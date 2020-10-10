const express = require('express');

const app = express();

const http = require('http').createServer(app);

const io = require("socket.io")(http);

const mysql = require('mysql2');
const pool = mysql.createPool({ host: 'localhost',user: 'root',password: 'Salamandra#1',database: 'evryka_dev'});

http.listen(4000, () =>{
    console.log("Listening on port 4000");
});

app.use(express.static("public"));


io.on('connection', (socket) => {
    console.log("Connection Established!");
    socket.on('disconnect', ()=>{
        console.log('User disconnected!');
    });
    socket.on('message', (msg)=>{
        console.log(msg);
    });
    socket.on('question', (msg)=>{
        get_Question().then(r => io.emit('rasp',r));

    });

});

//Gets a question from the DB and increases the counter of the times played

async function get_Question() {
    // create the pool
    // now get a Promise wrapped instance of that pool
    const promisePool = pool.promise();
    // query database using promises
    const [quest] = await promisePool.query("select id, question, times_played from  questions\n" +
        "where times_played like (select min(times_played) from questions)\n" +
        "order by RAND()\n" +
        "limit 1;");
    let id = quest[0]['id']
    let question = quest[0]['question']
    let played_times = quest[0]['times_played']

    console.log(id);
    console.log(question);
    console.log(played_times);
    const [answers] = await promisePool.query(`Select id, answer from answers where question_id = ${id};`);
    let question_JSON = {
                            'id' : id,
                            'question': question,
                            'answers': answers
                        };
    await promisePool.query(`UPDATE questions set times_played = ${played_times + 1} where id = ${id};`);
    return question_JSON;

}