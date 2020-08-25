// ----------- Add Break to Second to Bottom ----------- // 
/* 
    Places a break before the second-to-last word in a frame.
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
        |     about     |
        |   the wait.   |
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
    var arr = str.split(' ');

    return arr.length > 1 ?
        arr.slice(0, arr.length - 2).join(' ') + '\n' + arr.slice(-2).join(' ') :
        str;
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}



main();