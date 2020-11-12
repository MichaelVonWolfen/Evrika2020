jQuery(function() {
	let response_sent  = 1;

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

		let king = $('#pid').attr('value')

		console.log(king)
		console.log(msg.kings[0] == king)

		if(king == msg.kings[0] || king == msg.kings[1]) {

			response_sent = 0;

			$('#question').text(msg.question)
			for(let i = 0; i<4; i++){
				$(`#button${i}`).attr('name',msg.answers[i].name);
				$(`#button${i}`).text(msg.answers[i].text);
			}

			enable_buttons();

			refresh_buttons();

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

			curr_time = -1;
		}
	})

	socket.on('allAnswers', msg => {
		console.log(msg)

		for(let i = 0; i<4; i++){
			if($(`#button${i}`).attr('name') == msg.answer_correctID) {
				$(`#button${i}`).addClass('correctAnswer')
			}
		}

		if(msg.IDanswerTeam1 == msg.IDanswerTeam2) {
			console.log('here')
			console.log(msg.IDanswerTeam1)
			for(let i = 0; i<4; i++){
				if($(`#button${i}`).attr('name') == msg.IDanswerTeam1) {
					$(`#button${i}`).removeClass('selected')
					$(`#button${i}`).addClass('bothSelected')
				}
			}
		} else {
			if($('.selected').attr('value') == msg.IDanswerTeam1) {
				select_other_answer(msg.IDanswerTeam2)
			} else {
				select_other_answer(msg.IDanswerTeam1)
			}
		}
	})

	$('#button0,#button1,#button2,#button3').on("click", function(){
		select_button(this);
	});

	$('#submit').on("click", function(){
		pressed = $('.selected');
		answer = $(pressed).text();
		name = $(pressed).attr("name");
		send(answer, name);
	});
	
	function refresh_buttons() {
		$('.selected').removeClass('selected');
		$('.bothSelected').removeClass('bothSelected');
		$('.correctAnswer').removeClass('correctAnswer');

	}

	function select_other_answer(answerID) {

		if($(`#button${i}`).attr('name') == answerID) {
			$(`#button${i}`).removeClass('selected')
			$(`#button${i}`).addClass('team2Selected')
		}

	}

	function select_button(button) {
		$('.selected').removeClass('selected');
		$(button).addClass('selected');
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
