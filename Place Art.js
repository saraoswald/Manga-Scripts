/* 
    Place Art.js

    Updated: May 3 2021, Sara Linsley
    
    ----------------

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Usage Instructions: 
        - Create a new document with the correct size specifications.
        - Run Place Art.js.
        - Select your art files from the selection menu.
        - Select whether to allow this script to detect page numbers from the file names,
            or to place them sequentially based on a provided starting page
        - Select optional changes
            - Scale all the images as they're placed with "Scale Percentage(%)"
                - this MUST be a whole number to work (e.g. 119)
            - If the binding is set to "Left to Right", select whether or not to place the images "backwards",
                (e.g. 001.tif would be placed on the last page in the document)

    Important Notes: 
        - This is a really intensive operation on your computer. You might need to do it in batches. 
        - This script *will not* place art on locked layers, so protect your other work by locking layers 
        - This was originally intended for manga placement, which is "backwards" compared to other English-language books.
          Change the "thisIsManga" variable just below here if you'd like to always use this for non-manga projects. 
*/

var thisIsManga = true; // change this to "false" (no quotation marks) if you don't need art to be placed backwards


/* ------ Progress Bar Utility Functions ------ */

// define popup at the top level to please the runtime
var progressBarWindow = new Window("palette", "Placing Art...");
progressBarWindow.minimumSize = { width: 250, height: 50 }; // this can't be set during initialization despite what the documentation says!!
var progressBar = progressBarWindow.add('progressbar', undefined, 'Progress');

function progressBarStatusText(curr, maxValue, message) {
    return curr.toString() + "/" + maxValue.toString() + ' ' + (message || '');
}

function startProgressBar(maxValue, message) {
    // get a little progress bar going
    progressBar.maxvalue = maxValue;
    progressBar.minimumSize = { width: 200, height: 10 };
    // the static text's length can't be edited once it's initialized, so try to simulate how long the string will get
    // (progressBar.minWidth does absolutely nothing)
    progressBarWindow.add('statictext', undefined, progressBarStatusText(maxValue, maxValue, message));
    progressBarWindow.show();
}

function updateProgressBar(curr, message) {
    // update progress bar values + text
    progressBar.value = curr;
    progressBarWindow.children[1].text = progressBarStatusText(curr, progressBar.maxvalue, message);
    progressBarWindow.update();
}

function destroyProgressBar() {
    progressBarWindow.close();
}

/* ------ Start of Script ------ */

var doc = app.activeDocument;
var bookSize = doc.pages.count();
var isLtR = doc.documentPreferences.pageBinding == PageBindingOptions.LEFT_TO_RIGHT;

var anchorPoints = {
    'Center': AnchorPoint.CENTER_ANCHOR,
    'Top Center': AnchorPoint.TOP_CENTER_ANCHOR,
    'Top Left': AnchorPoint.TOP_LEFT_ANCHOR,
    'Top Right': AnchorPoint.TOP_RIGHT_ANCHOR,
    'Bottom Center': AnchorPoint.BOTTOM_CENTER_ANCHOR,
    'Bottom Left': AnchorPoint.BOTTOM_LEFT_ANCHOR,
    'Bottom Right': AnchorPoint.BOTTOM_RIGHT_ANCHOR,
    'Left Center': AnchorPoint.LEFT_CENTER_ANCHOR,
    'Right Center': AnchorPoint.RIGHT_CENTER_ANCHOR,
}

var anchorPointLabels = [
    'Center',
    'Top Center',
    'Top Left',
    'Top Right',
    'Bottom Center',
    'Bottom Left',
    'Bottom Right',
    'Left Center',
    'Right Center',
]; // ExtendScript doesn't have Object.keys :')

var anchorPointsValues = [
    AnchorPoint.CENTER_ANCHOR,
    AnchorPoint.TOP_CENTER_ANCHOR,
    AnchorPoint.TOP_LEFT_ANCHOR,
    AnchorPoint.TOP_RIGHT_ANCHOR,
    AnchorPoint.BOTTOM_CENTER_ANCHOR,
    AnchorPoint.BOTTOM_LEFT_ANCHOR,
    AnchorPoint.BOTTOM_RIGHT_ANCHOR,
    AnchorPoint.LEFT_CENTER_ANCHOR,
    AnchorPoint.RIGHT_CENTER_ANCHOR,
];

