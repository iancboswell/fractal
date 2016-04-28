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
 * TODO document everything
 */

var Perlin = function(octaves, roughness, lacunarity) {
    this.octaves = octaves
    this.roughness = roughness
    this.lacunarity = lacunarity

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
    for (i = 0; i <= 255; i++) {
        nums[i] = i
    }
    for (i = 0; i <= 255; i++) {
        this.perm[i] = nums.splice(Math.floor(Math.random() * nums.length), 1)[0]
    }
}

Perlin.prototype.dot = function(vec, x, y, z) {
    if (z?) {
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

Perlin.prototype.noise2 = function(x, y, offset) {
    
}

module.exports = Perlin