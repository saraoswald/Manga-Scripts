// ----------- Adjust Size and Leading - Increase ----------- // 
/* 
    Increases the size and leading of a selected text frame by the user's leading setting. 
        - Change this setting in Preferences > Units & Increments > Keyboard Increments > Size/Leading

    This is a sister script to "Adjust Size and Leading - Decrease" 

    Updated: Sep 17 2021 - Sara Linsley
*/

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i] instanceof InsertionPoint ?
            selections[i].parentTextFrames[0] :
            selections[i];
        // use the document's increment setting for convenience
        var increment = app.activeDocument.textPreferences.leadingKeyIncrement;
        // increase the leading and font size for all the paragraphs in the 
        forEach(textFrame.paragraphs, adjustSizeAndLeading(increment))
    }
}

function adjustSizeAndLeading(increment) {
    return function(paragraph) {
        // Increase the font size
        paragraph.pointSize = paragraph.pointSize + increment;

        // Increase the leading size
        var currentLeadingValue = paragraph.leading;
        // if the leading is already set to "Auto", then compute the current leading value
        if (paragraph.leading === Leading.AUTO) {
            currentLeadingValue = (paragraph.autoLeading / 100) * paragraph.pointSize;
        }
        // add increment to current value
        paragraph.leading = currentLeadingValue + increment;
    }
}

// basically Array.forEach
function forEach(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
        fn(arr[i]);
    }
}

main();