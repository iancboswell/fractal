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
    this.canvas.width = 512
    this.canvas.height = 512
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
    perlinLabel.setAttribute("for", "fractal-demo-perlin-noise")
    perlinLabel.innerHTML = "Perlin Noise"
    controls.appendChild(perlinLabel)
    controls.appendChild(document.createElement("br"))

    this.radioDS = document.createElement("input")
    this.radioDS.type = "radio"
    this.radioDS.id = "fractal-demo-diamond-square"
    this.radioDS.name = "algorithm"
    this.radioDS.onclick = this.switchToDS.bind(this)
    controls.appendChild(this.radioDS)

    var dsLabel = document.createElement("label")
    dsLabel.setAttribute("for", "fractal-demo-diamond-square")
    dsLabel.innerHTML = "Diamond-Square"
    controls.appendChild(dsLabel)

    // Create the Perlin controls
    this.perlinControls = document.createElement("div")
    this.perlinControls.className = "perlin-controls"

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
        label: "Octaves",
        onchange: octaveHandler.bind(this)
    })
    this.perlinControls.appendChild(document.createElement("br"))

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
    this.perlinControls.appendChild(document.createElement("br"))

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
    this.perlinControls.appendChild(document.createElement("br"))

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
    this.perlinControls.appendChild(document.createElement("br"))

    // regenerate permutation table button
    var btnRegen = document.createElement("button")
    btnRegen.innerHTML = "Regenerate Permutation Table"
    btnRegen.onclick = (function() {
        this.perlin.generatePermutationTable()
        this.generate()
    }).bind(this)
    this.perlinControls.appendChild(btnRegen)

    // Finally, append the Perlin controls.
    controls.appendChild(this.perlinControls)

    // Create the Diamond-Square controls
    this.diamondSquareControls = document.createElement("div")
    this.diamondSquareControls.className = "diamond-square-controls"

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
    this.diamondSquareControls.appendChild(document.createElement("br"))

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
    this.diamondSquareControls.appendChild(document.createElement("br"))

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
    this.diamondSquareControls.appendChild(document.createElement("br"))

    // Seed
    function seedHandler(value) {
        this.diamondSquare.setSeed(value)
        this.generate()
    }
    new BozSlider({
        parentElement: this.diamondSquareControls,
        min: 1,
        max: 256,
        step: 1,
        value: this.diamondSquare.getSeed(),
        label: "Seed",
        onchange: seedHandler
    })
    this.diamondSquareControls.appendChild(document.createElement("br"))

    // Append the D-S controls.
    controls.appendChild(this.diamondSquareControls)

    // Append the entirety of the controls.
    params.element.appendChild(controls)

    if (params.algorithm && params.algorithm == this.ALGORITHMS.diamondSquare) {
        this.radioDS.click()
    } else {
        this.radioPerlin.click()
    }
}

FractalDemo2D.prototype.switchToPerlin = function() {
    this.switchTo(this.ALGORITHMS.perlin)
}

FractalDemo2D.prototype.switchToDS = function() {
    this.switchTo(this.ALGORITHMS.diamondSquare)
}

FractalDemo2D.prototype.switchTo = function(algorithm) {
    console.log("Switching to " + algorithm)
    this.currentAlgorithm = algorithm
    this.header.innerHTML = algorithm
    this.calculatePixelSize()
    this.perlinControls.hidden = algorithm == this.ALGORITHMS.diamondSquare ? true : false
    this.diamondSquareControls.hidden = algorithm == this.ALGORITHMS.perlin ? true : false
    this.generate()
}

/**
 * Recalculate pixel size (this is mainly for Diamond-Square)
 */
FractalDemo2D.prototype.calculatePixelSize = function() {
    if (this.currentAlgorithm == this.ALGORITHMS.diamondSquare) {
        this.pixelSize = this.canvas.width / this.diamondSquare.rowSize
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
    if (this.currentAlgorithm == this.ALGORITHMS.diamondSquare) {
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