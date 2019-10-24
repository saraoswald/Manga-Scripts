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
        alert('Please select a text frame and try again');
        return true;
    }
    return false;
}

function addStroke(obj) {
    if (isError(obj)) return;
    // Check to see if the target character style already exists. If so, use it. If not, create it.
    var existingStyle = doc.characterStyles.itemByName(defaultObject.name);
    var targetStyle = existingStyle.isValid 
    	? existingStyle
    	: doc.characterStyles.add(defaultObject);

    // duplicate the object in place
    var newObj = obj.duplicate();
    // apply the style to every "character" in the target object
    for (var i = 0; i < newObj.characters.length; i++) {
        obj.characters[i].applyCharacterStyle(targetStyle);
    }
}

addStroke(app.selection[0])