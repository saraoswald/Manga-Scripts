// ----------- Pseudo Stroke ----------- // 
// Creates a duplicate object with a stroke behind your selected TextFrame
// This is an alternative to using Outer Glow, which creates grayscale aliasing 

// creates a new Character Style with these configurations
var defaultObject = {
    name: 'Stroke 1pt Paper', // change this to something else if you want to use that specific name for something else
    strokeWeight: '1pt',
    strokeColor: 'Paper',
    endJoin: OutlineJoin.ROUND_END_JOIN
};
var doc = app.activeDocument;

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        return true;
    }
    return false;
}

function addStroke(srcObj) {
    // Check to see if the target character style already exists. If so, use it. If not, create it.
    var existingStyle = doc.objectStyles.itemByName(defaultObject.name);
    var targetStyle = existingStyle.isValid ?
        existingStyle :
        doc.objectStyles.add(defaultObject);

    // duplicate the object in place
    var outlines = srcObj.duplicate().createOutlines();
    // apply the style to every new outline created
    for (var i = 0; i < outlines.length; i++) {
        outlines[i].applyObjectStyle(targetStyle);
    }
    srcObj.bringToFront();
}

