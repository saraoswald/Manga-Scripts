// ----------- Add Break to Top ----------- // 
/* 
    Places a space between the first two words in a text frame. 
    Before: 
        _________________
        |               |
        |   I'm sorry   |
        |   about the   |
        |     wait.     |
        |_______________|
    After:
        _________________
        |      I'm      |
        |     sorry     |
        |   about the   |
        |     wait.     |
        |_______________|
*/

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i] instanceof InsertionPoint ?
            selections[i].parentTextFrames[0] :
            selections[i];
        hasErrors = isError(textFrame);

        if (!hasErrors) {
            textFrame.contents = addBreakTop(textFrame.contents);
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

// replaces the first space with a line break
function addBreakTop(str) {
    return str.trim().replace(' ', '\n');
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

main();