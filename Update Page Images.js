// ----------- Update Page Images ----------- // 
// Updates the links to all the images on the current active page
// More info on how to run this script here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

function main() {
    if (!isError()) {
        var images = app.activeDocument.layoutWindows[0].activePage.allGraphics;
        for (var i = 0; i < images.length; i++) {
            images[i].itemLink.update();
        }
    }
}

function isError() {
    if (app.activeDocument.layoutWindows[0].activePage.allGraphics.length < 1) {
        alert('Please make sure there\'s an image on the active page');
        return true;
    }
    return false;
}


main()