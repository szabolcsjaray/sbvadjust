// 1.01

/*const TRANSLATION = 0;
const ADJUST_TEXT = 1;
const NEW_SUBS = 2;
const PIMP_UP_AUTO = 3;*/

const ELEMENT_ID = 0;
const DECSRIPTION = 1;

const FLOWS = [
                [ // TRANSLATION
                    [ 'loadOrigSBVFileButton' , 'Select original (English) SBV file.'],
                    [ 'loadButton' , ''],
                    [ 'loadScript' , 'Select raw (Google) translation file to the script area.'],
                    [ 'toWorkingBlocks' , 'Now work on the translation, make final adjustments, corrections.' +
                        ' After finished, the go to next step. You can check result in the result SBV textarea, and it\'s Show.'],
                    [ 'saveResSBVFileButton' , 'Add a name to the result SBV subtitle file, and save it.']
                ],
                [ // ADJUST_TEXT
                    [ 'loadOrigSBVFileButton' , 'Select autogenerated SBV file.'],
                    [ 'loadButton' , ''],
                    [ 'loadScript' , 'Select script file for the video.'],
                    [ 'processButton', 'Adjust the script to the autogenerated text boxes.\n' +
                        'If stops, check and correct the script if something is missing, or is cut from the video.\n' +
                        'Or correct the autoogenerated text box, if some words are recognized wrong, or there is whitespace problem.\n' +
                        'Then press again the Adjust script button. Check the red blocks, if those are correct or not! If all good, you can proceed to next step.'],
                    [ 'saveResSBVFileButton', 'Add a name to the result SBV subtitle file, and save it.']
                ],
                [ // NEW_SUBS
                    [ 'loadScript' , 'Select script file for the video. After loading script, copy paste web address of the video into YT video ID!'],
                    [ 'loadVideoButton' , ''],
                    [ 'cutButton', 'After cutting the script into text boxes, click in the small input box at the bottom, and start the timing.\n' +
                        'Use the keys: a, n, m, l, r and q. Description of these is right next to the video.\n'+
                        'If you find difference between the script text and the spoken text in the video, press l to stop timing,\n'+
                        'correct the text in the script area, click on Cut script again, click in the text box, you want to continue from,\n'+
                        'and press r to restart timing of the text boxes. After video finished, press q to save results. Then procedd to next step.'],
                    [ 'saveResSBVFileButton', 'Add a name to the result SBV subtitle file, and save it.']
                ],
                [ // PIMP_UP_AUTO
                    [ 'loadOrigSBVFileButton' , 'Select autogenerated SBV file.'],
                    [ 'loadButton' , ''],
                    [ 'restoreScript', 'After script text is restored from autogenerated subtitles, start working on it like this.\n' +
                        'Select Sentences from the Select pimp up mode, then go through the script, and add dots and commas, and capital initial letters to words.\n'+
                        'Single click on last word of the sentece: add dot, long click on the last word of the sentence part: add comma,\n'+
                        'double click on word: make first letter capital. You can switch to Edit text any time, and manually edit the script, if needed.\n'+
                        'Switching between Edit text and Sentence mode can be done by pressing F1 while in the script area.'],
                    [ 'saveResSBVFileButton', 'Add a name to the result SBV subtitle file, and save it.']
                ]
            ];

var wizardState = -1;
var savedControlClass;

function showWizardComment(state) {
    if (FLOWS[actualOp][state][DECSRIPTION].length!=0) {
        alert(FLOWS[actualOp][state][DECSRIPTION]);
    }
}

function startWizard() {
    wizardState = 0;
    let controlEl = el(FLOWS[actualOp][0][ELEMENT_ID]);
    savedControlClass = controlEl.className;
    controlEl.className = controlEl.className + ' highlight';
}

function stepWizardFwd() {
    if (wizardState==-1)
        return;

    showWizardComment(wizardState);
    let controlEl = el(FLOWS[actualOp][wizardState][ELEMENT_ID]);
    controlEl.className = savedControlClass;
    if (wizardState<FLOWS[actualOp].length-1) {
        if (FLOWS[actualOp][wizardState][DECSRIPTION].length>100) {
            el('wizardHelpButton').style.display = 'block';
        } else {
            el('wizardHelpButton').style.display = 'none';
        }
        wizardState++;
        controlEl = el(FLOWS[actualOp][wizardState][ELEMENT_ID]);
        savedControlClass = controlEl.className;
        controlEl.className = controlEl.className + ' highlight';
    } else {
        wizardState = -1;
        savedControlClass = '';
        el('wizardHelpButton').style.display = 'none';
    }
}

function checkWizard(id) {
    if (wizardState==-1)
        return;
    let elId = FLOWS[actualOp][wizardState][ELEMENT_ID];
    if (elId==id) {
        stepWizardFwd();
     }
}

function wizardHelp() {
    if (wizardState==-1) {
        alert('You can start Wizard with the Wizard button.\n'+
            'It guides you through the actual operation (mode) from the start to the end.');
        return;
    }
    if (wizardState==0) {
        alert('Start operation with the highlighted (yellow) button!');
        return;
    }
    if (FLOWS[actualOp][wizardState-1][DECSRIPTION].length<100) {
        alert('Just click on highlighted (yellow) button to continue!');
        return;
    }
   showWizardComment(wizardState-1);
}