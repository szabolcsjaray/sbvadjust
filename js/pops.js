// 1.01
function help() {
    el('helpContainer').style.display = 'block';
}

function closeHelp() {
    el('helpContainer').style.display = 'none';
}

function closePop() {
    el('popContainer').style.display = 'none';
}

function popThis(textAreaId) {
    el('popContainer').style.display = 'block';
    el('popTextArea').value = el(textAreaId).value;
}