function getAppAnchorPoint() {
    var res = 0;
    for (var i = 0; i < anchorPointsValues.length; i++) {
        if (anchorPointsValues[i] === app.activeWindow.transformReferencePoint)
            res = i;
    }
    return res;
};

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
    if (artFiles !== null) {
        var artFilesToPageNums = [];
        for (var i = 0; i < artFiles.length; i++) {
            var file = artFiles[i];
            artFilesToPageNums.push([file, extractPageNum(file)])
        }
        startDialog(artFilesToPageNums);
    }
} catch (err) { alert(err) }; // the debugger that will never let u down :')

function startDialog(artFilesToPageNums) {
    w = new Window("dialog", "Place Art");
    w.alignChildren = "fill";

    // ---- First row ----

    w.add('group').add('statictext', [0, 0, 400, 50], "This script can either try to detect what page an image should go on based on its file name, or place them sequentially based on a given starting page.", { multiline: true });

    // ---- Second row ----

    var grp = w.add('group');
    grp.alignChildren = "left";
    // Radio buttons
    var radioGroup = grp.add('panel', undefined, "Place Files Based On:");
    radioGroup.alignChildren = "left";
    var useFileNamesRadio = radioGroup.add('radiobutton', undefined, "File Names");
    var useStartingPageRadio = radioGroup.add('radiobutton', undefined, "Starting Page:");
    // set default radio selection
    useFileNamesRadio.value = true;


    // Starting page text input
    var currentPage = (isLtR && !thisIsManga) || !isLtR ? app.activeWindow.activePage.name : '';
    var startingPageInput = radioGroup.add('edittext', undefined, currentPage);
    startingPageInput.alignment = "fill";

    // List of files and their page numbers
    var fileList = grp.add('listbox', undefined, "", {
        numberOfColumns: 2,
        showHeaders: true,
        columnTitles: ["Image Name", "Page Number"]
    });
    fileList.maximumSize = [500, 500];
    fileList.alignment = "fill";

    function fillFileList(array, pageNumFn) {
        fileList.removeAll();
        for (var i = 0; i < array.length; i++) {
            with(fileList.add("item", array[i][0].name)) {
                subItems[0].text = pageNumFn ? pageNumFn(i) : (array[i][1] || '??');
            }
        }
    }
    fillFileList(artFilesToPageNums);

    // ---- Optional Placement Settings ----

    var placementOptionsGroup = w.add('panel', undefined, "Placement Options");
    placementOptionsGroup.alignChildren = "fill";

    // Scale Percentage
    // TODO: some validation on this field?
    var spGrp = placementOptionsGroup.add('group');
    spGrp.add('statictext', undefined, "Scale Percentage (%):");
    var scaleFactorInput = spGrp.add('edittext', undefined, '100');
    scaleFactorInput.characters = 5;


    //  Anchor (Reference) Point
    var apGrp = placementOptionsGroup.add('group');
    apGrp.add('statictext', undefined, "Reference Point:");
    var anchorPointDd = apGrp.add('dropdownlist', undefined, anchorPointLabels);

    anchorPointDd.selection = getAppAnchorPoint();

    //LtR checkbox row
    // If the binding is Left to Right
    // Check to see which direction the user wants to place the images
    var placeBackwardsInput = placementOptionsGroup.add('checkbox', undefined, "Place images in the \"backwards\" manga style");
    placeBackwardsInput.value = thisIsManga;
    if (!isLtR) placeBackwardsInput.hide();


    // ---- Final (Button) row ----

    // OK and Cancel buttons
    var buttonsGroup = w.add('group');
    var okButton = buttonsGroup.add('button', undefined, 'Place Art', { name: 'ok' });
    buttonsGroup.add('button', undefined, 'Cancel', { name: 'cancel' });

    // ---- Validation Functions ----
    function validateNum(inp) {
        return !!inp.text.match(/^-{0,1}\d*\.{0,1}\d+$/);
    }

    function validateStartingPage() {
        // make sure there are no non-number values
        // and that the given number is less than or equal to the book's last page
        return validateNum(startingPageInput) &&
            parseInt(startingPageInput.text) <= parseInt(doc.pages.lastItem().name);
    }

    // ---- Event Handling ----

    useFileNamesRadio.onActivate = function() {
        fillFileList(artFilesToPageNums);
        okButton.enabled = true
    };
    useStartingPageRadio.onActivate = function() {
        var isStartingPageValid = validateStartingPage();
        var startingPage = parseInt(startingPageInput.text);
        if (isStartingPageValid) fillFileList(artFilesToPageNums, function(i) { return i + startingPage });
        okButton.enabled = validateStartingPage()
    };
    startingPageInput.onChanging = function() {
        var isStartingPageValid = validateStartingPage();
        var startingPage = parseInt(startingPageInput.text);
        if (isStartingPageValid) fillFileList(artFilesToPageNums, function(i) { return i + startingPage });
        okButton.enabled = useStartingPageRadio.value === true && validateStartingPage()
    };

    var myReturn = w.show();
    if (myReturn == true) {
        try {
            thisIsManga = placeBackwardsInput.value; // grab the checkbox value and assign it to the global variable
            var startingPage = useStartingPageRadio.value === true ? startingPageInput.text : null;
            placeArtOnAllPages(artFiles, startingPage, {
                scaleFactor: validateNum(scaleFactorInput) ? parseFloat(scaleFactorInput.text) : 100,
                anchorPoint: anchorPoints[anchorPointDd.selection]
            });
        } catch (err) { alert(err) }
    }
}

