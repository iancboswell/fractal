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
