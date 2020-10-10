const socket = io();


$('#question').click(function(){
    socket.emit('question','type');
});
$('form').submit(function(e){
    try{
        e.preventDefault();
        //socket.emit('message', $('#m').val());
         $('#m').val('');
        return false;
    }catch(err){
        console.error(err);
    }
});
socket.on('rasp',function(msg){
    console.log(msg);
});