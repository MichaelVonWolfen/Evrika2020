jQuery(function() {
	let response_sent  = 0;

	//1 cand userul a trimis raspuns ( daca nu apasa send in momentul terminarii timpului se va trimite automat ce e selectat)
	disable_buttons() 

	const socket = io('/' + $('#namespace').val());
	var idQuestion;
	let curr_time = -1;
	
	socket.on('counter', function(count){
		if(response_sent == 0) {
			$('#seconds').text(count);
		}
		curr_time = count;
	});

	var procent = 100;

	$('.progress-done').on("click", function() {
		//console.warn(procent);
		this.setAttribute('data-done', procent);
		this.style.width = this.getAttribute('data-done') + '%';
		this.style.opacity = 1;
	});

	socket.on('answers', (msg) =>{

		response_sent = 0;

		$('#question').text(msg.question)
		for(let i = 0; i<4; i++){
			$(`#button${i}`).attr('name',msg.answers[i].name);
			$(`#button${i}`).text(msg.answers[i].text);
		}

		enable_buttons();

		refresh_selected();

		procent=100;

		$('.progress-done').trigger('click');

		let aux = 15500;

		var x = setInterval(function() {

			aux -= 50;

			if(aux - curr_time * 1000 > 500 && curr_time != -1) {
				aux = curr_time * 1000;
			}

			procent = aux / 155;

			$('.progress-done').trigger('click');

			if(response_sent == 1) {
				procent = 0;
				$('.progress-done').trigger('click');
				clearInterval(x);
			}

			if ( curr_time <= 0.01 && curr_time != -1) {

				if ( response_sent == 0 ) {
					pressed = $('.selected');
					answer = $(pressed).attr("value");
					name = $(pressed).attr("name");
					send(answer, name);
				}
				clearInterval(x);
			}
		}, 50);

		let king = $('#pid').attr('value')
		curr_time = -1;
	})

	$('#button0,#button1,#button2,#button3').on("click", function(){
		refresh_selected();
		$(this).addClass('selected');
	});

	$('#submit').on("click", function(){
		pressed = $('.selected');
		answer = $(pressed).text();
		name = $(pressed).attr("name");
		send(answer, name);
	});
	
	function refresh_selected() {
		$('.selected').removeClass('selected');
	}
	
	function send(answer, name) {
		
		disable_buttons()
	
		socket.emit('raspuns',{
			personID: $('#pid').attr('value'),
			answerID: name,
			timerValue: $('#seconds').text()
		})
		//for checking
		response_sent = 1;
		confirm(`Ai submis:${answer}\n`);
	}
	
	function disable_buttons() {
		for(i = 0; i < 4; i++) {
			$(`#button${i}`).addClass('disabled');
		}
		$('#submit').addClass('disabled');
	}
	function enable_buttons(){
		for(i = 0; i < 4; i++) {
			$(`#button${i}`).removeClass('disabled');
		}
		$('#submit').removeClass('disabled');
	}

});
