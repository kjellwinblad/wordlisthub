$().ready(function(){
    var numberOfAltButtons = 3;
    var wordField = $("#wordFieldDiv");
    var altButtonsDiv = $("#altButtonDivs");
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
    if(wordsToLearn.length < numberOfAltButtons){
        numberOfAltButtons = wordsToLearn.length;
    }
    altButtons = [];
    _.each(_.range(numberOfAltButtons), function(index){
        var altButton = $('<button type="button" class="btn btn-default"></button>');
        altButton.appendTo(altButtonsDiv);
        altButtons[index] = altButton;
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
        var alternatives = _.filter(wordList.words, function(word){return JSON.stringify(word.word)!==JSON.stringify(wordToLearn.word)});
        var options = [wordToLearn];
        _.each(_.range(numberOfAltButtons-1), function(index){
            var wordIndex = _.random(alternatives.length - 1);
            options.push(alternatives[wordIndex]);
            alternatives = _.without(alternatives, alternatives[wordIndex]);
        });
        options = _.shuffle(options);
        wordField.html('<b>'+wordToLearn.word+'</b>');
        _.each(_.range(numberOfAltButtons), function(index){
            var altButton = altButtons[index];
            altButton.removeClass("active");
            var option = options[index];
            altButton.text(option.explanation);
            altButton.unbind('click.guessEvent');
            if(wordToLearn === option){
                altButton.bind('click.guessEvent', function(event){
                    altButtons[index] = $('<button type="button" class="btn btn-default"></button>').text(altButton.text());
                    altButton.replaceWith(altButtons[index]);
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
                });
            }else{
                altButton.bind('click.guessEvent', function(event){
                    altButtons[index] = $('<button type="button" class="btn btn-default"></button>').text(altButton.text());
                    altButton.replaceWith(altButtons[index]);
                    wordToLearn.failures = wordToLearn.failures + 1;
                    failures = failures + 1;
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
