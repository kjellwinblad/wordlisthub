$().ready(function(){
    var numberOfAltButtons = 3;
    var definitionField = $("#definitionFieldDiv");
    var altButtonsDiv = $("#altButtonDivs");
    var wordList = $.parseJSON($('#wordListInputField').val());
    var wordsToLearn = $.map(wordList.words, function(word){
        var clone = $.extend(true, {}, word);
        clone.failures = 0;
        clone.successes = 0;
        return clone;
    } );
    if(wordsToLearn.length < numberOfAltButtons){
        numberOfAltButtons = wordsToLearn.length;
    }
    altButtons = [];
    _.each(_.range(numberOfAltButtons), function(index){
        var altButton = $('<button name="altButton"'+index+'/>');
        altButton.appendTo(altButtonsDiv);
        altButtons[index] = altButton;
    });
    function play(){
        if(wordsToLearn.length === 0){
            infoDialog("Game Completed", "<h1>Congratulation!</h1><p>You have now completed this game! Now you can play something else or play the same game again.</p>");
            return;
        }
        var wordIndex = _.random(wordsToLearn.length - 1);
        var wordToLearn = wordsToLearn[wordIndex];
        var alternatives = _.filter(wordList.words, function(word){return word.word!==wordToLearn.word});
        var options = [wordToLearn];
        _.each(_.range(numberOfAltButtons-1), function(index){
            var wordIndex = _.random(alternatives.length - 1);
            options.push(alternatives[wordIndex]);
            alternatives = _.without(alternatives, alternatives[wordIndex]);
        });
        options = _.shuffle(options);
        definitionField.html('<b>'+wordToLearn.explanation+'</b>');
        _.each(_.range(numberOfAltButtons), function(index){
            var altButton = altButtons[index];
            var option = options[index];
            altButton.text(option.word);
            altButton.unbind('click.guessEvent');
            if(wordToLearn === option){
                altButton.bind('click.guessEvent', function(){

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
                });
            }else{
                altButton.bind('click.guessEvent', function(){
                    wordToLearn.failures = wordToLearn.failures + 1;
                    var overlay = jQuery('<div id="failOverlay"></div>');//<br/>
                    overlay.appendTo(document.body);
                    overlay.fadeOut(4000, function(){ 
                        $(this).remove(); 
                    });
                });
            }
        });
    }
    play();
});
