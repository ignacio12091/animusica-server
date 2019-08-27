const express = require('express');
/* const path = require('path');*/
const { Client } = require('pg');

let app = express();
/* app.use(express.static(path.join(__dirname, 'build')));
 */
const client = new Client ({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'animusica',
    password: 'root',
    port: 5432,
});

app.listen(80, function() {
    console.log("Escuchando puerto 80");
});

/* app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
}); */

app.get('/generos', function(req, res) {
    client.connect();
    client.query('SELECT * from genero', (error, response) => {
        if(!error) {
            let generos = [];
            response.rows.forEach(element => {
                generos.push(element)
            });
            res.json(generos);
        } else {
            res.send("Error fetching genres");
        }
    });
});

app.get('/perfil', function(req, res) {
    res.json({ nombre: 'Cristian Mello', edad: 15 });
});