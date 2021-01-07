/* 
    Empty Text Frames.js

    Updated: Jan 7 2021, Sara Linsley
    
    ----------------

    Installation instructions here: https://github.com/saraoswald/Manga-Scripts#how-to-use-scripts-in-indesign

    Purpose: 
        Removes the contents of all text frames in a document

    Usage Instructions: 
        - Open a document with text frames
        - Run this script
*/

var doc = app.activeDocument;
var pages = doc.pages;

for (var i = 0; i < pages.length; i++) {
    for (var j = 0; j < pages[i].textFrames.length; j++) {
        pages[i].textFrames[j].contents = "";
    }
}