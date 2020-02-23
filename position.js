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
var bookSize = Number(doc.pages.lastItem().name); // num of pages in .indd
var allGraphics = doc.allGraphics;

// Array.indexOf polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
// This version tries to optimize by only checking for "in" when looking for undefined and
// skipping the definitely fruitless NaN search. Other parts are merely cosmetic conciseness.
// Whether it is actually faster remains to be seen.
if (!Array.prototype.indexOf)
    Array.prototype.indexOf = (function(Object, max, min) {
        "use strict"
        return function indexOf(member, fromIndex) {
            if (this === null || this === undefined)
                throw TypeError("Array.prototype.indexOf called on null or undefined")

            var that = Object(this),
                Len = that.length >>> 0,
                i = min(fromIndex | 0, Len)
            if (i < 0) i = max(0, Len + i)
            else if (i >= Len) return -1

            if (member === void 0) { // undefined
                for (; i !== Len; ++i)
                    if (that[i] === void 0 && i in that) return i
            } else if (member !== member) { // NaN
                return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
            } else // all else
                for (; i !== Len; ++i)
                if (that[i] === member) return i

            return -1 // if the value was not found, then return -1
        }
    })(Object, Math.max, Math.min)

main();

function main() {
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if (allGraphics.length === 0) {
        alert('Could not find any linked graphics in this document.');
    } else if (app.documents.length != 0) {
        myDisplayDialog();
    }
};

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
                    oddPages.scaleCheckbox = checkboxControls.add({ checkedState: defaults.oddPages.scale, staticLabel: "Scale:" });
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
                    pageRangeInput = textEditboxes.add();
                }
            }
        }
        with(dialogColumns.add()) {
            evenPages.enabledCheckbox = enablingGroups.add({ staticLabel: "Even Pages", checkedState: defaults.evenPages.enabled });
            with(evenPages.enabledCheckbox) {
                with(dialogColumns.add()) {
                    evenPages.scaleCheckbox = checkboxControls.add({ checkedState: defaults.oddPages.scale, staticLabel: "Scale:" });
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
        var pageRange = getValidRange(selectedPageRange === 0 ? pageRangeInput.editContents : '1-' + bookSize);
        var regex = /\d{3}(?=\_?\d?\.[A-Za-z]{3,4})/;
        var isOdd = function(n) { return oddPages.enabledCheckbox.checkedState && n % 2 > 0 },
            isEven = function(n) { return evenPages.enabledCheckbox.checkedState && n % 2 == 0 };

        if (selectedPageRange === 0 && pageRange.length === 0) {
            alert('Please enter a valid page range (e.g. "12, 32-33")');
            needsReview = true;
        }

        var extractPageNum = function(graphic) {
            var path = graphic && graphic.itemLink && graphic.itemLink.filePath || null;
            var regexResult = regex.exec(path);
            return path && regexResult !== null && regexResult.length > 0 ?
                parseInt(regexResult[0], 10) : 0;
        }
        var isInRange = function(pageNum) {
            return pageNum !== NaN &&
                (isOdd(pageNum) || isEven(pageNum)) &&
                pageRange.indexOf(pageNum) >= 0;
        }
        var transformPage = function(pageNum, pageIndex, data) {
            if (!isInRange(pageNum)) return;
            if (data.scaleCheckbox.checkedState) {
                scalePage(pageIndex, data.scaleFactor.editValue);
            };
            shiftPage(pageIndex, data.shiftRight.editValue, data.shiftDown.editValue);
        }

        for (var i = 0; i < allGraphics.length; i++) {
            var pageNum = extractPageNum(allGraphics[i]);
            if (pageNum > 0) transformPage(pageNum, i, isOdd(pageNum) ? oddPages : evenPages);
        }

        if (!needsReview) {
            myDialog.destroy();
        }
    } else {
        myDialog.destroy();
    }
}

function getValidRange(inp) {
    var getRange = function(start, stop) {
        var res = []
        for (var i = start; i <= stop; i++) res.push(i); // who needs polyfill when you have for loops amirite
        return res;
    }

    var getCleanVal = function(inp) {
        var nums = inp.split('-');
        var x = parseInt(nums[0]),
            y = parseInt(nums[1]) || parseInt(nums[0]);
        return (nums.length > 0 &&
            x && y &&
            x <= y &&
            x <= bookSize && y <= bookSize
        ) ? getRange(x, y) : false;
    }
    var arr = inp.replace(/\s/g, '').split(',');
    var resArr = [];
    for (var i = 0; i < arr.length; i++) {
        var cleanVal = getCleanVal(arr[i]);
        if (cleanVal) {
            resArr = resArr.concat(cleanVal);
        }
    }
    return resArr.sort();
}

function scalePage(pageIndex, scaleFactor) {
    allGraphics[pageIndex].absoluteHorizontalScale = parseInt(scaleFactor);
    allGraphics[pageIndex].absoluteVerticalScale = parseInt(scaleFactor);
}

function shiftPage(pageIndex, right, down) {
    if (right === 0 && down === 0) return;
    allGraphics[pageIndex].move(undefined, [right, down]);
}