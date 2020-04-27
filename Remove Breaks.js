// ----------- Remove Breaks ----------- // 
/* 
    Remove all the line breaks (Command+Return on Mac, Ctrl+Return on PC) in a text frame

    Very useful for when you've been manually balancing a paragraph and it looks worse than when you started 
*/

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i] instanceof InsertionPoint ?
            selections[i].parentTextFrames[0] :
            selections[i];
        var frameHasErrors = isError(textFrame);
        hasErrors = hasErrors || isError(textFrame);

        if (!frameHasErrors) {
            textFrame.contents = removeBreaks(textFrame);
        };
    }

    if (hasErrors) alert('Please select some text frames and try again');
}

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        return true;
    }
    return false;
}

// replaces the first space with a line break
function removeBreaks(textFrame) {
    return textFrame.contents.trim().replace(/\n/g, '');
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

main();