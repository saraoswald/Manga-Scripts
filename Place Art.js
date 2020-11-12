/* 
    Place Art.js

    Updated: Nov 12 2020
    
    ----------------

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Usage Instructions: 
        - Create a new document with the correct size specifications.
        - Run Place Art.js.
        - Select your art files from the selection menu.
        - Wait for the art to be placed. You should see images appearing on the pages and links appearing in the Links Panel. If not, you might need to place the art manually.

    Important Notes: 
        - This is a really intensive operation on your computer. You might need to do it in batches. 
        - This script *will not* place art on locked layers, so protect your other work by locking layers 
        - This was originally intended for manga placement, which is "backwards" compared to other English-language books.
          Change the "thisIsManga" variable just below here if you'd like to use this for non-manga projects. 
*/

var thisIsManga = true; // change this to "false" (no quotation marks) if you don't need art to be placed backwards

var doc = app.activeDocument;
var bookSize = doc.pages.count();
var isLtR = doc.documentPreferences.pageBinding == PageBindingOptions.LEFT_TO_RIGHT;

// define popup at the top level to please the runtime
var progressBarWindow = new Window("palette", "Placing Art");
progressBarWindow.minimumSize = { width: 250, height: 50 }; // this can't be set during initialization despite what the documentation says!!

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
        var pagesCount = 0; // for debugging :')
        var hasErrors = false;


        // get a little progress bar going
        var progressBar = progressBarWindow.add('progressbar', undefined, 'Progress', artFiles.length);
        progressBar.minimumSize = { width: 200, height: 10 };
        // construct info label for the progress bar's.... progress
        function getCurrPage(curr, file) {
            return curr.toString() + "/" + artFiles.length.toString() + " - " + file.name;
        }
        // the static text's length can't be edited once it's initialized, so try to simulate how long the string will get
        // (progressBar.minWidth does absolutely nothing)
        var progressNumber = progressBarWindow.add('statictext', undefined, getCurrPage(artFiles.length, artFiles[0]));
        progressBarWindow.show();

        for (var i = 0; !hasErrors && i < artFiles.length; i++) {
            // actually place the art
            hasErrors = placeArtOnPage(artFiles[i]);
            if (!hasErrors) pagesCount++; // keep track of how many images succeeded
            // update progress bar values + text
            progressBar.value = i;
            progressNumber.text = getCurrPage(i + 1, artFiles[i]);
            progressBarWindow.update();
        }

        progressBarWindow.close();

        if (!hasErrors && pagesCount === 0) alert("No art files found! Make sure the file names are formatted like 123.TIF");
    }
} catch (err) { alert(err) }; // the debugger that will never let u down :')


function placeArtOnPage(artLink) {
    var pageNum = extractPageNum(artLink)
    var hasErrors = pageNum < 1;
    if (!hasErrors) {
        var image = new File(artLink);
        // determine INDD page number based on book binding
        var bookPageNum = thisIsManga && isLtR ? bookSize - pageNum + 1 : pageNum; // LtR books are "backwards", where "Page 1" the last page in the document
        var page = doc.pages.itemByName(bookPageNum.toString()); // which page in the INDD to place the art on

        hasErrors = prePlaceErrorHandling(page, bookPageNum, bookSize, image, artLink);

        if (!hasErrors) {
            placeArtOnPageHelper(page, targetLayer, image);
        }
    }
    return hasErrors;
}

function placeArtOnPageHelper(page, layer, image) {
    var frame = getFrame(page, layer);
    if (frame) frame.place(image);
}

function prePlaceErrorHandling(page, pageNum, image, imageLink) {
    var debugInfo = "\n\n----Debug Info Below----\nPage number the script calculated from the link: " + pageNum.toString() + "\nNumber of pages in book: " + bookSize.toString() + "\nImage that messed up: " + imageLink;

    if (pageNum < 0 || pageNum > bookSize) {
        alert("Not enough pages in this document.\nAdd some more pages, and try again.\nIf that doesn't work, try renaming your files to look like '123.TIF'." + debugInfo);
        return true;
    }
    if (!page.isValid || pageNum === 0) {
        alert("Failed to match the number in the file name to one in the book.\nTry renaming your files to look like '123.TIF'." + debugInfo);
        return true;
    }
    if (image.error) {
        alert("Something wrong with the Image\nReview the image link below. Not sure when this would happen, but InDesign couldn't create a File out of the image's link" + debugInfo)
        return true;
    }

    return false; // yay no errors!!
}

function getFrame(page, layer) {
    var targetFrame = null;

    var findFrame = function(arr, ignoreLayer) {
        var returnVal = null;
        // iterate backwards because it's most likely on the bottom
        for (var i = arr.length; i > -1; i-- && returnVal === null) {
            // only grab an object if it's a Rectangle on a non-locked layer
            if (arr[i] && arr[i] instanceof Rectangle &&
                !arr[i].itemLayer.locked &&
                (ignoreLayer || arr[i].itemLayer == layer)) { // if using an element from a master, don't be picky about the layer
                returnVal = arr[i];
            }
        }
        return returnVal;
    }

    // check if there's a master, override the master items and use the frame there 
    if (page.appliedMaster !== null && page.appliedMaster.isValid) {
        var masterFrame = findFrame(page.masterPageItems, true); // look for a frame, but don't be picky about which layer it's on
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

function extractPageNum(path) {
    var regex = /\d{3,4}(?=\_?\d?[a-zA-Z]?\.[A-Za-z]{3,4})/;
    var regexResult = regex.exec(path);
    return path && regexResult !== null && regexResult.length > 0 ?
        parseInt(regexResult[0], 10) : 0;
}

// takes bounds input and gives output in the form [y1, x1, y2, x2]
// adds the document setting for bleed, taking into account the gutter
function getPageBounds(page) {
    var prfs = doc.documentPreferences,
        pb = page.bounds,
        bleedLeft = page.side == PageSideOptions.RIGHT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset,
        bleedRight = page.side == PageSideOptions.LEFT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset;
    var y1 = pb[0] - prfs.documentBleedTopOffset,
        x1 = pb[1] - bleedLeft,
        y2 = pb[2] + prfs.documentBleedBottomOffset,
        x2 = pb[3] + bleedRight;
    return [y1, x1, y2, x2];
}