if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const port = 3000;
const total_time_allowed = 15; //Time allowed to respond to a question
const categories_total = 10; //Number of total questions
const path = require('path')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const server =require("http").createServer(app);
const io = require("socket.io")(server);

const mysql = require('mysql2');
const pool = mysql.createPool(
    {
            host: process.env["DB_HOST"],
            user: process.env["DB_USER"],
            password: process.env["DB_PASSWORD"],
            database: process.env["DB_DATABASE"]
            });
const promisePool = pool.promise();

const initializePassport = require('./passport-config');
const { exception } = require('console');
const { promiseImpl } = require('ejs');
initializePassport(
    passport,
    email => GetUserByEmail(email),
    id =>GetUserByID(id)
    )


app.use(express.static(path.join(__dirname, 'static')));

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated, async (req, res) => {
    const user = await req.user
    res.render('index.ejs', {name: user.full_name})
    // console.log(user)
})

app.get('/login',checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
app.post('/login', passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
}))
app.get('/about', (req, res) => {
    res.render('about.ejs')
})
app.get('/home', (req, res) => {
    res.render('home.ejs')
})
app.get('/partners', (req, res) => {
    res.render('partners.ejs')
})
app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', {error:""})
})
app.post('/register', async (req, res) => {
    try{
        //TODO: Check all the inputs to have text
        let i = 0;
        const hashedPass = await bcrypt.hash(req.body.password, 10)
        const team_name = req.body.teamName
        const fname1 = req.body.firstName1
        const lname1 = req.body.lastName1
        const email1 = req.body.email1
        const phone1 = req.body.phone1
        const college1 = req.body.faculty1
        const fname2 = req.body.firstName2
        const lname2 = req.body.lastName2
        const email2 = req.body.email2
        const phone2 = req.body.phone2
        const college2 = req.body.faculty2

        const promisePool = pool.promise();
        let [team] = await promisePool.query(`Select name from teams where name like lower(?)`, [team_name]);
        if(team[0]){
            //DONE: show error message
            console.log('Error 1')
            return res.render('register.ejs',{error:"Team already exists."});
        }
        //TODO: ADD team in the DB and the members
        let [user1] = await promisePool.query(`Select email from users where email like lower(?)`,[email1])
        let [user2] = await promisePool.query(`Select email from users where email like lower(?)`,[email2])
        if(user1[0] || user2[0]){
            console.log('Error 2')
            return res.render('register.ejs',{error:`Email ${email} already used.`});
        }
        await promisePool.query(`INSERT into teams(NAME, ROLE, CREATEDAT, UPDATEDAT) 
                                VALUES(lower(?), 'ROLE_USER', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());`, [team_name]);
        [team] = await promisePool.query(`Select id from teams where name like ?`, [team_name]);

        const id = team[0]['id'];
        await promisePool.query(`insert into users(first_name, last_name, email, password, phone, faculty, team_id, role, createdAt, updatedAt)
                                        values (?, ?, lower(?), ?, ?, ?, ?,
                                        'ROLE_USER', current_timestamp, current_timestamp)`, [fname1, lname1, email1, hashedPass, phone1, college1, id]);
        await promisePool.query(`insert into users(first_name, last_name, email, password, phone, faculty, team_id, role, createdAt, updatedAt)
                                values (?, ?, lower(?), ?, ?, ?, ?,
                                'ROLE_USER', current_timestamp, current_timestamp)`, [fname2, lname2, email2, hashedPass, phone2, college2, id]);
        res.redirect('/login');

    }catch (e){
        console.error(e)
        res.redirect('/register')
    }
})
app.delete('/logout', async (req, res) => {
    req.logOut()
    res.redirect('/')
})


