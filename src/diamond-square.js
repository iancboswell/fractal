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
    return this.integerNoise.rand(pt) * randRange
}

DiamondSquare.prototype.squareCornerAvg = function(pt) {
    l = Math.floor(this.sqrSide / 2)
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

