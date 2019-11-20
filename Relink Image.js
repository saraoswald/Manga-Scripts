// ----------- Relink Image ----------- // 
// Relinks the base image on the current active page to a converted image saved in the same directory. 
// This currently only works on the first linked image on a page. 
//
// Example: 
//  The file linked in your INDD is a PSD. In Photoshop, you convert and flatten the image into a new .tif
//  You want to relink the image in the INDD to be the new .tif
// 
// Note: 
//  The converted file needs to be in the same directory as the original image. 
//  You can edit the `newPath` variable below if you really need the new image to be in a new directory.

// Change the below file types as needed!
var oldFileType = '.psd';
var newFileType = '.tif';

function main() {
    if (!isError()) {
        var srcImage = app.activeDocument.layoutWindows[0].activePage.allGraphics[0];
        var newPath = srcImage.itemLink.filePath.replace(oldFileType, newFileType);
        relink(srcImage, newPath);
    }
}

function isError() {
    if (app.activeDocument.layoutWindows[0].activePage.allGraphics.length < 1) {
        alert('Please make sure there\'s an image on the active page');
        return true;
    }
    return false;
}

function relink(srcImage, destinationPath) {
    srcImage.itemLink.relink(new File(destinationPath));
}

main()