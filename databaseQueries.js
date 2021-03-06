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
    function callback (result) { response.json(result); }

    function asyncFunction (element, cb) {
        setTimeout(() => {
            pool.query(`SELECT * FROM genero INNER JOIN cancion_genero ON genero.nombre = cancion_genero.genero_nombre INNER JOIN cancion ON cancion_genero.id_cancion = cancion.id and cancion_genero.id_usuario = cancion.id_usuario WHERE genero.nombre = '${element.nombre}' ORDER BY RANDOM() LIMIT 10`, (error, results) => {
                cb(results.rows);
            });
        }, 100);
      }
    
    var itemsProcessed = 0;

    pool.query('SELECT * FROM genero', (error, results) => {
        if(!error) {
            let result = [];
            results.rows.forEach((element, index, array) => {
                asyncFunction(element, (songs) => {
                    itemsProcessed++;
                    if (songs.length > 0) {
                        result.push({
                            genre: element.nombre,
                            songs: songs,
                        })
                    }
                    if (itemsProcessed === array.length) {
                        callback(result)
                    }
                })
            })
        } else {
            response.json({ success: false });
        }
    });
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
            response.json({ success: false })
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
            response.json({ success: false })
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
            response.json({ success: false })
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
            response.json({ success: false })
        }
    });
}

