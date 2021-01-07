// ----------- Refit Overset Frames ----------- // 
/* 
    Refits all of the overflowing frames on either the current page or all pages. 

    Usage Instructions: 
    - Select one or many text frames that are overset
    - Run this script

    This is the same thing as doing `Object > Fitting > Fit Frame to Content`, but on a bunch of text frames at once. 
    UPDATE: Now the script will expand the frame by 1 pixel until it's no longer overset

    Installation Instructions: https://github.com/saraoswald/Manga-Scripts/#how-to-use-scripts-in-indesign

    Nov 21 2020, Sara Linsley
*/

/* ------ Progress Bar Utility Functions ------ */

// define popup at the top level to please the runtime
var progressBarWindow = new Window("palette", "Refitting Overset Frames...");
progressBarWindow.minimumSize = { width: 250, height: 50 }; // this can't be set during initialization despite what the documentation says!!
var progressBar = progressBarWindow.add('progressbar', undefined, 'Progress');

function progressBarStatusText(curr, maxValue) {
    return curr.toString() + "/" + maxValue.toString();
}

function startProgressBar(maxValue) {
    // get a little progress bar going
    progressBar.maxvalue = maxValue;
    progressBar.minimumSize = { width: 200, height: 10 };
    // the static text's length can't be edited once it's initialized, so try to simulate how long the string will get
    // (progressBar.minWidth does absolutely nothing)
    progressBarWindow.add('statictext', undefined, progressBarStatusText(maxValue, maxValue));
    progressBarWindow.show();
}

function updateProgressBar(curr) {
    // update progress bar values + text
    progressBar.value = curr;
    progressBarWindow.children[1].text = progressBarStatusText(curr, progressBar.maxvalue);
    progressBarWindow.update();
}

function destroyProgressBar() {
    progressBarWindow.close();
}

/* ------ Start of Script ------ */

var doc = app.activeDocument;
var usersUnits = app.scriptPreferences.measurementUnit; // so we can revert 'em back later
app.scriptPreferences.measurementUnit = MeasurementUnits.PIXELS;

function myDisplayDialog() {
    myDialog = app.dialogs.add({ name: "Refit Overset Frames" });
    var pageRangeControl;
    with(myDialog) {
        with(dialogColumns.add()) {
            staticTexts.add({ staticLabel: "Fit all the overset frames on:" });
            pageRangeControl = radiobuttonGroups.add();
            with(pageRangeControl) {
                radiobuttonControls.add({ staticLabel: "All Pages", checkedState: 0 });
                radiobuttonControls.add({ staticLabel: "This Page", checkedState: 1 });
            }
            staticTexts.add({ staticLabel: '' });
        }
    }
    var myReturn = myDialog.show();
    if (myReturn == true) {
        try {
            if (pageRangeControl.selectedButton === 0) { // if "All Pages" is selected
                startProgressBar(doc.pages.length);
                for (var i = 0; i < doc.pages.length; i++) {
                    fitFramesOnPage(doc.pages[i]);
                    updateProgressBar(i + 1);
                }
                destroyProgressBar();
            } else { // if "This Page" is selected 
                fitFramesOnPage(app.activeWindow.activePage);
            }
        } catch (err) { alert(err) }

    } else {
        myDialog.close();
    }
    app.scriptPreferences.measurementUnit = usersUnits;
}

// on a given page, loops through all the text frames
// if any of the text frames are overset, refit the frame to accomodate the content
function fitFramesOnPage(page) {
    try {
        var textFrames = page.textFrames;
        for (var i = 0; i < textFrames.length; i++) {
            var frame = textFrames[i];
            if (frame.overflows) {
                // try using InDesign's default Fit Frame to Content feature
                frame.fit(FitOptions.FRAME_TO_CONTENT);
                // if it doesn't work, expand the frame manually
                if (frame.overflows) {
                    doFit(frame);
                }
            }
        }
    } catch (err) { alert(err) }
}

// recursive function that nudges the frame bounds out by 1
// until the frame is no longer overset
function doFit(frame) {
    if (!frame.overflows) return;
    expandFrame(frame, 5);
    doFit(frame);
}

// expands a given frame by a given unit
function expandFrame(frame, by) {
    frame.geometricBounds = transformCoords(frame.geometricBounds, [by * -1, by * -1, by, by]);
}

// applies transformations in the format [y1, x1, y2, x2]
function transformCoords(src, trns) {
    return [
        src[0] + trns[0],
        src[1] + trns[1],
        src[2] + trns[2],
        src[3] + trns[3]
    ];
}

myDisplayDialog();