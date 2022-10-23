/* 
    Convert Text to Outlines.js

    Updated: October 23 2022, Sara Linsley (InDesign 2022)
    
    ----------------

    Purpose:
        Converts text frames in an InDesign document to outlines, given some search criteria for text in the Find/Replace dialog.

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Instructions: 
        - Open a document in InDesign.
        - Open the Find/Replace dialog (Ctrl/Cmd + F), and provide some search criteria. E.g., Find Format: "CCMeanwhile + Regular"
        - Run this script.
        - Confirm that the number of text frames that's listed in the dialog that pops up seems correct. 
*/

/* ------ Progress Bar Utility Functions ------ */

// define popup at the top level to please the runtime
var progressBarWindow = new Window("palette", "Converting to Outlines...");
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

function main() {
    findResults = doc.findText();
    if (!isError(findResults)) {
        makeOutlines(findResults);
    }
}

function isError(findResults) {
    if (findResults.length < 1) {
        return alert("There were no results found with the given search criteria. Please open the Find/Change dialog and adjust the preferences.")
    }

    // Check to make sure some preferences are set
    if (app.findTextPreferences.appliedFont == "" &&
        app.findTextPreferences.appliedCharacterStyle == "" &&
        app.findTextPreferences.appliedParagraphStyle == "") {
        return !confirm("There was no font, character style, or paragraph style specified in the Find/Change dialog. Continue anyway?")
    }

    return !confirm("There were " + findResults.length.toString() + " text frame(s) that matched the search criteria. Would you like to continue with converting them into outlines?");
}

function makeOutlines(findResults) {
    startProgressBar(findResults.length)
    for (var i = 0; i < findResults.length; i++) {
        updateProgressBar(i + 1);

        currentText = findResults[i];
        parentTextFrame = currentText.parentTextFrames[0]
        if (parentTextFrame && parentTextFrame.createOutlines) parentTextFrame.createOutlines();
    }
    destroyProgressBar();
}

try { main() } catch (err) { alert(err) }