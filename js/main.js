function init() {
    let url = new URL(window.location.href);
    if (url.searchParams.get('test')) {
        console.log(getRidOffMarks("Iti!?;"));
        console.log(getRidOffMarks("Itiner"));
        console.log(wmatches("7", "seven"));
        block0 = { "text": "try to parse these words", "index": 0, 'time': "0:0"};
        block1 = { "text": "ammd coontinue here. Some more sentences come here to make sure..", 'index': 1, 'time': "0:1"};
        block2 = { "text": "Third example section of the what we want.", 'index': 2, 'time': "0:2"};

        processedWords = 0;
        testScr = "Try to parse these w-ords and continue here. "+
                "Some more sentences come here to make sure.. "+
                "Third example section of the what we want.";
        scrcontent = testScr.split(' ');
        let str = "TESTING...  \n\n"+testScr+"\n----------------------\n"+ blockToStr(block0)+"\n"+blockToStr(block1)+"\n";
        el("script").value = str;
        let res = processBlock(block0, block1);
        let res2 = processBlock(block1, block2, res);
        let res3 = processBlock(block2, null, res2);
        el("script").value = el("script").value  +"\nresult 1. block:\n"+ blockToStr(res) +
            "\nresult 2. block:\n" + blockToStr(res2) +
            "\nresult 3. block:\n" + blockToStr(res3);
        //alert(res.text);
    }
    //alert("yo");
}

function blockToStr(block) {
    return "time: " + block.time +
        "\ntext: " + block.text +
        "\nnextText: "+((typeof block.nextText=='undefined')? "":block.nextText) +
        "\nnextI: "+block.nextI+
        "\n*********************************************************";
}
function el(id) {
    return document.getElementById(id);
}

var blocks = [];
var scrcontent;
var processedWords = 0;
var SBVloaded = false;

function loadOriginal() {
    blocks = [];
    let original = el("origSBV").value;
    let arrayOfLines = original.match(/[^\r\n]+/g);
    let bi = 0;
    for(let li = 0;li<arrayOfLines.length;) {
        arrayOfLines[li] = arrayOfLines[li].replace(/(\r\n)/g, " ");
        let block = {time: arrayOfLines[li]};
        li++; if (li>arrayOfLines.length) { break; }
        let text = arrayOfLines[li];
        li++;
        //console.log(arrayOfLines[li].match(/(\d:\d\d:\d\d)/));
        while(li<arrayOfLines.length && arrayOfLines[li].match(/(\d:\d\d:\d\d)/)==null) {
            text = text + " " + arrayOfLines[li];
            li++;
            //console.log(arrayOfLines[li].match(/(\d:\d\d:\d\d)/));
            if (li>arrayOfLines.length) { break; }

        }
        block.text = text;
        block.index = bi;
        bi = bi + 1;
        blocks.push(block);
    }

    el("blocks").innerHTML = "";
    let newBlocks = "";
    let ind = 0;
    blocks.forEach( function(block) {
        newBlocks = newBlocks + "            <div class=\"block\" id=\"b"+ind+"\">"+
        (ind+1) + ". Time: <p id=\"ot"+ind+"\">"+ block.time +"</p><br>" +
        "<textarea id=\"ob"+ind+"\" class=\"blockText\" title=\"Original SBV block\""+
        "onchange=\"refreshBlocksFromScreen();\"" +
        ">"+
        block.text+
        "</textarea>"+
        "<textarea id=\"rb"+ind+"\" class=\"blockText resultBlock\" title=\"Result SBV block\""+
        "onchange=\"refreshResultSVB();\"" +
        "></textarea>" +
        "<div style=\"display:inline-block;width:3%;height:40px;position:relative;\">"+
        "<img class=\"icon\" src=\"pics/target.png\" style=\"width:100%;top:0px;position:absolute;\""+
            " title=\"Locate the block in the script.\" onclick=\"findBlock("+block.index+")\"/>" +
        //"<img  class=\"icon\" src=\"pics/copy.png\" style=\"width:100%;top:50%;position:absolute;\""+
        //    " title=\"Copy the autogenerated block text to the script.\"/>" +
        "</div>" +
        "</div>";
        ind++;
    });
    el("blocks").innerHTML = newBlocks;
    SBVloaded = true;

}

