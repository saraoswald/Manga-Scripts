// ----------- Apply Style ----------- // 
/* 
    Applies a paragraph style to the currently selected text frame. 
    Usage: 
        1. Edit the paragraphStyleName variable to exactly match the name of the paragraph style you'd like to apply
            - for example:
                var paragraphStyleName = 'Asides';
        2. Save this file. 
        3. Run this script from the Scripts Panel
            - (optional) assign a keyboard shortcut to this script: https://github.com/saraoswald/Manga-Scripts#setting-up-keyboard-shortcuts
*/

var paragraphStyleName = '';

var doc = app.activeDocument;

function main() {
    var hasErrors = false,
        selections = app.selection;

    for (var i = 0; i < selections.length && !hasErrors; i++) {
        var textFrame = selections[i] instanceof InsertionPoint ?
            selections[i].parentTextFrames[0] :
            selections[i];
        hasErrors = isError(textFrame);

        if (!hasErrors) {
            applyStyle(textFrame);
        };
    }
}

function isError(obj) {
    if (!(obj instanceof TextFrame)) {
        alert('Please select some text frames and try again');
        return true;
    }
    if (paragraphStyleName.length < 1) {
        alert('Please set the variable "paragraphStyleName" to a valid name.');
        return true;
    }
    if (!doc.paragraphStyles.itemByName(paragraphStyleName).isValid) {
        alert('Paragraph style with the name "' + paragraphStyleName + '" not found');
        return true;
    }
    return false;
}

function applyStyle(srcObj) {
    var pargs = srcObj.paragraphs;
    var styleObj = doc.paragraphStyles.itemByName(paragraphStyleName);

    for (var i = 0; i < pargs.length; i++) {
        pargs[i].applyParagraphStyle(styleObj);
    }
}
try {
    main();
} catch (err) { alert(err) }