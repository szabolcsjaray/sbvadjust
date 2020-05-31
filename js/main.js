function init() {
    //alert("yo");
}
function el(id) {
    return document.getElementById(id);
}

var blocks = [];
var scrcontent;
var processedWords = 0;
var SBVloaded = false;

function loadOriginal() {
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
        blocks.push(block);
    }

    el("blocks").innerHTML = "";
    let newBlocks = "";
    let ind = 0;
    blocks.forEach( function(block) {
        newBlocks = newBlocks + "            <div class=\"block\">"+
        "Time: <p id=\"ot"+ind+"\">"+ block.time +"</p><br>" +
        "<textarea id=\"ob"+ind+"\" class=\"blockText\" title=\"Original SBV block\">"+
        block.text+
        "</textarea>"+
        "<textarea id=\"rb"+ind+"\" class=\"blockText\" title=\"Result SBV block\"></textarea>" +
        "</div>";
        ind++;
    });
    el("blocks").innerHTML = newBlocks;
    SBVloaded = true;

}

const EXACT_MATCH = 1;
const PARTIAL_MATCH = 2;
const DIFFERENT = 3;
const LOOK_FORWARD = 10;
const SIGNS=[',.:\''];

function wmatches(word1, word2) {

    if (word1.toUpperCase()==word2.toUpperCase()) {
        return EXACT_MATCH;
    } else {
        let dword1 = word1.toUpperCase();
        let dl1 = dword1.length;
        let dword2 = word2.toUpperCase();
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

function processBlock(block) {
    let resTextLine = "";
    let separator = "";
    console.log("Processing block: " + block.time);
    let blockWords = block.text.split(' ');
    let blockWordI = 0;
    let startWord = processedWords;
    let iLog = "Processing block: " + block.time + "\n";
    let newBlock = { 'last': false, 'lostSync' : false};
    while (blockWordI<blockWords.length) {
        let blockWord = blockWords[blockWordI];

        if (processedWords>=scrcontent.length) {
            newBlock.last = true;
            break;
        }
        let nextWord = scrcontent[processedWords];
        processedWords++;
        iLog = iLog + "Check block|content: " + blockWord + "|" + nextWord + "\n";
        //console.log("Check block|content: " + blockWord + "|" + nextWord)
        match = wmatches(nextWord, blockWord);
        if (match==EXACT_MATCH) {
            resTextLine = resTextLine + separator + nextWord;
            iLog = iLog + "Exact match (block|content): " + blockWord + "|" + nextWord + "\n";
            //console.log("Exact match (block|content): " + blockWord + "|" + nextWord)
        } else if (match==PARTIAL_MATCH) {
            iLog = iLog + "Partial match (block|content): " + blockWord + "|" + nextWord + "\n";
            //console.log("Partial match (block|content): " + blockWord + "|" + nextWord)
            resTextLine = resTextLine + separator + nextWord;
        } else {
            iLog = iLog + "Problem here (block|content):" + blockWord + "|" + nextWord + "\n";
            //console.log("Problem here (block|content):" + blockWord + "|" + nextWord)

            let syncs = [];
            let badBlockWord = blockWord;
            let blockWordProblemI = blockWordI;
            let foundSync = false;
            while (foundSync==false && blockWordI<blockWords.length && blockWordI-blockWordProblemI<LOOK_FORWARD) {
                blockWord = blockWords[blockWordI];
                iLog = iLog + "Try to find sync for this block word:" + blockWord +"\n";
                //console.log("Try to find sync for this block word:" + blockWord)
                let findI = processedWords-1;
                let collectContentPart = "";
                while (findI<processedWords+LOOK_FORWARD && (wmatches(scrcontent[findI], blockWord)==DIFFERENT)) {
                    iLog = iLog +  "Try sync, no match:" + scrcontent[findI] + "!=" + blockWord + "\n";
                    //console.log("Try sync, no match:" + content[findI] + "!=" + blockWord)
                    collectContentPart = collectContentPart + separator + scrcontent[findI];
                    separator = " ";
                    findI = findI + 1;
                }
                if (findI>=processedWords+LOOK_FORWARD) {
                    blockWordI = blockWordI + 1;
                    iLog = iLog + "Step blockWordI"  + "\n";
                    //console.log("Step blockWordI")
                } else {
                    iLog = iLog + "Found sync: " + scrcontent[findI]  + "==" + blockWord  + "\n";
                    //console.log("Found sync: " + scrcontent[findI]  + "==" + blockWord)
                    collectContentPart = collectContentPart + separator + scrcontent[findI];
                    sync = {'findI': findI, 'blockWordI' : blockWordI, 'collectContentPart': collectContentPart};
                    syncs.push(sync);
                    blockWordI = blockWordI + 1;

                    //foundSync = True
                }
            }

            if (syncs.length==0) {
                console.log(iLog);
                console.log("Not found sync till end of block or "+
                LOOK_FORWARD+" words, word:" + nextWord +
                ", block word:" + badBlockWord +". Block is:" + block['time']);
                console.log("Old block:" + block['text']);
                let i = processedWords;
                contentFrom = "";
                while (i<processedWords+10 && i<scrcontent.length) {
                    contentFrom = contentFrom + scrcontent[i] + " ";
                    i = i + 1;
                }
                console.log("Content from:" + contentFrom);
                newBlock.lostSync = true;
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
                iLog = iLog + "Apply sync, add this to new block:" + sync['collectContentPart'] + "\n";
                resTextLine = resTextLine + sync['collectContentPart'];
                blockWordI = sync['blockWordI'];
                iLog = iLog + "result so far:" + resTextLine + "\n";
                if (blockWordI<blockWords.length-1) {
                    iLog = iLog + "next block word:" + blockWords[blockWordI+1] + "\n";
                }
                //logf.write(iLog.encode('utf-8') + "\n")
                //logf.write("\n\n")
                //console.log("result so far:" + resTextLine)
            }
        }
        separator = " ";
        blockWordI = blockWordI + 1;
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
    newBlock.time = block.time;
    newBlock.text = resTextLine;
    return newBlock;
}

function createResultSBV(resBlocks) {
    resLine = "";
    resBlocks.forEach(function(block) {
        resLine = resLine + block.time + "\n" + block.text + "\n\n";
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
        resBlocks[bi] = processBlock(blocks[bi]);
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
    }

    for(bi=0;bi<resBlocks.length;bi++) {
        el("rb"+bi).value = resBlocks[bi].text;
    }
    if (scrollTo==-1) {
        scrollTo = block.length;
    }
    el("blocks").scrollTop = el("ob"+scrollTo).offsetTop - el("blocks").offsetTop;
    createResultSBV(resBlocks);
}