/*
    - Creates a new nonprinting layer named "Hidden Page Nums"
    - Creates a new object style named "Hidden Page Nums"
    - Creates a new text box on every page of an .indd with the Right-to-Left page number

    Usage from VS Code: 
        - install the Adobe Script Runner and configure it for InDesign
        - https://marketplace.visualstudio.com/items?itemName=renderTom.adobe-script-runner
        - open document in InDesign, open this file in Code
        - press CMD + R (or Ctrl+R on Windows)

    Usage from InDesign:
        - run this script from the Scripts panel, no setup necessary
        - https://helpx.adobe.com/indesign/using/scripting.html
*/

var doc = app.activeDocument;
var bookSize = doc.pages.count();
var bleed = doc.documentPreferences.documentBleedBottomOffset;
var boxSize = { height: 2, width: 3 }; // size of the new Text Frames

doc.layers.add({ name: "Hidden Page Nums", printable: false });
var objectStyle = doc.objectStyles.add({ name: "Hidden Page Nums" });

// takes bounds input and gives output in the form [y1, x1, y2, x2]
function getBounds(pageBounds, isLeftAligned) {
    var y1 = pageBounds[0],
        x1 = pageBounds[1],
        y2 = pageBounds[2] + bleed,
        x2 = pageBounds[3];
    var Y = boxSize.height,
        X = boxSize.width;
    return isLeftAligned
        ? [y2, x1, y2 + Y, x1 + X]
        : [y2, x2 - X, y2 + Y, x2];
}

for (var i = 0; i < bookSize; i++) {
    var currPageNum = bookSize - i;
    var currPage = doc.pages.item(i);
    currPage.textFrames.add({
        geometricBounds: getBounds(currPage.bounds, i % 2 !== 0),
        contents: currPageNum.toString(),
        appliedObjectStyle: objectStyle
    });
}

doc.activeLayer.locked = true;