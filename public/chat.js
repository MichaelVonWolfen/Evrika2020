    var socket = io();
    $('form').submit(function(e){
        try{
            e.preventDefault();
            socket.emit('message', $('#m').val());
             $('#m').val('');
            return false;
        }catch(err){
            console.error(err);            
        }
    });