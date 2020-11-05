jQuery(function() {
	let response_sent  = 0;
	let timp_pornire = new Date().getTime();

	//1 cand userul a trimis raspuns ( daca nu apasa send in momentul terminarii timpului se va trimite automat ce e selectat)

	enable_buttons();

	var procent=100;
	$('.progress-done').on("click", function() {
		//console.warn(procent);
		this.setAttribute('data-done', procent);

		this.style.width = this.getAttribute('data-done') + '%';
		this.style.opacity = 1;
    });

	let show_time = 14;
	let y= setInterval(function() {
		$('#seconds').text(`${show_time}`)
		show_time--;
		if(show_time == -1) {
			clearInterval(y);
		} else if(response_sent == 1) {
			clearInterval(y);
		}
 	}, 1000);
	var x = setInterval(function() {

		var aux = new Date().getTime() - timp_pornire;

        procent=(15000-aux)/150;
		$('.progress-done').trigger('click');

		if(response_sent == 1) {
			procent = 0;
			$('.progress-done').trigger('click');
			clearInterval(x);
		}

		if ( aux > 15000) {

			if ( response_sent == 0 ) {
				pressed = $('.selected');
				answer = $(pressed).attr("value");
				name = $(pressed).attr("name");
				send(answer, name);
			}
			clearInterval(x);
		}
	}, 50);

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
		answer = $(pressed).text();
		name = $(pressed).attr("name");
		send(answer, name);
	});

	function refresh_selected(button) {
		pressed = $('.selected');
		$(pressed).removeClass('selected');
		$(button).addClass('selected');
	}

	function send(answer, name) {
		
		disable_buttons()

		socket.emit('raspuns',{
			personID: $('#pid').attr('value'),
			answerID: name,
			timerValue: $('#seconds').text()
		})
		response_sent = 1;
		//for checking
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