// 1.02
const SBV_SPACE = "sbvadjust";
const ORIG_SBV = "origsbv";
const SCRIPT = "script";
const ORIGBLOCKS = "origblocks";
const RESBLOCKS = "resblocks";
const TIMINGS = "timings";
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
        let resBlocks = [];
        for(let i=0;i<blocks.length;i++) {
            resBlocks.push(el("rb"+i).value);
        }
        localStorage.setItem(SBV_SPACE+"/"+RESBLOCKS, JSON.stringify(resBlocks));
        let timings = [];
        for(let i=0;i<blocks.length;i++) {
            timings.push(el("ot"+i).innerHTML);
        }
        localStorage.setItem(SBV_SPACE+"/"+TIMINGS, JSON.stringify(timings));

    }
}

function sessionLoad() {
    let ok = confirm("This will overwrite the site text fields with the saved session content. Ok?");
    if (ok) {
        el("origSBV").value = localStorage.getItem(SBV_SPACE+"/"+ORIG_SBV);
        el("script").value = localStorage.getItem(SBV_SPACE+"/"+SCRIPT);
        let origBlocks = JSON.parse(localStorage.getItem(SBV_SPACE+"/"+ORIGBLOCKS));
        let resBlocks = JSON.parse(localStorage.getItem(SBV_SPACE+"/"+RESBLOCKS));
        let timings = JSON.parse(localStorage.getItem(SBV_SPACE+"/"+TIMINGS));
        //loadOriginal();
        blocks = [];
        for(let i=0;i<origBlocks.length;i++) {
            blocks[i] = { "time" : timings[i], "text" : origBlocks[i], "index" : i};
        }
        createOrigBlocks();
        for(let i=0;i<origBlocks.length;i++) {
            el("rb"+i).value = resBlocks[i];
        }

        refreshBlocksFromScreen();
        refreshResultSBV();
        SBVloaded = true;
    }
}