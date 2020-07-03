// ----------- Pseudo Stroke ----------- // 
/*  Creates a duplicate object with a stroke behind your selected TextFrame
    This is an alternative to using Outer Glow, which creates grayscale aliasing 

    To use:
        - Select a text frame
        - Run script from script panel
    More info on running scripts here: https://github.com/saraoswald/Manga-Scripts
*/

// creates a new Character Style with these configurations
var defaultObject = {
    name: 'Stroke 2pt Paper', // change this to something else if you want to use that specific name for something else
    strokeWeight: '2pt',
    strokeColor: 'Paper',
    endJoin: OutlineJoin.ROUND_END_JOIN
};
var doc = app.activeDocument;

var PARENT_LABEL = 'hasPseudoStroke'; // label placed on the final result group 
var OUTLINE_LABEL = 'isStrokeGroup'; // label placed on just the background outlines;

// check for label 
function hasPseudoStroke(obj) {
    return obj.isValid && obj.extractLabel(PARENT_LABEL) === 'true';
}

function childHasPseudoStroke(obj) {
    // if it's not a group, or it's magically empty, return false
    if (!(obj instanceof Group) || !obj.allPageItems || obj.allPageItems.length < 1) {
        return false;
    }

    var children = obj.allPageItems;
    var i = 0;
    var foundStroke = false;
    while (i < children.length) {
        if (hasPseudoStroke(children[i])) {
            foundStroke = true;
        }
        i++;
    }
    return foundStroke;
}

// check for outline label
function isOutlineGroup(obj) {
    return obj.extractLabel(OUTLINE_LABEL) === 'true';
}

// This has only been tested on Text Frames and Outlines. I don't know what else y'all need to stroke, but this won't do it
function isError(obj) {
    if (!(obj instanceof TextFrame || obj instanceof Group || obj instanceof Polygon)) {
        return true;
    }
    return false;
}

function doAddStroke(srcObj) {
    // Check to see if the target character style already exists. If so, use it. If not, create it.
    var existingStyle = doc.objectStyles.itemByName(defaultObject.name);
    var targetStyle = existingStyle.isValid ?
        existingStyle :
        doc.objectStyles.add(defaultObject);
    // duplicate the object in place
    var outlines = srcObj instanceof TextFrame ? srcObj.duplicate().createOutlines() : new Array(srcObj.duplicate());
    var outlineObjs = new Array(srcObj);
    // apply the style to every new outline created
    for (var i = 0; i < outlines.length; i++) {
        outlines[i].applyObjectStyle(targetStyle);
        outlines[i].insertLabel(OUTLINE_LABEL, 'true');

        outlineObjs.push(outlines[i]);
    }
    srcObj.bringToFront();
    var newGroup = doc.groups.add(outlineObjs);
    newGroup.insertLabel(PARENT_LABEL, 'true');
    return newGroup;
}

function addStroke(srcObj) {
    var resultingGroups = new Array();

    if (srcObj instanceof Group) {
        var children = srcObj.allPageItems;
        var newGroup = new Array();
        // ungroup it first since the outline will be created outside of the group
        // and indesign won't let me put it in the group idk
        srcObj.ungroup();
        for (var i = 0; i < children.length; i++) {
            // add a stroke to each child
            newGroup.push(doAddStroke(children[i]));
        }
        // put everything back into a group, and then pass it on to be selected
        resultingGroups.push(doc.groups.add(newGroup));
    } else resultingGroups.push(doAddStroke(srcObj));

    return resultingGroups;
}

function doRemoveStroke(srcObj) {
    try {
        // ungroup the Group we made in doAddStroke, then remove the outlines group
        var childItems = srcObj.allPageItems;
        srcObj.ungroup();
        var i = 0;
        while (i < childItems.length) {
            if (isOutlineGroup(childItems[i])) {
                childItems[i].remove();
                break;
            }
            i++;
        }
        return childItems;
    } catch (err) {
        alert(err);
    };
}

function removeStroke(srcObj) {
    var resultingGroups = new Array();

    if (srcObj instanceof Group && !hasPseudoStroke(srcObj)) {
        var children = srcObj.allPageItems;
        var newGroup = new Array();
        for (var i = 0; i < children.length; i++) {
            if (hasPseudoStroke(children[i])) doRemoveStroke(children[i]);
        }
        resultingGroups.push(srcObj);
        // TODO: select groups after removing stroke
    } else resultingGroups.push(doRemoveStroke(srcObj));

    return resultingGroups;
}

// determine if stroke should be added or removed
function applyStroke(srcObj) {
    // check if the group already has a pseudostroke
    if (hasPseudoStroke(srcObj))
        removeStroke(srcObj);
    // check if one of the group's children has pseudostroke
    else if (childHasPseudoStroke(srcObj))
        removeStroke(srcObj);
    else addStroke(srcObj);
}

var hasErrors = false;
var selections = app.selection;
var newSelections = new Array();
for (var i = 0; i < selections.length && !hasErrors; i++) {
    hasErrors = isError(selections[i]);
    if (!hasErrors) {
        var newGroup = applyStroke(selections[i]);
        if (newGroup) newSelections.push();
    };
}
if (!hasErrors) app.select(newSelections);