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
    fileType: 0
};

var doc = app.activeDocument;
var bookSize = doc.pages.count(); // num of pages in .indd
var imagesLayer = doc.activeLayer.allGraphics;

main();

function main() {
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if (imagesLayer.length === 0) {
        alert('Please select the layer with all of your linked images and try again');
    } else if (app.documents.length != 0) {
        myDisplayDialog();
    }
};

function myDisplayDialog() {
    myDialog = app.dialogs.add({ name: "Layout Pages" });
    var supportedFileTypes = ["TIFF", "PSD"];
    var regexs = ["[0-9][0-9]?[0-9]?(?=\.(tif|tiff|TIFF|TIF))", "[0-9][0-9]?[0-9]?(?=\.(psd|PSD))"];
    var fileTypeDropdown;
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
                staticTexts.add({ staticLabel: "File Type:" });
                with(dialogColumns.add()) {
                    fileTypeDropdown = dropdowns.add({ stringList: supportedFileTypes, selectedIndex: defaults.fileType });
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
        var regex = new RegExp(regexs[fileTypeDropdown && fileTypeDropdown.selectedIndex || 0]);
        if (oddPages.enabledCheckbox.checkedState) {
            if (oddPages.scaleCheckbox.checkedState) {
                scalePages("odd", oddPages.scaleFactor.editValue, regex);
            }
            shiftPages("odd", oddPages.shiftRight.editValue, oddPages.shiftDown.editValue, regex);
        }
        if (evenPages.enabledCheckbox.checkedState) {
            if (evenPages.scaleCheckbox.checkedState) {
                scalePages("even", evenPages.scaleFactor.editValue, regex);
            }
            shiftPages("even", evenPages.shiftRight.editValue, evenPages.shiftDown.editValue, regex);
        }

        myDialog.destroy();
    } else {
        myDialog.destroy();
    }
}

function scalePages(side, scaleFactor, regex) {
    for (var i = 0; i < bookSize; i++) {
        try {
            var path = imagesLayer[i].itemLink.filePath || '';
            var pageNum = parseInt(regex.exec(path), 10);
            if (pageNum && (side == "odd" && pageNum % 2 > 0) || (side == "even" && pageNum % 2 == 0)) {
                // rescale images
                imagesLayer[i].absoluteHorizontalScale = parseInt(scaleFactor);
                imagesLayer[i].absoluteVerticalScale = parseInt(scaleFactor);
                $.write("scaled page #" + pageNum + "\n");
            }
        } catch (e) {
            $.write(e);
        }
    };
};

function shiftPages(side, right, down, regex) {
    if (right === 0 && down === 0) return;
    var pageNum, pageLink, i;
    try {
        for (i = 0; i < bookSize; i++) {
            var path = imagesLayer[i].itemLink.filePath || '';
            var pageNum = parseInt(regex.exec(path), 10);
            if (pageNum && (side == "odd" && pageNum % 2 > 0) || (side == "even" && pageNum % 2 == 0)) {
                imagesLayer[i].move(undefined, [right, down]);
                $.write("shifted page #" + pageNum + "\n");
            }
        }
    } catch (e) {
        $.write(e);
    };
};