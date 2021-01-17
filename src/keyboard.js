const kb = require('./keyboard-button')

module.exports = {
    home: [
        [kb.home.films, kb.home.cinemas],
        [kb.home.favourite]
    ],
    films: [
        [kb.film.random],
        [kb.film.action, kb.film.comedy],
        [kb.back.back]
    ]
}