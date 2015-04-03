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
        $("button").attr("disabled", "disabled");
        $(editWordDiv.html()).appendTo(newCell);
        var editExplanationField  = $('#editExplanationField');
        makePinyinTypeable(editExplanationField);
        editExplanationField.val(explanation);
        $('#formEditWord').attr("action", "/wordlists/"+wordListId+"/editword/" + position)

        var numberOfAlternatieFormsSoFar = 0;
        _.each(word.word, function(word){
            numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar + 1;
            var newElement = $('<br/><input id="newWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'" value="'+word+'">');
            newElement.insertBefore($('#editWordAddAlternativePlaceholder'));
            makePinyinTypeable($('#newWordField'+numberOfAlternatieFormsSoFar));
        });
        $('#addAlternativeFormButton').click(function(){
            numberOfAlternatieFormsSoFar = numberOfAlternatieFormsSoFar + 1;
            $('<br/><input id="newWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'">')
                .insertBefore($('#editWordAddAlternativePlaceholder'));
            makePinyinTypeable($('#newWordField'+numberOfAlternatieFormsSoFar));
        });
        $('#editCancelButton').click(function(){
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
        $('<br/><input id="newWordField'+numberOfAlternatieFormsSoFar+'" type="text" placeholder="my word" name="word'+numberOfAlternatieFormsSoFar+'">')
            .insertBefore($('#newWordAddAlternativePlaceholder'));
        makePinyinTypeable($('#newWordField'+numberOfAlternatieFormsSoFar));
    });
});
