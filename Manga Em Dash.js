// ----------- Manga Em Dash ----------- // 
/*
    When run on a text frame, this script will do three things:
        - change all of the em dashes (—) to hyphens (-)
        - create a new Character Style named "200% Width", which sets the Horizontal Scale to 200%
        - applies that character style to all the hyphens

    Use case:
        Some fonts use a double-dash glyph for em dashes, and we have to change them to be long hyphens. 
        This script handles the manual work of changing dashes.

    To use:
        - Select a text frame 
        - Run script
    More info on running scripts here: https://github.com/saraoswald/Manga-Scripts
*/


// creates a new Character Style with these configurations
var defaultStyle = {
    name: '200% Width', // change this to something else if you want to use that specific name for something else
    horizontalScale: 200,
};

var doc = app.activeDocument;

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        alert('Please select only text frames and try again');
        return true;
    }
    return false;
}

function applyMangaDash(srcObj) {
    // Check to see if the Character Style already exists
    var existingStyle = doc.characterStyles.itemByName(defaultStyle.name);
    var targetStyle = existingStyle.isValid ?
        existingStyle :
        doc.characterStyles.add(defaultStyle);

    // loop through all of the paragraphs
    for (var i = 0; i < srcObj.paragraphs.length; i++) {
        // loop through all of the characters in each paragraph
        var chars = srcObj.paragraphs[i].characters;
        for (var j = 0; j < chars.length; j++) {
            var ch = chars[j].contents;
            // if the character is an em dash or en dash
            if (ch == SpecialCharacters.EM_DASH || ch == SpecialCharacters.EN_DASH) {
                // change it to a hyphen, and apply the 200% Width character style
                srcObj.paragraphs[i].characters[j].contents = '-';
                srcObj.paragraphs[i].characters[j].applyCharacterStyle(targetStyle);
            }
        }
    }
}

// reuseable helper function
// applies given operation to a text frame,
// whether the cursor is inside of the text frame or not
function main(operation) {
    var hasErrors = false,
        selections = app.selection;
    for (var i = 0; i < selections.length; i++) {
        try {
            var textFrame = selections[i] instanceof InsertionPoint ?
                selections[i].parentTextFrames[0] :
                selections[i];

            var frameHasErrors = isError(textFrame);
            hasErrors = hasErrors || isError(textFrame);

            if (!frameHasErrors) {
                operation(textFrame);
            };
        } catch (e) {
            // pretend nothing happened :-)
        }
    }
}

main(applyMangaDash);