// 1.01

var lastScript = "";
var backEditing = false;

const SENTENCE_MODE = 0;
const EDIT_MODE = 1;

function newScriptValue(scr) {
    beforeLatsScript = lastScript;
    el("script").value = scr;
    lastScript = scr;
}

function restoreScriptFromBlocks() {
    let i = 0;
    let blockEl = el("ob"+i);
    let script = "";
    let sep = "";
    while (blockEl!=null) {
        el("rb"+i).startScriptPos = script.length;
        script = script + sep + blockEl.value.trim().replace(/  +/g, ' ');
        el("rb"+i).endScriptPos = script.length;
        el("rb"+i).value = el("ob"+i).value;
        sep = " ";
        i = i + 1;
        blockEl = el("ob"+i);
    }
    script = script.charAt(0).toUpperCase() + script.substr(1);
    el("script").value = script;
    lastScript = script;
}

function findFirstDiffPos(a, b) {
    let ai = 0;
    let bi = 0;
    while (ai<a.length && bi<b.length) {
        if (a.charAt(ai)!=b.charAt(bi)) {
            return bi;
        }
        ai++;
        bi++;
    }
    return (a.length==b.length ? -1 : bi);
}

function findFirstDiffPosBack(a, b) {
    let ai = a.length-1;
    let bi = b.length-1;
    while (ai>=0 && bi>=0) {
        if (a.charAt(ai)!=b.charAt(bi)) {
            return bi;
        }
        ai--;
        bi--;
    }
    return bi;
}

function switchEditMode() {
    el('pimpMode').selectedIndex = (el('pimpMode').selectedIndex+1)%2;
}

function scriptEdited(evt) {
    if (!backEditing) {
        return;
    }
    if (evt.code=='F1') {
        switchEditMode();
        return;
    }

    if (el('pimpMode').selectedIndex!=EDIT_MODE)
        return;
    let scr = el('script').value;
    let diff1 = findFirstDiffPos(lastScript, scr);
    if (diff1==-1) {
        return;
    }

    let diff2 = findFirstDiffPosBack(lastScript, scr);

    let diff =diff1;
    if (diff2>=diff1) {
        //alert('diff1:'+ diff1 +', diff2: '+diff2 +'added diff:' + scr.substr(diff1, diff2-diff1+1) +
        //'\n' +  scr.substr(diff1,10));
    } else {
        diff = diff2;
        //alert('diff1:'+ diff1 +', diff2: '+diff2 +'deleted diff:' + lastScript.substr(diff2+1, diff1-diff2) +
        //'\n' +  scr.substr(diff1,10));
    }
    let blockI = findBlockForPos(diff);
    let lengthDiff = scr.length-lastScript.length;
    el("rb"+blockI).endScriptPos+=lengthDiff;
    pushBlocks(blockI+1, lengthDiff);
    refreshResBlocks(blockI);
    newScriptValue(scr);
}

var scriptPos;
var clickTime;
var lastClick = -1;
var firstClick = true;

function searchWordEnd(text, from) {
    let i = (from!=0) ? from - 1 : 0;
    if (text.charAt(i)==' ') {
        while (i>0 && text.charAt(i)==' ') {
            i--;
        }
        i++;
    } else {
        while (i<text.length && text.charAt(i)!=' ') {
            i++;
        }
    }
    return i;
}

function findBlockForPos(pos) {
    let i = 0;
    let bl = el("rb" +i);
    while (bl!=null) {
        if (bl.startScriptPos<=pos && bl.endScriptPos>=pos) {
            return i;
        }
        i++;
        bl = el("rb" +i);
    }
    return -1;
}

function pushBlocks(from, delta = 1) {
    let i = from;
    let bl = el("rb" +i);
    while (bl!=null) {
        bl.startScriptPos+=delta;
        bl.endScriptPos+=delta;
        i++;
        bl = el("rb" +i);
    }
}

function refreshResBlocks(from) {
    let i = from;
    let textarea = el("script");
    let bl = el("rb" +i);
    while (bl!=null) {
        bl.value = textarea.value.substr(
            (bl.startScriptPos==0 ? 0 : bl.startScriptPos+1),
            bl.endScriptPos-bl.startScriptPos);
        i++;
        bl = el("rb" +i);
    }
}


function isWhiteSpace(ch) {
    return (" \n\r".indexOf(ch)!=-1);
}

function addDotIfNotDoubleClick() {
    console.log("addDot");
    if (firstClick) {
        console.log("addDot really");
        let textarea = el("script");
        let pos = textarea.selectionStart;
        let blockI = findBlockForPos(pos);
        let addedChar = '.';
        let signPos = searchWordEnd(textarea.value, pos);
        let shift = 1;
        if (textarea.value.charAt(signPos-1)=='.') {
            addedChar = '';
        }
        let afterPart = textarea.value.substr(signPos);

        // uppercase sentence start
        let nextSentencePos = 0;
        while(nextSentencePos<afterPart.length && isWhiteSpace(afterPart.charAt(nextSentencePos))) {
            nextSentencePos++;
        }
        if (nextSentencePos<afterPart.length) {
            if (addedChar=='.') {
                afterPart = afterPart.substr(0,nextSentencePos) + afterPart.charAt(nextSentencePos).toUpperCase() + afterPart.substr(nextSentencePos+1);
            } else {
                shift=-1;
                afterPart = afterPart.substr(0,nextSentencePos) + afterPart.charAt(nextSentencePos).toLowerCase() + afterPart.substr(nextSentencePos+1);
            }
        }
        if (addedChar=='') {
            signPos--;
        }
        textarea.value = textarea.value.substr(0, signPos) + addedChar + afterPart;
        el("rb"+blockI).endScriptPos++;
        pushBlocks(blockI+1, shift);
        refreshResBlocks(blockI);
        newScriptValue(textarea.value);
        lastClick = -1;
    }
    firstClick = true;
}

function scriptMouseUp(event) {
    if (actualOp!=PIMP_UP_AUTO)
        return;

    if (el('pimpMode').selectedIndex==EDIT_MODE)
        return;

    let t = new Date() - clickTime;
    let textarea = el("script");
    let pos = textarea.selectionStart;
    let blockI = findBlockForPos(pos);
    if (t>500) {
        console.log("long c");
        let addedChar = ',';
        let signPos = searchWordEnd(textarea.value, pos);
        let afterPart = textarea.value.substr(signPos);
        textarea.value = textarea.value.substr(0, signPos) + addedChar + afterPart;
        el("rb"+blockI).endScriptPos++;
        pushBlocks(blockI+1);
        refreshResBlocks(blockI);
        newScriptValue(textarea.value);
        lastClick = -1;
        firstClick = true;
        return;
    } else {
        if (lastClick==-1) {
            console.log("f c");
            lastClick = new Date();
            firstClick = true;
            setTimeout(addDotIfNotDoubleClick, 300);
            return;
        } else if ( t-lastClick<300) {
            console.log("double click." + textarea.value[pos]);
            let ch;
            if (textarea.value[pos]>='A' && textarea.value[pos]<='Z') {
                ch = textarea.value[pos].toLowerCase();
            } else {
                ch = textarea.value[pos].toUpperCase()
            }
            textarea.value = textarea.value.substr(0, pos) + ch + textarea.value.substr(pos+1);
            refreshResBlocks(blockI);
            newScriptValue(textarea.value);
            firstClick = false;
            lastClick = -1;
        }
    }
}

function scriptMouseDown(event) {
    clickTime = new Date();
}