function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
async function namespaceExistsAndAllowed(req, res, next){
    // if namespace exists and team is allowed or multimedia then allow them to acces the page.
    let nsp = req.query.namespace
    
    try{
        let user = await req.user
        if(user.role === 'ROLE_MULTIMEDIA')
            next()
        let [acces] = await promisePool.query(`Select 'true' from users_active_namespaces uan join active_namespaces an on uan.active_namespace_id = an.id
                                                where is_active = 1 and  namespace_identifier like ? and team_id = ?`,[nsp, user.team_id])
        if(acces.length === 0)
            return res.redirect('/404')
    }catch (e){
        console.error(e)
        return res.redirect('/404')
    }
    next()
}
async function GetUserByEmail(email){
    try {
        const [res] = await promisePool.query(`select id, concat(first_name,' ', last_name) as 'full_name', email, 
                                                    password, phone, faculty, team_id, is_active, role, createdAt, 
                                                    updatedAt from users where email like ?;`, [email])
        let user = ExtractUser(res)
        // console.log(user)
        return user
    }catch (e){
        console.error(e)
    }
}
async function GetUserByID(id){
    try {
        const [res] = await promisePool.query(`select id, concat(first_name,' ', last_name) as 'full_name', email, 
                                                    password, phone, faculty, team_id, is_active, role, createdAt, 
                                                    updatedAt  from users where id like ?;`, [id])
        let user = ExtractUser(res)
        // console.log(user)
        return user
    }catch (e){
        console.error(e)
    }
}
function ExtractUser(res){
    const user = {
        "id" : res[0]['id'],
        "full_name":  res[0]['full_name'],
        "email":  res[0]['email'],
        "password":  res[0]['password'],
        "phone":  res[0]['phone'],
        "faculty":  res[0]['faculty'],
        "team_id":  res[0]['team_id'],
        "is_active": res[0]['is_active'],
        "role":  res[0]['role']
    }
    return user;
}
async function get_Question(msg) {
    try{
        console.log(msg)
        // create the pool
        // now get a Promise wrapped instance of that pool
        let category = msg.id
        let t1 = msg.id_1
        let t2 = msg.id_2
        // console.log(msg)
        const promisePool = pool.promise();
        // query database using promises
        const [quest] = await promisePool.query(`select id, question, times_played from  questions 
                                where times_played like (
                                                        Select min(times_played) from questions where  question_type = ?
                                                        ) 
                                AND id not in (
                                                Select question_id from answers_recieved where team_id in ( Select team_id from users where id in (?, ?))
                                                )
                                AND question_type = ?
                                order by RAND()
                                limit 1;`, [category, t1, t2, category]);
        // console.log(quest);
        let id = quest[0]['id']
        let question = quest[0]['question']
        let played_times = quest[0]['times_played']
        
        const [answers] = await promisePool.query(`Select id, answer from answers where question_id = ? order by rand()`, [id]);
        let answer_array = []
        answers.forEach(answer => {
           answer_array.push(answer['answer'])
        });
        let question_JSON = {
            'id' : id,
            'question': question,
            'answers' : answer_array
        };
        await promisePool.query(`UPDATE questions set times_played = ? where id = ?`,[played_times + 1, id]);
        return question_JSON;
                                        
    }catch(e){
        console.error(e)
    }
}
async function get_QuestionAndAnswers(queryBig) {
    // create the pool
    // now get a Promise wrapped instance of that pool
    let id = queryBig.id
    let k1 = queryBig.id_1
    let k2 = queryBig.id_2
    const promisePool = pool.promise();
    // query database using promises
    const [quest] = await promisePool.query(`select question from questions where id = ?`, [id]);

    const [answers] = await promisePool.query(`Select id, answer from answers where question_id = ? order by rand()`, [id]);
    let button_answers = [];
    for(let i = 0; i < 4; i++){
        let button = {
            name: answers[i]['id'],
            text: answers[i]['answer']
        }
        button_answers.push(button);
    }
    let response = {
        question: quest[0]['question'],
        answers: button_answers,
        kings:[
            k1,k2
        ]
    }
    return response;

}
async function saveAnswer(userID, ansID, timerValue){
    // console.log(`Save Answer este apelat`)
    try{
        let time = total_time_allowed - timerValue;
        
        let teamID = (await promisePool.query(`Select team_id from users where id  = ?`, [userID]))[0][0]["team_id"]

        
        let question_id = (await promisePool.query(`Select question_id from answers where id like ?`, [ansID]))[0][0]["question_id"]

        await promisePool.query(`INSERT INTO answers_recieved(team_id, answer_id, question_id, total_time, createdAt, updatedAt)
                                Values(?,?,?,?,  current_timestamp, current_timestamp)`,
                                [teamID, ansID, question_id, time])
    }catch(e){
        console.error(e)
    }

}
async function GetTeamsList(){
    // throw new exception("Not implemented");
    try{
        let query = `Select id, name from teams where role like 'ROLE_USER'`
        
        let teams = (await promisePool.query(query))[0]
        let obtions = []
        teams.forEach(team => {
            obtions.push({
                            id: team["id"], 
                            name:team['name']
                        })
        });
        return obtions;
    }
    catch(e){
        console.error(e)
        return false;
    }
}
async function GetTeamsInNamespaceDetails(nsp){
    let [team] = await promisePool.query(`select t.id teamID, t.name as teamName, u.id as userID, concat(u.first_name, ' ', u.last_name) as name, t.role, uan.total_points
                                                        from users_active_namespaces uan join teams t on uan.team_id = t.id join users u on t.id = u.team_id
                                                        WHERE active_namespace_id = (select id from active_namespaces an where an.is_active = 1 
                                                                                        and namespace_identifier like ?);`, [nsp])
    let teams = []
    // console.log('Echipa')
    // console.log(team)
    team.forEach(member => {
        teams.push({
            teamID : member['teamID'],
            teamName : member['teamName'],
            userName : member['name'],
            uID : member['userID'],
            TotalPoints : member['total_points']
        })
    });
    return teams
}
// Socket IO LOGIC.
var timeDivisor = 100;
function countDown(namespace){
    let counter = total_time_allowed + 1;
    let WinnerCountdown = setInterval(function(){
        counter-= 0.1
        io.of(namespace).emit('counter', Math.ceil(counter * timeDivisor)/timeDivisor);
        if (counter <= 0.01) {
            clearInterval(WinnerCountdown); 
        }
    }, timeDivisor);
}
io.of((nsp, query, next) => {
    
    next(null, true);
  
  }).on('connect', (socket) => {
        socket.on('toPlayers', (msg)=> {
            let namespace = socket.nsp.name
            get_QuestionAndAnswers(msg).then(answers =>{
                // console.log(answers)
                io.of(namespace).emit('answers', answers);
            });
            countDown(namespace)
        });
        socket.on('question', (msg)=>{
            if (isNaN(msg.id)){
                socket.emit('error', 'Error! That is not allowed!');
            }
            else{
                if(msg.id < 0 || msg.id > categories_total){
                    socket.emit('error', 'Error! No question category that high/low!');
                }else{
                    get_Question(msg).then(r => {
                        console.log(r)
                        socket.emit('rasp',r)
                    });
                }
            }
            
        });
        socket.on('raspuns', (msg)=>{
            console.log(msg);
            saveAnswer(msg.personID, msg.answerID, msg.timerValue)
            //TODO:: INSERT THE ANSWER AND TIME IN THE DB
        });
        socket.on('start_round', async (msg)=>{
            try{
                console.log(msg)
                let t =[
                    msg.team1,
                    msg.team2
                ] 
                let nsp = msg.namespace 
                
                let nsp_id = (await promisePool.query(`select id from active_namespaces where namespace_identifier like ?`, [nsp]))[0][0]['id']
                for(let i = 0; i < 2; i++){
                    await promisePool.query(`insert into  users_active_namespaces(team_id, active_namespace_id, createdAt, updatedAt, corect_answers, total_points)
                    values(?, ?,current_timestamp, current_timestamp, 0, 0)`, [t[i], nsp_id])
                }
                GetTeamsInNamespaceDetails(nsp).then((teams) =>{
                    socket.emit('TeamsMembers', teams)
                })
                
            }catch(e){
                console.error(e)
            }
        })
        socket.on('newSession', async (msg) =>{
            try{
                await promisePool.query(`Update active_namespaces set is_active = 0 where namespace_identifier like ?`, [msg])
            }catch(e){
                console.error(e)
            }
        });
        socket.on('UpdateScores', async (msg)=>{
            console.log(msg);
            try{
                await promisePool.query(`Update users_active_namespaces set total_points = ?
                                        where active_namespace_id = (select id from active_namespaces id where namespace_identifier like ?)
                                        and team_id = (select users.team_id from users where users.id = ?)`, [msg.scorTeam1, msg.namespace, msg.userTeam1])
                await promisePool.query(`Update users_active_namespaces set total_points = ?
                                        where active_namespace_id = (select id from active_namespaces id where namespace_identifier like ?)
                                        and team_id = (select users.team_id from users where users.id = ?)`, [msg.scorTeam2, msg.namespace, msg.userTeam2])
            }catch(e){
                console.error(e)
            }
        })
        socket.on('get_namespace_load_status', async (msg)=>{
            try{
                console.log(msg)
                let [teams] = await promisePool.query(`select uan.team_id from active_namespaces an join users_active_namespaces uan on an.id = uan.active_namespace_id
                                                         where namespace_identifier like ?`, [msg])
                console.log(teams)
                if(teams.length === 0){
                    return
                }else{
                    let team1 = teams[0]['team_id']
                    let team2 = teams[1]['team_id']
                    if(team1 && team2){
                        console.log(team1 + ' ' + team2)
                        GetTeamsInNamespaceDetails(msg).then((teams) =>{
                            console.log(teams)
                            socket.emit('TeamsMembers', teams)
                        })
                    }
                }
            }catch(e){
                console.error(e)
            }
        })

        socket.on('correctAnswer',async (msg)=>{
            try{
                let [teams_answers] = await promisePool.query(`select a.id as answer_id, a.answer,t.name
                            from active_namespaces an join users_active_namespaces uan on an.id = uan.active_namespace_id
                            join teams t on uan.team_id = t.id join answers_recieved ar on t.id = ar.team_id join answers a on a.id = ar.answer_id
                            where an.namespace_identifier like ? and ar.question_id = ?`, [msg.namespace, msg.question_id])
                
                let response = {}
                for(let i = 1; i <=2; i++){
                    if(teams_answers[i]){
                        response[`IDanswerTeam${i}`] = teams_answers[i]['answer_id']
                        response[`Team${i}ValueAnswer`] = teams_answers[i]['answer']
                        response[`Team${i}Name`] = teams_answers[i]['name']
                    }else{
                        response[`IDanswerTeam${i}`] = 0
                        response[`Team${i}ValueAnswer`] = "_____Nu a raspuns!_____"
                        response[`Team${i}Name`] = "__Uncknown__"
                    }
                }
                let [correctAnswer] = await promisePool.query(`select id, answer from answers where question_id = ? and is_correct = 1`, [msg.question_id])
                response['answer_correctID'] = correctAnswer[0]['id']
                response['answer_correctValue'] = correctAnswer[0]['answer']
                console.log(response)
                socket.nsp.emit('allAnswers', response)
            }catch(e){
                console.error(e)
            }
        })
  });
