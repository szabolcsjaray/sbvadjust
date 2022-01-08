// 1.04
const SBV_SPACE = "sbvadjust";
const ORIG_SBV = "origsbv";
const SCRIPT = "script";
const ORIGBLOCKS = "origblocks";
const RESBLOCKS = "resblocks";
const TIMINGS = "timings";
const PROCESSEDBLOCKS = "processedblocks";
const VIDEOLINK = "videolink";

function sessionSave(auto = false) {
    let ok = auto;
    if (!auto) {
        ok = confirm("This will overwrite the session already saved in browser. Ok?");
    }
    if (ok) {
        autoFolder = (auto ? "/auto" : "");
        space = SBV_SPACE + autoFolder;
        localStorage.setItem(space+"/"+ORIG_SBV, el("origSBV").value);
        localStorage.setItem(space+"/"+SCRIPT, el("script").value);
        let origBlocks = [];
        for(let i=0;i<blocks.length;i++) {
            origBlocks.push(el("ob"+i).value);
        }
        localStorage.setItem(space+"/"+ORIGBLOCKS, JSON.stringify(origBlocks));
        let resBlocks = [];
        for(let i=0;i<blocks.length;i++) {
            resBlocks.push(el("rb"+i).value);
        }
        localStorage.setItem(space+"/"+RESBLOCKS, JSON.stringify(resBlocks));
        let timings = [];
        for(let i=0;i<blocks.length;i++) {
            timings.push(el("ot"+i).innerHTML);
        }
        localStorage.setItem(space+"/"+TIMINGS, JSON.stringify(timings));
        localStorage.setItem(space+"/"+VIDEOLINK, el("videoID").value);
    }
}

function setIfNotNull(htmlId, storageId) {
    let value = localStorage.getItem(storageId);
    if (value!=null) {
        el(htmlId).value = value;
    }
}

function sessionLoad(auto = false) {
    let ok = auto;
    if (!auto) {
        ok = confirm("This will overwrite the site text fields with the saved session content. Ok?");
    }
    if (ok) {
        autoFolder = (auto ? "/auto" : "");
        space = SBV_SPACE + autoFolder;
        setIfNotNull("origSBV", space+"/"+ORIG_SBV);
        setIfNotNull("script", space+"/"+SCRIPT);
        setIfNotNull("videoID", space+"/"+VIDEOLINK);
        let origBlocks = JSON.parse(localStorage.getItem(space+"/"+ORIGBLOCKS));
        let resBlocks = JSON.parse(localStorage.getItem(space+"/"+RESBLOCKS));
        let timings = JSON.parse(localStorage.getItem(space+"/"+TIMINGS));
        //loadOriginal();
        blocks = [];
        if (origBlocks!=null) {
            for(let i=0;i<origBlocks.length;i++) {
                blocks[i] = { "time" : timings[i], "text" : origBlocks[i], "index" : i};
            }
            createOrigBlocks();
            for(let i=0;i<origBlocks.length;i++) {
                el("rb"+i).value = resBlocks[i];
            }

            refreshBlocksFromScreen();
        }
        refreshResultSBV();
        SBVloaded = true;
    }
}