const getUserPlaylists = (request, response) => {
    const idCliente = request.params.id
    pool.query(`SELECT lista_reproduccion.* FROM lista_reproduccion INNER JOIN cliente_lista_reproduccion ON lista_reproduccion.id = cliente_lista_reproduccion.id_lista_reproduccion WHERE cliente_lista_reproduccion.id_cliente = ${idCliente};`, (error, results) => {
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
    pool.query(`SELECT * FROM usuario INNER JOIN cliente ON usuario.id = cliente.id_usuario WHERE usuario.email = '${userEmail}'`, (error, results) => {
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
            response.json({ success: false })
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
                bcrypt.hash(userPassword, 10, (hashError, hash) => {
                    pool.query(`INSERT INTO usuario (email, nombre, contrasena, link_imagen) VALUES ('${userEmail}', '${userName}', '${hash}', 'https://theimag.org/wp-content/uploads/2015/01/user-icon-png-person-user-profile-icon-20.png') RETURNING *;`, (err, res) => {                           
                        if (!err) {
                            pool.query(`INSERT INTO cliente (id_usuario, apellido, fecha_nacimiento) VALUES (${res.rows[0].id}, '${userSurname}', '${userDateOfBirth}')`, (clientError, clientResponse) => {
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
        const userId = request.params.id        
        switch(request.body.option) {
            case "name":
                const userName = request.body.name
                pool.query(`UPDATE usuario SET nombre='${userName}' WHERE id=${userId}`, (error, results) => {
                    if (!error) {
                        response.json({ success: true })                        
                    } else {
                        response.json({ success: false })                                                
                    }
                });
            break;
            case "mail":
                const oldMail = request.body.oldMail
                const password = request.body.password
                const newMail = request.body.newMail
                pool.query(`SELECT * FROM usuario INNER JOIN cliente ON usuario.id = cliente.id_usuario WHERE usuario.id = ${userId} and usuario.email = '${oldMail}'`, (error, results) => {
                    if (!error) {
                        if(results.rows.length > 0) {
                            bcrypt.compare(password, results.rows[0].contrasena, function(err, equals) {
                                if (equals) {
                                    pool.query(`UPDATE usuario SET email='${newMail}' WHERE id=${userId}`, (error, results) => {
                                        if (!error) {
                                            response.json({ success: true })          
                                        } else {
                                            response.json({ success: false, error: "No se pudo modificar el nombre" })                                                
                                        }
                                    });
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
            break;
            case "password": 
                const pass = request.body.password
                const newPassword = request.body.newPassword
                pool.query(`SELECT * FROM usuario INNER JOIN cliente ON usuario.id = cliente.id_usuario WHERE usuario.id = ${userId}`, (error, results) => {
                    if (!error) {
                        if(results.rows.length > 0) {
                            bcrypt.compare(pass, results.rows[0].contrasena, function(err, equals) {                               
                                if (equals) {
                                    bcrypt.hash(newPassword, 10, (hashError, hash) => {                        
                                        if (!err) {
                                            pool.query(`UPDATE usuario SET contrasena='${hash}' WHERE id=${userId}`, (error, results) => {
                                                if (!error) {
                                                    response.json({ success: true })      
                                                } else {
                                                    response.json({ success: false, error: "No se pudo modificar el nombre" })                                                
                                                }
                                            });

                                        } else {
                                            response.json({ success: false, error: "Error en la creación del usuario" })
                                        }
                                    })
                                } else {
                                    response.json({ success: false, error: "Error en la autenticación" })
                                }
                            });
                        } else {
                            response.json({ success: false, error: "El usuario no existe" })
                        }
                    } else {
                        throw error
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

const newPlaylist = (request, response) => {
    const userId = request.params.id
    var todayDate = new Date().toISOString().slice(0,10); 
    pool.query(`INSERT INTO lista_reproduccion (nombre, descripcion, link_imagen, fecha_subida) VALUES ('${request.body.name}', '${request.body.description}', 'https://pbs.twimg.com/profile_images/943046122125197312/D6iFJCqf_400x400.jpg','${todayDate}') RETURNING *;`, (error, results) => {
        if(!error) {
            pool.query(`INSERT INTO cliente_lista_reproduccion (id_lista_reproduccion, id_cliente) VALUES (${results.rows[0].id}, ${userId});`, (err, res) => {
                if (!err) {
                    response.json({ success: true });
                } else {
                    response.json({ success: false, error: "Error creando la lista de reproducción" })
                }
            })
        } else {
            response.json({ success: false, error: "Error creando la lista de reproducción" })
        }
    })
}

const deletePlaylist = (request, response) => {
    pool.query(`DELETE FROM cliente_lista_reproduccion WHERE cliente_lista_reproduccion.id_lista_reproduccion = ${request.params.playlistId} and cliente_lista_reproduccion.id_cliente = ${request.params.id}; DELETE FROM lista_reproduccion WHERE lista_reproduccion.id = ${request.params.playlistId}`, (error, results) => {
        if (!error) {
            response.json({ success: true });
        } else {
            response.json({ success: false });
        }
    })
}

const getPlaylistSongs = (request, response) => {
    pool.query(`SELECT c.* FROM lista_reproduccion lr INNER JOIN lista_reproduccion_cancion lrc ON lr.id = lrc.id_lista_reproduccion INNER JOIN cancion c ON lrc.id_cancion = c.id and lrc.id_usuario = c.id_usuario WHERE lr.id = ${request.params.id}`, (error, results) => {
        if (!error) {
            if (results.rows.length > 0) {
                response.json({ success: true, songs: results.rows });
            } else {
                response.json({ success: false, error: "Esta playlist no tiene canciones" });
            }
        } else {
            response.json({ success: false, error: "Error al traer los datos de la playlist" });
        }
    })
}

const addSongToPlaylist = (request, response) => {
    pool.query(`INSERT INTO lista_reproduccion_cancion (id_lista_reproduccion, id_cancion, id_usuario) VALUES (${request.params.playlistId}, ${request.params.songId}, ${request.params.id})`, (error, results) => {
        if (!error) {
            response.json({ success: true });
        } else if (error.code === "23505") {
            response.json({ success: false, error: "Esta canción ya está agregada a la lista de reproducción" });
        } else {
            response.json({ success: false, error: "Error agregando la canción a la lista de reproducción" });
        }
    })
}

const deleteSongFromPlaylist = (request, response) => {
    pool.query(`DELETE FROM lista_reproduccion_cancion WHERE lista_reproduccion_cancion.id_lista_reproduccion = ${request.params.playlistId} and lista_reproduccion_cancion.id_usuario = ${request.params.artistId} and lista_reproduccion_cancion.id_cancion = ${request.params.songId}`, (error, results) => {
        console.log(error)
        console.log(results)
        if (!error) {
            response.json({ success: true });
        } else {
            response.json({ success: false });
        }
    })
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
    newPlaylist,
    deletePlaylist,
    getPlaylistSongs,
    addSongToPlaylist,
    deleteSongFromPlaylist,
}