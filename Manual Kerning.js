/*
Applies manual kerning to a text frame based on predefined values

----- How to Use ----
1) Install the script on your computer: https://github.com/saraoswald/Manga-Scripts#the-fast-and-simple-way
2) Edit "kerningPairs" below to match what kerning your font needs
3) Select one or more text frames
4) Run the script

*/

// 
var kerningPairs = [{
        text: "TA",
        kerningValue: 400
    },
    {
        text: "YO",
        kerningValue: 400
    }
];

var doc = app.activeDocument;

function main() {
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
                textFrame.contents = applyKerning(textFrame);
            };
        } catch (e) {
            // pretend nothing happened
        }
    }
}

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        alert('Please select only text frames and try again');
        return true;
    }
    return false;
}

// searches through the kerningPairs array for a given string
// returns the corresponding kerning value if found
// returns null if not found
function getKerningValue(pair) {
    var k = 0;
    while (k < kerningPairs.length) {
        if (pair == kerningPairs[k].text) {
            return kerningPairs[k].kerningValue;
        }
        k++;
    }
    return null;
}

function applyKerning(srcObj) {
    var pargs = srcObj.paragraphs;
    // search through each "paragraph" in a text frame
    for (var i = 0; i < pargs.length; i++) {
        var chars = pargs[i].characters;
        // search though each individual character
        for (var j = 0; j < chars.length; j++) {
            // check next character to see if it completes a pair as targeted in kerningPairs
            var pair = chars[j].contents + (j + 1 < chars.length ? chars[j + 1].contents : '');
            var kerningValue = getKerningValue(pair);
            if (kerningValue !== null)
                chars[j].kerningValue = kerningValue;
        }
    }
}

main();