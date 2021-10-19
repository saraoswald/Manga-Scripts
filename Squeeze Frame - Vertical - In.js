// ----------- Squeeze Frame - Vertical - In ----------- // 
/* 
    DECREASES the vertical height of a text frame by equal amounts on both sides.

    One part of a series of scripts, meant to be used together: 
        - Squeeze Frame - Horizontal - In.js
        - Squeeze Frame - Horizontal - Out.js
        ->> Squeeze Frame - Vertical - In.js
        - Squeeze Frame - Vertical - Out.js

    Most Common Use Case:
        - As I typeset, I want to incrementally adjust the vertical height of a text
            frame so that the text reflows into a diamond shape.
    
    Updated: October 19 2021, Sara Linsley
*/

var squeezeFactor = 0.05; // change this number to increase/decrease the amount the text frame is squeezed by
var doc = app.activeDocument;

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i];
        hasErrors = isError(textFrame);

        if (!hasErrors) {
            squeezeVert(textFrame, squeezeFactor);
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

function transformCoords(src, trns) {
    return [
        src[0] + trns[0],
        src[1] + trns[1],
        src[2] + trns[2],
        src[3] + trns[3]
    ];
}

function squeezeVert(srcObj, by) {
    srcObj.geometricBounds = transformCoords(srcObj.geometricBounds, [by, 0, by * -1, 0]);
}

main();