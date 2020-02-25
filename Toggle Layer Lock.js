/* Toggle Layer Lock 

Toggles the lock on layers in the active document whose names are specified in the file name.

HOW TO USE:
    - edit this file's name to include the name of the Layers you want to lock, separated by spaces
        NOTE: 
            The layer names are CASE SENSITIVE
        EXAMPLE: 
            My InDesign document has layers named Text, Images, and Guides.
            I want this script to only lock Text and Images, so I rename this file to:
                Toggle Layer Lock Text Images.js
    - run this script normally
        - more instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign
*/


var layers = app.activeDocument.layers;
var fileName = app.activeScript.name;
var baseName = 'Toggle%20Layer%20Lock%20';
var names = fileName.replace(baseName, '').replace('.js', '').split('%20');

for (var i = 0; i < names.length; i++) {
    toggleLock(layers.itemByName(names[i]));
}

function toggleLock(layer) {
    if (!layer.isValid) return;
    layer.locked = !layer.locked;
}