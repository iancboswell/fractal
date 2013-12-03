###########################################
#                                         #
##  Ian Boswell's 2D Terrain Algorithms  ##
#                                         #
###########################################

Random = require './random.coffee'
$ = require 'jquery-browserify'
UI = require '../lib/jquery-ui-1.10.3.custom.js'


DiamondSquare = new Random.DiamondSquare
Perlin = new Random.Perlin

PERLIN_SCALE = 124

PIXEL_SIZE = 1

# Hex converter
happyHex = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"]

# HTML5 canvas objects
ctx = document.getElementById("leCanvas").getContext("2d");

# UI handlers
# TODO: little blurbs that explain what each parameter does
# Diamond-Square
itHandler =  (event, ui) ->
    DiamondSquare.iterations = $("#slider1").slider("value")
    lbl1.innerHTML = "Iterations: " + DiamondSquare.iterations
    PIXEL_SIZE = Math.pow(2, 9 - DiamondSquare.iterations)
    generate()
smHandler = (event, ui) ->
    DiamondSquare.smoothness = $("#slider2").slider("value")
    lbl2.innerHTML = "Smoothness Constant: " + DiamondSquare.smoothness
    generate()
raHandler = (event, ui) ->
    DiamondSquare.initialRange = $("#slider3").slider("value")
    lbl3.innerHTML = "Random Range: " + DiamondSquare.initialRange
    generate()
seedHandler = (event, ui) ->
    DiamondSquare.IntegerNoise.seed = $("#slider4").slider("value")
    lbl4.innerHTML = "Seed: " + DiamondSquare.IntegerNoise.seed
    generate()
# Perlin
octHandler = ->
    Perlin.octaves = $("#slider1").slider("value")
    document.getElementById("lbl1").innerHTML = "Octaves: " + Perlin.octaves
    generate()
rouHandler = ->
    Perlin.roughness = $("#slider2").slider("value")
    document.getElementById("lbl2").innerHTML = "Smoothness: " + Perlin.roughness
    generate()
lacHandler = ->
    Perlin.lacunarity = $("#slider3").slider("value")
    document.getElementById("lbl3").innerHTML = "Lacunarity: " + Perlin.lacunarity
    generate()
scaleHandler = ->
    PERLIN_SCALE = $("#slider4").slider("value")
    document.getElementById("lbl4").innerHTML = "Scale: " + PERLIN_SCALE
    generate()


UI = ->
    if document.getElementById("d-s").checked
        # Diamond-Square UI
        document.getElementById("headerAlg").innerHTML = "Diamond-Square"
        document.getElementById("lbl1").innerHTML = "Iterations: " + DiamondSquare.iterations
        document.getElementById("lbl2").innerHTML = "Smoothness Constant: " + DiamondSquare.smoothness
        document.getElementById("lbl3").innerHTML = "Random Range: " + DiamondSquare.initialRange
        document.getElementById("lbl4").innerHTML = "Seed: " + DiamondSquare.IntegerNoise.seed

        document.getElementById("btnRegen").innerHTML = "Reset"

        # jQuery UI elements
        $("#slider1").slider({
            range: false,
            animate: true,
            value: DiamondSquare.iterations,
            max: 9,
            min: 1,
            step: 1,
            stop: itHandler
        })
        $("#slider2").slider({
            range: false,
            animate: true,
            max: 1,
            min: .1,
            step: .1,
            stop: smHandler
        })
        $("#slider2").slider({
            value: DiamondSquare.smoothness
        })
        $("#slider3").slider({
            range: false,
            animate: true,
            value: DiamondSquare.initialRange,
            min: 1
            max: 40,
            step: 1,
            stop: raHandler
        })
        $("#slider4").slider({
            range: false,
            animate: true,
            value: DiamondSquare.IntegerNoise.seed,
            min: 1
            max: 256,
            step: 1,
            stop: seedHandler
        })
        
    else
        # Perlin UI
        document.getElementById("headerAlg").innerHTML = "Perlin Noise"
        document.getElementById("lbl1").innerHTML = "Octaves: " + Perlin.octaves
        document.getElementById("lbl2").innerHTML = "Smoothness: " + Perlin.roughness
        document.getElementById("lbl3").innerHTML = "Lacunarity: " + Perlin.lacunarity
        document.getElementById("lbl4").innerHTML = "Scale: " + PERLIN_SCALE

        $("#slider1").slider({
            range: false,
            animate: true,
            value: Perlin.octaves,
            max: 9,
            min: 1,
            step: 1,
            stop: octHandler
        })
        $("#slider2").slider({
            range: false,
            animate: true,
            min: .01,
            max: 4,
            step: .01,
            stop: rouHandler
        })
        $("#slider2").slider({
            value: Perlin.roughness
        })
        $("#slider3").slider({
            range: false,
            animate: true,
            value: Perlin.lacunarity,
            min: 1,
            max: 16,
            step: 1,
            stop: lacHandler
        })
        $("#slider4").slider({
            range: false,
            animate: true,
            value: PERLIN_SCALE
            min: 1
            max: 256,
            step: 1,
            stop: scaleHandler
        })

        document.getElementById("btnRegen").innerHTML = "Regenerate Permutation Table"


