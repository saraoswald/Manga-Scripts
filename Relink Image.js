// ----------- Relink Image ----------- // 
// Relinks the base image on the current active page to a converted image saved in the same directory. 
// This currently only works on the first linked image on a page. 
//
// Updated: Jan 14 2021
//
// Example: 
//  The file linked in your INDD is a PSD. In Photoshop, you convert and flatten the image into a new .tif
//  You want to relink the image in the INDD to be the new .tif
// 
// Note: 
//  The new image needs to be in the same folder as the original image. 

// Change the below file types as needed!
var fileTypes = [
    { oldType: '.psd', newType: '.tif' },
    { oldType: '.tif', newType: '.psd' },
]

function main() {
    if (!isError()) {
        var srcImage = app.activeDocument.layoutWindows[0].activePage.allGraphics[0];
        relink(srcImage);
    }
}

function isError() {
    if (app.activeDocument.layoutWindows[0].activePage.allGraphics.length < 1) {
        alert('Please make sure there\'s an image on the active page');
        return true;
    }
    return false;
}

function relink(srcImage) {
    var isFound = false;
    for (var i = 0; i < fileTypes.length && !isFound; i++) {
        var ref = fileTypes[i];
        var oldPath = srcImage.itemLink.filePath;
        var newPath = oldPath.replace(ref.oldType, ref.newType);
        var newImage = new File(newPath);

        if (oldPath.toLowerCase() !== newPath.toLowerCase() && newImage.exists) {
            srcImage.itemLink.relink(newImage);
            isFound = true;
        }
    }
}

main()