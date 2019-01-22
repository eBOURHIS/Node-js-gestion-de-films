const path = require('path') // gestion fichiers locaux
const express = require('express') //framework mvc
const nunjucks = require('nunjucks') // templates
const session = require('express-session') // sessions
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require(path.join(__dirname, 'config.js'))

const FilmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  releasedate: { type: String },
  realisator: { type: String },
  gender: { type: String },
  description: { type: String },
})

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true)

const Film = mongoose.model('Film', FilmSchema)

mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.db)
mongoose.connection.on('error', err => {
  console.error(err)
})

let app = express()

nunjucks.configure('views', {
  express: app
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

let sessionStore = new session.MemoryStore()

app.use(express.static(path.join(__dirname, '/views')))
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: config.express.cookieSecret
}))

app.use((req, res, next) => {
  next()
})

let router = express.Router()

router.route('/')
  .get((req, res) => {
    Film.find().then(films => {
      res.render('film.njk', {films: films})
    }).catch(err => {
      console.error(err)
    })
  })

  router.route('/fiche/:id')
    .get((req, res) => {
      Film.find().then(films => {
        res.render('fiche.njk', {_id : req.params.id})
      }).catch(err => {
        console.error(err)
      })
    })

    router.route('/cine')
      .get((req, res) => {
        Film.find().then(films => {
          res.render('cine.njk', {films: films})
        }).catch(err => {
          console.error(err)
        })
      })

router.route('/add')
  .post((req, res) => {
    new Film({
      title: req.body.inputtitle,
      releasedate: req.body.inputDateBegin,
      realisator: req.body.inputreal,
      gender: req.body.inputgender,
      description: req.body.inputdesc
    }).save().then(film => {
       console.log('Votre tâche a été ajoutée');
      res.redirect('/film')
    }).catch(err => {
      console.warn(err);
    })
  })



router.route('/delete/:id')
  .get((req, res) => {
    Film.findByIdAndRemove({_id: req.params.id}).then(() => {
      console.log('Votre tâche est finie');
      res.redirect('/film')
    }).catch(err => {
      console.error(err)
    })
  })


app.use('/film', router)
app.use('/pub', express.static('public'))
app.use((req, res) => {
  res.redirect('/film')
})

app.listen(config.express.port, config.express.ip, () => {
  console.log('Server listening on ' + config.express.ip + ':' + config.express.port)
})
