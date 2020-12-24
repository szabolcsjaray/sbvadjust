// 1.03
//load the IFrame Player API code asynchronously
var player;
var timingBlock = 0;
const TIMING_STOPPED = 0;
const TIMING_IN_BLOCK = 1;
const TIMING_BLOCK_ENDED = 2;
const TIMING_PAUSED = 3;

var phase = TIMING_STOPPED;

function initVideo() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

//gets called once the player API has loaded
function onYouTubeIframeAPIReady() {
    let myFrame = el('videoFrame');
    //let videoId = myFrame.getAttribute('idVid');
    player = new YT.Player('videoFrame');

}

function pauseVideo() {
    player.pauseVideo();
    console.log("Video time:" + player.getCurrentTime());
}
function startVideo() {
    player.playVideo();
}

function selectBlock(bi) {
    if (phase==TIMING_PAUSED) {
        el('ob'+(timingBlock)).style.backgroundColor = 'blanchedalmond';
        timingBlock = bi;
        el('ob'+(timingBlock)).style.backgroundColor = '#7ad8d4';
        el('keyInput').focus();
    }
}

function refreshTime(bi) {
    let ts = generateTimestamp(cutResBlocks[bi].startTime, cutResBlocks[bi].endTime);
    el('ot'+bi).innerHTML = ts;
    cutResBlocks[bi].time = ts;
    resBlocks[bi].time = ts;
}

function nextBlock(time) {
    cutResBlocks[timingBlock].startTime = time;
    refreshTime(timingBlock);
    if (timingBlock>0 && phase!=TIMING_STOPPED) {
        cutResBlocks[timingBlock-1].endTime = time;
        el('ob'+(timingBlock-1)).style.backgroundColor = 'blanchedalmond';
        el('rb'+(timingBlock-1)).style.backgroundColor = 'blanchedalmond';
        refreshTime(timingBlock-1);
    }
    highlightBlock(timingBlock);
    timingBlock++;
    if (timingBlock>=cutResBlocks.length) {
        player.stopVideo();
        phase = TIMING_STOPPED;
    }
    phase = TIMING_IN_BLOCK;
}

function unHighlightBlock(blockI) {
    el('ob'+(blockI)).style.backgroundColor = 'blanchedalmond';
}

function highlightBlock(blockI) {
    el('ob' + blockI).style.backgroundColor = '#7ad8d4';
    el("blocks").scrollTop = el("ob" + blockI).offsetTop - el("blocks").offsetTop - 20;
}

function endBlock(time) {
    if (timingBlock>0) {
        cutResBlocks[timingBlock-1].endTime = time;
        el('ob'+(timingBlock-1)).style.backgroundColor = 'blanchedalmond';
        el('rb'+(timingBlock-1)).style.backgroundColor = 'blanchedalmond';
        refreshTime(timingBlock-1);
    }
    el('ob'+timingBlock).style.backgroundColor = '#aaa8a4';
    el("blocks").scrollTop = el("ob"+timingBlock).offsetTop - el("blocks").offsetTop - 20;
    phase = TIMING_STOPPED;
}

function pauseTiming() {
    phase = TIMING_PAUSED;
    player.pauseVideo();
}

function restartTiming() {
    if (phase==TIMING_PAUSED) {
        phase = TIMING_IN_BLOCK;
        player.seekTo(cutResBlocks[timingBlock].startTime, true);
        player.playVideo();
        timingBlock++;
    }
}

function addKeyListener() {
    el('keyInput').addEventListener("keydown", event => {
    if (event.code=='KeyA') {
        player.seekTo(0);
        player.playVideo();
        timingBlock=0;
        nextBlock(0);
        phase = TIMING_IN_BLOCK;
    } else if (event.code=='KeyN') {
        nextBlock(player.getCurrentTime());
    } else if (event.code=='KeyM') {
        endBlock(player.getCurrentTime());
    } else if (event.code=='KeyQ') {
        refreshResultSBV(cutResBlocks);
    } else if (event.code=='KeyL') {
        pauseTiming();
    } else if (event.code=='KeyR') {
        restartTiming();
    }
    console.log(event.code);
    el('keyInput').value='';
  });
}

const VIDEO_ADDRESS_TEMPLATE = "http://www.youtube.com/embed/VIDEOID?rel=0&amp;controls=0&amp;hd=1&amp;showinfo=0&amp;enablejsapi=1"

function loadVideo(id) {
    checkWizard(id);
    let videoId = el("videoID").value;
    if (videoId.startsWith('http')) {
        let idPart  = videoId.search('v=');
        if (idPart==-1 || videoId.length<idPart+7) {
            alert('Wrong video address!');
            return;
        }
        let idEnds = videoId.substr(idPart).search('&');
        if (idEnds==-1) {
            videoId = videoId.substr(idPart+2);
        } else {
            videoId = videoId.substr(idPart+2,idEnds-2);
        }
        el("videoID").value = videoId;
    }
    address = VIDEO_ADDRESS_TEMPLATE.replace("VIDEOID", videoId);
    console.log(address);
    el('videoFrame').src = address;
    //initVideo();
}