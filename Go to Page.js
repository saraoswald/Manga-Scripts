/* Go to Page.js

    Works like the built-in "Go to Page" function, but also works for "backwards" (Left to Right) books. 
    Uses the pageBinding setting in the document to determine which InDesign page to take you to. 
    
    For example, in a 200-page document:
    | Input | Page Binding Setting | Final Page |
    |-------|----------------------|------------|
    |   40  |     Left to Right    |    161     |
    |   40  |     Right to Left    |     40     |


    Installation Instructions: https://github.com/saraoswald/Manga-Scripts/#how-to-use-scripts-in-indesign
    
    Last Updated: August 28, 2022
*/


var isLtR = app.documents[0].documentPreferences.pageBinding == PageBindingOptions.LEFT_TO_RIGHT;
var doc = app.activeDocument;

function myDisplayDialog() {
    myDialog = app.dialogs.add({ name: "Go to Page" });
    var selectedPageNumber;
    var bookSize = parseInt(doc.pages.lastItem().name);
    with(myDialog) {
        with(dialogColumns.add()) {
            var currentPageNum = parseInt(app.activeWindow.activePage.name) || 1;
            var bookPageNum = isLtR ? bookSize - currentPageNum + 1 : currentPageNum;
            selectedPageNumber = integerEditboxes.add({
                editValue: bookPageNum,
                minimumValue: parseInt(doc.pages.firstItem().name),
                maximumValue: bookSize
            });
        }
    }
    var myReturn = myDialog.show();
    if (myReturn == true) {
        var needsReview = false;

        if (selectedPageNumber.editValue < 1) {
            alert('Please enter a valid page number');
            needsReview = true;
        }

        if (!needsReview) {
            var newPageNum = isLtR ? bookSize - selectedPageNumber.editValue + 1 : selectedPageNumber.editValue;
            var newPage = doc.pages.itemByName(newPageNum.toString());

            app.activeWindow.activePage = newPage.isValid ?
                newPage :
                (isLtR ? doc.pages.firstItem() : doc.pages.lastItem());
        }

        myDialog.destroy();
    } else {
        myDialog.destroy();
    }
}

try {
    myDisplayDialog();
} catch (err) { alert(err) }