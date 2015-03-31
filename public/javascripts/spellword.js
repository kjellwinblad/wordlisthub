$().ready(function(){
    var definitionField = $("#definitionFieldDiv");
    var wordInput = $("#wordInput");
    var tryButton = $("#tryButton");
    var wordList = $.parseJSON($('#wordListInputField').val());
    var wordsToLearn = $.map(wordList.words, function(word){
        var clone = $.extend(true, {}, word);
        clone.failures = 0;
        clone.successes = 0;
        return clone;
    } );
    wordInput.keyup(function(e){
        if(e.keyCode == 13){
            $(this).trigger("enterKey");
        }
    });
    function play(){
        if(wordsToLearn.length === 0){
            infoDialog("Game Completed", "<h1>Congratulation!</h1><p>You have now completed this game! Now you can play something else or play the same game again.</p>");
            return;
        }
        var wordIndex = _.random(wordsToLearn.length - 1);
        var wordToLearn = wordsToLearn[wordIndex];
        definitionField.html('<b>'+wordToLearn.explanation+'</b>');
        function correctAnswerAction(){
            console.log("wordToLearn",wordToLearn, wordInput.val());
            if(_.indexOf(wordToLearn.word, wordInput.val()) !== -1 ){    
                var overlay = jQuery('<div id="successOverlay"></div>');//<br/>
                overlay.appendTo(document.body);
                overlay.fadeOut(1500, function(){ 
                    $(this).remove(); 
                });
                wordToLearn.successes = wordToLearn.successes + 1;
                if((wordToLearn.successes - wordToLearn.failures) === 1){
                    wordsToLearn = _.without(wordsToLearn, wordToLearn);
                }
                play();
            }else{
                wordToLearn.failures = wordToLearn.failures + 1;
                var overlay = jQuery('<div id="failOverlay"></div>');//<br/>
                overlay.appendTo(document.body);
                overlay.fadeOut(4000, function(){ 
                    $(this).remove(); 
                });
                infoDialog("Wrong Answer", "One of the following answer(s) would have been correct: <br/>" + wordToLearn.word.join(","));
            }
            wordInput.val("")
        }
        tryButton.unbind('click.tryEvent');
        wordInput.unbind('enterKey.tryEvent');
        tryButton.bind('click.tryEvent', correctAnswerAction);
        wordInput.bind('enterKey.tryEvent', correctAnswerAction);
    }
    play();
});
