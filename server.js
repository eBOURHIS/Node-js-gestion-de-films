const path = require('path') // gestion fichiers locaux
const express = require('express') //framework mvc
const nunjucks = require('nunjucks') // templates
const session = require('express-session') // sessions
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')

const config = require(path.join(__dirname, 'config.js'))

const filmSchema = new mongoose.Schema({
  label: { type: String, required: true },
  dateBegin: { type: String },
  dateEnd: { type: String },
  priority: { type: Number, default: 5 }
})

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true)

const film = mongoose.model('film', filmSchema)
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.db)
mongoose.connection.on('error', err => {
  console.error(err)
})

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//Passport JS
app.get('/', (req, res) => res.render('auth.njk', { root : __dirname}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.render("film.njk"));
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
    res.redirect('/success?username='+req.user.username);
  });


app.use((req, res, next) => {
  next()
})

let router = express.Router()

router.route('/films')
  .get((req, res) => {
    film.find().then(films => {
      res.render('film.njk', {films: films})
    }).catch(err => {
      console.error(err)
    })
  })

router.route('/add')
  .post((req, res) => {
    new film({
      label: req.body.inputLabel,
      dateBegin: req.body.inputDateBegin,
      dateEnd: req.body.inputDateEnd,
      priority: req.body.inputPriority
    }).save().then(film => {
       console.log('Votre tâche a été ajoutée' + req);
      res.redirect('/film')
    }).catch(err => {
      console.warn(err);
    })
  })

router.route('/delete/:id')
  .get((req, res) => {
    film.findByIdAndRemove({_id: req.params.id}).then(() => {
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
