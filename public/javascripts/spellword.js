$().ready(function(){
    var permitNonPinyinField = $("#permitNonPinyin");
    function isNonPinyinPermited(){
        return permitNonPinyinField.prop('checked');
    }
    var definitionField = $("#definitionFieldDiv");
    var wordInput = $("#wordInput");
    makePinyinTypeable(wordInput);
    var tryButton = $("#tryButton");
    var wordList = $.parseJSON($('#wordListInputField').val());
    var statisticsList = [];
    var wordsToLearn = $.map(wordList.words, function(word){
        var clone = $.extend(true, {}, word);
        clone.failures = 0;
        clone.successes = 0;
        statisticsList.push(clone);
        return clone;
    } );
    var failures = 0;
    var successes = 0;
    wordInput.keyup(function(e){
        if(e.keyCode == 13){
            $(this).trigger("enterKey");
        }
    });
    function showStatisticsDialog(){
        statisticsList.sort(function(a,b){
            return b.failures - a.failures;
        });
        text = '<table>' +
            '<tr><th>Word</th><th>Description</th><th>Failures</th><th>Successes</th></tr>';
        _.each(statisticsList, function(word){
            text = text +
                '<tr><td>' + word.word +
                '</td><td>' +word.explanation +
                '</td><td>' + word.failures+
                '</td></td><td>' + word.successes+ '</tr>';
        });
        
        text = text + '</table>'
        infoDialog("Statistics", text);
    }
    function play(){
        if(wordsToLearn.length === 0){
            openOptionDialog("Game Completed",
                             "<h2>Score: "+ (100*(successes / (successes + failures))).toFixed(2) +"%</h2>" + 
                             "<p>" +
                             "<b>Number of correct answers:" + successes +"</b><br>" +
                             "<b>Number of incorrect answers:" + failures +"</b><br>" +
                             "<p>" +
                             "<p><b>Congratulation!</b>You have now completed this game! Now you can view detailed statistics, play something else or play the same game again.</p>",
                             ["Statistics", "Play again", "Word lists"],
                             function(option){
                                 if(option == 0){
                                     showStatisticsDialog();
                                 }else if(option == 1){
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
            var wordsToTest = _.map(wordToLearn.word, function(w){return w;});
            if(isNonPinyinPermited()){
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
                _.each(wordsToTest, function(word){
                    var plainWord = word;
                    _.each(toneTable, function(tones, letter){
                        _.each(tones, function(withTone){
                            plainWord = plainWord.replace(new RegExp(withTone, 'g'), letter);
                        });
                    });
                    wordsToTest.push(plainWord);
                });
            }
            if(_.indexOf(wordsToTest, wordInput.val()) !== -1 ){    
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
