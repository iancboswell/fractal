# Random Noise Generators in CoffeeScript
# Implemented by Ian Boswell
# 2013
#
#
# This is a nice explanation of the integer-noise function:
#
# http://libnoise.sourceforge.net/noisegen/index.html
#
#
# Reference for Diamond-Square:
#
# http://gameprogrammer.com/fractal.html
#
#
# These pages offer an extremely helpful explanation of Perlin Noise:
#
# http://www.angelcode.com/dev/perlin/perlin.html
# http://webstaff.itn.liu.se/~stegu/TNM022-2005/perlinnoiselinks/perlin-noise-math-faq.html#algorithm
# http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
# https://gist.github.com/banksean/304522
#
# Here is Ken Perlin's reference implentation:
#
# http://mrl.nyu.edu/~perlin/noise/
#
#
# An excellent article on generating procedural worlds:
#
# http://www.gamasutra.com/view/feature/131507/a_realtime_procedural_universe_.php

class IntegerNoise
    constructor: (@seed=1) ->

    rand: (n, seed=@seed) ->
        # Pseudorandom 1-dimensional noise. Each input n will produce the
        # same output, but there will be no correlation between outputs.
        n = (n >> 13) ^ n
        n = (n * (n * n * 60493 + 19990303) + 1376312589) * seed & 0x7fffffff
        1.0 - (n / 1073741824.0)

    rand2D: (x, y, seed=@seed) ->
        # Returns a pseudorandom number given two inputs.
        n = x + y * 57
        @rand(n, seed)


class DiamondSquare
    # Diamond-Square Algorithm.
    # ~~~~~~~~~~~~~~~~~~~~~~~~~
    # Diamond step: take squares and make diamonds.
    #     Find the midpoint in the square and average the square's four
    #     corners plus a random number to find the value for that midpoint,
    #     creating diamonds.
    # 
    # Square step: take diamonds and make squares.
    #     find midpoints on each side of the square, find their diamond
    #     corners and average them + random number to find the value for
    #     that midpoint, creating squares.
    # 
    # Points are stored in a one-dimensional array. To find x and y for point pt:
    #     x = pt % ROW_S
    #     y = Math.floor pt / ROW_S

    constructor: (@defaultIterations=1, @defaultSmoothness=.3, @initialRange=17) ->
        @IntegerNoise = new IntegerNoise
        @iterations = @defaultIterations
        @smoothness = @defaultSmoothness
        @randRange = @initialRange

        @rowSize = Math.pow(2, @iterations) + 1

        @heightMap = 0

        @sqrSide = 0

    random: (pt) ->
        @IntegerNoise.rand(pt) * @randRange

    squareCornerAvg: (pt) ->
        l = Math.floor(@sqrSide / 2)
        # top left, rt; bottom left, rt
        @heightMap[pt] = Math.floor((@heightMap[pt - l - l * @rowSize] + @heightMap[pt + l - l * @rowSize] +
        @heightMap[pt - l + l * @rowSize] + @heightMap[pt + l + l * @rowSize]) / 4 + @random(pt))

    diamondCornerAvg: (pt) ->
        l = Math.floor(@sqrSide / 2)
        points = []
        avg = 0

        # top, right, bottom, left
        points.push(@heightMap[pt - l * @rowSize]) if @heightMap[pt - l * @rowSize]?
        points.push(@heightMap[pt + l]) if pt % @rowSize + l < @rowSize
        points.push(@heightMap[pt + l * @rowSize]) if @heightMap[pt + l * @rowSize]?
        points.push(@heightMap[pt - l]) if pt % @rowSize - l >= 0

        avg += points[i] for i in [0...points.length]
        @heightMap[pt] = Math.floor(avg / points.length + @random(pt))

    diamondStep: (pt) ->
        @diamondCornerAvg(pt - Math.floor(@sqrSide / 2))  # Left
        @diamondCornerAvg(pt - Math.floor(@sqrSide / 2) * @rowSize) # Top
        @diamondCornerAvg(pt + Math.floor(@sqrSide / 2)) # Right
        @diamondCornerAvg(pt + Math.floor(@sqrSide / 2) * @rowSize) # Bottom

    generate: ->
        @rowSize = Math.pow(2, @iterations) + 1   # Row Size
        @randRange = @initialRange

        @heightMap = (50 for i in [0...@rowSize * @rowSize])
        # Initialize corners
        @heightMap[0] += @random(0)
        @heightMap[@rowSize - 1] += @random(@rowSize - 1)
        @heightMap[(@rowSize - 1) * @rowSize] += @random((@rowSize - 1) * @rowSize)
        @heightMap[@heightMap.length - 1] += @random(@heightMap.length - 1)

        for I in [1..@iterations]
            squares = Math.pow(4, I - 1)
            @sqrSide = Math.ceil(@rowSize / (Math.pow(2, I - 1)))
            sqrRow_s = Math.pow(2, I - 1)
            for s in [0...squares]
                sqrX = (s - Math.floor(s / sqrRow_s) * sqrRow_s)
                sqrY = Math.floor(s / sqrRow_s)
                sqrOffset = sqrX * (@sqrSide - 1) + sqrY * (@sqrSide - 1) * @rowSize
                # Diamond
                @squareCornerAvg(Math.floor(@sqrSide / 2) + Math.floor(@sqrSide / 2) * @rowSize + sqrOffset)
                # Square
                @diamondStep(Math.floor(@sqrSide / 2) + Math.floor(@sqrSide / 2) * @rowSize + sqrOffset)
            @randRange = Math.ceil(@randRange * Math.pow(2, -@smoothness))
        @heightMap


