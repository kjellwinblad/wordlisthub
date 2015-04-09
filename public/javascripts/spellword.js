$().ready(function(){
    var definitionField = $("#definitionFieldDiv");
    var wordInput = $("#wordInput");
    makePinyinTypeable(wordInput);
    var tryButton = $("#tryButton");
    var wordList = $.parseJSON($('#wordListInputField').val());
    var wordsToLearn = $.map(wordList.words, function(word){
        var clone = $.extend(true, {}, word);
        clone.failures = 0;
        clone.successes = 0;
        return clone;
    } );
    var failures = 0;
    var successes = 0;
    wordInput.keyup(function(e){
        if(e.keyCode == 13){
            $(this).trigger("enterKey");
        }
    });
    function play(){
        if(wordsToLearn.length === 0){
            openOptionDialog("Game Completed",
                             "<h2>Score: "+ (100*(successes / (successes + failures))).toFixed(2) +"%</h2>" + 
                             "<p>" +
                             "<b>Number of correct answers:" + successes +"</b><br>" +
                             "<b>Number of incorrect answers:" + failures +"</b><br>" +
                             "<p>" +
                             "<p><b>Congratulation!</b>You have now completed this game! Now you can play something else or play the same game again.</p>",
                             ["Play again", "Go to word lists"],
                             function(option){
                                 if(option == 0){
                                     location.reload(); 
                                 }else{
                                     window.location.href = '/public_wordlists';
                                 }
                             });
            return;
        }
        var wordIndex = _.random(wordsToLearn.length - 1);
        var wordToLearn = wordsToLearn[wordIndex];
        definitionField.html('<b>'+wordToLearn.explanation+'</b>');
        function correctAnswerAction(){
            if(_.indexOf(wordToLearn.word, wordInput.val()) !== -1 ){    
                var overlay = jQuery('<div id="successOverlay"></div>');//<br/>
                overlay.appendTo(document.body);
                overlay.fadeOut(1500, function(){ 
                    $(this).remove(); 
                });
                wordToLearn.successes = wordToLearn.successes + 1;
                successes = successes + 1;
                if((wordToLearn.successes - wordToLearn.failures) === 1){
                    wordsToLearn = _.without(wordsToLearn, wordToLearn);
                }
                play();
            }else{
                wordToLearn.failures = wordToLearn.failures + 1;
                failures = failures + 1;
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
