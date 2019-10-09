/* 
    Pared-down version of "PathEffects.jsx" 3.0.0 15 December 2009
    Functionally equivalent to Object > Convert Shape > Ellipse
*/
main();

function main() {
    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    var myObjectList = new Array;
    if (app.documents.length != 0) {
        if (app.selection.length != 0) {

            for (var myCounter = 0; myCounter < app.selection.length; myCounter++) {
                switch (app.selection[myCounter].constructor.name) {
                    case "TextFrame":
                    case "Rectangle":
                    case "Oval":
                    case "Polygon":
                    case "GraphicLine":
                        myObjectList.push(app.selection[myCounter]);
                        break;
                }
            }
            if (myObjectList.length != 0) {
                myPathEffect(myObjectList);
            } else {
                alert("Please select a rectangle, oval, polygon, or graphic line and try again.");
            }
        } else {
            alert("Please select an object and try again.");
        }
    } else {
        alert("Please open a document, select an object, and try again.");
    }
}

function myPathEffect(myObjectList) {
    //This function builds a list of all of the anchor point coordinates (and the control handle coordinates
    //for curved line segments) and puts them in an array. Once the coordinates have been calculates, we
    //set all of the point locations using the "entirePath" property. This is much faster than drawing
    //the path point-by-point.
    var myPointArray = new Array(4);
    for (var myObjectCounter = 0; myObjectCounter < myObjectList.length; myObjectCounter++) {
        var myObject = myObjectList[myObjectCounter];
        var myBounds = myObject.geometricBounds;
        var myXCenter = myBounds[1] + ((myBounds[3] - myBounds[1]) / 2);
        var myYCenter = myBounds[0] + ((myBounds[2] - myBounds[0]) / 2);

        myMagicConstant = 0.552284746667;
        myXOffset = ((myBounds[3] - myBounds[1]) / 2) * myMagicConstant;
        myYOffset = ((myBounds[2] - myBounds[0]) / 2) * myMagicConstant;
        myPointArray[0] = [
            [myBounds[1], myYCenter - myYOffset],
            [myBounds[1], myYCenter],
            [myBounds[1], myYCenter + myYOffset]
        ];
        myPointArray[1] = [
            [myXCenter - myXOffset, myBounds[2]],
            [myXCenter, myBounds[2]],
            [myXCenter + myXOffset, myBounds[2]]
        ];
        myPointArray[2] = [
            [myBounds[3], myYCenter + myYOffset],
            [myBounds[3], myYCenter],
            [myBounds[3], myYCenter - myYOffset]
        ];
        myPointArray[3] = [
            [myXCenter + myXOffset, myBounds[0]],
            [myXCenter, myBounds[0]],
            [myXCenter - myXOffset, myBounds[0]]
        ];

        myObject.paths.item(0).entirePath = myPointArray;
    }
}