const socket = io('/' + $('#namespace').text(), 
    {
        query: {
                admin: true
        }
    });
var idQuestion;
var king_team1;
var king_team2;
var categories = [ "nature", "quotes", "social", "movies", "facts", 
                    "history", "geo", "romanian", "music", "sport" ];

$('document').ready(function(){
    socket.emit('get_types_responded', '');
})
function query(data){
    return {
        id: data,
        id_1: king_team1, 
        id_2: king_team2
    }
}
$('button').click(function(){
    let type = categories.indexOf($(this).attr('id'));
    if(type !== -1){
        socket.emit('question',query(type + 1));
        // $(this).prop('disabled', true);
    }
});
$('#teams_choosen').click(function(){
    let team1ID = $('#team1 option:selected').attr('value')
    let team2ID = $('#team2 option:selected').attr('value')
    let namespace = $('#namespace').text();
    $('#teams_nust_be_choosen').text('');
    categories.forEach(categorie => {
        $(`#${categorie}`).attr('disabled', false);
    });
    socket.emit("start_round",{
                                team1: team1ID,
                                team2: team2ID,
                                namespace: namespace
                            });

});
$('#sendToPlayers').click(function(){
    socket.emit('toPlayers', query(idQuestion));
    $('#sendToPlayers').prop('disabled', true);
    $('#correctAnswer').prop('disabled', false);
});
$('#correctAnswer').click(function(){
    socket.emit('correctAnswer', '');
});
$('#startSession').click(function(){
    socket.emit("newSession", $('#namespace').text());
    location.reload()
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
    $('#question').text(msg['question']);
    $('#sendToPlayers').prop('disabled', false);
    $('#correctAnswer').prop('disabled', true);
    
});
socket.on('counter', function(count){
    $('#timer').text(count);
});