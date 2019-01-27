const path = require('path') // gestion fichiers locaux
const express = require('express') // framework mvc
const nunjucks = require('nunjucks') // templates
const session = require('express-session') // sessions
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')

const config = require(path.join(__dirname, 'config.js'))

const FilmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  releasedate: { type: String },
  director: { type: String },
  genre: { type: String },
  description: { type: String }
})

const Schema = mongoose.Schema
const UserDetail = new Schema({
  username: String,
  email: String,
  password: String
})

mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)

const Film = mongoose.model('film', FilmSchema)
const User = mongoose.model('userInfo', UserDetail, 'userInfo')

mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.db)
mongoose.connection.on('error', err => {
  console.error(err)
})

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({
      username: username
    }, function (err, user) {
      if (err) {
        return done(err)
      }

      if (!user) {
        return done(null, false)
      }

      if (user.password !== password) {
        return done(null, false)
      }
      return done(null, user)
    })
  }
))

let app = express()

nunjucks.configure('views', {
  express: app
})

let sessionStore = new session.MemoryStore()

app.use(session({
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: config.express.cookieSecret
}))

app.use(flash())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Passport JS Login
app.get('/login', (req, res) => res.render('auth.njk', { root: __dirname }))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, cb) {
  cb(null, user.id)
})

passport.deserializeUser(function (id, cb) {
  User.findById(id, function (err, user) {
    cb(err, user)
  })
})

app.use(express.static(path.join(__dirname, '/views')))

app.use((req, res, next) => {
  next()
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/',
  failureFlash: 'Invalid username or password.' }),
function (req, res) {
  console.log('logging in')
  res.redirect('/cine')
  req.flash('info', 'Flash is back!')
})

app.get('/logout', function (req, res) {
  console.log('logging out')
  req.logout()
  res.redirect('/login')
})

app.get('/register', function (req, res) {
  res.render('register.njk')
})

let router = express.Router()

/**
 * FILM
 */
router.route('/film')
  .get(checkAuthentication, (req, res) => {
    Film.find().then(films => {
      res.render('film.njk', { films: films })
    }).catch(err => {
      console.error(err)
    })
  })

router.route('/fiche/:id')
  .get((req, res) => {
    Film.find().then(films => {
      res.render('fiche.njk', { _id: req.params.id })
    }).catch(err => {
      console.error(err)
    })
  })

router.route('/cine')
  .get((req, res) => {
    Film.find().then(films => {
      res.render('cine.njk', { films: films })
    }).catch(err => {
      console.error(err)
    })
  })

router.route('/film/add')
  .post(checkAuthentication, (req, res) => {
    new Film({
      title: req.body.inputtitle,
      releasedate: req.body.inputDateBegin,
      director: req.body.inputreal,
      genre: req.body.inputgenre,
      description: req.body.inputdesc
    }).save().then(film => {
      console.log('Votre film a été ajoutée')
      res.redirect('/film')
    }).catch(err => {
      console.warn(err)
    })
  })

router.route('/film/edit/:id')
  .get(checkAuthentication, (req, res) => {
    Film.findById({ _id: req.params.id }).then(film => {
      const { title, releasedate, director, genre, description } = film
      res.render('modifFilm.njk', { id: film._id, title, releasedate, director, genre, description })
    }).catch(err => {
      console.warn(err)
    })
  })

router.route('/film/validerModif/:id')
  .post(checkAuthentication, (req, res) => {
    const { body } = req
    Film.findByIdAndUpdate(req.params.id, { $set: body }).then(film => {
      res.redirect('/film')
    }).catch(err => {
      console.warn(err)
    })
  })

router.route('/film/delete/:id')
  .get(checkAuthentication, (req, res) => {
    Film.findByIdAndRemove({ _id: req.params.id }).then(() => {
      console.log('Votre film est supprimé')
      res.redirect('/film')
    }).catch(err => {
      console.error(err)
    })
  })

/**
* USER
*/
router.route('/user')
  .get(checkAuthentication, (req, res) => {
    User.find().then(user => {
      res.render('user.njk', { user: user })
    }).catch(err => {
      console.error(err)
    })
  })

router.route('/user/add')
  .post((req, res) => {
    new User({
      username: req.body.inputLogin,
      email: req.body.inputEmail,
      password: req.body.inputPassword
    }).save().then(film => {
      console.log('Votre utilisateur a été ajouté')
      res.redirect('/user')
    }).catch(err => {
      console.warn(err)
    })
  })

router.route('/user/edit/:id')
  .get(checkAuthentication, (req, res) => {
    User.findById({ _id: req.params.id }).then(user => {
      const { username, email } = user
      res.render('modifUser.njk', { id: user._id, username, email })
    }).catch(err => {
      console.warn(err)
    })
  })

router.route('/user/validerModif/:id')
  .post(checkAuthentication, (req, res) => {
    const { body } = req
    User.findByIdAndUpdate(req.params.id, { $set: body }).then(user => {
      res.redirect('/user')
    }).catch(err => {
      console.warn(err)
    })
  })

router.route('/user/delete/:id')
  .get(checkAuthentication, (req, res) => {
    User.findByIdAndRemove({ _id: req.params.id }).then(() => {
      console.log('L\'utilisateur a été supprimé')
      res.redirect('/user')
    }).catch(err => {
      console.error(err)
    })
  })

/**
   * Vérifie si l'utilisateur est authentifié via le middleware.
*/
function checkAuthentication (req, res, next) {
  if (req.isAuthenticated()) {
    // req.isAuthenticated() will return true if user is logged in
    next()
  } else {
    res.redirect('/login')
  }
}

app.use('/', router)
app.use('/pub', express.static('public'))
app.use((req, res) => {
  res.redirect('/login')
})

app.listen(config.express.port, config.express.ip, () => {
  console.log('Server listening on ' + config.express.ip + ':' + config.express.port)
})
