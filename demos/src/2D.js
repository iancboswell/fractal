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
	label1.innerHTML = "Iterations: " + DiamondSquare.iterations
}
function iterationHandler(e) {
	DiamondSquare.iterations = slider1.value
	syncIterationLabel()
	PIXEL_SIZE = Math.pow(2, 9 - DiamondSquare.iterations)
	generate()
}
function syncSmoothnessLabel() {
	label2.innerHTML = "Smoothness Constant: " + DiamondSquare.smoothness
}
function smoothnessHandler(e) {
	DiamondSquare.smoothness = slider2.value
	syncSmoothnessLabel()
	generate()
}
function syncRandomLabel() {
	label3.innerHTML = "Random Range: " + DiamondSquare.initialRange
}
function randomRangeHandler(e) {
	DiamondSquare.initialRange = slider3.value
	syncRandomLabel()
	generate()
}
function syncSeedLabel() {
	label4.innerHTML = "Seed: " + DiamondSquare.IntegerNoise.seed
}
function seedHandler(e) {
	DiamondSquare.IntegerNoise.seed = slider4.value
	syncSeedLabel()
}

// Perlin
function syncOctaveLabel() {
	label1.innerHTML = "Octaves: " + Perlin.octaves
}
function octaveHandler(e) {
	Perlin.octaves = slider1.value
	syncOctaveLabel()
	generate()
}
function syncRoughnessLabel() {
	label2.innerHTML = "Roughness: " + Perlin.roughness
}
function roughnessHandler(e) {
	Perlin.roughness = slider2.value
	syncRoughnessLabel()
	generate()
}
function syncLacunarityLabel() {
	label3.innerHTML = "Lacunarity: " + Perlin.lacunarity
}
function lacunarityHandler(e) {
	Perlin.lacunarity = slider3.value
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
		slider1.setAttribute("value", DiamondSquare.defaultIterations)
		slider2.setAttribute("value", DiamondSquare.defaultSmoothness)
		syncIterationLabel()
		syncSmoothnessLabel()
		// TODO should have a reset function on the DiamondSquare object
		DiamondSquare.iterations = DiamondSquare.defaultIterations
		DiamondSquare.smoothness = DiamondSquare.defaultSmoothness
		generate()
	}

	initializeSlider(slider1, 1, 9, 1, DiamondSquare.iterations, iterationHandler)
	syncIterationLabel()

	initializeSlider(slider2, .1, 1, .1, DiamondSquare.smoothness, smoothnessHandler)
	syncSmoothnessLabel()

	initializeSlider(slider3, 1, 40, 1, DiamondSquare.initialRange, randomRangeHandler)
	syncRandomLabel()

	initializeSlider(slider4, 1, 256, 1, DiamondSquare.IntegerNoise.seed, syncSeedLabel)
	syncSeedLabel()
}

function initializePerlinUI() {
	headerAlg.innerHTML = "Perlin Noise"

	btnRegen.innerHTML = "Regenerate Permutation Table"
	btnRegen.onclick = function() {
		Perlin.generatePermutationTable()
		generate()
	}

	initializeSlider(slider1, 1, 9, 1, Perlin.octaves, octaveHandler)
	syncOctaveLabel()

	initializeSlider(slider2, .01, 4, .01, Perlin.roughness, roughnessHandler)
	syncRoughnessLabel()

	initializeSlider(slider3, 1, 16, 1, Perlin.lacunarity, lacunarityHandler)
	syncLacunarityLabel()

	initializeSlider(slider4, 1, 256, 1, PERLIN_SCALE, scaleHandler)
	syncScaleLabel()
}

function initialize() {
	radioDiamondSquare.onclick = function() {
		PIXEL_SIZE = Math.pow(2, 9 - DiamondSquare.iterations)
		initializeDiamondSquareUI()
		generate()
	}
}