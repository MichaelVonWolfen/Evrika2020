let timp_pornire = new Date().getTime();

jQuery(function() {
	var procent=100;
	$('.progress-done').on("click", function() {
		//console.warn(procent);
		this.setAttribute('data-done', procent);

		this.style.width = this.getAttribute('data-done') + '%';
		this.style.opacity = 1;
    });

	// function sendResponse(raspuns){
  	// 	var categorie = $(".nume_categorie")[0].textContent;
  	// 	categorie=categorie.substring(0, categorie.length - 1);
  	// 	$.ajax({
	// 	  type: "POST",
	// 	  url: "/raspuns_intrebare",
	// 	  data: {
	// 	  	'raspuns':raspuns,
	// 	  	'categorie':categorie
	// 	  },
	// 	  dataType: "json",
	// 	  success: function(data){
	// 		     	alert(data);
	// 		     	window.location = '/intrebari';
	// 		  	}
		  
	// 	});
	// }
	$( ".varianta_alegere" ).on("click", function() {
		var raspuns = this.id;
		//sendResponse(raspuns);
	});
	let show_time = 14;
	let y= setInterval(function() {
		$('#seconds').text(`${show_time}`)
		show_time--;
		if(show_time == -1) {
			clearInterval(y);
		}
 	}, 1000);
	var x = setInterval(function() {
		//console.log(new Date().getTime());
		var aux = new Date().getTime() - timp_pornire;
		// Output the result in an element with id="demo"

        procent=(15000-aux)/150;
		$('.progress-done').trigger('click');

		// If the count down is over, write some text 
		if ( aux > 15000) {
			//sendResponse('x');
			$('#button0').addClass('disabled');
			$('#button1').addClass('disabled');
			$('#button2').addClass('disabled');
			$('#button3').addClass('disabled');
			clearInterval(x);
		}
	}, 50);
});

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

$('#button0,#button1,#button2,#button3').on("click", function(){
	refresh_selected(this);
});

$('#submit').on("click", function(){
	pressed = $('.selected');
	console.log($(pressed).attr("value"))
	answer = $(pressed).attr("value");
	name = $(pressed).attr("name");
	try_send(answer, name);
});

function refresh_selected(button) {
	$('#button0').removeClass('selected');
	$('#button1').removeClass('selected');
	$('#button2').removeClass('selected');
	$('#button3').removeClass('selected');
	$(button).addClass('selected');
}
function try_send(answer, name){
    let r = confirm(`Vei submite:${answer}\nEsti sigur?`)
    let counter = $('#counter').text()
    if(r){
        $('#button0').addClass('disabled');
        $('#button1').addClass('disabled');
        $('#button2').addClass('disabled');
        $('#button3').addClass('disabled');
        socket.emit('raspuns',{
            personID: $('#pid').attr('value'),
            answerID: name,
            timerValue: $('#timer').text()
        })
        
    }
}
function enable_buttons(){
        $('#button0').prop('disabled', false);
        $('#button1').prop('disabled', false);
        $('#button2').prop('disabled', false);
        $('#button3').prop('disabled', false);
}