init = ->
    $('.ui-slider').width 265

    $("#algType").buttonset()
    $("#btnRegen").button()

    document.getElementById("d-s").addEventListener "change", ->
        if document.getElementById("d-s").checked
            PIXEL_SIZE = Math.pow(2, 9 - DiamondSquare.iterations)
        UI()
        generate()

    document.getElementById("perlin").addEventListener "change", ->
        if document.getElementById("perlin").checked
            PIXEL_SIZE = 1
        UI()
        generate()

    btnRegen.onclick = ->
        if document.getElementById("d-s").checked
            $("#slider1").slider("value", DiamondSquare.defaultIterations)
            $("#slider2").slider("value", DiamondSquare.defaultSmoothness)
            lbl1.innerHTML = "Iterations: " + DiamondSquare.defaultIterations
            lbl2.innerHTML = "Smoothness Constant: " + DiamondSquare.defaultRoughness
            DiamondSquare.iterations = DiamondSquare.defaultIterations
            DiamondSquare.smoothness = DiamondSquare.defaultRoughness
            generate()
        else
            Perlin.generatePermutationTable()
            generate()

    if document.getElementById("d-s").checked
        PIXEL_SIZE = Math.pow(2, 9 - DiamondSquare.iterations)
    else
        PIXEL_SIZE = 1
    UI()
    generate()

# Takes a height value and spits out a hex color
hToHex = (h) ->
    h = Math.floor(h * 2.56)
    if h < 256 && h >= 0
        sixteens = 0
        ones = h % 16
        if h > 15 then sixteens = (h - ones) / 16
        sixteens = happyHex[sixteens]
        ones = happyHex[ones]
        theHex = "#" + sixteens + ones + sixteens + ones + sixteens + ones
    else
        theHex = "#FF0000"
    theHex

drawPixel = (x,y,h) ->
    ctx.fillStyle = hToHex(h)
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)

drawHMap = (map) ->
    for i in [0..map.length - 1]
        x = i - Math.floor(i / DiamondSquare.rowSize) * DiamondSquare.rowSize
        y = Math.floor(i / DiamondSquare.rowSize)
        drawPixel(x,y,Math.floor(map[i]))

generate = ->
    if document.getElementById("d-s").checked
        drawHMap(DiamondSquare.generate())
    else
        ctx.clearRect 0, 0, leCanvas.width, leCanvas.height
        for y in [0...Math.floor(leCanvas.height)]
            for x in [0...Math.floor(leCanvas.width)]
                p = Perlin.fBm2 x / PERLIN_SCALE, y / PERLIN_SCALE, 1
                drawPixel x, y, (p + 1) * 40        

module.exports = {init, generate}