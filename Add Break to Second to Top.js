// ----------- Add Break to Second to Top ----------- // 
/* 
    Places a break after the second word in a text frame. 
    Before: 
         _________________
        |                 |
        | I'm sorry about |
        |    the wait.    |
        |                 |
        |_________________|
    After:
        _________________
        |               |
        |   I'm sorry   |
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

// replaces the second space with a line break
function addBreakTop(str) {
    var arr = str.trim().split(' ');
    return arr.length > 1 ?
        arr.slice(0, 2).join(' ') + ' \n' + arr.slice(2).join(' ') :
        str;
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

main();