function openOptionDialog(title, text, options, callback) {
    dialogElement = $("<div/>").html(text);
    buttons = [];
    $.each(options, function(index){
        buttons.push({
            text: options[index],
            click: function() {
                $(this).dialog('close');
                callback(index);
            }
        });
    });

    var width = $( document ).width() - 30;
    if(width > 950){
        width = 900;
    }
    // Define the Dialog and its properties.
    return dialogElement.dialog({
        resizable: false,
        modal: true,
        title: title,
        //height: 250,
        width:  width,
        buttons: buttons
    });
}


function confirmDialog(text, callback){
    openOptionDialog("", text, ["Yes", "Cancel"], function(selection){
        if(selection === 0){
            callback();
        }
    });
}


function infoDialog(title, text, callback){
    return  openOptionDialog(title, text, ["Ok"], function(selection){
        if(selection === 0){
            if(callback){
                callback();
            }
        }
    });
}


