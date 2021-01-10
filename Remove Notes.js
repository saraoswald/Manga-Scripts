// ----------- Remove Notes ----------- // 
/* 
    Remove all the notes contained in brackets in a text frame.
    Before: 
        I love you. [note: from vol 5, page 35]
    After:
        I love you.
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
            textFrame.contents = removeNotes(textFrame);
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
function removeNotes(textFrame) {
    return textFrame.contents.replace(/\[.+\]/g, '').trim()
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

main();