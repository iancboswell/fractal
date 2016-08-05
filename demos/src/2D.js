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
    var diamondSquare = new DiamondSquare()
    var perlin = new Perlin()

    var PERLIN_SCALE = 124
    var PIXEL_SIZE = 1

    // HTML5 Canvas context
    var ctx = document.getElementById("leCanvas").getContext("2d")

    /* UI Elements */
    var headerAlg = document.getElementById("headerAlg")

    var label1 = document.getElementById("label1")
    var slider1 = document.getElementById("slider1")
    var label1 = document.getElementById("label2")
    var slider2 = document.getElementById("slider2")
    var label1 = document.getElementById("label3")
    var slider3 = document.getElementById("slider3")
    var label1 = document.getElementById("label4")
    var slider4 = document.getElementById("slider4")

    var radioDiamondSquare = document.getElementById("d-s")
    var radioPerlin = document.getElementById("perlin")

    var btnRegen = document.getElementById("btnRegen")

    /* UI Handlers */

    // Diamond-Square
    function syncIterationLabel() {
        label1.innerHTML = "Iterations: " + diamondSquare.iterations
    }
    function iterationHandler(e) {
        diamondSquare.iterations = slider1.value
        syncIterationLabel()
        PIXEL_SIZE = Math.pow(2, 9 - diamondSquare.iterations)
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
        slider.setAttribute("min", min) // TODO
        slider.setAttribute("max", max)
        slider.setAttribute("value", value)
        slider.onchange = handler // TODO onstop?
    }

    function initializeDiamondSquareUI() {
        headerAlg.innerHTML = "Diamond-Square"

        btnRegen.innerHTML = "Reset"
        btnRegen.onclick = function() {
            slider1.setAttribute("value", diamondSquare.defaultIterations)
            slider2.setAttribute("value", diamondSquare.defaultSmoothness)
            syncIterationLabel()
            syncSmoothnessLabel()
            // TODO should have a reset function on the DiamondSquare object
            diamondSquare.iterations = diamondSquare.defaultIterations
            diamondSquare.smoothness = diamondSquare.defaultSmoothness
            generate()
        }

        initializeSlider(slider1, 1, 9, 1, diamondSquare.iterations, iterationHandler)
        syncIterationLabel()

        initializeSlider(slider2, .1, 1, .1, diamondSquare.smoothness, smoothnessHandler)
        syncSmoothnessLabel()

        initializeSlider(slider3, 1, 40, 1, diamondSquare.initialRange, randomRangeHandler)
        syncRandomLabel()

        initializeSlider(slider4, 1, 256, 1, diamondSquare.getSeed(), syncSeedLabel)
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
            PIXEL_SIZE = Math.pow(2, 9 - diamondSquare.iterations)
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
        var color = h * 2.55
        ctx.fillStyle = "rgb("+color+","+color+","+color+")"
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
    }

    /**
     * Draws a Diamond-Square height map (1-dimensional pixel array)
     */
    function drawHMap(map) {
        for (var i = 0; i < map.length - 1; i++) {
            // TODO these calculations seem wrong?
            var y = Math.floor(i / diamondSquare.rowSize)
            var x = i - y * diamondSquare.rowSize
            drawPixel(x, y, Math.floor(map[i]))
        }
    }

    function generate() {
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