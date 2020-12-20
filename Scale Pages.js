/* 
    Scale Pages.js

    Updated: Dec 20 2020, Sara Linsley
    
    ----------------

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Purpose: 
        Sometimes a pages that have already been lettered need to be adjusted in size
        to meet the bleed and margin requirments. This script allows you to scale all
        of the art and text at once, for multiple pages.

    Usage Instructions: 
        - Open an InDesign document
        - Run Place Art.js
        - Provide a factor by which to scale page items
        - Specify whether to scale a range of pages or all of them
        - Hit "OK"

    Important Notes: 
        - This is a really intensive operation on your computer. It will take a while. 
        - This script *will not* place art on locked layers, so protect your other work by locking layers 
        - This script ignores page binding settings. Page 1 to the script is Page 1 to InDesign. 
*/

var doc = app.activeDocument;

function myDisplayDialog() {
    myDialog = app.dialogs.add({ name: "Scale Pages" });
    var supportedPageRangeTypes = ["Range", "All"];
    var pageRangeControl, pageRangeInput;
    var scaleFactor;
    with(myDialog) {
        with(dialogColumns.add()) {
            with(dialogRows.add()) {
                staticTexts.add({ staticLabel: "Resize all text and graphics in unlocked layers." });
            }
            with(dialogRows.add()) {
                staticTexts.add({ staticLabel: "Scale Factor:" });
                scaleFactor = percentEditboxes.add({ editValue: 100 });
            }

            with(dialogRows.add()) {
                staticTexts.add({ staticLabel: "Pages:" });

                pageRangeControl = radiobuttonGroups.add();
                with(pageRangeControl) {
                    for (var i = 0; i < supportedPageRangeTypes.length; i++) {
                        radiobuttonControls.add({ staticLabel: supportedPageRangeTypes[i], checkedState: i == 0, minWidth: 65 });
                    }
                    pageRangeInput = textEditboxes.add({ editContents: app.activeWindow.activePage.name });
                }
            }
        }

    }
    var myReturn = myDialog.show();
    if (myReturn == true) {
        var needsReview = false;
        var selectedPageRange = pageRangeControl.selectedButton;
        var pageRange = selectedPageRange === 0 ? getValidRange(pageRangeInput.editContents) : doc.pages;

        if (selectedPageRange === 0 && pageRange.length === 0) {
            alert('Please enter a valid page range (e.g. "12, 32-33")');
            needsReview = true;
        }

        resizePages(scaleFactor.editValue, pageRange)

        if (!needsReview) {
            myDialog.destroy();
        }
    } else {
        myDialog.destroy();
    }
}


// returns sorted array of numbers based on given range string
// e.g. "11-13, 23" returns [11,12,13,23]
function getValidRange(inp) {
    var getRange = function(start, stop) {
        var res = []
        for (var i = start; i <= stop; i++) res.push(i); // who needs polyfill when you have for loops amirite
        return res;
    }

    var getCleanRange = function(inp) {
        var nums = inp.split('-');
        var x = parseInt(nums[0]),
            y = parseInt(nums[1]) || parseInt(nums[0]);
        return (nums.length > 0 &&
            x && y &&
            x <= y
        ) ? getRange(x, y) : false;
    }

    var arr = inp.replace(/\s/g, '').split(',');
    var resArr = [];
    for (var i = 0; i < arr.length; i++) {
        var cleanRange = getCleanRange(arr[i]);
        for (var j = 0; cleanRange && j < cleanRange.length; j++) {
            var pageObj = cleanRange[j] ? doc.pages.itemByName(cleanRange[j].toString()) : {};
            if (pageObj.isValid) {
                resArr.push(pageObj);
            }
        }
    }
    return resArr.sort();
}

var selectAllOnPage = function() {
    var filterFrames = function(pageItem) { return !pageItem.itemLayer.locked && !pageItem.locked };
    var selection = filter(app.activeWindow.activePage.pageItems, filterFrames);
    app.selection = selection;
    return selection;
}


// returns whether or not a given frame is fully past a page's margins
// uses the margin as a reference point instead of page bounds or bleed due to floating point issues :/
function isFramePastMargin(page, frame) {
    var prfs = page.marginPreferences,
        pb = page.bounds,
        fb = frame.geometricBounds;
    return fb[0] <= pb[0] + prfs.top &&
        fb[1] <= pb[1] + prfs.left &&
        fb[2] >= pb[2] - prfs.bottom &&
        fb[3] >= pb[3] - prfs.right;
}

// takes bounds input and gives output in the form [y1, x1, y2, x2]
// adds the document setting for bleed, taking into account the gutter
function getPageBleed(page) {
    var prfs = doc.documentPreferences,
        pb = page.bounds,
        bleedLeft = page.side == PageSideOptions.RIGHT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset,
        bleedRight = page.side == PageSideOptions.LEFT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset;
    return [
        pb[0] - prfs.documentBleedTopOffset, //y1
        pb[1] - bleedLeft, // x1
        pb[2] + prfs.documentBleedBottomOffset, // y2
        pb[3] + bleedRight // x2
    ]
}

// grab menu actions so we can invoke them later
var doScaleUpOne = app.menuActions.itemByName("Increase scale by 1%");
var doScaleUpFive = app.menuActions.itemByName("Increase scale by 5%");
var doScaleDownOne = app.menuActions.itemByName("Decrease scale by 1%");
var doScaleDownFive = app.menuActions.itemByName("Decrease scale by 5%");
// Recursively scale the page, starting with 5% increments, 
// until the equillibrium point of 100%
function scaleSelected(factor) {
    if (factor === 100) return;
    if (factor > 104 && doScaleUpFive.enabled) {
        doScaleUpFive.invoke();
        scaleSelected(factor - 5);
    } else if (factor > 100 && doScaleUpOne.enabled) {
        doScaleUpOne.invoke();
        scaleSelected(factor - 1);
    } else if (factor < 96 && doScaleDownFive.enabled) {
        doScaleDownFive.invoke();
        scaleSelected(factor + 5);
    } else if (factor < 100 && doScaleDownOne.enabled) {
        doScaleDownOne.invoke();
        scaleSelected(factor + 1);
    } else { return }
}


function resizePages(scaleFactor, pageRange) {
    if (scaleFactor === 100) return; // don't waste resources if the scale factor wasn't changed

    var resizePage = function(page) {
        // change the active page
        app.activeWindow.activePage = page;

        // select everything that's not in a locked layer on the page
        var selected = selectAllOnPage();

        // keep track of frames that are past the margin, so that we can refit them to the bleed later
        var needsToBeFitted = filter(selected, function(s) { return isFramePastMargin(page, s) });

        // scale everything that's selected by the given scale value
        scaleSelected(scaleFactor);

        // refit anything that was larger than the margin to the bleed
        // this is intended for base art frames
        forEach(needsToBeFitted, function(f) { return f.geometricBounds = getPageBleed(page) });
    }

    forEach(pageRange, resizePage);
}

// basically Array.filter
function filter(arr, filterFn) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
        if (filterFn(arr[i])) {
            res.push(arr[i])
        }
    }
    return res;
}
// basically Array.forEach
function forEach(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
        fn(arr[i]);
    }
}

try {
    myDisplayDialog();
} catch (err) { alert(err) }