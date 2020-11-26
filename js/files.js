// 1.01
function saveResultSBV() {
    let textToWrite = el("resultSBV").value;
    let textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    let downloadLink = document.createElement("a");
    downloadLink.download = "result.sbv";
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

function loadOrigSBVFileClick() {
    el("origFileSelect").click();
}

function loadOrigSBVFile() {
    const reader = new FileReader();
    reader.onload = event => {
        el('origSBV').value = event.target.result;
        el('origSBV').title = "Original SBV file: " + el("origFileSelect").value.split(/(\\|\/)/g).pop();
    }
    reader.onerror = error => reject(error);
    if (el("origFileSelect").files.length>0) {
        reader.readAsText(el("origFileSelect").files[0]);
    }
}

function loadScriptClick() {
    el("scriptFileSelect").click();
}

function loadScriptFile() {
    const reader = new FileReader();
    reader.onload = event => {
        el('script').value = event.target.result;
        el('scriptTitle').innerHTML = "Script area: " + el("scriptFileSelect").value.split(/(\\|\/)/g).pop();
    }
    reader.onerror = error => reject(error);
    if (el("scriptFileSelect").files.length>0) {
        reader.readAsText(el("scriptFileSelect").files[0]);
    }

}