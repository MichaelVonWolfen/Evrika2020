const express = require('express');

const app = express();

const http = require('http').createServer(app);

const io = require("socket.io")(http);

const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Salamandra#1',
    database: 'evryka_dev'
});

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
        console.log(msg);
        // get_question();
        connection.query(
            'select * from  questions\n' +
                'where times_played like (select min(times_played) from questions)\n' +
                'order by RAND()\n' +
                'limit 1;',
            function(err, results, fields) {
                io.emit('rasp', err);
                io.emit('rasp', results);
                io.emit('rasp', fields);
            }
          );
    });

});

function get_question(){
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Salamandra#1',
        database: 'evryka_dev'
    });
    connection.query(
        'SELECT * FROM `questions`',
        function(err, results, fields) {
            socket.br
            console.log("error:\n" + err);
            console.log("results:\n" + results); // results contains rows returned by server
            console.log("fields:\n" + fields); // fields contains extra meta data about results, if available
        }

      );
}
