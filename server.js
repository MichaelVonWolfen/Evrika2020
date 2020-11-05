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

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => GetUserByEmail(email),
    id =>GetUserByID(id)
    )


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
app.get('/register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', {error:""})
})
app.post('/register', async (req, res) => {
    try{
        //TODO: Check all the inputs to have text
        let i = 0;
        const hashedPass = await bcrypt.hash(req.body.password, 10)
        const team_name = req.body.team_name
        const fname = req.body.first_name
        const lname = req.body.last_name
        const email = req.body.email
        const phone = req.body.phone
        const college = req.body.college

        const promisePool = pool.promise();
        let [team] = await promisePool.query(`Select name from teams where name like lower('${team_name}')`);
        if(team[0]){
            //DONE: show error message
            return res.render('register.ejs',{error:"Team already exists."});
        }
        //TODO: ADD team in the DB and the members
        let [user] = await promisePool.query(`Select email from users where email like lower('${email}')`)
        if(user[0]){
            return res.render('register.ejs',{error:`Email ${email} already used.`});
        }
        await promisePool.query(`INSERT into teams(NAME, ROLE, CREATEDAT, UPDATEDAT) 
                                VALUES(lower('${team_name}'), 'ROLE_USER', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());`);
        [team] = await promisePool.query(`Select id from teams where name like '${team_name}'`);

        const id = team[0]['id'];
        await promisePool.query(`insert into users(first_name, last_name, email, password, phone, faculty, team_id, role, createdAt, updatedAt)
                                        values ('${fname}', '${lname}', lower('${email}'), '${hashedPass}','${phone}', '${college}','${id}',
                                        'ROLE_USER', current_timestamp, current_timestamp)`);

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
app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/views/css/" + "404.css");
});
app.get('/style_bad.css', function(req, res) {
    res.sendFile(__dirname + "/views/css/" + "style_bad.css");
});
app.get('/admin.js', function(req, res) {
    res.sendFile(__dirname + "/views/js/" + "admin.js");
});
app.get('/user.js', function(req, res) {
    res.sendFile(__dirname + "/views/js/" + "user.js");
});
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
async function namespaceExists(req, res, next){
    namespace = req.query.namespace
    try{
        let [hasAdmin] = await promisePool.query(`SELECT id from active_namespaces where namespace_identifier like '${namespace}'`)
        if(hasAdmin.length === 0)
            return res.redirect('/404')
    }catch (e){
        console.error(e)
    }
    next()
}
async function GetUserByEmail(email){
    try {
        const [res] = await promisePool.query(`select id, concat(first_name,' ', last_name) as 'full_name', email, 
                                                    password, phone, faculty, team_id, is_active, role, createdAt, 
                                                    updatedAt from users where email like '${email}';`)
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
                                                    updatedAt  from users where id like '${id}';`)
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
    // create the pool
    // now get a Promise wrapped instance of that pool
    let category = msg.id
    let t1 = msg.id_1
    let t2 = msg.id_2
    console.log(msg)
    const promisePool = pool.promise();
    // query database using promises
    let query =`select id, question, times_played from  questions 
                where times_played like (
                                            Select min(times_played) from questions 
                                            where  question_type = ${category}
                                        ) AND
                        id not in (
                                    Select question_id from answers_recieved
                                    where team_id in (
                                                        Select team_id from users
                                                        where id in (${t1}, ${t2})
                                                    )
                                    )
                order by RAND()
                limit 1;`
    const [quest] = await promisePool.query(query);
    // console.log(quest);
    let id = quest[0]['id']
    let question = quest[0]['question']
    let played_times = quest[0]['times_played']

    let question_JSON = {
        'id' : id,
        'question': question
    };
    await promisePool.query(`UPDATE questions set times_played = ${played_times + 1} where id = ${id}`);
    return question_JSON;

}
async function get_QuestionAndAnswers(queryBig) {
    // create the pool
    // now get a Promise wrapped instance of that pool
    let id = queryBig.id
    let k1 = queryBig.id_1
    let k2 = queryBig.id_2
    const promisePool = pool.promise();
    // query database using promises
    let query = `select question from questions where id = ${id}`
    const [quest] = await promisePool.query(query);

    const [answers] = await promisePool.query(`Select id, answer from answers where question_id = ${id} order by rand()`);
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
    try{
        let time = total_time_allowed - timerValue;
        let query = `Select team_id from users where id  = ${userID}`
        
        let teamID = (await promisePool.query(query))[0][0]["team_id"]
        
        query = `Select question_id from answers where id like ${ansID}`
        let question_id = (await promisePool.query(query))[0][0]["question_id"]

        query = `INSERT INTO answers_recieved(team_id, answer_id, question_id, total_time, createdAt, updatedAt)
        Values(${teamID}, ${ansID}, ${question_id}, ${time},  current_timestamp, current_timestamp)`
        await promisePool.query(query)
    }catch(e){
        console.error(e)
    }

}
// Socket IO LOGIC.
function countDown(namespace){
    let counter = total_time_allowed + 1;
    let WinnerCountdown = setInterval(function(){
        counter--
        io.of(namespace).emit('counter', counter);
        if (counter === 0) {
            clearInterval(WinnerCountdown); 
        }
    }, 1000);
}
io.of((nsp, query, next) => {
    
    next(null, true);
  
  }).on('connect', (socket) => {
        socket.on('toPlayers', (msg)=> {
            let namespace = socket.nsp.name
            get_QuestionAndAnswers(msg).then(answers =>{
                console.log(answers)
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
                    get_Question(msg).then(r => socket.emit('rasp',r));
                }
            }
            
        });
        socket.on('raspuns', (msg)=>{
            console.log(msg);
            saveAnswer(msg.personID, msg.answerID, msg.timerValue)
            //TODO:: INSERT THE ANSWER AND TIME IN THE DB
        });
  });
app.get('/user', checkAuthenticated, namespaceExists, async (req, res) => {
    let user = await req.user
    let nsp = req.query.namespace
    if(user.role !== 'ROLE_USER'){
        res.redirect('/')
    }
    else{
        res.render('user_room.ejs',{user: user.full_name, namespace:nsp, pid: user.id})
    }
})
app.get('/admin', checkAuthenticated, async (req, res) => {
    let user = await req.user
    let nsp = req.query.namespace
    if(!nsp)
        nsp = Date.now() + user.id + Math.floor(Math.random() * 10);

    if(user.role !== 'ROLE_ADMIN'){
        res.redirect('/')
    }
    else{
        res.render('admin_room.ejs', {namespace: nsp, pid: user.id})
    }
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