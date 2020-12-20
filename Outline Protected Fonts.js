function main() {
    var fontList = getAdobeFonts();
    if (!isError(fontList)) {
        var allPageItems = app.activeDocument.allPageItems;
        for (var i = 0; i < allPageItems.length; i++) {
            var item = allPageItems[i];
            if (item instanceof TextFrame) {

            }
        }
    }
}

function isError(fontList) {
    if (fontList.length < 1) {
        alert('No Adobe Fonts found');
        return true;
    }
    return false;
}

function outlineText(parag) {
    // parag.createOutlines();
    $.writeln('made outlines out of ' + parag.);
}

function getAdobeFonts() {
    var results = [];
    var fontList = app.activeDocument.fonts;
    for (var i = 0; i < fontList.length; i++) {
        var font = fontList[i];
        if (font.location === "Activated from Adobe Fonts") {
            results.push(font);
        }
    }
    return results;
}

main()


// function help(src) {
//     var obj = null;
//     var isArray = null;
//     try {
//         obj = src.properties;
//     } catch (error) {
//         obj = src;
//     }
//     var props = obj.toSource().substr(0, obj.length - 4).split(', ');
//     for (var i = 0; i < props.length; i++) {
//         var prp = props[i];
//         var colonIdx = prp.indexOf(':');
//         if (colonIdx > -1) {
//             $.writeln(prp.substr(0, colonIdx));
//             $.writeln('\t' + prp.substr(colonIdx + 1));
//         } else {
//             $.writeln('\t' + prp);
//         }
//     }
// }