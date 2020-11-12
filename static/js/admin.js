jQuery(function() {
    const socket = io('/' +$('#namespace').text(), 
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
        
        socket.emit('get_namespace_load_status', $('#namespace').text());
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
            if(king_team1 && king_team2){
                socket.emit('question',{
                    id: type + 1,
                    id_1: king_team1,
                    id_2: king_team2
                })
                $(this).prop('disabled', true);
            }else alert('Trebuie alese persoanele care pot sa raspunda la intrebari.')
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
    socket.on('allAnswers', (msg)=>{
        // console.log(msg)
        let IDanswerTeam1 = msg.IDanswerTeam1
        let IDanswerTeam2 = msg.IDanswerTeam2
        let Team1Name = msg.Team1Name
        let Team1ValueAnswer = msg.Team1ValueAnswer
        let Team2Name = msg.Team2Name
        let Team2ValueAnswer = msg.Team2ValueAnswer
        let answer_correctID = msg.answer_correctID
        let answer_correctValue = msg.answer_correctValue
        $('#P-correctAnswer').empty();
        $('#P-correctAnswer').append(`<p>Echipa ${Team1Name} a raspuns: ${Team1ValueAnswer}</p>`)
        $('#P-correctAnswer').append(`<p>Echipa ${Team2Name} a raspuns: ${Team2ValueAnswer}</p>`)
        $('#P-correctAnswer').append(`<p>Raspunsul corect este: ${answer_correctValue}</p>`)
    })
    $('#sendToPlayers').click(function(){
        socket.emit('toPlayers', query(idQuestion));
        $('#sendToPlayers').prop('disabled', true);
        $('#correctAnswer').prop('disabled', false);
    });
    $('#correctAnswer').click(function(){
        socket.emit('correctAnswer', {
                                        namespace: $('#namespace').text(),
                                        question_id:idQuestion
                                    });
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
    $('#UpdateScor').click(()=>{
        let scort1 = $('#scoreTeam1').val()
        let scort2 = $('#scoreTeam2').val()
        if (!scort1 || !scort2){
            alert("Este ceva in neregula cu scorurile");
        }
        else{
            if(king_team1 && king_team2){
                socket.emit('UpdateScores',{
                    namespace: $('#namespace').text(),
                    userTeam1: king_team1,
                    scorTeam1: scort1,
                    userTeam2: king_team2,
                    scorTeam2: scort2
                })
            }else{
                alert("Nu au fost alese persoanele care sa raspunda la intrebari!")
            }
        }
    })
        
    
    
    socket.on('rasp',function(msg){
        idQuestion = msg['id'];
        let answer_array = msg['answers']
        let answer_text = ""
        answer_array.forEach(answer => {
            answer_text += `|   ${answer}   |`
        });
        $('#question').empty();
        $('#question').append(`<h2>${msg['question']}</h2><h3>${answer_text}</h3>`);
        $('#sendToPlayers').prop('disabled', false);
        $('#correctAnswer').prop('disabled', true);
        
    });
    socket.on('counter', function(count){
        $('#timer').text(count);
    });
    socket.on('TeamsMembers',(msg)=>{
        console.log(msg)
        for(let i = 0; i < 4; i++){
            let member = msg[i];
            let team = 0;
            let mbID = 0;
            let points = 0;
            if(i < 2){
                team = 1;
            }else{
                team = 2;
            }
            if(i % 2 === 0){
                mbID = 1;
            }else{
                mbID = 2;
            }
            $(`#teamid_${team}`).text(member['teamName']);
            $(`#member_${team}${mbID}`).text(member['userName']);
            $(`#member_${team}${mbID}`).attr('name', member['uID']);
            $(`#scoreTeam${team}`).attr('value', member['TotalPoints']);
            $('#team1').prop('disabled', true);
            $('#team2').prop('disabled', true);
            $('#teams_choosen').prop('disabled', true);
            $('#teams_nust_be_choosen').text('');
            categories.forEach(categorie => {
                $(`#${categorie}`).attr('disabled', false);
            });
        }
    })
});