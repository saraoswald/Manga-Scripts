// ----------- Change Horizontal Scale - Increase ----------- // 
/* 
    Updated: June 8 2021 - Sara Linsley

    Changes the horizontal scale factor of selected text by +1%

    NOTE: it makes this change on a character by character basis, so individual letter's existing styles are honored
*/

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        changeHorizontalScale(selections[i], 1);
    }
}

function changeHorizontalScale(source, increment) {
    try {
        var target = source.characters !== undefined ? source.characters : source;

        for (var i = 0; i < target.length; i++) {
            var t = target[i];
            if (t.horizontalScale) t.horizontalScale = t.horizontalScale + increment;
        }
    } catch (err) { alert(err) }
}

main();