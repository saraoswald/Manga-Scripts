// ----------- Relink All Images ----------- // 
// Relinks all of the graphics in a document with a specified graphic saved in the same directory. 
//
// Updated: Jan 14 2021
//
// Example: 
//  The file linked in your INDD is a PSD. In Photoshop, you convert and flatten the image into a new .tif
//  You want to relink the image in the INDD to be the new .tif
// 
// Installation instructions here: https://github.com/saraoswald/Manga-Scripts#the-fast-and-simple-way
//
// Note: 
//  The new image needs to be in the same folder as the original image. 
// Change the below file types as needed!
var fileTypes = [
    { oldType: '.psd', newType: '.tif' },
]

var progressBarWindow = new Window("palette");
progressBarWindow.add("statictext", undefined, "Relinking images...");

function main() {
    if (!isError()) {
        var images = app.activeDocument.allGraphics;
        relinkAll(images);
    }
}

function isError() {
    if (app.activeDocument.allGraphics.length < 1) {
        alert('No images found in this document');
        return true;
    }
    if (fileTypes.length < 1 || !fileTypes[0].oldType) {
        alert('Please edit the "fileTypes" variable to have one or more file types specified. E.g.  { oldType: \'.psd\', newType: \'.tif\' },')
        return true;
    }
    return false;
}

function relinkAll(images) {
    var progressBar = progressBarWindow.add('progressbar', undefined, 0, images.length);
    var progressNumber = progressBarWindow.add("statictext", undefined, '0/' + images.length.toString());

    progressBarWindow.show();

    for (var i = 0; i < images.length; i++) {
        relink(images[i]);

        progressBar.value = i;
        progressNumber.text = (i + 1).toString() + '/' + images.length.toString();
        progressBarWindow.update();

    }

    progressBarWindow.close();
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

try {
    main();
} catch (err) {}