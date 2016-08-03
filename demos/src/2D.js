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
function iterationHandler(e) {
	DiamondSquare.iterations = slider1.value
	label1.innerHTML = "Iterations: " + DiamondSquare.iterations
	PIXEL_SIZE = Math.pow(2, 9 - DiamondSquare.iterations)
	generate()
}
function smoothnessHandler(e) {
	DiamondSquare.smoothness = slider2.value
	label2.innerHTML = "Smoothness Constant: " + DiamondSquare.smoothness
	generate()
}
function randomRangeHandler(e) {
	DiamondSquare.initialRange = slider3.value
	label3.innerHTML = "Random Range: " + DiamondSquare.initialRange
	generate()
}
function seedHandler(e) {
	DiamondSquare.IntegerNoise.seed = slider4.value
	label4.innerHTML = "Seed: " + DiamondSquare.IntegerNoise.seed
}

// Perlin
function octaveHandler(e) {
	Perlin.octaves = slider1.value
	label1.innerHTML = "Octaves: " + Perlin.octaves
	generate()
}
function roughnessHandler(e) {
	Perlin.roughness = slider2.value
	label2.innerHTML = "Roughness: " + Perlin.roughness
	generate()
}
function lacunarityHandler(e) {
	Perlin.lacunarity = slider3.value
	label3.innerHTML = "Lacunarity: " + Perlin.lacunarity
	generate()
}
function scaleHandler(e) {
	PERLIN_SCALE = slider4.value
	label4.innerHTML = "Scale: " + PERLIN_SCALE
	generate()
}

function initializeDiamondSquareUI() {
	headerAlg.innerHTML = "Diamond-Square"
}