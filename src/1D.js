var paper, line;
var N = 0;
var S = .630;
var terrain = [[0, 150], [500, 150]];
var rand = 150;
var defaultIterations = 0;
var defaultSmoothness = .63;
var defaultRandRange = 150;


// UI stuff
$(function() {
    itHandler =  function(event, ui) {
        val = $("#sliderIt").slider("value");
        lblIt.innerHTML = "Iterations: " + val;
        N = val;
        changeDepth();
        render();
    };
    $("#sliderIt").slider({
        range: false,
        animate: true,
        value: defaultIterations,
        max: 11,
        step: 1,
        slide: itHandler,
        change: itHandler,
        stop: itHandler
    })
    smHandler = function(event, ui) {
        val = $("#sliderSm").slider("value");
        lblSm.innerHTML = "Smoothness constant: " + val;
        S = val;
        render();
    };
    $("#sliderSm").slider({
        range: false,
        animate: true,
        value: defaultSmoothness,
        max: 2,
        step: .01,
        slide: smHandler,
        change: smHandler,
        stop: smHandler
    })
    raHandler = function(event, ui) {
        val = $("#sliderRa").slider("value");
        lblRa.innerHTML = "Range: " + val;
        rand = val;
        render();
    };
    $("#sliderRa").slider({
        range: false,
        animate: true,
        value: defaultRandRange,
        max: 300,
        slide: raHandler,
        change: raHandler,
        stop: raHandler
    })
    $("#reset").button();
})

function log2(x) {
    return Math.log(x) / Math.log(2);
}

function initialize() {
    line = paper.path("");
}

function render() {
    newLine(terrain);
}

window.onload = function() {
    paper = Raphael('canvasness', 500, 300);
    initialize();
    render();
    
    reset.onclick = function () {  
        terrain = [[0, 150], [500, 150]];
        $("#sliderIt").slider("value", defaultIterations);
        $("#sliderSm").slider("value", defaultSmoothness);
        $("#sliderRa").slider("value", defaultRandRange);
        render();
    };
    
}

function newLine(coords) {
    var pathStr = "M" + coords[0][0] + ", " + coords[0][1];
    for (var i = 1; i < coords.length; i++) {
        pathStr += "L" + coords[i][0] + ", " + coords[i][1];
    }
    line.remove();
    line = paper.path(pathStr); 
}

function changeDepth() {
    var i, j;
    //first, how many iterations (line segments) exist?
    var initSegments = terrain.length - 1;
    //next, how many segments are desired?
    var newSegments = Math.pow(2, N);
    if (initSegments === newSegments) return;
    if (initSegments < newSegments) {
        //add more segments -- increase depth
        var toAdd = log2(newSegments) - log2(initSegments);
        for (i = 0; i < toAdd; i++) {
            for (j = 1; j < terrain.length; j+=2) {
                //for each line segment
                x = (terrain[j-1][0]+terrain[j][0])/2
                y = (terrain[j-1][1]+terrain[j][1])/2
                terrain.splice(j, 0, [x, y + Math.floor(Math.random()*rand) - (rand / 2)]);
            }
            rand = rand * S;
            
        }
    } else {
        //it's less, and we remove segments -- reduce depth
        var toLose = log2(initSegments) - log2(newSegments);
        for (i = 0; i < toLose; i++) {
            for (j = terrain.length - 2; j > 0; j-=2) {
                //start at the end and cut out the midpoints
                terrain.splice(j, 1);
            }
            rand = rand / S;
        }
    }
}

function genRange(beg, end) {
    if (!beg) beg = [0, 400];
    if (!end) end = [1200, 400];
    var i, j, x, y, rand = 30, range = [beg, end];
    for (i = 0; i < N; i++) {
        for (j = 1; j < range.length; j+=2) {
            //for each line segment
            x = (range[j-1][0]+range[j][0])/2
            y = (range[j-1][1]+range[j][1])/2
            range.splice(j, 0, [x, y + Math.floor(Math.random()*rand) - (rand / 2)]);
            rand = rand * S;
        }
    }
    return range;
}
