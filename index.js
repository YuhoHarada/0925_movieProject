require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fetch = require('node-fetch')
const MovieItem = require('./models/movieItem')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

mongoose.connect(process.env.dbUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => {
        console.log('conected to db')
        app.listen(process.env.PORT, () => {
            console.log('server')
        })
    })
    .catch(err => console.log(err))

app.get('/', (req, res) => {
    res.redirect('/popular/1')
})

app.get('/popular/:id', (req, res) => {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.APIKEY}&language=en-US&page=${req.params.id}&region=DE`)
        .then(res => res.json())
        .then(json => {
            res.status(200).render('home', { movie: json, url: 'popular' })
        })
})

app.get('/detail/:id', (req, res) => {
    fetch(`https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.APIKEY}&language=en-US`)
        .then(res => res.json())
        .then(json => {
            MovieItem.find()
                .then(result => {
                    let favorite = false, deleteid
                    result.forEach(elt => {
                        if (elt.id == json.id) {
                            favorite = true
                            deleteid = elt._id
                        }
                    })
                    res.status(200).render('detail', { detail: json, favorite, deleteid })
                })
                .catch(err => console.log(err))
        })
})

app.get('/add/:id', (req, res) => {
    fetch(`https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.APIKEY}&language=en-US`)
        .then(res => res.json())
        .then(json => {
            const newMovieItem = new MovieItem(json)
            newMovieItem.save()
                .then(result => {
                    res.redirect(`/detail/${json.id}`)
                })
                .catch(err => console.log(err))
        })
})

app.get('/delete/:id', (req, res) => {
    MovieItem.findByIdAndDelete(req.params.id)
        .then(result => {
            res.redirect(`/detail/${result.id}`)
        })
        .catch(err => console.log(err))
})

app.get('/favorite/:id', (req, res) => {
    MovieItem.find()
        .then(result => {
            let total_pages = Math.ceil(result.length / 20)
            let results = []
            let i = 0
            for (let j = 1; j < req.params.id; j++) {
                i += 20
            }
            let lastitem = i + 20
            if (req.params.id == total_pages) lastitem = result.length
            for (i; i < lastitem; i++) {
                results.push(result[i])
            }
            let movie = {
                page: req.params.id,
                total_pages,
                results
            }
            res.status(200).render('home', { movie, url: 'favorite' })
        })
        .catch(err => console.log(err))
})

app.post('/search', (req, res) => {
    res.redirect(`/search/${req.body.userInput}/1`)
})

app.get('/search/:word/:page', (req, res) => {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=${req.params.word}&page=${req.params.page}&include_adult=false`)
        .then(res => res.json())
        .then(json => {
            res.status(200).render('home', { movie: json, url: `search/${req.params.word}`, word: req.params.word })
        })
})