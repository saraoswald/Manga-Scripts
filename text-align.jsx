var doc = app.activeDocument;

// You need to select which way your files are named, and comment out whichever one doesn't apply

// for files that look like /108.tif
var regex = new RegExp("(?=.+)[0-9][0-9][0-9](?=\.tif)"); // to match the file name
var numRegex = new RegExp("[0-9][0-9][0-9](?=\.tif)"); // to get *just* the page number from the tif

// for  files that look like /P108.TIF
// var regex = new RegExp("(?=.+)[0-9][0-9][0-9](.TIF|G.TIF)"); // to match the file name
// var numRegex = new RegExp("[0-9][0-9][0-9](?=\.TIF|G\.TIF)"); // to get *just* the page number from the tif

var pageNum, pageLink, i;
var imagesLayer = doc.activeLayer.allGraphics;
var pageNumsLayer = app.activeDocument.layers.itemByName("Page Nums");
var textFrames = doc.textFrames;
// alert(doc.pages[205].allPageItems[0].itemLayer.name);
