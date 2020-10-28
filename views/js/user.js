const socket = io('/' + $('#namespace').val());
var idQuestion;
socket.on('counter', function(count){
    $('#timer').text(count);
});
socket.on('answers', (msg) =>{
    $('#question').text(msg.question)
    for(let i = 0; i<4; i++){
        $(`#button${i}`).attr('name',msg.answers[i].name);
        $(`#button${i}`).text(msg.answers[i].text);
    }
    enable_buttons()
    let king = $('#pid').attr('value')
})

$('#button0').click(function(){
    disable_buttons($(this).text(),$(this).attr('name'))
});
$('#button1').click(function(){
    disable_buttons($(this).text(),$(this).attr('name'))
});
$('#button2').click(function(){
    disable_buttons($(this).text(),$(this).attr('name'))
});
$('#button3').click(function(){
    disable_buttons($(this).text(),$(this).attr('name'))
});
function disable_buttons(answer, name){
    let r = confirm(`Vei submite:${answer}\nEsti sigur?`)
    let counter = $('#counter').text()
    if(r){
        $('#button0').prop('disabled', true);
        $('#button1').prop('disabled', true);
        $('#button2').prop('disabled', true);
        $('#button3').prop('disabled', true);
        socket.emit('raspuns',{
            person: $('#pid').attr('value'),
            answer: name
        })
    }
}
function enable_buttons(){
        $('#button0').prop('disabled', false);
        $('#button1').prop('disabled', false);
        $('#button2').prop('disabled', false);
        $('#button3').prop('disabled', false);
}