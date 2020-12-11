// 1.02
const endSigns = ".!?";
const midSigns = ",;:-()";
const MAX_LENGTH = 140;
const MIN_LENGTH = 30;

var cutResBlocks = [];
var resBlocks = [];

function isEndSigned(word) {
    return (endSigns.indexOf(word[word.length-1])!=-1);
}

function isMidSigned(word) {
    return (midSigns.indexOf(word[word.length-1])!=-1);
}

function readSentenceBlock(words, wordI) {
    let sentence = "";
    let blockEnds = false;
    let sep = "";
    let startI = wordI;
    let midSignI = -1;
    let lastMidSentence = "";
    while (!blockEnds && wordI<words.length) {
        if ("\n".localeCompare(words[wordI])==0) {
            if (sentence.length>0) {
                return {SENTENCE:sentence.trim(), NEWWORDCOUNT: wordI+1};
            } else {
                wordI++;
                if (sentence.length!=0 && sentence[sentence.length-1]!=' ') {
                    sentence = sentence + ' ';
                    continue;
                }
            }
        } else if (words[wordI].length==0) {
            wordI++;
            continue;
        } else if (words[wordI][words[wordI].length-1]=='\n') {
            if (sentence.length>=MIN_LENGTH) {
                return {SENTENCE:sentence.trim(), NEWWORDCOUNT: wordI+1};
            }
        }
        sentence = sentence + sep + words[wordI];
        if (words[wordI].length>0) {
            if (isEndSigned(words[wordI])) {
                if (sentence.length>=MIN_LENGTH) {
                    return {SENTENCE:sentence.trim(), NEWWORDCOUNT: wordI+1};
                }
            } else {
                if (sentence.length>MAX_LENGTH) {
                    if (midSignI!=-1) {
                        return {SENTENCE:lastMidSentence.trim(), NEWWORDCOUNT: midSignI+1};
                    } else {
                        return {SENTENCE:sentence.trim(), NEWWORDCOUNT: wordI+1};
                    }
                }
                if (isMidSigned(words[wordI])) {
                    midSignI = wordI;
                    lastMidSentence = sentence;
                }
            }
        }
        wordI++;
        sep = " ";
    }
    return {SENTENCE:sentence.trim(), NEWWORDCOUNT: wordI+1};
}

function putresBlockOnScreen(resBlocks) {
    let blocksHTML = "";
    for(let i=0;i<resBlocks.length;i++) {
        blocksHTML += createHTMLForBlock(i, resBlocks[i].time,
            resBlocks[i].text,
            i,
            resBlocks[i].text);
    }
    el("blocks").innerHTML = blocksHTML;
    for(let i=0;i<resBlocks.length;i++) {
        el("rb"+i).startScriptPos = resBlocks[i].startScriptPos;
        el("rb"+i).endScriptPos = resBlocks[i].endScriptPos;
    }
}

function separateNewLine(words) {
    let resWords = [];
    words.forEach(function(word) {
        let innerSplit = word.split('\n');
        innerSplit.forEach(function(innerWord, i) {
            if (innerWord.length>0) {
                resWords.push(innerWord);
            }
            if (i<innerSplit.length-1) {
                resWords.push("\n");
            }
        });
    });
    return resWords;
}

function generateTimestamp(seconds, seconds1) {
    let frac = Math.floor((seconds-Math.floor(seconds))*1000);
    seconds = Math.floor(seconds);
    let secs = seconds % 60;
    let minutes = Math.floor(seconds/ 60) % 60;
    let hours = Math.floor(seconds/ 3600);

    let frac1 = Math.floor((seconds1-Math.floor(seconds1))*1000);
    seconds1 = Math.floor(seconds1);
    let secs1 = seconds1 % 60;
    let minutes1 = Math.floor(seconds1/ 60) % 60;
    let hours1 = Math.floor(seconds1/ 3600);

    return ""+hours+":" +
        (minutes<10? "0" : "") + minutes + ":" +
        (secs<10? "0" : "") + secs + "." + frac.toString().padStart(3, "0") + "," +
        hours1+":" +
        (minutes1<10? "0" : "") + minutes1 + ":" +
        (secs1<10? "0" : "") + secs1 + "." + frac1.toString().padStart(3, "0");
}

function cutScript() {
    let scr = el("script").value;
    let block = "";
    let sentence = "";
    let blockI = 0;
    let seconds = 0;

    let words = scr.split(' ');
    words = separateNewLine(words);
    let wordCount = 0;
    let blockScriptPos = 0;
    let lastLength = 0;
    while (wordCount<words.length) {
        let sentenceBlock = readSentenceBlock(words, wordCount);
        // add short part to long block.
        if (sentenceBlock.SENTENCE.length<MIN_LENGTH && lastLength>MAX_LENGTH) {
            resBlocks[blockI-1].text = resBlocks[blockI-1].text + ' ' + sentenceBlock.SENTENCE;
            blockScriptPos = stepOverBlock(blockScriptPos, sentenceBlock.SENTENCE);
            resBlocks[blockI-1].endScriptPos = blockScriptPos;
            wordCount = sentenceBlock.NEWWORDCOUNT;
            continue;
        }

        lastLength = sentenceBlock.SENTENCE.length;

        wordCount = sentenceBlock.NEWWORDCOUNT;
        let newBlock = {};
        newBlock.text = sentenceBlock.SENTENCE;

        if (cutResBlocks.length>blockI) {
            newBlock.time = cutResBlocks[blockI].time;
            newBlock.startTime = cutResBlocks[blockI].startTime;
            newBlock.endTime = cutResBlocks[blockI].endTime;
        } else {
            newBlock.time = generateTimestamp(seconds, seconds+5);
            newBlock.startTime = seconds;
            newBlock.endTime = seconds+5;
        }
        seconds += 5;
        newBlock.startScriptPos = blockScriptPos;
        blockScriptPos = stepOverBlock(blockScriptPos, newBlock.text);
        newBlock.endScriptPos = blockScriptPos;
        resBlocks[blockI] = newBlock;
        blockI++;
    }

    putresBlockOnScreen(resBlocks);
    createResultSBV(resBlocks);
    refreshResultSBV();
    cutResBlocks = resBlocks.slice();
}