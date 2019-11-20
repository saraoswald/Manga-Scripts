// ----------- Pseudo Stroke ----------- // 
// Creates a duplicate object with a stroke behind your selected TextFrame.
// Result is a group of the original text frame and the new stroke object
// This is an alternative to using Outer Glow, which creates grayscale aliasing 

// creates a new Character Style with these configurations
var defaultObject = {
    name: 'Stroke 1pt Paper', // change this to something else if you want to use that specific name for something else
    strokeWeight: '1pt',
    strokeColor: 'Paper',
    endJoin: OutlineJoin.ROUND_END_JOIN
};
var doc = app.activeDocument;

function main() {
    var hasErrors = false,
        selections = app.selection,
        newSelections = new Array(),
        strokeStyle = getStyle();
    var applyStyle = function(obj) { obj.applyObjectStyle(strokeStyle) };

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i];
        hasErrors = isError(textFrame);

        if (!hasErrors) {
            var newGroup = dupAndGroup(textFrame, applyStyle);
            newSelections.push(newGroup);
        };
    }
    // select all the newly-formed groups
    if (!hasErrors) app.select(newSelections);
}

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        alert('Please select some text frames and try again');
        return true;
    }
    return false;
}

// Check to see if the target character style already exists. If so, use it. If not, create it.
function getStyle() {
    // Check to see if the target character style already exists. If so, use it. If not, create it.
    var existingStyle = doc.objectStyles.itemByName(defaultObject.name);
    return existingStyle.isValid ?
        existingStyle :
        doc.objectStyles.add(defaultObject);
}

function dupAndGroup(srcObj, applyFn) {
    // duplicate the object in place
    var outlines = srcObj.duplicate().createOutlines();
    var objs = new Array(srcObj);
    // apply the style to every new outline created
    for (var i = 0; i < outlines.length; i++) {
        applyFn(outlines[i]);
        objs.push(outlines[i]);
    }
    srcObj.bringToFront();
    return doc.groups.add(objs);
}

main()