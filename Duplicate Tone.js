/*
 ----------- Duplicate Tone -----------  

    Duplicates the selection a given number of times to the right. 

    Tested in: Photoshop CC 2020

    Updated: Jan 16 2021

    Note: For now this script only duplicates tone directly to the right

    Usage: 
        - Select a pattern-able section of halftone
        - Run this script (File > Scripts > Browse...)
        - Give a number of times to duplicate, and click OK
*/


function main() {

    var iterations = prompt("How many times should the selection be duplicated?", 5, "Tone Duplicator");
    if (!iterations) return;

    // make a selection 
    var selection = app.activeDocument.selection;
    var bounds = getBounds(selection);

    // var layerSet = app.activeDocument.layerSets.add();
    var target = null;
    var layers = [];
    for (var i = 0; i < iterations; i++) {
        target = duplicateAndMove(target || selection, bounds.width, 0);
        layers.push(target);
    }

    mergeLayers(layers);
}

function getBounds(area) {
    // bounds = x1, y1, x2, y2
    return {
        width: area.bounds[2] - area.bounds[0],
        height: area.bounds[3] - area.bounds[1]
    }
}


// takes a source object, duplicates it, and moves it according to deltaX and deltaY
function duplicateAndMove(source, deltaX, deltaY) {
    var duplicateLayer = null;
    if (source instanceof Selection) {
        source.copy();
        duplicateLayer = app.activeDocument.paste();
    } else if (source instanceof ArtLayer) {
        duplicateLayer = source.duplicate();
    }

    duplicateLayer.translate(deltaX, deltaY);
    return duplicateLayer;
}

function mergeLayers(layersArr) {
    for (var i = 1; i < layersArr.length; i++) {
        layersArr[i].merge();
    }
}

try {
    main();
} catch (err) { alert(err) } // nature's debugger :v)