const socket = io('/' + $('#namespace').val());
var idQuestion;
var king_team1;
var king_team2;
var categories = [ "nature", "quotes", "social", "movies", "facts", 
                    "history", "geo", "romanian", "music", "sport" ];

$('document').ready(function(){
    socket.emit('get_types_responded', '');
})
$('#sendToPlayers').click(function(){
    let query = {
        id: idQuestion,
        id_1: king_team1, 
        id_2: king_team2
    };
    socket.emit('toPlayers', query);
});
$('#correctAnswer').click(function(){
    socket.emit('correctAnswer', '');
});
$('#startSession').click(function(){
    socket.emit("start", 'New Round!');
});
$('button').click(function(){
    let type = categories.indexOf($(this).attr('id'));
    if(type !== -1){
        socket.emit('question',type + 1);
        $(this).prop('disabled', true);
    }
});
$('#member_11').click(function(){
    king_team1 = $(this).attr('name');
    $(this).addClass('king');
    $('#member_12').removeClass('king');
});
$('#member_12').click(function(){
    king_team1 = $(this).attr('name');
    $(this).addClass('king');
    $('#member_11').removeClass('king');
});
$('#member_21').click(function(){
    king_team2 = $(this).attr('name');
    $(this).addClass('king');
    $('#member_22').removeClass('king');
});
$('#member_22').click(function(){
    king_team2 = $(this).attr('name');
    $(this).addClass('king');
    $('#member_21').removeClass('king');
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