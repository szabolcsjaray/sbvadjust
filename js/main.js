function init() {
    //alert("yo");
}
function el(id) {
    return document.getElementById(id);
}

var blocks = [];

function loadOriginal() {
    original = el("origSBV").value;
    alert(original.length);
    arrayOfLines = original.match(/[^\r\n]+/g);
    alert("rows num:" + arrayOfLines.length);
    let bi = 0;
    for(let li = 0;li<arrayOfLines.length;li++) {
        let block = {time: arrayOfLines[li]};
        li++; if (li>arrayOfLines.length) { break; }
        let text = arrayOfLines[li];
        li++;
        //console.log(arrayOfLines[li].match(/(\d:\d\d:\d\d)/));
        while(li<arrayOfLines.length && arrayOfLines[li].match(/(\d:\d\d:\d\d)/)==null) {
            text = text + arrayOfLines[li];
            li++;
            //console.log(arrayOfLines[li].match(/(\d:\d\d:\d\d)/));
            if (li>arrayOfLines.length) { break; }

        }
        block.text = text;
        blocks.push(block);
    }

    el("ob1").value = blocks[0].text;
    el("ot1").innerHTML = blocks[0].time;
    el("ob2").value = blocks[3].text;
    el("ot2").innerHTML = blocks[3].time;
}