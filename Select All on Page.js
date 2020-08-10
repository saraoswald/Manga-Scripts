/*

Selects all of the elements on the active page, 
but only selects the graphics inside of the image frames

How to use scripts in InDesign: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

Sara Linsley / 2020

*/

var selectAllOnPage = function() {
    var pageItems = app.activeWindow.activePage.pageItems;
    var selection = filterFrames(pageItems);

    app.selection = selection;
}

// checks each page item to see if it's a graphic frame
// if so, it skips the frame itself and just adds the graphics to the selection
function filterFrames(pageItems) {
    var selectedItems = [];
    for (var i = 0; i < pageItems.length; i++) {
        if (pageItems[i].allGraphics.length > 0) {
            for (var j = 0; j < pageItems[i].allGraphics.length; j++)
                selectedItems.push(pageItems[i].allGraphics[j]);
        } else {
            selectedItems.push(pageItems[i]);
        }
    }
    return selectedItems;
}

selectAllOnPage();