app.get('/user', checkAuthenticated, namespaceExistsAndAllowed, async (req, res) => {
    let user = await req.user
    let nsp = req.query.namespace


    if(user.role !== 'ROLE_USER' && user.role !== 'ROLE_MULTIMEDIA'){
        res.redirect('/')
    }
    else{
        res.render('user_room.ejs',{user: user.full_name, namespace:nsp, pid: user.id})
    }
})
app.get('/admin', checkAuthenticated, async (req, res) => {
    let user = await req.user
    // let nsp = req.query.namespace
    let nsp
    if(user.role !== 'ROLE_ADMIN'){
        res.redirect('/')
    }
    let [namespace] = await promisePool.query(`Select namespace_identifier from active_namespaces
                                            where is_active = 1 and admin_id = ?`, [user.id])
    if(namespace[0]){
        nsp = namespace[0]['namespace_identifier']
    }else{
        nsp = Date.now() + user.id + Math.floor(Math.random() * 10);
        await promisePool.query(`INSERT INTO active_namespaces(admin_id, namespace_identifier, is_active, createdAt, updatedAt)
                                 values (?, ?, 1, current_timestamp, current_timestamp)`, [user.id, nsp])
    }
    //get list of teams parsed as obtions for a selector
    GetTeamsList().then(teams =>{
        res.render('admin_room.ejs', {namespace: nsp, pid: user.id, teams:teams})
    })
})

// END of SOCKET.IO Logic
//
//
// MUST be placed always at the end
app.get('/404', (req,res)=>{
    res.render(__dirname + '/' + 'views' +'/' + "404.ejs")
})
app.get('*', function(req, res){
    res.redirect('/404')
})
app.post('*', (req, res) => {
    res.redirect('/404')
})

server.listen(port, () => {
    console.log(`application is running at: http://localhost:${port}`);
});