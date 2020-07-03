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

// find condition within a Group
// returns immediately once the mapper function returns true
function find(group, mapFn) {
    if (!group || !(group instanceof Group) || !group.allPageItems || group.allPageItems.length < 1) {
        return false;
    }
    var children = group.allPageItems;
    var i = 0;
    var found = false;
    while (i < children.length) {
        if (mapFn(children[i])) {
            found = true;
            break;
        }
        i++;
    }
    return found;
}

function childHasPseudoStroke(obj) {
    // if it's not a group, or it's magically empty, return false
    var mapFn = function(child) { return hasPseudoStroke(child) };
    return find(obj, mapFn);
}

function childIsTextFrame(obj) {
    var mapFn = function(child) { return child instanceof TextFrame };
    return find(obj, mapFn);
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

function outline(obj) {
    if (obj instanceof Group) {
        var children = obj.allPageItems;
        obj.ungroup();
        var outlineArr = new Array();
        for (var i = 0; i < children.length; i++) {
            if (children[i].createOutlines) {
                var childOutlines = children[i].createOutlines();
                // I could not get Array.concat to work for the life of me
                for (var j = 0; j < childOutlines.length; j++)
                    outlineArr.push(childOutlines[j]);
            }
        }
        return outlineArr;
    } else return obj.createOutlines();
}

function doAddStroke(srcObj) {
    // Check to see if the target character style already exists. If so, use it. If not, create it.
    var existingStyle = doc.objectStyles.itemByName(defaultObject.name);
    var targetStyle = existingStyle.isValid ?
        existingStyle :
        doc.objectStyles.add(defaultObject);
    var finalGroup = new Array(srcObj);

    // duplicate the object in place
    var duplicate = srcObj.duplicate();
    var outlines = srcObj instanceof TextFrame || childIsTextFrame(srcObj) ?
        outline(duplicate) :
        new Array(duplicate);
    var formattedOutlines = new Array();
    var needToGroupOutlines = false;
    // apply the style to every new outline created
    for (var i = 0; i < outlines.length; i++) {
        outlines[i].applyObjectStyle(targetStyle);
        formattedOutlines.push(outlines[i]);

        if (outlines[i] instanceof Group) {
            outlines[i].insertLabel(OUTLINE_LABEL, 'true');
            finalGroup.push(outlines[i]);
        } else needToGroupOutlines = true;
    }
    if (needToGroupOutlines) {
        var groupedOutlines = null;
        if (formattedOutlines.length > 1) {
            groupedOutlines = doc.groups.add(formattedOutlines);
        } else if (formattedOutlines.length == 1) {
            groupedOutlines = formattedOutlines[0];
        }
        groupedOutlines.insertLabel(OUTLINE_LABEL, 'true');
        finalGroup.push(groupedOutlines);
    }

    srcObj.bringToFront();

    var newGroup = doc.groups.add(finalGroup);
    newGroup.insertLabel(PARENT_LABEL, 'true');
    return newGroup;
}

function addStroke(srcObj) {

    return new Array(doAddStroke(srcObj));
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
        return removeStroke(srcObj);
    // check if one of the group's children has pseudostroke
    else if (childHasPseudoStroke(srcObj))
        return removeStroke(srcObj);
    else return addStroke(srcObj);
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