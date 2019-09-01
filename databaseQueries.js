const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'animusica',
  password: 'root',
  port: 5432,
})

/*
Para la db del servidor de animusica
user: 'postgres',
host: '10.1.2.1',
database: 'animusica',
password: '123',
port: 5432,
*/

const getGenres = (request, response) => {
    pool.query('SELECT * FROM genero', (error, results) => {
        if(!error) {
            let generos = [];
            results.rows.forEach(element => {
                generos.push(element);
            });
            response.status(200).json(generos);
        } else {
            throw error
        }
    })
}

const getMostVisited = (request, response) => {
    pool.query('SELECT * FROM cancion', (error, results) => {
        if(!error) {
            let songs = []
            results.rows.forEach(element => {
                songs.push(element);
            });
            response.json(songs);
        } else {
            throw error
        }
    });
}

const getSongs = (request, response) => {
    pool.query('SELECT * FROM cancion', (error, results) => {
        if(!error) {
            let songs = []
            results.rows.forEach(element => {
                songs.push(element);
            });
            response.json(songs);
        } else {
            throw error
        }
    });
}

const searchSong = (request, response) => {
    pool.query('SELECT * from cancion', (error, results) => {
        if(!error) {
            let match = []
            results.rows.forEach(element => {
                if (element.nombre.toLowerCase().includes(request.params.song.toLowerCase())) {
                    match.push(element);
                }
            });
            response.json(match);
        } else {
            throw error
        }
    });
}

module.exports = {
    getGenres,
    getMostVisited,
    getSongs,
    searchSong,
}