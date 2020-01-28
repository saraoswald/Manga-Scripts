// ----------- Force Lowercase ----------- // 
/* 
    Forces all characters in the selected text frames to be lowercase.
*/

var doc = app.activeDocument;

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i];
        hasErrors = isError(textFrame);

        if (!hasErrors) {
            forceLower(textFrame);
        };
    }
}

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        alert('Please select some text frames and try again');
        return true;
    }
    return false;
}

function forceLower(frame) {
    frame.contents = frame.contents.toLowerCase();
}

main();