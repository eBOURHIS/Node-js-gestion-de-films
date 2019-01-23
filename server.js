const path = require('path') // gestion fichiers locaux
const express = require('express') //framework mvc
const nunjucks = require('nunjucks') // templates
const session = require('express-session') // sessions
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')

const config = require(path.join(__dirname, 'config.js'))

const FilmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  releasedate: { type: String },
  realisator: { type: String },
  gender: { type: String },
  description: { type: String },
})

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true)

const Film = mongoose.model('film', FilmSchema)
const User = mongoose.model('userInfo', UserDetail, 'userInfo');

mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.db)
mongoose.connection.on('error', err => {
  console.error(err)
})

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      User.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

let app = express()

nunjucks.configure('views', {
  express: app
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Passport JS
app.get('/', (req, res) => res.render('auth.njk', { root : __dirname}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/cine', (req, res) => res.render("cine.njk"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

let sessionStore = new session.MemoryStore()

app.use(express.static(path.join(__dirname, '/views')))
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: config.express.cookieSecret
}))

app.post('/', passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/cine');
  });

app.use((req, res, next) => {
  next()
})

let router = express.Router()

router.route('/film')
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

router.route('/user')
  .get((req, res) => {
    User.find().then(user => {
      res.render('user.njk', {user: user})
    }).catch(err => {
      console.error(err)
    })
  })

  router.route('/user/add')
  .post((req, res) => {
    new User({
      username: req.body.inputLogin,
      password: req.body.inputPassword
    }).save().then(film => {
       console.log('Votre utilisateur a été ajouté');
      res.redirect('/user')
    }).catch(err => {
      console.warn(err);
    })
  })

router.route('/user/delete/:id')
  .get((req, res) => {
    User.findByIdAndRemove({_id: req.params.id}).then(() => {
      console.log('L\'utilisateur a été supprimé');
      res.redirect('/user')
    }).catch(err => {
      console.error(err)
    })
  })

app.use('/', router)
app.use('/pub', express.static('public'))
app.use((req, res) => {
  res.redirect('/film')
})

app.listen(config.express.port, config.express.ip, () => {
  console.log('Server listening on ' + config.express.ip + ':' + config.express.port)
})
