const express = require('express');
const path = require('path');
const { Client } = require('pg');

let app = express();
app.use(express.static(path.join(__dirname, 'build')));

const client = new Client ({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'animusica',
    password: 'root',
    port: 5432,
});

client.connect(() => {
    console.log('conectado a la BD');
})

app.listen(80, function() {
    console.log("Escuchando puerto 80");
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/generos', function(req, res) {
    const response = [];
    client.query('SELECT * from genero', (err, res) => {
        console.log(err, res)
        response = res.rows
        client.end()
    })
    res.json(response);
});

app.get('/perfil', function(req, res) {
    res.json({ nombre: 'Cristian Mello', edad: 15 });
});