class Perlin
    # Classic Perlin Noise.
    # ~~~~~~~~~~~~~~~~~~~~~
    # It is assumed that the vast majority of points passed here
    # will be non-integers. First, the four integer vertices
    # of the square surrounding the point will be found (using the
    # top left vertex as main reference), then the relative
    # coordinates of the input point within that unit-length square.
    # 
    # Each integer vertex has a unique, consistent, pseudorandom gradient
    # in two dimensions. Each point will always have the same gradient
    # as long as the permutation table hasn't been regenerated. The
    # permutation table, then, functions kind of like a seed for the
    # pseudorandom element of this function. To generate the same pattern,
    # the permutation table must remain the same.
    #
    # Once the gradients are calculated, their influence on the input point
    # must be determined. A dot product is performed to figure this out.
    #
    # Ease curves are performed on relative x and relative y within the
    # unit square. This is so that all noise values have zero derivative
    # motion at the unit vertices.
    #
    # Next, a linear interpolation is performed from both initial X
    # coordinates in the unit square, and then a lerp across those
    # interpolated values is performed along the Y fade curve.
    #
    # The result is the perlin noise for that particular point on the grid.
    # Each input point will always return the same perlin noise, unless
    # the permutation table is recalculated.

    constructor: (@octaves=4, @roughness=.5, @lacunarity=2) ->
        # Gradient table
        @grad2 = [[1, 1], [0, 1], [1, 0], [-1, -1], [0, -1], [-1, 0], [-1, 1], [1, -1]]
        @grad3 = [[1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0], [1,0,1], [-1,0,1],
                  [1,0,-1], [-1,0,-1], [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]]
        # Permutation table
        @generatePermutationTable()

    generatePermutationTable: =>
        @perm = []
        nums = [0..255]
        for i in [0..255]
            @perm.push nums.splice(Math.floor(Math.random()*nums.length), 1)[0]

    dot: (vec, x, y, z) ->
        if z?
            return vec[0] * x + vec[1] * y + vec[2] * z
        else
            return vec[0] * x + vec[1] * y

    lerp: (a, b, alpha) ->
        (1.0 - alpha) * a + alpha * b

    ease: (p) ->
        # Ease curve to zero out derivative motion at vertices
        3 * Math.pow(p, 2) - 2 * Math.pow(p, 3)

    getPerm: (p) ->
        P = @perm[p & 255]
        #if not P and P isnt 0
        #    console.debug p, P
        P

    noise2: (x, y, offset=0) ->
        # Offset allows each octave to use a different set of gradients --
        # it effectively scrambles the permutation table in a pseudorandom,
        # reproducible way

        # Cell coordinates (top left)
        X = Math.floor x
        Y = Math.floor y

        # Relative coordinates within cell
        x = x - X
        y = y - Y

        # Wrapping the cell coordinate base at 255 will prevent a negative
        # or too-large index being passed to the permutation table
        X = X & 255
        Y = Y & 255

        # Calculate gradients for each integer vertex surrounding the
        # input point
        g00 = @perm[(X + @perm[(Y + @perm[offset & 255]) & 255]) & 255] % 8
        g10 = @perm[(X + 1 + @perm[(Y + @perm[offset & 255]) & 255]) & 255] % 8
        g01 = @perm[(X + @perm[(Y + 1 + @perm[offset & 255]) & 255]) & 255] % 8
        g11 = @perm[(X + 1 + @perm[(Y + 1 + @perm[offset & 255]) & 255]) & 255] % 8

        # Noise contributions from each corner
        n00 = @dot @grad2[g00], x, y
        n10 = @dot @grad2[g10], x - 1, y
        n01 = @dot @grad2[g01], x, y - 1
        n11 = @dot @grad2[g11], x - 1, y - 1

        # Ease curves for x and y
        u = @ease x
        v = @ease y

        # Interpolate along x contributions from each corner
        lerpx0 = @lerp n00, n10, u
        lerpx1 = @lerp n01, n11, u
        # Interpolate along y
        lerpxy = @lerp lerpx0, lerpx1, v

        lerpxy

    noise3: (x, y, z, offset=0) ->
        # Offset allows each octave to use a different set of gradients --
        # it effectively scrambles the permutation table in a pseudorandom,
        # reproducible way

        # Cell coordinate base
        X = Math.floor x
        Y = Math.floor y
        Z = Math.floor z

        # Relative coordinates within cell
        x = x - X
        y = y - Y
        z = z - Z

        # Calculate gradients for each integer vertex surrounding the
        # input point
        # Each lookup is wrapped at 255 to keep indices positive and <256
        g000 = @getPerm(X + @getPerm(Y + @getPerm(Z + @getPerm(offset)))) % 12
        g100 = @getPerm(X+1 + @getPerm(Y + @getPerm(Z + @getPerm(offset)))) % 12
        g010 = @getPerm(X + @getPerm(Y+1 + @getPerm(Z + @getPerm(offset)))) % 12
        g110 = @getPerm(X+1 + @getPerm(Y+1 + @getPerm(Z + @getPerm(offset)))) % 12
        g001 = @getPerm(X + @getPerm(Y + @getPerm(Z+1 + @getPerm(offset)))) % 12
        g101 = @getPerm(X+1 + @getPerm(Y + @getPerm(Z+1 + @getPerm(offset)))) % 12
        g011 = @getPerm(X + @getPerm(Y+1 + @getPerm(Z+1 + @getPerm(offset)))) % 12
        g111 = @getPerm(X+1 + @getPerm(Y+1 + @getPerm(Z+1 + @getPerm(offset)))) % 12

        # Noise contributions from each corner
        n000 = @dot @grad3[g000], x, y, z
        n100 = @dot @grad3[g100], x - 1, y, z
        n010 = @dot @grad3[g010], x, y - 1, z
        n110 = @dot @grad3[g110], x - 1, y - 1, z
        n001 = @dot @grad3[g001], x, y, z - 1
        n101 = @dot @grad3[g101], x - 1, y, z - 1
        n011 = @dot @grad3[g011], x, y - 1, z - 1
        n111 = @dot @grad3[g111], x - 1, y - 1, z - 1

        # Ease curves for x, y, and z
        u = @ease x
        v = @ease y
        w = @ease z

        # Interpolate along x contributions from each corner
        lerpx0 = @lerp n000, n100, u
        lerpx1 = @lerp n010, n110, u
        lerpx2 = @lerp n001, n101, u
        lerpx3 = @lerp n011, n111, u
        # Interpolate along y
        lerpxy0 = @lerp lerpx0, lerpx1, v
        lerpxy1 = @lerp lerpx2, lerpx3, v
        # Interpolate along z
        lerpxyz = @lerp lerpxy0, lerpxy1, w

        lerpxyz

    # Fractal Brownian motion takes several noise functions and layers them
    # on top of each other, decreasing amplitude according to the
    # roughness constant and increasing frequency by the lacunarity constant.
    fBm2: (x, y) ->
        total = @noise2 x, y
        if @octaves > 1
            for o in [1..@octaves - 1]
                # Each octave has a different offset, changing the gradients
                total += @noise2(x * (1 / @roughness) * o,
                                 y * (1 / @roughness) * o,
                                 o
                                 ) / (@lacunarity * o)
        total

    fBm3: (x, y, z) ->
        total = @noise3 x, y, z
        if @octaves > 1
            for o in [1..@octaves - 1]
                total += @noise3(x * (1 / @roughness) * o,
                                 y * (1 / @roughness) * o,
                                 z * (1 / @roughness) * o,
                                 o
                                 ) / (@lacunarity * o)
        total

    expfBm3: (x, y, z) ->
        total = fBm3(x, y, z)
        Math.pow(fBm3(x, y, z), 2 + total)

module.exports = {IntegerNoise, DiamondSquare, Perlin}
