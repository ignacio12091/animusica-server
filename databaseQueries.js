const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'animusica',
    password: 'root',
    port: 5432,
})

/*
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

const getBestRanked = (request, response) => {
    pool.query('SELECT cancion.nombre, cancion.link_imagen, cancion.link_recurso, avg(puntuacion) AS "Promedio Puntuacion" FROM cancion INNER JOIN puntua ON cancion.id = puntua.id_cancion GROUP BY cancion.nombre, cancion.link_imagen, cancion.link_recurso', (error, results) => {
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

const getUserPlaylists = (request, response) => {
    const idCliente = request.params.id
    pool.query(`SELECT lista_reproduccion.* FROM lista_reproduccion INNER JOIN cliente_lista_reproduccion ON lista_reproduccion.id = cliente_lista_reproduccion.id_lista_reproduccion WHERE cliente_lista_reproduccion.id_cliente = ${idCliente};`, (error, results) => {
        if(!error) {
            let playlists = []
            results.rows.forEach(element => {
                playlists.push(element);
            });
            response.json(playlists);
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
    getBestRanked,
    getUserPlaylists,
}