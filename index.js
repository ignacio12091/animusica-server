const express = require('express');
/* const path = require('path');*/
const { Pool } = require('pg');

let app = express();
/* app.use(express.static(path.join(__dirname, 'build')));
 */
const client = new Pool ({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'animusica',
    password: 'root',
    port: 5432,
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });  

app.listen(80, function() {
    console.log("Escuchando puerto 80");
});

/* app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
}); */

app.get('/songs/:id', function(req, res) {
    res.sendFile(__dirname + '/public/songs/' + req.params.id);
});

app.get('/generos', function(req, res) {
    client.connect();
    client.query('SELECT * FROM genero', (error, response) => {
        if(!error) {
            let generos = [];
            response.rows.forEach(element => {
                generos.push(element);
            });
            res.json(generos);
        } else {
            res.send("Error fetching genres");
        }
    });
});

app.get('/mostvisited', function(req, res) {
    client.connect();
    client.query('SELECT * FROM cancion', (error, response) => {
        if(!error) {
            let songs = []
            response.rows.forEach(element => {
                songs.push(element);
            });
            res.json(songs);
        } else {
            res.send("Error fetching most visited");
        }
    });
});

app.get('/songs', function() {
    client.connect();
    client.query('SELECT * from cancion', (error, response) => {
        if(!error) {
            console.log(response.rows)
        } else {
            res.send("Error fetching songs");
        }
    });
});

app.get('/perfil', function(req, res) {
    res.json({ nombre: 'Cristian Mello', edad: 15 });
});