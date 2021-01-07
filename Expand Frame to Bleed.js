/* 
    Expand Frame to Bleed.js

    Updated: Jan 7 2021, Sara Linsley
    
    ----------------

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Purpose: 
        Expands the selected frame to the page's bleed setting.

    Usage Instructions: 
        - Select a frame
        - Run this script (either from the Scripts panel or a keyboard shortcut)
        - The selected frame should now be expanded to the page's bleed settings
        
    Important Notes: 
        - This script will run on anything with geometric bounds,
          so make sure you *only* select things that need to be expanded before running
*/


var activeDoc = app.activeDocument;

function main() {
    forEach(app.selection, expandFrameToBleed);
}


// basically Array.forEach
function forEach(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
        fn(arr[i]);
    }
}

function expandFrameToBleed(pageItem) {
    if (!pageItem.isValid || !pageItem.geometricBounds) return; // not gonna be picky about class, but it should have geometric bounds
    pageItem.geometricBounds = getPageBleed(pageItem.parentPage);
}

// takes bounds input and gives output in the form [y1, x1, y2, x2]
// adds the document setting for bleed, taking into account the gutter
function getPageBleed(page) {
    var prfs = activeDoc.documentPreferences,
        pb = page.bounds,
        bleedLeft = page.side == PageSideOptions.RIGHT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset,
        bleedRight = page.side == PageSideOptions.LEFT_HAND ? 0 : prfs.documentBleedOutsideOrRightOffset;
    return [
        pb[0] - prfs.documentBleedTopOffset, //y1
        pb[1] - bleedLeft, // x1
        pb[2] + prfs.documentBleedBottomOffset, // y2
        pb[3] + bleedRight // x2
    ]
}

try {
    main();
} catch (err) { alert(err) }