function placeArtOnAllPages(artFiles, startingPage, options) {
    var hasErrors = false,
        pagesCount = 0; // for debugging :')
    if (artFiles !== null && artFiles.length > 0) { // in case the user pressed cancel or something
        startProgressBar(artFiles.length, artFiles[0].name);
        var pageNum = startingPage; // null if the user wants the number determined from the file name
        for (var i = 0; !hasErrors && i < artFiles.length; i++) {
            // actually place the art
            hasErrors = placeArtOnPage(artFiles[i], pageNum, options);
            if (pageNum !== null) pageNum++;

            if (!hasErrors) pagesCount++; // keep track of how many images succeeded

            updateProgressBar(i + 1, artFiles[i].name);
        }
        destroyProgressBar();
    }
    return hasErrors, pagesCount;
}

function placeArtOnPage(artLink, pageNum, options) {
    if (!pageNum) pageNum = extractPageNum(artLink)
    var hasErrors = pageNum < 1;
    if (!hasErrors) {
        var image = new File(artLink);
        // determine INDD page number based on book binding
        var bookPageNum = thisIsManga && isLtR ? bookSize - pageNum + 1 : pageNum; // LtR books are "backwards", where "Page 1" the last page in the document
        var page = doc.pages.itemByName(bookPageNum.toString()); // which page in the INDD to place the art on

        hasErrors = prePlaceErrorHandling(page, bookPageNum, bookSize, image, artLink);

        if (!hasErrors) {
            var frameWithArt = placeArtOnPageHelper(page, targetLayer, image);
            if (frameWithArt) {
                // if successfully placed art, apply options
                // just assume there's only one placed grapic per page
                if (options.scaleFactor && frameWithArt.graphics && frameWithArt.graphics[0].isValid) {
                    scalePage(frameWithArt.graphics[0], options);
                }
            }
        }
    }
    return hasErrors;
}

function placeArtOnPageHelper(page, layer, image) {
    var frame = getFrame(page, layer);
    if (frame) frame.place(image);
    return frame
}

function prePlaceErrorHandling(page, pageNum, image, imageLink) {
    var debugInfo = "\n\n----Debug Info Below----\nPage number the script calculated from the link: " + pageNum.toString() + "\nNumber of pages in book: " + bookSize.toString() + "\nImage that messed up: " + imageLink;

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


function scalePage(graphic, options) {
    if (options.scaleFactor === 100) return; // don't waste resources if the scale factor wasn't changed
    var scaleMatrix = app.transformationMatrices.add({ horizontalScaleFactor: options.scaleFactor / 100, verticalScaleFactor: options.scaleFactor / 100 });
    graphic.transform(CoordinateSpaces.INNER_COORDINATES, options.anchorPoint, scaleMatrix);
}