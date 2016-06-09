/**
 * One-Dimensional Midpoint Displacement
 *
 * TODO: re-generate when smoothness or range are changed.
 */

var paper, line
var N = 0
var S = .630
var terrain = [[0, 150], [500, 150]]
var rand = 150
var defaultIterations = 0
var defaultSmoothness = .63
var defaultRandRange = 150

window.addEventListener("load", function(e) {
    updateLblIt = function(value) {
        document.getElementById("lblIt").innerHTML = "Iterations: " + sliderIt.value
    }
    updateLblSm = function(value) {
        document.getElementById("lblSm").innerHTML = "Smoothness constant: " + sliderSm.value
    }
    updateLblRa = function(value) {
        document.getElementById("lblRa").innerHTML = "Range: " + sliderRa.value
    }

    // Canvas stuff
    paper = Raphael('canvasness', 500, 300)
    initialize()
    render()

    // UI stuff
    itHandler =  function(e) {
        updateLblIt()
        N = this.value
        changeDepth()
        render()
    }
    var sliderIt = document.getElementById("sliderIt")
    sliderIt.addEventListener("input", itHandler)
    sliderIt.value = defaultIterations
    updateLblIt()

    smHandler = function(e) {
        updateLblSm()
        S = this.value
        render()
    }
    var sliderSm = document.getElementById("sliderSm")
    sliderSm.addEventListener("input", smHandler)
    sliderSm.value = defaultSmoothness
    updateLblSm()

    raHandler = function(e) {
        updateLblRa()
        rand = this.value
        render()
    }
    var sliderRa = document.getElementById("sliderRa")
    sliderRa.addEventListener("input", raHandler)
    sliderRa.value = defaultRandRange
    updateLblRa()

    reset.onclick = function () {
        terrain = [[0, 150], [500, 150]]
        sliderIt.value = defaultIterations
        updateLblIt()
        sliderSm.value = defaultSmoothness
        updateLblSm()
        sliderRa.value = defaultRandRange
        updateLblRa()

        render()
    }
})

function log2(x) {
    return Math.log(x) / Math.log(2)
}

function initialize() {
    line = paper.path("")
}

function render() {
    newLine(terrain)
}

function newLine(coords) {
    var pathStr = "M" + coords[0][0] + ", " + coords[0][1]
    for (var i = 1; i < coords.length; i++) {
        pathStr += "L" + coords[i][0] + ", " + coords[i][1]
    }
    line.remove()
    line = paper.path(pathStr)
}

function changeDepth() {
    var i, j
    //first, how many iterations (line segments) exist?
    var initSegments = terrain.length - 1
    //next, how many segments are desired?
    var newSegments = Math.pow(2, N)
    if (initSegments === newSegments) return
    if (initSegments < newSegments) {
        //add more segments -- increase depth
        var toAdd = log2(newSegments) - log2(initSegments)
        for (i = 0; i < toAdd; i++) {
            for (j = 1; j < terrain.length; j+=2) {
                //for each line segment
                x = (terrain[j-1][0]+terrain[j][0])/2
                y = (terrain[j-1][1]+terrain[j][1])/2
                terrain.splice(j, 0, [x, y + Math.floor(Math.random()*rand) - (rand / 2)])
            }
            rand = rand * S
        }
    } else {
        //it's less, and we remove segments -- reduce depth
        var toLose = log2(initSegments) - log2(newSegments)
        for (i = 0; i < toLose; i++) {
            for (j = terrain.length - 2; j > 0; j-=2) {
                //start at the end and cut out the midpoints
                terrain.splice(j, 1)
            }
            rand = rand / S
        }
    }
}

function genRange(beg, end) {
    if (!beg) beg = [0, 400]
    if (!end) end = [1200, 400]
    var i, j, x, y, rand = 30, range = [beg, end]
    for (i = 0; i < N; i++) {
        for (j = 1; j < range.length; j+=2) {
            //for each line segment
            x = (range[j-1][0]+range[j][0])/2
            y = (range[j-1][1]+range[j][1])/2
            range.splice(j, 0, [x, y + Math.floor(Math.random()*rand) - (rand / 2)])
            rand = rand * S
        }
    }
    return range
}
