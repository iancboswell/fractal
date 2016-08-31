(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * 2D Terrain Generation Demo Source File
 *
 * Build this with Browserify and include the bundle!
 * The structure I'm using for this project is to put bundles
 * into the `js` folder.
 *
 * This is a simple user interface that's designed to switch
 * between Perlin and Diamond-Square terrain generation.
 */
var DiamondSquare = require("../../src/diamond-square")
var Perlin = require("../../src/perlin")

window.addEventListener("load", function() {
    window.diamondSquare = new DiamondSquare()
    window.perlin = new Perlin()

    // HTML5 Canvas context
    var leCanvas = document.getElementById("leCanvas")
    var ctx = leCanvas.getContext("2d")

    /* UI Elements */
    var headerAlg = document.getElementById("headerAlg")

    var label1 = document.getElementById("label1")
    var slider1 = document.getElementById("slider1")
    var label2 = document.getElementById("label2")
    var slider2 = document.getElementById("slider2")
    var label3 = document.getElementById("label3")
    var slider3 = document.getElementById("slider3")
    var label4 = document.getElementById("label4")
    var slider4 = document.getElementById("slider4")

    var radioDiamondSquare = document.getElementById("d-s")
    var radioPerlin = document.getElementById("perlin")

    var btnRegen = document.getElementById("btnRegen")

    // This is for diamond-square
    function calculatePixelSize() {
        return leCanvas.width / diamondSquare.rowSize
    }

    var PERLIN_SCALE = 124
    var PIXEL_SIZE = calculatePixelSize()

    /* UI Handlers */

    // Diamond-Square
    function syncIterationLabel() {
        label1.innerHTML = "Iterations: " + diamondSquare.iterations
    }
    function iterationHandler(e) {
        diamondSquare.setIterations(slider1.value)
        syncIterationLabel()
        PIXEL_SIZE = calculatePixelSize()
        generate()
    }
    function syncSmoothnessLabel() {
        label2.innerHTML = "Smoothness Constant: " + diamondSquare.smoothness
    }
    function smoothnessHandler(e) {
        diamondSquare.smoothness = slider2.value
        syncSmoothnessLabel()
        generate()
    }
    function syncRandomLabel() {
        label3.innerHTML = "Random Range: " + diamondSquare.initialRange
    }
    function randomRangeHandler(e) {
        diamondSquare.initialRange = slider3.value
        syncRandomLabel()
        generate()
    }
    function syncSeedLabel() {
        label4.innerHTML = "Seed: " + diamondSquare.getSeed()
    }
    function seedHandler(e) {
        diamondSquare.setSeed(slider4.value)
        syncSeedLabel()
        generate()
    }

    // Perlin
    function syncOctaveLabel() {
        label1.innerHTML = "Octaves: " + perlin.octaves
    }
    function octaveHandler(e) {
        perlin.octaves = slider1.value
        syncOctaveLabel()
        generate()
    }
    function syncRoughnessLabel() {
        label2.innerHTML = "Roughness: " + perlin.roughness
    }
    function roughnessHandler(e) {
        perlin.roughness = slider2.value
        syncRoughnessLabel()
        generate()
    }
    function syncLacunarityLabel() {
        label3.innerHTML = "Lacunarity: " + perlin.lacunarity
    }
    function lacunarityHandler(e) {
        perlin.lacunarity = slider3.value
        syncLacunarityLabel()
        generate()
    }
    function syncScaleLabel() {
        label4.innerHTML = "Scale: " + PERLIN_SCALE
    }
    function scaleHandler(e) {
        PERLIN_SCALE = slider4.value
        syncScaleLabel()
        generate()
    }

    function initializeSlider(slider, min, max, step, value, handler) {
        //slider.min = min // TODO
        slider.max = max
        slider.value = value
        slider.step = step
        slider.onchange = handler // TODO onstop?
    }

    function initializeDiamondSquareUI() {
        headerAlg.innerHTML = "Diamond-Square"

        btnRegen.innerHTML = "Reset"
        btnRegen.onclick = function() {
            diamondSquare.reset()

            slider1.value = diamondSquare.iterations
            slider2.value = diamondSquare.imoothness
            slider3.value = diamondSquare.initialRange
            syncIterationLabel()
            syncSmoothnessLabel()
            syncRandomLabel()

            generate()
        }

        initializeSlider(slider1, 1, 9, 1, diamondSquare.iterations, iterationHandler)
        syncIterationLabel()

        initializeSlider(slider2, .1, 1, .1, diamondSquare.smoothness, smoothnessHandler)
        syncSmoothnessLabel()

        initializeSlider(slider3, 1, 40, 1, diamondSquare.initialRange, randomRangeHandler)
        syncRandomLabel()

        initializeSlider(slider4, 1, 256, 1, diamondSquare.getSeed(), seedHandler)
        syncSeedLabel()
    }

    function initializePerlinUI() {
        headerAlg.innerHTML = "Perlin Noise"

        btnRegen.innerHTML = "Regenerate Permutation Table"
        btnRegen.onclick = function() {
            perlin.generatePermutationTable()
            generate()
        }

        initializeSlider(slider1, 1, 9, 1, perlin.octaves, octaveHandler)
        syncOctaveLabel()

        initializeSlider(slider2, .01, 4, .01, perlin.roughness, roughnessHandler)
        syncRoughnessLabel()

        initializeSlider(slider3, 1, 16, 1, perlin.lacunarity, lacunarityHandler)
        syncLacunarityLabel()

        initializeSlider(slider4, 1, 256, 1, PERLIN_SCALE, scaleHandler)
        syncScaleLabel()
    }

    function initialize() {
        console.log("Initializing")

        radioDiamondSquare.onclick = function() {
            PIXEL_SIZE = calculatePixelSize()
            initializeDiamondSquareUI()
            generate()
        }
        radioPerlin.onclick = function() {
            PIXEL_SIZE = 1
            initializePerlinUI()
            generate()
        }

        // Start with the Diamond-Square demo
        radioDiamondSquare.click()
    }

    /**
     * Draws a pixel of PIXEL_SIZE at coordinates (x, y)
     * h is a height value from 0-100 and determines shading
     */
    function drawPixel(x, y, h) {
        var color = Math.floor(h * 2.55)
        ctx.fillStyle = "rgb("+color+","+color+","+color+")"
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
    }

    /**
     * Draws a Diamond-Square height map (1-dimensional pixel array)
     */
    function drawHMap(map) {
        console.debug("Drawing height map", map)
        for (var i = 0; i < map.length; i++) {
            var x = i % diamondSquare.rowSize
            var y = Math.floor(i / diamondSquare.rowSize)
            drawPixel(x, y, Math.floor(map[i]))
        }
    }

    function generate() {
        ctx.clearRect(0, 0, leCanvas.width, leCanvas.height)
        if (radioDiamondSquare.checked) {
            drawHMap(diamondSquare.generate())
        } else {
            ctx.clearRect(0, 0, leCanvas.width, leCanvas.height)
            for (var y = 0; y < Math.floor(leCanvas.height); y++) {
                for (var x = 0; x < Math.floor(leCanvas.width); x++) {
                    var p = perlin.fBm2(x / PERLIN_SCALE, y / PERLIN_SCALE, 1)
                    drawPixel(x, y, (p + 1) * 40)
                }
            }
        }
    }

    initialize()
})
},{"../../src/diamond-square":2,"../../src/perlin":4}],2:[function(require,module,exports){
/** Diamond-Square Algorithm **
 *
 * Diamond step: take squares and make diamonds.
 *     Find the midpoint in the square and average the square's four
 *     corners plus a random number to find the value for that midpoint,
 *     creating diamonds.
 *
 * Square step: take diamonds and make squares.
 *     find midpoints on each side of the square, find their diamond
 *     corners and average them + random number to find the value for
 *     that midpoint, creating squares.
 *
 * Points are stored in a one-dimensional array. To find x and y for point pt:
 *     x = pt % ROW_S
 *     y = Math.floor pt / ROW_S
 *
 * TODO some documentation on each function
 */

var IntegerNoise = require('./integer-noise.js')

/**
 * Defaults for iterations, smoothness, and initial range are passed into the
 * constructor.
 * Initial range: the range of random values is decreased on each iteration.
 * The degree of the decrease is determined by the smoothness constant.
 */
var DiamondSquare = function(defaultIterations, defaultSmoothness, defaultInitialRange) {
    this.defaultIterations = defaultIterations ? defaultIterations : 1
    this.defaultSmoothness = defaultSmoothness ? defaultSmoothness : .5
    this.defaultInitialRange = defaultInitialRange ? defaultInitialRange : 20

    // Now that defaults are set, call reset to set the normal values
    this.reset()

    this.integerNoise = new IntegerNoise()

    this.heightMap = 0
    this.sqrSide = 0
}

/**
 * Reset to initial values.
 */
DiamondSquare.prototype.reset = function() {
    this.setIterations(this.defaultIterations)
    this.smoothness = this.defaultSmoothness
    this.initialRange = this.defaultInitialRange
}

DiamondSquare.prototype.random = function(pt) {
    return this.integerNoise.rand(pt) * this.randRange
}

DiamondSquare.prototype.getSeed = function() {
    return this.integerNoise.seed
}

DiamondSquare.prototype.setSeed = function(seed) {
    this.integerNoise.seed = seed
}

DiamondSquare.prototype.squareCornerAvg = function(pt) {
    var l = Math.floor(this.sqrSide / 2) // TODO what is "l"? length?
    this.heightMap[pt] = Math.floor(
        (
            this.heightMap[pt - l - l * this.rowSize] // top left
            + this.heightMap[pt + l - l * this.rowSize] // top right
            + this.heightMap[pt - l + l * this.rowSize] // bottom left
            + this.heightMap[pt + l + l * this.rowSize] // bottom right
        ) / 4
        + this.random(pt)
    )
}

DiamondSquare.prototype.diamondCornerAvg = function(pt) {
    var l = Math.floor(this.sqrSide / 2)
    var points = []
    var avg = 0

    // top, right, bottom, left
    // Make sure the point actually exists before pushing it
    // TODO optimize
    if (this.heightMap[pt - l * this.rowSize])
        points.push(this.heightMap[pt - l * this.rowSize])
    if (pt % this.rowSize + l < this.rowSize)
        points.push(this.heightMap[pt + l])
    if (this.heightMap[pt + l * this.rowSize])
        points.push(this.heightMap[pt + l * this.rowSize])
    if (pt % this.rowSize - l >= 0)
        points.push(this.heightMap[pt - l])

    for (i = 0; i < points.length; i++) {
        avg += points[i]
    }

    this.heightMap[pt] = Math.floor(avg / points.length + this.random(pt))
}

DiamondSquare.prototype.diamondStep = function(pt) {
    this.diamondCornerAvg(pt - Math.floor(this.sqrSide / 2)) // Left
    this.diamondCornerAvg(pt - Math.floor(this.sqrSide / 2) * this.rowSize) // Top
    this.diamondCornerAvg(pt + Math.floor(this.sqrSide / 2)) // Right
    this.diamondCornerAvg(pt + Math.floor(this.sqrSide / 2) * this.rowSize) // Bottom
}

/**
 * Set number of iterations and recalculate row size.
 */
DiamondSquare.prototype.setIterations = function(iterations) {
    this.iterations = iterations
    this.rowSize = Math.pow(2, this.iterations) + 1
}

DiamondSquare.prototype.generate = function() {
    console.debug("Generating with " + this.iterations + " iterations.")

    this.randRange = this.initialRange

    this.heightMap = []
    for (i = 0; i < this.rowSize * this.rowSize; i++) {
        this.heightMap[i] = 50
    }

    // Initialize corners
    this.heightMap[0] += this.random(0)
    this.heightMap[this.rowSize - 1] += this.random(this.rowSize - 1)
    this.heightMap[(this.rowSize - 1) * this.rowSize] += this.random((this.rowSize - 1) * this.rowSize)
    this.heightMap[this.heightMap.length - 1] += this.random(this.heightMap.length - 1)

    for (var iteration = 1; iteration <= this.iterations; iteration++) {
        var squares = Math.pow(4, iteration - 1)
        this.sqrSide = Math.ceil(this.rowSize / (Math.pow(2, iteration - 1)))
        var sqrRow_s = Math.pow(2, iteration - 1)
        for (s = 0; s < squares; s++) {
            var sqrX = (s - Math.floor(s / sqrRow_s) * sqrRow_s)
            var sqrY = Math.floor(s / sqrRow_s)
            var sqrOffset = sqrX * (this.sqrSide - 1) + sqrY * (this.sqrSide - 1) * this.rowSize
            // Diamond
            this.squareCornerAvg(Math.floor(this.sqrSide / 2) + Math.floor(this.sqrSide / 2) * this.rowSize + sqrOffset)
            // Square
            this.diamondStep(Math.floor(this.sqrSide / 2) + Math.floor(this.sqrSide / 2) * this.rowSize + sqrOffset)
        }
        this.randRange = Math.ceil(this.randRange * Math.pow(2, -this.smoothness))
    }
    return this.heightMap
}

module.exports = DiamondSquare
},{"./integer-noise.js":3}],3:[function(require,module,exports){
/** Integer Noise **
 *
 * This is a nice explanation of the integer-noise function:
 * http://libnoise.sourceforge.net/noisegen/index.html
 *
 */

/**
 * Optionally pass a seed value into the constructor; otherwise, a default is used.
 */
var IntegerNoise = function(seed) {
    this.seed = seed ? seed : 1
}

/**
 * Pseudorandom 1-dimensional noise. Each input n will produce the same output,
 * but there will be no correlation between outputs.
 */
IntegerNoise.prototype.rand = function(n, seed) {
    seed = seed ? seed : this.seed

    n = (n >> 13) ^ n
    n = (n * (n * n * 60493 + 19990303) + 1376312589) * seed & 0x7fffffff

    return 1.0 - (n / 1073741824.0)
}

/**
 * Returns a pseudorandom number given two inputs.
 */
IntegerNoise.prototype.rand2D = function(x, y, seed) {
    seed = seed ? seed : this.seed

    n = x + y * 57

    return this.rand(n, seed)
}

module.exports = IntegerNoise

},{}],4:[function(require,module,exports){
/** Classic Perlin Noise.
 * ~~~~~~~~~~~~~~~~~~~~~
 * It is assumed that the vast majority of points passed here
 * will be non-integers. First, the four integer vertices
 * of the square surrounding the point will be found (using the
 * top left vertex as main reference), then the relative
 * coordinates of the input point within that unit-length square.
 *
 * Each integer vertex has a unique, consistent, pseudorandom gradient
 * in two dimensions. Each point will always have the same gradient
 * as long as the permutation table hasn't been regenerated. The
 * permutation table, then, functions kind of like a seed for the
 * pseudorandom element of this function. To generate the same pattern,
 * the permutation table must remain the same.
 *
 * Once the gradients are calculated, their influence on the input point
 * must be determined. A dot product is performed to figure this out.
 *
 * Ease curves are performed on relative x and relative y within the
 * unit square. This is so that all noise values have zero derivative
 * motion at the unit vertices.
 *
 * Next, a linear interpolation is performed from both initial X
 * coordinates in the unit square, and then a lerp across those
 * interpolated values is performed along the Y fade curve.
 *
 * The result is the perlin noise for that particular point on the grid.
 * Each input point will always return the same perlin noise, unless
 * the permutation table is recalculated.
 *
 */

var Perlin = function(octaves, roughness, lacunarity) {
    this.octaves = octaves ? octaves : 1
    this.roughness = roughness ? roughness : 1
    this.lacunarity = lacunarity ? lacunarity : 1

    // Gradient tables
    this.grad2 = [
        [1, 1], [0, 1], [1, 0], [-1, -1], [0, -1], [-1, 0], [-1, 1], [1, -1]
    ]
    this.grad3 = [
        [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0], [1,0,1], [-1,0,1],
        [1,0,-1], [-1,0,-1], [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
    ]
    // Permutation table
    this.generatePermutationTable()
}

Perlin.prototype.generatePermutationTable = function() {
    this.perm = []
    var nums = []
    for (i = 0; i <= 255; i++) {
        nums[i] = i
    }
    for (i = 0; i <= 255; i++) {
        this.perm[i] = nums.splice(Math.floor(Math.random() * nums.length), 1)[0]
    }
}

Perlin.prototype.dot = function(vec, x, y, z) {
    if (typeof z != "undefined") {
        return vec[0] * x + vec[1] * y + vec[2] * z
    } else {
        return vec[0] * x + vec[1] * y
    }
}

Perlin.prototype.lerp = function(a, b, alpha) {
    return (1.0 - alpha) * a + alpha * b
}

/**
 * Ease curve to zero out derivative motion at vertices
 */
Perlin.prototype.ease = function(p) {
    return 3 * Math.pow(p, 2) - 2 * Math.pow(p, 3)
}

Perlin.prototype.getPerm = function(p) {
    return this.perm[p & 255]
}

/**
 * Offset allows each octave to use a different set of gradients.
 * It effectively scrambles the permutation table in a pseudorandom,
 * reproducible way.
 */
Perlin.prototype.noise2 = function(x, y, offset) {
    // Cell origin coordinates (top left)
    var originX = Math.floor(x)
    var originY = Math.floor(y)

    // Relative coordinates within cell
    x = x - originX
    y = y - originY

    // Wrapping the cell coordinate origin at 255 will prevent a negative
    // or too-large index being passed to the permutation table
    originX = originX & 255
    originY = originY & 255

    // Calculate gradients for each integer vertex surrounding the input point
    var g00 = this.perm[
        (originX + this.perm[
            (originY + this.perm[offset & 255]) & 255
        ]) & 255
    ] % 8
    var g10 = this.perm[
        (originX + 1 + this.perm[
            (originY + this.perm[offset & 255]) & 255
        ]) & 255
    ] % 8
    var g01 = this.perm[
        (originX + this.perm[
            (originY + 1 + this.perm[offset & 255]) & 255
        ]) & 255
    ] % 8
    var g11 = this.perm[
        (originX + 1 + this.perm[
            (originY + 1 + this.perm[offset & 255]) & 255
        ]) & 255
    ]

    // Noise contributions from each corner
    var n00 = this.dot(this.grad2[g00], x, y)
    var n10 = this.dot(this.grad2[g10], x - 1, y)
    var n01 = this.dot(this.grad2[g01], x, y - 1)
    var n11 = this.dot(this.grad2[g11], x - 1, y - 1)

    // Ease curves for x and y
    var u = this.ease(x)
    var v = this.ease(y)

    // Interpolate along x contributions from each corner
    var lerpX0 = this.lerp(n00, n10, u)
    var lerpX1 = this.lerp(n01, n11, u)
    // Interpolate along y
    return this.lerp(lerpX0, lerpX1, v)
}

/**
 * Offset allows each octave to use a different set of gradients --
 * it effectively scrambles the permutation table in a pseudorandom,
 * reproducible way
 */
Perlin.prototype.noise3 = function(x, y, z, offset) {
    // Cell coordinate base
    var originX = Math.floor(x)
    var originY = Math.floor(y)
    var originZ = Math.floor(z)

    // Relative coordinates within cell
    x = x - originX
    y = y - originY
    z = z - originZ

    // Calculate gradients for each integer vertex surrounding the input point
    var g000 = this.getPerm(
        originX + this.getPerm(
            originY + this.getPerm(
                originZ + this.getPerm(offset)
            )
        )
    ) % 12
    var g100 = this.getPerm(
        originX + 1 + this.getPerm(
            originY + this.getPerm(
                originZ + this.getPerm(offset)
            )
        )
    ) % 12
    var g010 = this.getPerm(
        originX + this.getPerm(
            originY + 1 + this.getPerm(
                originZ + this.getPerm(offset)
            )
        )
    ) % 12
    var g110 = this.getPerm(
        originX + 1 + this.getPerm(
            originY + 1 + this.getPerm(
                originZ + this.getPerm(offset)
            )
        )
    ) % 12
    var g001 = this.getPerm(
        originX + this.getPerm(
            originY + this.getPerm(
                originZ + 1 + this.getPerm(offset)
            )
        )
    ) % 12
    var g101 = this.getPerm(
        originX + 1 + this.getPerm(
            originY + this.getPerm(
                originZ + 1 + this.getPerm(offset)
            )
        )
    ) % 12
    var g011 = this.getPerm(
        originX + this.getPerm(
            originY + 1 + this.getPerm(
                originZ + 1 + this.getPerm(offset)
            )
        )
    ) % 12
    var g111 = this.getPerm(
        originX + 1 + this.getPerm(
            originY + 1 + this.getPerm(
                originZ + 1 + this.getPerm(offset)
            )
        )
    ) % 12

    // Noise contributions from each corner
    var v000 = this.dot(this.grad3[g000], x, y, z)
    var v100 = this.dot(this.grad3[g100], x - 1, y, z)
    var v010 = this.dot(this.grad3[g010], x, y - 1, z)
    var v110 = this.dot(this.grad3[g110], x - 1, y - 1, z)
    var v001 = this.dot(this.grad3[g001], x, y, z - 1)
    var v101 = this.dot(this.grad3[g101], x - 1, y, z - 1)
    var v011 = this.dot(this.grad3[g011], x, y - 1, z - 1)
    var v111 = this.dot(this.grad3[g111], x - 1, y - 1, z - 1)

    // Ease curves for x, y, and z
    var u = this.ease(x)
    var v = this.ease(y)
    var w = this.ease(z)

    // Interpolate along x contributions from each corner
    var lerpx0 = this.lerp(n000, n100, u)
    var lerpx1 = this.lerp(n010, n110, u)
    var lerpx2 = this.lerp(v001, v101, u)
    var lerpx3 = this.lerp(n011, n111, u)
    // Interpolate along y
    var lerpxy0 = this.lerp(lerpx0, lerpx1, v)
    var lerpxy1 = this.lerp(lerpx2, lerpx3, v)
    // Finally, interpolate along z
    return this.lerp(lerpxy0, lerpxy1, w)
}

/**
 * Fractal Brownian motion takes several noise functions and layers them
 * on top of each other, decreasing amplitude according to the
 * roughness constant and increasing frequency by the lacunarity constant.
 */

/**
 * Two-dimensional fractal Brownian motion.
 */
Perlin.prototype.fBm2 = function(x, y) {
    var total = this.noise2(x, y)
    if (this.octaves > 1) {
        for (var octave = 1; octave < this.octaves - 1; octave++) {
            // Each octave gives the coordinates a different offset,
            // changing the gradients
            total += this.noise2(
                    x * (1 / this.roughness) * octave,
                    y * (1 / this.roughness) * octave,
                    octave
                ) / (this.lacunarity * octave)
        }
    }
    return total
}

/**
 * Three-dimensional fractal Brownian motion.
 */
Perlin.prototype.fBm3 = function(x, y, z) {
    var total = this.noise3(x, y, z)
    if (this.octaves > 1) {
        for (var octave = 1; octave < this.octaves - 1; octave++) {
            total += this.noise3(
                    x * (1 / this.roughness) * octave,
                    y * (1 / this.roughness) * octave,
                    z * (1 / this.roughness) * octave,
                    octave
                ) / (this.lacunarity * octave)
        }
    }
}

module.exports = Perlin
},{}]},{},[1]);
