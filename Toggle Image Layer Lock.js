var layers = app.activeDocument.layers;
var names = ['images', 'Images', 'Image', 'art'];
var isValid = undefined;

for (var i = 0; i < names.length && !isValid; i++) {
    isValid = tryUnlock(layers.itemByName(names[i]));
}

function tryUnlock(layer) {
    if (!layer.isValid) return false;
    layer.locked = !layer.locked;
}