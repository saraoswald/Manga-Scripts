// ----------- Add Break to Bottom ----------- // 
/* 
    Places a space between the last two words in a text frame. 
    Before: 
        _________________
        |               |
        |   I'm sorry   |
        |about the wait.|
        |               |
        |_______________|
    After:
        _________________
        |               |
        |   I'm sorry   |
        |   about the   |
        |     wait.     |
        |_______________|



    ----------- New Feature 04/03/2020 -----------
        - Breaks on a hyphen if there are no spaces in the text frame
    Before: 
        _________________
        |               |
        |   Asako-san!  |
        |               |
        |_______________|

    After: 
        _________________
        |               |
        |     Asako-    |
        |      san!     |
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
            textFrame.contents = addBreakEnd(textFrame.contents);
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

// replaces the last space with a line break
function addBreakEnd(str) {
    str = str.trim();
    // if there are no spaces in the string, break at a hyphen
    var delimiter = str.split(' ').length > 1 ? ' ' :
        (str.split('-').length === 2 ? '-' :
            ' '); // there's no indexOf RIP
    var arr = str.split(delimiter);

    return arr.length > 1 ?
        arr.slice(0, arr.length - 1).join(delimiter) + delimiter + '\n' + arr[arr.length - 1] :
        str;
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}



main();