/*
 ----------- Duplicate Tone -----------  

    Duplicates the selection a given number of times in a given direction. 
    Perfect for reconstructing tone from a small sample.

    Tested in: Photoshop CC 2020

    Updated: Jan 17 2021

    Usage: 
        - Select a pattern-able section of halftone
        - Run this script (File > Scripts > Browse...)
        - Give a number of times to duplicate, and click OK
*/


/* ----- Constants ----- */

var DIRECTIONS = [
    "Right",
    "Left",
    "Up",
    "Down"
];

/* ----- Functions ----- */

function main(iterationCount, direction) {
    // make a selection 
    var selection = app.activeDocument.selection;
    var deltaValues = getDeltaValues(direction, selection);

    var target = null;
    var layers = []; // keep track of new layers (using the LayerSet class gave me lots of issues, including layer reordering and unexplained errors on merge)
    for (var i = 0; i < iterationCount; i++) {
        target = duplicateAndMove(target || selection, deltaValues);
        layers.push(target);
    }

    mergeLayers(layers); // merge all the new layers into one
}

// returns iteration count and duplication direction
function doPrompt() {
    if (getErrors()) return;

    var myDialog = new Window("dialog", "Tone Duplicator", undefined);

    var inputGroup = myDialog.add("group");
    inputGroup.alignChildren = "left";
    inputGroup.orientation = "column";

    var iterationGroup = inputGroup.add("group");
    iterationGroup.add("statictext", undefined, "Number of times to duplicate the selection:");
    var iterationCount = iterationGroup.add("edittext", undefined, "5");

    var directionGroup = inputGroup.add("group");
    directionGroup.add("statictext", undefined, "Duplication direction:");
    var directionDD = directionGroup.add("dropdownlist", undefined, DIRECTIONS);
    directionDD.selection = 0;

    var buttonGroup = myDialog.add("group");
    buttonGroup.alignment = "right";
    buttonGroup.add("button", undefined, "OK");
    buttonGroup.add("button", undefined, "Cancel");


    var myReturn = myDialog.show();
    if (myReturn == true) {
        var parsedIterationCount = parseInt(iterationCount.text);

        if (parsedIterationCount !== NaN) {
            main(parsedIterationCount, directionDD.selection.toString());
        }
    } else {
        myDialog.close();
    }
}

function getDeltaValues(direction, selection) {
    var bounds = getBounds(selection),
        deltaX = 0,
        deltaY = 0;

    if (direction === "Right") {
        deltaX = bounds.width;
    } else if (direction === "Left") {
        deltaX = bounds.width * -1;
    } else if (direction === "Up") {
        deltaY = bounds.height * -1;
    } else if (direction === "Down") {
        deltaY = bounds.height;
    }

    return {
        deltaX: deltaX,
        deltaY: deltaY
    }

}

// converts an array of coordinates into an object in the format {width, height}
// makes math easier to understand :')
function getBounds(area) {
    // bounds = x1, y1, x2, y2
    return {
        width: area.bounds[2] - area.bounds[0],
        height: area.bounds[3] - area.bounds[1]
    }
}


// takes a source object, duplicates it, and moves it according to deltaX and deltaY
function duplicateAndMove(source, deltaValues) {
    var duplicateLayer = null;
    // the first iteration will be of type "Selection", so we want to create a new layer out of it by copying and pasting
    if (source instanceof Selection) {
        source.copy();
        duplicateLayer = app.activeDocument.paste();
        duplicateLayer.name = "Tone";
        // just leave this where it is and only move subsequent iterations
    } else if (source instanceof ArtLayer) { // subsequent iterations will be their own layers, so we can just duplicate them
        duplicateLayer = source.duplicate();
        // then move the new layer by given X and Y values
        duplicateLayer.translate(deltaValues.deltaX, deltaValues.deltaY);
    }
    return duplicateLayer;
}

// given an array of layers, merges them all down into one
function mergeLayers(layersArr) {
    // start at 1 instead of zero to skip the oldest layer
    for (var i = 1; i < layersArr.length; i++) {
        layersArr[i].merge();
    }
}

function getErrors() {
    var hasErrors = false;

    try {
        if (!app.activeDocument.selection || !app.activeDocument.selection.bounds) {
            alert('Please make a selection and try again.');
            hasErrors = true;
        } else if (app.activeDocument.mode === DocumentMode.BITMAP) {
            alert("This script doesn't work on Bitmap images. Please convert to Grayscale and try again.");
            hasErrors = true;
        }
    } catch (err) {
        alert('Please make a selection and try again.');
        hasErrors = true;
    }

    return hasErrors;
}

try {
    doPrompt();
} catch (err) { alert(err) } // nature's debugger :^)