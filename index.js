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

// app.get('*', function(req, res, next) {
//     console.log(req.ip);
//     next();
// });

// app.get('/robert', function(req, res) {
//     res.send('Hola, yo me llamo Robert');
// });

// app.get('/english', function(req, res) {
//     res.send('Hello, my name is Robert');
// });

// app.get('/deutsch', function(req, res) {
//     res.send('Hallo, ich heiße Robert');
// });

// app.get('/ayuwoki', function(req, res) {
//     fs.readFile('index.html',function (err, data){
//         res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
//         res.write(data);
//         res.end();
//     });
// });

// app.get('*', function(req, res) {
//     res.send('Error 800546');
// });