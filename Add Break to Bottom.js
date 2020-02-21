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
*/

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i];
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
    var arr = str.trim().split(' ');
    return arr.slice(0, arr.length - 1).join(' ') + '\n' + arr[arr.length - 1];
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

main();