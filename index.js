const express = require('express');
const db = require('./databaseQueries');

/* const path = require('path');*/

let app = express();

/* 
Para devolver la página cuando se haga un build
app.use(express.static(path.join(__dirname, 'build')));
*/

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});  

app.listen(80, function() {
    console.log("Escuchando puerto 80");
});

app.get('/', function(req, res) {
    /*res.sendFile(path.join(__dirname, 'build', 'index.html'));*/
});

app.get('/songs/:id', function(req, res) {
    res.sendFile(__dirname + '/public/songs/' + req.params.id);
});

app.get('/generos', db.getGenres);

app.get('/mostvisited', db.getMostVisited);

app.get('/songs', db.getSongs);

app.get('/perfil', function(req, res) {
    res.json({ nombre: 'Cristian Mello', edad: 15 });
});

app.get('/songs/search/:song', db.searchSong);

app.get('/bestranked', db.getBestRanked);

app.get('/playlists/user/:id', db.getUserPlaylists);