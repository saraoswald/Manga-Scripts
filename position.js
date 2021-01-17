/* 
    Position.js

    Updated: Jan 17 2020, Sara Linsley
    
    ----------------

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Purpose: 
        Shifts and scales art that's been placed in an InDesign document

    Usage Instructions: 
        - Run Position.js with a document open
        - Specify the scale and shift amounts (in points)
        - Specify which pages to transform
        - Hit OK
        
    Important Notes: 
        - This is a really intensive operation on your computer. You might need to do it in batches. 
*/

// Feel free to change the default values
var defaults = {
    oddPages: {
        enabled: true,
        scale: false,
        scaleFactor: 100,
        shiftRight: 0,
        shiftDown: 0
    },
    evenPages: {
        enabled: true,
        scale: false,
        scaleFactor: 100,
        shiftRight: 0,
        shiftDown: 0
    },
    pageRange: 1, // 0 = Range, 1 = All
};

var doc = app.activeDocument;

function myDisplayDialog() {
    myDialog = app.dialogs.add({ name: "Layout Pages" });
    var supportedPageRangeTypes = ["Range", "All"];
    var pageRangeControl, pageRangeInput;
    var oddPages = {};
    var evenPages = {};
    with(myDialog) {
        with(dialogColumns.add()) {
            oddPages.enabledCheckbox = enablingGroups.add({ staticLabel: "Odd Pages", checkedState: defaults.oddPages.enabled });
            with(oddPages.enabledCheckbox) {
                with(dialogColumns.add()) {
                    oddPages.scaleCheckbox = checkboxControls.add({ checkedState: defaults.oddPages.scale, staticLabel: "Set Image Scale:" });
                    staticTexts.add({ staticLabel: "Shift Right:" });
                    staticTexts.add({ staticLabel: "Shift Down:" });
                }
                with(dialogColumns.add()) {
                    oddPages.scaleFactor = percentEditboxes.add({ editValue: defaults.oddPages.scaleFactor });
                    oddPages.shiftRight = measurementEditboxes.add({ editValue: defaults.oddPages.shiftRight });
                    oddPages.shiftDown = measurementEditboxes.add({ editValue: defaults.oddPages.shiftDown });
                }
            }

            with(borderPanels.add()) {
                staticTexts.add({ staticLabel: "Pages:" });

                pageRangeControl = radiobuttonGroups.add();
                with(pageRangeControl) {
                    for (var i = 0; i < supportedPageRangeTypes.length; i++) {
                        radiobuttonControls.add({ staticLabel: supportedPageRangeTypes[i], checkedState: defaults.pageRange == i, minWidth: 65 });
                    }
                    pageRangeInput = textEditboxes.add({ editContents: app.activeWindow.activePage.name });
                }
            }
        }
        with(dialogColumns.add()) {
            evenPages.enabledCheckbox = enablingGroups.add({ staticLabel: "Even Pages", checkedState: defaults.evenPages.enabled });
            with(evenPages.enabledCheckbox) {
                with(dialogColumns.add()) {
                    evenPages.scaleCheckbox = checkboxControls.add({ checkedState: defaults.oddPages.scale, staticLabel: "Set Image Scale:" });
                    staticTexts.add({ staticLabel: "Shift Right:" });
                    staticTexts.add({ staticLabel: "Shift Down:" });
                }
                with(dialogColumns.add()) {
                    evenPages.scaleFactor = percentEditboxes.add({ editValue: defaults.evenPages.scaleFactor });
                    evenPages.shiftRight = measurementEditboxes.add({ editValue: defaults.evenPages.shiftRight });
                    evenPages.shiftDown = measurementEditboxes.add({ editValue: defaults.evenPages.shiftDown });
                }
            }
        }
    }
    var myReturn = myDialog.show();
    if (myReturn == true) {
        var needsReview = false;
        var selectedPageRange = pageRangeControl.selectedButton;
        var pageRange = selectedPageRange === 0 ? getValidRange(pageRangeInput.editContents, oddPages.enabledCheckbox.checkedState, evenPages.enabledCheckbox.checkedState) : doc.pages;
        var regex = /\d{3,4}(?=\_?\d?\d?[a-zA-Z]?\.[A-Za-z]{3,4})/;

        if (selectedPageRange === 0 && pageRange.length === 0) {
            alert('Please enter a valid page range (e.g. "12, 32-33")');
            needsReview = true;
        }

        var transformPage = function(page, data) {
            if (data.scaleCheckbox.checkedState) {
                scalePage(page, parseInt(data.scaleFactor.editValue));
            };
            shiftPage(page, parseInt(data.shiftRight.editValue), parseInt(data.shiftDown.editValue));
        }

        try {
            for (var i = 0; i < pageRange.length; i++) {
                var page = pageRange[i];
                transformPage(page, parseInt(page.name) % 2 > 0 ? oddPages : evenPages);
            }
        } catch (err) { alert(err) }

        if (!needsReview) {
            myDialog.destroy();
        }
    } else {
        myDialog.destroy();
    }
}

// returns sorted array of numbers based on given range string
// e.g. "11-13, 23" returns [11,12,13,23]
function getValidRange(inp, includeOdd, includeEven) {
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
            var pageNum = cleanRange[j];
            var pageObj = !!pageNum ? doc.pages.itemByName(pageNum.toString()) : {};
            if (pageObj.isValid &&
                (includeOdd && pageNum % 2 > 0) || (includeEven && pageNum % 2 == 0)) { // exclude odd/even values based on checkbox values
                resArr.push(pageObj);
            }
        }
    }
    return resArr.sort();
}

// resets the horizontal and vertical scale of all the graphics on a page to a given factor
function scalePage(page, scaleFactor) {
    if (!page.isValid || scaleFactor === NaN) return;

    var graphics = page.allGraphics;
    for (var i = 0; i < graphics.length; i++) {
        var gr = graphics[i];
        if (isFramePastMargin(page, gr.parent)) {
            gr.absoluteHorizontalScale = scaleFactor;
            gr.absoluteVerticalScale = scaleFactor;
        }
    }
}

function shiftPage(page, right, down) {
    if (right === 0 && down === 0) return;

    for (var i = 0; i < page.allGraphics.length; i++) {
        var gr = page.allGraphics[i];
        if (isFramePastMargin(page, gr.parent)) {
            gr.move(undefined, [right, down]);
        }
    }
}

// returns whether or not a given frame is larger than the page
function isFramePastMargin(page, frame) {
    var pageDims = getBounds(page.bounds),
        frameDims = getBounds(frame.geometricBounds);
    return frameDims.height >= pageDims.height &&
        frameDims.width >= pageDims.width;
}

// converts an array of coordinates into an object in the format {width, height}
// makes math easier to understand :')
function getBounds(bounds) {
    // bounds = x1, y1, x2, y2
    return {
        width: bounds[2] - bounds[0],
        height: bounds[3] - bounds[1]
    }
}


function main() {
    var usersUnits = app.scriptPreferences.measurementUnit; // so we can revert 'em back later
    app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

    if (doc.allGraphics.length === 0) {
        alert('Could not find any linked graphics in this document.');
    } else if (app.documents.length != 0) {
        myDisplayDialog();
    }

    app.scriptPreferences.measurementUnit = usersUnits;
};

try {
    main();
} catch (err) { alert(err) }