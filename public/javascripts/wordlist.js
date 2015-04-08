$().ready(function(){
    $('button[name="deleteWord"]').click(function(){
        var position = $(this).attr("position");

        var wordListId = $('#wordListTable').attr('wordListId')
        confirmDialog("Are you sure that you want to delete the word?", function(){
            $.post("/wordlists/" + wordListId + "/removeword/" + position,{},function(){
                location.reload(true);
            });
        });
    });


    $('button[name="editWord"]').click(function(){
        var position = $(this).attr("position");
        var word = jQuery.parseJSON($(this).attr("word"));
        var explanation = $(this).attr("explanation");
        var wordListId = $('#wordListTable').attr('wordListId');
        var wordListRow = $('tr[name="wordRow"][position="'+position+'"]');
        var editWordDiv = $('#editWordDiv');
        var newCell = $('<td colspan="4" style="border: 1px solid black;"></td>')
        wordListRow.html(newCell);
        editWordDiv.detach();
        //$("button").attr("disabled", "disabled");
        $(editWordDiv.html()).appendTo(newCell);
        var editExplanationField  = $('#editExplanationField');
        makePinyinTypeable(editExplanationField);
        editExplanationField.val(explanation);
        $('#formEditWord').attr("action", "/wordlists/"+wordListId+"/editword/" + position)

        var numberOfAlternatieFormsSoFar = 0;
        _.each(word.word, function(word){
            numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar + 1;            
            var newElement = undefined;
            if(numberOfAlternatieFormsSoFar === 1){
                newElement = $('<input id="editWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'" value="'+word+'">');
            }else{
                newElement = $('<br/><span id="editWordDiv'+numberOfAlternatieFormsSoFar+'"><input id="editWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'" value="'+word+'"><button id="editWordRemoveWordButton'+numberOfAlternatieFormsSoFar+'" number="'+numberOfAlternatieFormsSoFar+'" type="button">Remove</button></span>');
            }
            newElement.insertBefore($('#editWordAddAlternativePlaceholder'));
            $('#editWordRemoveWordButton'+numberOfAlternatieFormsSoFar).click(function(){
                var toRemove = parseInt($(this).attr("number"));
                var index = toRemove;
                for(; index < numberOfAlternatieFormsSoFar ; index++){
                    $('#editWordField'+index).val($('#editWordField'+(index+1)).val());
                }
                $('#editWordDiv'+numberOfAlternatieFormsSoFar).remove();
                numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar - 1;
            });
            makePinyinTypeable($('#editWordField'+numberOfAlternatieFormsSoFar));
        });
        $('#addAlternativeFormButton').click(function(){
            numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar + 1;
            $('<br/><span id="editWordDiv'+numberOfAlternatieFormsSoFar+'"><input id="editWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'"><button id="editWordRemoveWordButton'+numberOfAlternatieFormsSoFar+'" number="'+numberOfAlternatieFormsSoFar+'" type="button">Remove</button></span>')
                .insertBefore($('#editWordAddAlternativePlaceholder'));
            $('#editWordRemoveWordButton'+numberOfAlternatieFormsSoFar).click(function(){
                var toRemove = parseInt($(this).attr("number"));
                var index = toRemove;
                for(; index < numberOfAlternatieFormsSoFar ; index++){
                    $('#editWordField'+index).val($('#editWordField'+(index+1)).val());
                }
                $('#editWordDiv'+numberOfAlternatieFormsSoFar).remove();
                numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar - 1;
            });
            makePinyinTypeable($('#editWordField'+numberOfAlternatieFormsSoFar));
        });
        $('#editCancelButton').click(function(){
            //$("button").attr("disabled", "false");
            location.reload();
        });
    });

    var newWordFiled = $('#newWordField1');
    makePinyinTypeable(newWordFiled);
    makePinyinTypeable($('#newWordExplanantionField'));
    newWordFiled.focus();
    var numberOfAlternatieFormsSoFar = 1;
    $('#newWordAddAlternativeFormButton').click(function(){
        numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar + 1;
        $('<span id="newWordDiv'+numberOfAlternatieFormsSoFar+'"><br><input id="newWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'"><button id="newWordRemoveWordButton'+numberOfAlternatieFormsSoFar+'" number="'+numberOfAlternatieFormsSoFar+'" type="button">Remove</button></span>')
            .insertBefore($('#newWordAddAlternativePlaceholder'));
        makePinyinTypeable($('#newWordField'+numberOfAlternatieFormsSoFar));
        $('#newWordRemoveWordButton'+numberOfAlternatieFormsSoFar).click(function(){
            var toRemove = parseInt($(this).attr("number"));
            var index = toRemove;
            for(; index < numberOfAlternatieFormsSoFar ; index++){
                $('#newWordField'+index).val($('#newWordField'+(index+1)).val());
            }
            $('#newWordDiv'+numberOfAlternatieFormsSoFar).remove();
            numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar - 1;
        });
    });
});
