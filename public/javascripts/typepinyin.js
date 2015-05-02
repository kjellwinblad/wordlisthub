//Add function to get current cursor position
//From: http://stackoverflow.com/questions/1891444/cursor-position-in-a-textarea-character-index-not-x-y-coordinates
(function ($, undefined) {
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }
})(jQuery);

function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}

function makePinyinTypeable(textComponent){
    var toneTable = {
        'a':['ā','á','ǎ','à'],
        'e':['ē','é','ě','è'],
        'i':['ī','í','ǐ','ì'],
        'o':['ō','ó','ǒ','ò'],
        'u':['ū','ú','ǔ','ù'],
        'ü':['ǖ','ǘ','ǚ','ǜ'],
        'A':['Ā','Á','Ǎ','À'],
        'E':['Ē','É','Ě','È'],
        'I':['Ī','Í','Ǐ','Ì'],
        'O':['Ō','Ó','Ǒ','Ò'],
        'U':['Ū','Ú','Ǔ','Ù'],
        'Ü':['Ǖ','Ǘ','Ǚ','Ǜ']
    }
    textComponent.keypress(function(event){
        var pos = textComponent.getCursorPosition();
        if(pos == 0){
            return;
        }else{
            var text = textComponent.val();
            var changeChar = text.charAt(pos-1);
            var alternatives = toneTable[changeChar];
            var tone = event.which - 49;
            if(alternatives === undefined){
                return;
            }else if (0 <= tone && tone <= 3){
                textComponent.val(text.slice(0, pos-1) + alternatives[tone] + text.slice(pos-1 + 1));
                setCaretToPos (textComponent[0], pos);
                event.preventDefault();
            }else if((changeChar == 'u' || changeChar == 'U') &&
                     (event.which == 246 || event.which == 58)){
                textComponent.val(text.slice(0, pos-1) + (changeChar == 'u' ? 'ü' : Ü) + text.slice(pos-1 + 1));
                setCaretToPos (textComponent[0], pos);
                event.preventDefault();
            }
        }
    });    
}

