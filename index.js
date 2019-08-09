const express = require('express');
const path = require('path');
let app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.listen(80, function() {
    console.log("Escuchando puerto 80");
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/prueba', function(req, res) {
    res.json({ respuesta: 'hola' });
});

app.get('/perfil', function(req, res) {
    res.json({ nombre: 'Cristian Mello', edad: 15 });
});