// 1.02
const TRANSLATION = 0;
const ADJUST_TEXT = 1;
const NEW_SUBS = 2;
const PIMP_UP_AUTO = 3;

var actualOp = TRANSLATION;
var setmodes = {'cutButton' : ['none', 'flex'],
                'processButton': ['none', 'flex'],
                'toWorkingBlocks': ['none', 'block'],
                'restoreScript': ['none', 'block'],
                'loadButton': ['none', 'flex'],
                'pimpMode': ['none', 'flex'],

               };
var settings = [  ['toWorkingBlocks', 'restoreScript', 'loadButton'], //TRANSLATION
                 ['processButton', 'loadButton'], //ADJUST_TEXT
                 ['cutButton'], //NEW_SUBS
                 ['restoreScript', 'loadButton', 'pimpMode'] //PIMP_UP_AUTO
            ];

function showAndHideControls() {
    Object.keys(setmodes).forEach((key, index) => {
        let actSetting = settings[actualOp];
        if(actSetting.includes(key)) {
            el(key).style.display = setmodes[key][1];
        } else {
            el(key).style.display = setmodes[key][0];
        }
    });
    backEditing = (actualOp==PIMP_UP_AUTO);
}

function operationChanged() {
    actualOp = el('operation').selectedIndex;
    showAndHideControls();
}