const FIND_BLOCK_LEN = 30;

function findBlock(bi) {
    let findText = el("rb"+bi).value;
    if (findText.length>0) {
        //alert("find:" + bi + "\n" + findText);
        let start = el("script").value.indexOf(findText.substring(0,Math.max(findText.length, FIND_BLOCK_LEN)));
        if (start>-1) {
            selectInTextarea(el("script"), start, start + findText.length, true);
        }
    }
}

function refreshBlocksFromScreen() {
    for(let i=0;i<blocks.length;i++) {
        blocks[i].text=el("ob"+i).value.trim();
    }
}

function refreshResultSVB() {
    let resLine = "";
    for(let i=0;i<blocks.length;i++) {
        let line = el("rb"+i).value.trim();
        if (line.length>0) {
            resLine = resLine + blocks[i].time + "\n" + line + "\n\n";
        }
    }
    el("resultSVB").value = resLine;
}

const EXACT_MATCH = 1;
const PARTIAL_MATCH = 2;
const DIFFERENT = 3;
const LOOK_FORWARD = 10;
const SIGNS=[',.:\''];
const NUMBERS=['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
const MARKS="?!.:,;";

function getRidOffMarks(str) {
    i = str.length-1;
    while (i>0 && MARKS.includes(str[i])) {
        i--;
    }
    return str.substr(0,i+1);
}

function wmatches(srcWord, blockWord) {
    let dword1 = getRidOffMarks(srcWord.toUpperCase());
    let dword2 = getRidOffMarks(blockWord.toUpperCase());
    if (dword1==dword2) {
        return EXACT_MATCH;
    } else if ((NUMBERS.indexOf(dword1)!=-1 && ""+NUMBERS.indexOf(dword1)==dword2) ||
            (NUMBERS.indexOf(dword2)!=-1 && ""+NUMBERS.indexOf(dword2)==dword1)) {
        return EXACT_MATCH;
    } else {
        let dl1 = dword1.length;
        let dl2 = dword2.length;
        let i = 0;
        let diff = [];
        //print("match:" + dword1 +"|"+ dword2)
        while (i<dword1.length && i<dword2.length) {
            if (dword1[i]!=dword2[i]) {
                diff.push(i);
            }

            i = i + 1;
        }
        //print(diff)


        if (dword1.length==dword2.length+1) {
            if (i==dword2.length && diff.length==0) {
                return PARTIAL_MATCH;
            }
        }

        if (dword2.length==dword1.length+1) {
            if (i==dword1.length && diff.length==0) {
                return PARTIAL_MATCH;
            }
        }

        if (diff.length==1 && i>2) {
            return PARTIAL_MATCH;
        }


        if (dl1>dl2) {
            if (dl2==1 && diff.length>0) {
                return DIFFERENT;
            }
            if (dl1>dl2+4) {
                return DIFFERENT;
            }
            if (diff.length==1 && diff[0]==dl2-1) {
                return PARTIAL_MATCH;
            }
        } else if (dl2>dl1 && dl1>2) {
            if (dl1==1 && diff.length>0) {
                return DIFFERENT;
            }
            if (dl2>dl1+4) {
                return DIFFERENT;
            }
            if (diff.length==1 && diff[0]==dl1-1) {
                return PARTIAL_MATCH;
            }
        } else if (diff.length==1 && diff[0]==dl1-1 && dl1>2) {
            return PARTIAL_MATCH;
        }

        if (i>2 && diff.length<dl1*0.3 && diff.length<dl2*0.3) {
            return PARTIAL_MATCH;
        }

        return DIFFERENT;
    }
}

function selectInTextarea(tarea, startPos, endPos, scrollTo = false) {
    if(typeof(tarea.selectionStart) != "undefined") {
        tarea.focus();
        if (scrollTo) {
            const fullText = tarea.value;
            tarea.value = fullText.substring(0, endPos);
            tarea.scrollTop = tarea.scrollHeight;
            tarea.value = fullText;
        }
        tarea.selectionStart = startPos;
        tarea.selectionEnd = endPos;
        return true;
    }

    // IE
    if (document.selection && document.selection.createRange) {
        tarea.focus();
        tarea.select();
        var range = document.selection.createRange();
        range.collapse(true);
        range.moveEnd("character", endPos);
        range.moveStart("character", startPos);
        range.select();
        return true;
    }
}

function logCollect(logStr, newLogStr, toConsole) {
    logStr = logStr + newLogStr;
    if (toConsole) {
        console.log(newLogStr);
    }
    return logStr;
}

function processBlock(block, nextBlock, prevResBlock = null) {
    let resTextLine = "";
    let separator = "";
    console.log("Processing block: " + block.time);
    let blockWords = block.text.split(' ');
    let twoBlockWords = (nextBlock!=null ? block.text.split(' ').concat(nextBlock.text.split(' ')) : block.text.split(' '));
    let blockWordI = 0;
    let startWord = processedWords;
    let iLog = "Processing block: " + block.time + "\n";
    let newBlock = { 'last': false, 'lostSync' : false, nextText : ''};
    if (prevResBlock!=null) {
        newBlock.text = prevResBlock.nextText + (prevResBlock.nextText.length>0 ? " " : "");
        blockWordI = prevResBlock.nextI + 1;
        console.log("Transferred text: "+ newBlock.text + "\n blockWordI = " + (prevResBlock.nextI + 1))
    } else {
        newBlock.text = "";
    }
    let startPos = 0;
    let collectedNextContentPart = "";
    let nextI = -1;
    while (blockWordI<blockWords.length) {
        let blockWord = blockWords[blockWordI];


        if (processedWords>=scrcontent.length) {
            newBlock.last = true;
            break;
        }
        while (processedWords<scrcontent.length-1 && scrcontent[processedWords].length==0) {
            processedWords++;
        }
        let nextWord = scrcontent[processedWords];
        processedWords++;
        collectedNextContentPart = "";
        nextI = -1;

        iLog = logCollect(iLog, "Check block|content: " + blockWord + "|" + nextWord + "\n", false);
        //console.log("Check block|content: " + blockWord + "|" + nextWord)
        match = wmatches(nextWord, blockWord);
        if (match==EXACT_MATCH) {
            resTextLine = resTextLine + separator + nextWord;
            iLog = logCollect(iLog, "Exact match (block|content): " + blockWord + "|" + nextWord + "\n", false);
            //console.log("Exact match (block|content): " + blockWord + "|" + nextWord)
        } else if (match==PARTIAL_MATCH) {
            iLog = logCollect(iLog, "Partial match (block|content): " + blockWord + "|" + nextWord + "\n", false);
            //console.log("Partial match (block|content): " + blockWord + "|" + nextWord)
            resTextLine = resTextLine + separator + nextWord;
        } else {
            iLog = logCollect(iLog, "Problem here (block|content):" + blockWord + "|" + nextWord + "\n", false);
            //console.log("Problem here (block|content):" + blockWord + "|" + nextWord)

            let syncs = [];
            let startPosBadWord = startPos;
            let badBlockWord = blockWord;
            let blockWordProblemI = blockWordI;
            let foundSync = false;
            while (foundSync==false && blockWordI<twoBlockWords.length && blockWordI-blockWordProblemI<LOOK_FORWARD) {
                blockWord = twoBlockWords[blockWordI];
                iLog = logCollect(iLog, "Try to find sync for this block word:" + blockWord +"\n", false);
                //console.log("Try to find sync for this block word:" + blockWord)
                let findI = processedWords-1;
                let collectContentPart = "";
                collectedNextContentPart = "";
                while (findI<scrcontent.length && findI<processedWords+LOOK_FORWARD &&
                        (wmatches(scrcontent[findI], blockWord)==DIFFERENT)) {
                    iLog = logCollect(iLog,  "Try sync, no match:" + scrcontent[findI] + "!=" + blockWord + "\n", false);
                    //console.log("Try sync, no match:" + content[findI] + "!=" + blockWord)
                    if (findI-processedWords<blockWords.length-blockWordProblemI-1) {
                        collectContentPart = collectContentPart + separator + scrcontent[findI];
                    } else {
                        collectedNextContentPart = collectedNextContentPart + separator + scrcontent[findI];
                    }
                    separator = " ";
                    findI = findI + 1;
                }
                if (findI>=processedWords+LOOK_FORWARD) {
                    blockWordI = blockWordI + 1;
                    iLog = logCollect(iLog, "Step blockWordI"  + "\n", false);
                    //console.log("Step blockWordI")
                } else {
                    iLog = logCollect(iLog, "Found sync: " + scrcontent[findI]  + "==" + blockWord  + "\n", false);
                    //console.log("Found sync: " + scrcontent[findI]  + "==" + blockWord)

                    if (findI-processedWords<blockWords.length-blockWordProblemI-1) {
                        collectContentPart = collectContentPart + separator + scrcontent[findI];
                    } else {
                        collectedNextContentPart = collectedNextContentPart + separator + scrcontent[findI];
                    }
                    sync = {'findI': findI,
                            'blockWordI' : blockWordI,
                            'collectContentPart': collectContentPart,
                            'collectedNextContentPart' : collectedNextContentPart};
                    syncs.push(sync);
                    blockWordI = blockWordI + 1;
                    startPos = startPos + blockWord.length + 1;
                    //foundSync = True
                }
            }

            if (syncs.length==0) {
                console.log(iLog);
                console.log("Not found sync till end of block or "+
                    LOOK_FORWARD+" words, word:" + nextWord +
                    ", block word:" + badBlockWord +". Block is:" + block['time']);
                console.log("Old block:" + block['text']);
                selectInTextarea( el("ob"+block.index), startPosBadWord, startPosBadWord+badBlockWord.length);
                let i = processedWords;
                contentFrom = "";
                while (i<processedWords+10 && i<scrcontent.length) {
                    contentFrom = contentFrom + scrcontent[i] + " ";
                    i = i + 1;
                }
                console.log("Content from:" + contentFrom);
                newBlock.lostSync = true;
                alert("Sync lost. Bad block word:" + badBlockWord);
                el("stopped").innerHTML = badBlockWord;
                return newBlock; // !!!!!!
            } else {
                //console.log("Syncs num: " , len(syncs))
                if (syncs-length!=1) {
                    //console.log("Sync only: --------")
                    //for k,v in sync.iteritems():
                    //    console.log(k , v)
                    //console.log("----------")
                    //else:
                    sync = syncs[0]

                    for(let i=1;i<syncs.length;i++) {
                        if (syncs[i]['findI']<sync['findI']) {
                            sync = syncs[i];
                            /*
                            //console.log("Sync: --------")
                            //for k,v in sync.iteritems():
                            //    console.log(k , v)
                            console.log("----------")
                            */
                        }
                    }
                }
                processedWords = sync['findI'] + 1;
                iLog = logCollect(iLog, "Apply sync, add this to new block:" + sync['collectContentPart'] + "\n", false);
                blockWordI = sync['blockWordI'];
                if (blockWordI>=blockWords.length) {
                    nextI = blockWordI - blockWords.length;
                    //alert("over the block! i:" + blockWordI + "\n collected next part:" + sync['collectedNextContentPart'] +
                    //    "\n nextI:" + nextI);
                    collectedNextContentPart = sync['collectedNextContentPart'];
                    /*newBlock.lostSync = true;
                    alert("Sync lost. Bad block word:" + badBlockWord);
                    return newBlock;*/
                }
                resTextLine = resTextLine + sync['collectContentPart'];
                iLog = logCollect(iLog, "result so far:" + resTextLine + "\n", false);
                if (blockWordI<twoBlockWords.length-1) {
                    iLog = logCollect(iLog, "next block word:" + blockWords[blockWordI+1] + "\n", false);
                }
                //logf.write(iLog.encode('utf-8') + "\n")
                //logf.write("\n\n")
                //console.log("result so far:" + resTextLine)
            }
        }
        separator = " ";
        blockWordI = blockWordI + 1;
        startPos = startPos + blockWord.length + 1;
    }

    console.log("New block text:" + resTextLine);
    console.log("Old block text:" + block.text);
    if (resTextLine.split(' ').length!=block.text.split(' ').length) {
        console.log('------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!---------------------------------------------');
    }
    let usedWords = "";
    for(let i=startWord;i<processedWords;i++) {
        usedWords = usedWords + scrcontent[i] + " ";
    }
    console.log("Used words    :" + usedWords);
    console.log("---------------------------------------------------");
    newBlock.time = block.time.trim();
    newBlock.text = newBlock.text + resTextLine.trim();
    newBlock.nextText = collectedNextContentPart;
    newBlock.nextI = nextI;
    return newBlock;
}

function createResultSBV(resBlocks) {
    resLine = "";
    resBlocks.forEach(function(block) {
        resLine = resLine + block.time.trim() + "\n" + block.text.trim() + "\n\n";
    });
    el("resultSVB").value = resLine;
}

function processSBV() {
    if (!SBVloaded) {
        loadOriginal();
    }
    processedWords = 0;
    scrcontent = []
    //console.log(el("script").value.replace(/\n\r/g, " "));
    scrcontent = el("script").value.replace(/\n\r/g, " ")
                    .replace(/\n/g, ' ')
                    .replace(/  /g, ' ')
                    .replace(/  /g, ' ')
                    .replace(/  /g, ' ')
                    .split(' ');
    let resBlocks = [];
    let bi = 0;
    let scrollTo = -1;
    for(bi=0;bi<blocks.length;bi++) {
        resBlocks[bi] = processBlock(blocks[bi],
            (bi+1<blocks.length ? blocks[bi+1] : null),
            (bi>0 ? resBlocks[bi-1] : null));
        if (resBlocks[bi].nextText.length>0) {
            console.log("This is transferred: " + resBlocks[bi].nextText);
            console.log("blcokWordI in next block: " +resBlocks[bi].nextI);
        }
        if (resBlocks[bi].lostSync) {
            scrollTo = bi;
            console.log("Lost synchronization.. Correct sources, and rerun process!");
            break;
        }
        if (resBlocks[bi].last) {
            scrollTo = bi;
            console.log('All script is processed.');
            alert("Whole script is processed!");
            break;
        }
	  el("rb"+bi).value = resBlocks[bi].text;
        let wordNoOrig = blocks[bi].text.split(' ').length;
        let wordNoRes = resBlocks[bi].text.split(' ').length;
        let wordNoDiff = Math.abs(wordNoOrig-wordNoRes);
        if (wordNoDiff>0) {
            if (wordNoDiff<=2) {
                el("b"+bi).style.borderRight="4px solid orange";
                blocks[bi].mark = 'orange';
            } else {
                el("b"+bi).style.borderRight="5px solid red";
                blocks[bi].mark = 'red';
            }
        } else {
            el("b"+bi).style.borderRight="4px solid green";
            blocks[bi].mark = 'green';
        }
        el("rb"+bi).style.backgroundColor = "blanchedalmond";
    }


    for(let i=resBlocks.length-1;i<blocks.length;i++) {
        el("rb"+i).style.backgroundColor = "";
        el("b"+i).style.borderRight="5px solid red";
    }
    if (scrollTo==-1) {
        scrollTo = block.length;
    }
    if (scrollTo>0) {
        scrollTo--;
    }
    el("blocks").scrollTop = el("ob"+scrollTo).offsetTop - el("blocks").offsetTop;
    createResultSBV(resBlocks);
}

function saveResultSBV() {
    let textToWrite = el("resultSVB").value;
    let textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    let downloadLink = document.createElement("a");
    downloadLink.download = "result.svb";
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null)
    { //Chrome
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    { // Firefox
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function isBlockRed(bi) {
    return 'mark' in blocks[bi] && blocks[bi].mark=="red";
}

function changeOnlyRed() {
    if (el("onlyRed").checked) {
        for(let bi=0;bi<blocks.length;bi++) {
            if ( !isBlockRed(bi) &&
                (bi==0 || !isBlockRed(bi-1)) &&
                (bi>=blocks.length-1 || !isBlockRed(bi+1)) ) {
               el("b"+bi).style.display = "none";
            }
        }
    } else {
        for(let bi=0;bi<blocks.length;bi++) {
             el("b"+bi).style.display = "block";
        }
    }
}