function saveResultSBV() {
    let textToWrite = el("resultSVB").value;
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
    reader.onload = event => el('origSBV').value = event.target.result;
    reader.onerror = error => reject(error);
    if (el("origFileSelect").files.length>0) {
        reader.readAsText(el("origFileSelect").files[0]);
    }
}