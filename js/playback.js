// 1.01

var playbackBlock = -1;
var nextStart = '';
var blockEnds = '';
var stopped = true;


function playBlock(i) {
    if (!stopped) {
        stopped = true;
        unHighlightBlock(playbackBlock);
    }
    el('subTryDiv').style.display = 'flex';
    el('stopButton').style.display ='inline-block';
    playbackBlock = i;
    showBlock();
    let blockStart = getInMillis(getStartTime(el('ot' + playbackBlock).innerHTML));
    player.seekTo(blockStart, true);
    player.playVideo();
    stopped = false;
    setTimeout(() => {
        checkText();
    }, 50);
}

function getInMillis(timestr) {
    // 0:00:23.150
    console.log('time:'+timestr );
    let milli = 0 + Number(timestr.substr(0,1)) * 60*60 +
        Number(timestr.substr(2,2)) * 60 +
        Number(timestr.substr(5,2)) +
        Number(timestr.substr(8,3))/1000;
        console.log('time ms:'+milli );
    return milli;
}

function showBlock() {
    if (playbackBlock>0) {
        unHighlightBlock(playbackBlock-1);
    }
    highlightBlock(playbackBlock);
    blockEnds = getInMillis(getEndTime(el('ot' + playbackBlock).innerHTML));
    if (el('ot' + (playbackBlock + 1)) != null) {
        nextStart = getInMillis(getStartTime(el('ot' + (playbackBlock + 1)).innerHTML));
    } else {
        nextStart = null;
    }
    updateText(playbackBlock);
}

function checkText() {
    if (stopped) {
        return;
    }

    if (nextStart!=null && player.getCurrentTime()>=nextStart) {
        playbackBlock++;
        showBlock();
    } else if (player.getCurrentTime()>=blockEnds) {
        el('subTrySpan').innerHTML = '';
        if (nextStart==null) {
            player.stopVideo();
            return;
        }
    }
    setTimeout(() => {
        checkText();
    }, 50);
}

function updateText(i) {
    if (el('rb' + i).value.length != 0) {
        el('subTrySpan').innerHTML = el('rb' + i).value;
    } else {
        el('subTrySpan').innerHTML = el('ob' + i).value;
    }
}


function stopPlayback() {
    player.pauseVideo();
    unHighlightBlock(playbackBlock);
    el('subTryDiv').style.display='none';
    el('stopButton').style.display ='none';
    playbackBlock = -1;
    nextStart = '';
    blockEnds = '';
    stopped = true;
}