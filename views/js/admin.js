const socket = io('/' + $('namespace').val());
var idQuestion;

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
    idQuestion = msg['id'];
    $('#question_c').text(msg['question']);
    $('form').empty();
    for(let i = 0; i < 4; i++){
        let button = `<input type="button" id = "button" name= "buton${i}" value="${msg['answers'][i]['answer']}">`
        $('form').append(button);
    }
    console.log(msg);
});