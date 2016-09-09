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
var BozSlider = require("./boz-slider")

/**
 * Params is an object with two parameters:
 *   `element` - the element in which to create the demo.
 *   `algorithm` (optional) - the algorithm to start displaying.
 */
var FractalDemo2D = function(params) {
    if (typeof params.element == "undefined") {
        console.error("No element defined! Aborting demo.")
        return
    }

    // Create the random noise functions
    this.diamondSquare = new DiamondSquare()
    this.perlin = new Perlin()

    this.PERLIN_SCALE = 124

    this.ALGORITHMS = {
        perlin: "Perlin Noise",
        diamondSquare: "Diamond-Square"
    }

    // Create the header
    this.header = document.createElement("h1")
    this.header.innerHTML = "Initializing. . ."
    params.element.appendChild(this.header)

    // Create a canvas and get a 2D context for drawing on.
    this.canvas = document.createElement("canvas")
    this.canvas.className = "fractal-demo"
    params.element.appendChild(this.canvas)
    this.context = this.canvas.getContext("2d")

    // Create the controls
    var controls = document.createElement("div")
    controls.className = "fractal-demo"

    var controlsHeader = document.createElement("h2")
    controlsHeader.innerHTML = "Controls"
    controls.appendChild(controlsHeader)

    this.radioPerlin = document.createElement("input")
    this.radioPerlin.type = "radio"
    this.radioPerlin.id = "fractal-demo-perlin-noise"
    this.radioPerlin.name = "algorithm"
    this.radioPerlin.onclick = this.switchToPerlin.bind(this)
    controls.appendChild(this.radioPerlin)

    var perlinLabel = document.createElement("label")
    perlinLabel.for = "fractal-demo-perlin-noise"
    perlinLabel.innerHTML = "Perlin Noise"
    controls.appendChild(perlinLabel)

    this.radioDS = document.createElement("input")
    this.radioDS.type = "radio"
    this.radioDS.id = "fractal-demo-diamond-square"
    this.radioDS.name = "algorithm"
    this.radioDS.onclick = this.switchToDS.bind(this)
    controls.appendChild(this.radioDS)

    var dsLabel = document.createElement("label")
    dsLabel.for = "fractal-demo-diamond-square"
    dsLabel.innerHTML = "Diamond-Square"
    controls.appendChild(dsLabel)

    // Create the Perlin controls
    this.perlinControls = document.createElement("div")
    if (params.algorithm = "Diamond-Square") {
        this.perlinControls.hidden = true
    }

    // Octave slider
    function octaveHandler(value) {
        this.perlin.octaves = value
        this.generate()
    }
    new BozSlider({
        parentElement: this.perlinControls,
        min: 1,
        max: 9,
        step: 1,
        value: this.perlin.octaves,
        labelText: "Octaves",
        onchange: octaveHandler.bind(this)
    })

    // Roughness slider
    function roughnessHandler(value) {
        this.perlin.roughness = value
        this.generate()
    }
    new BozSlider({
        parentElement: this.perlinControls,
        min: .01,
        max: 4,
        step: .01,
        value: this.perlin.roughness,
        label: "Roughness",
        onchange: roughnessHandler.bind(this)
    })

    // Lacunarity slider
    function lacunarityHandler(value) {
        this.perlin.lacunarity = value
        this.generate()
    }
    new BozSlider({
        parentElement: this.perlinControls,
        min: 1,
        max: 16,
        step: 1,
        value: this.perlin.lacunarity,
        label: "Lacunarity",
        onchange: lacunarityHandler.bind(this)
    })

    function scaleHandler(value) {
        this.PERLIN_SCALE = value
        this.generate()
    }
    new BozSlider({
        parentElement: this.perlinControls,
        min: 1,
        max: 256,
        step: 1,
        value: this.PERLIN_SCALE,
        label: "Scale",
        onchange: scaleHandler.bind(this)
    })

    // regenerate permutation table button
    var btnRegen = document.createElement("button")
    btnRegen.innerHTML = "Regenerate Permutation Table"
    btnRegen.onclick = function() {
        this.perlin.generatePermutationTable()
        this.generate()
    }
    this.perlinControls.appendChild(btnRegen)

    // Finally, append the Perlin controls.
    controls.appendChild(this.perlinControls)

    // Create the Diamond-Square controls
    this.diamondSquareControls = document.createElement("div")
    if (params.algorithm != "Diamond-Square") {
        this.diamondSquareControls.hidden = true
    }

    // Iterations
    function iterationHandler(value) {
        this.diamondSquare.setIterations(value)
        this.calculatePixelSize()
        this.generate()
    }
    new BozSlider({
        parentElement: this.diamondSquareControls,
        min: 1,
        max: 9,
        step: 1,
        value: this.diamondSquare.iterations,
        label: "Iterations",
        onchange: iterationHandler.bind(this)
    })

    // Smoothness
    function smoothnessHandler(value) {
        this.diamondSquare.smoothness = value
        this.generate()
    }
    new BozSlider({
        parentElement: this.diamondSquareControls,
        min: .1,
        max: 1,
        step: .1,
        value: this.diamondSquare.smoothness,
        label: "Smoothness",
        onchange: smoothnessHandler.bind(this)
    })

    // Random Range
    function randomRangeHandler(value) {
        this.diamondSquare.initialRange = value
        this.generate()
    }
    new BozSlider({
        parentElement: this.diamondSquareControls,
        min: 1,
        max: 40,
        step: 1,
        value: this.diamondSquare.initialRange,
        label: "Random Range",
        onchange: randomRangeHandler
    })

    // Seed
    function seedHandler(value) {
        this.diamondSquare.setSeed(value)
        this.generate()
    }
    new BozSlider({
        parentElement: this.seedHandler,
        min: 1,
        max: 256,
        step: 1,
        value: this.diamondSquare.getSeed(),
        label: "Seed",
        onchange: seedHandler
    })

    // Append the D-S controls.
    controls.appendChild(this.diamondSquareControls)

    // Append the entirety of the controls.
    params.element.appendChild(controls)
}

