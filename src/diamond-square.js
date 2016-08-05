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

var DiamondSquare = function(defaultIterations, defaultSmoothness, initialRange) {
    this.iterations = defaultIterations
    this.smoothness = defaultSmoothness
    this.randRange = initialRange

    this.integerNoise = new IntegerNoise()

    this.rowSize = Math.pow(2, this.iterations) + 1

    this.heightMap = 0

    this.sqrSide = 0
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

DiamondSquare.prototype.generate = function() {
    this.rowSize = Math.pow(2, this.iterations) + 1
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

    for (var iteration = 1; iteration < this.iterations; iteration++) {
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