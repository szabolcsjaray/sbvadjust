const TRANSLATION = 0;
const ADJUST_TEXT = 1;
const NEW_SUBS = 2;

var actualOp = TRANSLATION;

function showAndHideControls() {
    switch (actualOp) {
        case TRANSLATION:
            el('cutButton').style.display='none';
            el('processButton').style.display='none';
            el('loadButton').style.display = 'flex';
            break;
        case ADJUST_TEXT:
            el('cutButton').style.display='none';
            el('processButton').style.display='flex';
            el('loadButton').style.display = 'flex';
            break;
        case NEW_SUBS:
            el('cutButton').style.display='flex';
            el('processButton').style.display='none';
            el('loadButton').style.display = 'none';
            break;
        }
}

function operationChanged() {
    actualOp = el('operation').selectedIndex;
    showAndHideControls();
}