FractalDemo2D.prototype.switchToPerlin = function() {
    this.header.innerHTML = this.ALGORITHMS.perlin
    this.calculatePixelSize()
    this.perlinControls.hidden = false
    this.diamondSquareControls.hidden = true
    this.generate()
}

FractalDemo2D.prototype.switchToDS = function() {
    this.header.innerHTML = this.ALGORITHMS.diamondSquare
    this.calculatePixelSize()
    this.perlinControls.hidden = true
    this.diamondSquareControls.hidden = false
    this.generate()
}

/**
 * Recalculate pixel size (this is mainly for Diamond-Square)
 */
FractalDemo2D.prototype.calculatePixelSize = function() {
    if (this.currentAlgorithm = this.ALGORITHMS.diamondSquare) {
        this.pixelSize = this.canvas.width / diamondSquare.rowSize
    } else {
        this.pixelSize = 1
    }
}

/**
 * Draws a pixel of this.pixelSize at coordinates (x, y)
 * h is a height value from 0-100 and determines shading
 */
FractalDemo2D.prototype.drawPixel = function(x, y, h) {
    var color = Math.floor(h * 2.55)
    this.context.fillStyle = "rgb("+color+","+color+","+color+")"
    this.context.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
}

/**
 * Draws a Diamond-Square height map (1-dimensional pixel array)
 */
FractalDemo2D.prototype.drawHMap = function(map) {
    //console.debug("Drawing height map", map)
    for (var i = 0; i < map.length; i++) {
        var x = i % this.diamondSquare.rowSize
        var y = Math.floor(i / this.diamondSquare.rowSize)
        this.drawPixel(x, y, Math.floor(map[i]))
    }
}

FractalDemo2D.prototype.generate = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.currentAlgorithm = this.ALGORITHMS.diamondSquare) {
        this.drawHMap(this.diamondSquare.generate())
    } else {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for (var y = 0; y < Math.floor(this.canvas.height); y++) {
            for (var x = 0; x < Math.floor(this.canvas.width); x++) {
                var p = this.perlin.fBm2(x / this.PERLIN_SCALE, y / this.PERLIN_SCALE, 1)
                this.drawPixel(x, y, (p + 1) * 40)
            }
        }
    }
}

window.addEventListener("load", function() {
    window.fractalDemo2D = new FractalDemo2D({
        element: document.getElementById("demo-container")
    })
})
},{"../../src/diamond-square":3,"../../src/perlin":5,"./boz-slider":2}],2:[function(require,module,exports){
/**
 * BozSlider
 *
 * This is just a simple wrapper around the standard HTML5 Slider that
 * implements a minimum value and a label. 
 */

var BozSlider = function(params) {
    // The element to which this slider will be appended.
    this.parentElement = params.parentElement ? params.parentElement : null
    // Minimum value.
    this.min = params.min ? params.min : 0
    // Maximum value.
    this.max = params.max ? params.max : 1
    // Step.
    this.step = params.step ? params.step : 1
    // Initial value.
    this.value = params.value ? params.value : 0
    // Label to prepend value with on display. If null, no label will be shown.
    this.labelText = params.label ? params.label : null

    // User-facing onchange handler. This will be called with a value
    // adjusted 
    this.userOnChange = params.onchange ? params.onchange : function() {}

    // Create the div that will contain both input and label.
    this.containerDiv = document.createElement("div")
    this.containerDiv.className = "boz-slider"

    // Create a range input and append it to the container div.
    this.inputElement = document.createElement("input")
    this.inputElement.type = "range"
    this.inputElement.max = this.max - this.min
    this.inputElement.step = this.step
    this.inputElement.value = this.value
    this.inputElement.onchange = this.onRangeInputChange.bind(this)
    this.containerDiv.appendChild(this.inputElement)

    // If there is a label, create and append.
    if (this.label) {
        this.labelElement = document.createElement("label")
        this.containerDiv.appendChild(this.labelElement)
    }

    // If a parent element was specified, append the container div to it.
    if (this.parentElement) {
        this.parentElement.appendChild(this.containerDiv)
    }
}

BozSlider.prototype.onRangeInputChange = function(e) {
    // Get the min-adjusted value
    var value = this.getValue()

    // If there is a label, update it
    this.updateLabel(value)

    // Call the user-facing onchange handler with the adjusted value
    this.userOnChange(value)
}

/**
 * Sync the current value with the label.
 */
BozSlider.prototype.updateLabel = function(value) {
    if (!this.labelText)
        return

    this.labelElement.innerHTML = this.labelText + ": " + value
}

/**
 * Return the container div
 */
BozSlider.prototype.getElement = function() {
    return this.containerDiv
}

/**
 * Return the min-adjusted value
 */
BozSlider.prototype.getValue = function() {
    return this.element.value + this.min
}

/**
 * Set the slider's value and update the label,
 */
BozSlider.prototype.setValue = function(value) {
    if (value < this.min || value > this.max)
        return

    this.element.value = value
    this.updateLabel(value)
}

module.exports = BozSlider
},{}],3:[function(require,module,exports){
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
    //console.debug("Generating with " + this.iterations + " iterations.")

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
},{"./integer-noise.js":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
    this.octaves = octaves ? octaves : 4
    this.roughness = roughness ? roughness : 0.5
    this.lacunarity = lacunarity ? lacunarity : 2

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
    ] % 8

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
