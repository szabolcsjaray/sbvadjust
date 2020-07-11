const SBV_SPACE = "sbvadjust";
const ORIG_SBV = "origsbv";
const SCRIPT = "script";
const ORIGBLOCKS = "origblocks";
const PROCESSEDBLOCKS = "processedblocks";

function sessionSave() {
    let ok = confirm("This will overwrite the session already saved in browser. Ok?");
    if (ok) {
        localStorage.setItem(SBV_SPACE+"/"+ORIG_SBV, el("origSBV").value);
        localStorage.setItem(SBV_SPACE+"/"+SCRIPT, el("script").value);
        let origBlocks = [];
        for(let i=0;i<blocks.length;i++) {
            origBlocks.push(el("ob"+i).value);
        }
        localStorage.setItem(SBV_SPACE+"/"+ORIGBLOCKS, JSON.stringify(origBlocks));
    }
}

function sessionLoad() {
    let ok = confirm("This will overwrite the site text fields with the saved session content. Ok?");
    if (ok) {
        el("origSBV").value = localStorage.getItem(SBV_SPACE+"/"+ORIG_SBV);
        el("script").value = localStorage.getItem(SBV_SPACE+"/"+SCRIPT);
        let origBlocks = JSON.parse(localStorage.getItem(SBV_SPACE+"/"+ORIGBLOCKS));
        loadOriginal();
        for(let i=0;i<blocks.length;i++) {
            el("ob"+i).value = origBlocks[i];
        }
        refreshBlocksFromScreen();
    }
}