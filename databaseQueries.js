const Pool = require('pg').Pool
const bcrypt = require('bcrypt');

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
    console.log(idCliente)
    pool.query(`SELECT lista_reproduccion.* FROM lista_reproduccion INNER JOIN cliente_lista_reproduccion ON lista_reproduccion.id = cliente_lista_reproduccion.id_lista_reproduccion WHERE cliente_lista_reproduccion.id_cliente = ${idCliente};`, (error, results) => {
        console.log("ok: ", results.rows)
        if(results) {
            let playlists = []
            results.rows.forEach(element => {
                playlists.push(element);
            });
            response.json(playlists);
        } else {
            response.send("error");
        }
    });
}

const validateLogin = (request, response) => {
    const userEmail = request.body.email
    const userPassword = request.body.password
    pool.query(`SELECT * FROM usuario WHERE usuario.email = '${userEmail}'`, (error, results) => {
        if (!error) {
            if(results.rows.length > 0) {
                bcrypt.compare(userPassword, results.rows[0].contrasena, function(err, equals) {
                    if (equals) {
                        response.json({ success: true, user: results.rows[0] });
                    } else {
                        response.json({ success: false, error: "Error en la autenticación" })
                    }
                });
            } else {
                response.json({ success: false, error: "Error en la autenticación" })
            }
        } else {
            throw error
        }
    });
}

const register = (request, response) => {
    const userName = request.body.name
    const userSurname = request.body.surname
    const userDateOfBirth = request.body.birth
    const userEmail = request.body.email 
    const userPassword = request.body.password
    pool.query(`SELECT * FROM usuario WHERE usuario.email = '${userEmail}'`, (error, results) => {
        if (results) {
            if (results.rows.length > 0) {
                response.json({ success: false, error: "Este mail ya está registrado" })
            } else {
                // ese email no está registrado
                bcrypt.hash(userPassword, 10, (hashError, hash) => {
                        pool.query(`INSERT INTO usuario (email, nombre, contrasena, link_imagen) VALUES ('${userEmail}', '${userName}', '${hash}', 'https://theimag.org/wp-content/uploads/2015/01/user-icon-png-person-user-profile-icon-20.png') RETURNING *;`, (err, res) => {                           
                            if (!err) {
                                pool.query(`INSERT INTO cliente (id, apellido, fecha_nacimiento) VALUES (${res.rows[0].id}, '${userSurname}', '${userDateOfBirth}')`, (clientError, clientResponse) => {
                                    if (!clientError) {
                                        response.json({ success: true })
                                    } else {
                                        response.json({ success: false, error: "Error en la creación del usuario" })
                                    }
                                })
                            } else {
                                response.json({ success: false, error: "Error en la creación del usuario" })
                            }       
                        });
                })
            }
        }
    });
}

const setSettings = (request, response) => {
    if (request.body) {
        switch(request.body.option) {
            case "name":
                const userName = request.body.name
                const userId = request.params.id
                pool.query(`UPDATE usuario SET nombre='${userName}' WHERE id=${userId}`, (error, results) => {
                    if (!error) {
                        response.json({ success: true })                        
                    } else {
                        response.json({ success: false })                                                
                    }
                });
            break;
            default:
            break;
        }
    }
}

const userInfo = (request, response) => {
    const userId = request.params.id
    pool.query(`SELECT id, nombre, email, link_imagen FROM usuario WHERE id=${userId}`, (error, results) => {
        response.json(results.rows[0])
    });
}

module.exports = {
    getGenres,
    getMostVisited,
    getSongs,
    searchSong,
    getBestRanked,
    getUserPlaylists,
    validateLogin,
    register,
    setSettings,
    userInfo,
}