
$().ready(function(){
    var wordListId = $('#wordListsTable').attr('wordListId');
    $('button[name="deleteWordList"]').click(function(){
        var id = $(this).attr("_id");
        var wordListName = $(this).attr("wordListName");
        confirmDialog("Are you sure that you want to delete the word list " + wordListName + "?", function(){
            $.post("/wordlists/remove/" + id,{},function(){
                location.reload(true);
            });
        });
    });
    console.log("INSTALL", $('#editButton'));
    $('button[name="editButton"]').click(function(){
        document.location.href = "/wordlists/" + $(this).attr('wordListId');
    });
    $('select[name="wordlistGameSelector"]').click(function(){
        var selection = $(this).find(":selected").val();
        var wordListId = $(this).attr("wordListId");
        if(selection === "guessword"){
            document.location.href = "/wordlists/" + wordListId + "/" + selection;
        }else if(selection === "spellword"){
            document.location.href = "/wordlists/" + wordListId + "/" + selection;
        }
    });


// .selectmenu({
//         select: function( event, data ) {
//             console.log("Hej1");
//             console.log("Hej", $(this));
//             if(data.item.value === "guessword"){
//                 document.location.href = "/wordlists/" + $(this).val("wordListId") + "/" + data.item.value;
//             }
//         }
//     });

});
