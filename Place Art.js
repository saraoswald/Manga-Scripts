/* Version 1.0

    documentation coming soon sorrrrryyyyyyyy

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign
*/

var doc = app.activeDocument;
var bookSize = doc.pages.count();
var isLtR = doc.documentPreferences.pageBinding == PageBindingOptions.LEFT_TO_RIGHT;

var extractPageNum = function(path) {
    var regex = /\d{3,4}(?=\_?\d?\.[A-Za-z]{3,4})/;
    var regexResult = regex.exec(path);
    return path && regexResult !== null && regexResult.length > 0 ?
        parseInt(regexResult[0], 10) : 0;
}

var targetLayer = doc.layers.itemByName('Art').isValid ?
    doc.layers.itemByName('Art') :
    doc.layers.add({ name: 'Art' });

function getFilter() {
    if (File.fs == "Windows") {
        return "*.*";
    } else {
        return function() { return true }
    }
}

try {
    var artFiles = File.openDialog('Select art files to place', getFilter(), true);
    if (artFiles !== null && artFiles.length > 0) { // in case the user pressed cancel or something
        for (var i = 0; i < artFiles.length; i++) {
            var pageNum = extractPageNum(artFiles[i]);
            if (pageNum > 0) {
                var image = new File(artFiles[i]);
                var bookPageNum = isLtR ? bookSize - pageNum + 1 : pageNum;
                var page = doc.pages.itemByName(bookPageNum.toString());
                placeArtOnPage(page, targetLayer, image);
            }
        }
    }
} catch (err) { alert(err) }; // the debugger that will never let u down :')

function getFrame(page, layer) {
    var targetFrame = null;

    var findFrame = function(arr, ignoreLayer) {
        var returnVal = null;
        // iterate backwards because it's most likely on the bottom
        for (var i = arr.length; i > -1; i-- && returnVal === null) {
            if (arr[i] && arr[i] instanceof Rectangle &&
                !arr[i].itemLayer.locked &&
                (ignoreLayer || arr[i].itemLayer == layer)) {
                returnVal = arr[i];
            }
        }
        return returnVal;
    }

    // check if there's a master, override the master items and use the frame there 
    if (page.appliedMaster !== null && page.appliedMaster.isValid) {
        var masterFrame = findFrame(page.masterPageItems, true);
        targetFrame = masterFrame && masterFrame.isValid ?
            masterFrame.override(page) : null;
    };
    // check if there's a Rectangle at the bottom of the Art layer
    if (targetFrame === null) targetFrame = findFrame(page.allPageItems);
    // if there's no frame, no master, make a frame that extends to the edges of the page
    if (targetFrame === null) targetFrame = page.rectangles
        .add({
            geometricBounds: getPageBounds(page),
            itemLayer: targetLayer
        });

    return targetFrame;
}

// place art on page function / inputs: page & image link
function placeArtOnPage(page, layer, image) {
    if (!page.isValid || !layer.isValid || !image.exists) return;

    var frame = getFrame(page, layer);
    if (frame) frame.place(image);
}

// takes bounds input and gives output in the form [y1, x1, y2, x2]
function getPageBounds(page) {
    var prfs = doc.documentPreferences,
        pg = page.bounds,
        bleedLeft = page.side == PageSideOptions.RIGHT_HAND ? 0 : prfs.documentBleedInsideOrLeftOffset,
        bleedRight = page.side == PageSideOptions.LEFT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset;
    var y1 = pg[0] - prfs.documentBleedTopOffset,
        x1 = pg[1] - bleedLeft,
        y2 = pg[2] + prfs.documentBleedBottomOffset,
        x2 = pg[3] + bleedRight;
    return [y1, x1, y2, x2];
}