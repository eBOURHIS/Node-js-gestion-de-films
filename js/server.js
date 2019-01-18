const path = require('path') // gestion fichiers locaux
const express = require('express') //framework mvc
const nunjucks = require('nunjucks') // templates
const session = require('express-session') // sessions
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const config = require(path.join(__dirname, 'config.js'))

const TodoSchema = new mongoose.Schema({
  label: { type: String, required: true },
  dateBegin: { type: String },
  dateEnd: { type: String },
  priority: { type: Number, default: 5 }
})

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true)

const Todo = mongoose.model('Todo', TodoSchema)

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
    Todo.find().then(todos => {
      res.render('../views/todo.njk', {todos: todos})
    }).catch(err => {
      console.error(err)
    })
  })

router.route('/add')
  .post((req, res) => {
    new Todo({
      label: req.body.inputLabel,
      dateBegin: req.body.inputDateBegin,
      dateEnd: req.body.inputDateEnd,
      priority: req.body.inputPriority
    }).save().then(todo => {
       console.log('Votre tâche a été ajoutée');
      res.redirect('/todo')
    }).catch(err => {
      console.warn(err);
    })
  })



router.route('/delete/:id')
  .get((req, res) => {
    Todo.findByIdAndRemove({_id: req.params.id}).then(() => {
      console.log('Votre tâche est finie');
      res.redirect('/todo')
    }).catch(err => {
      console.error(err)
    })
  })


app.use('/todo', router)
app.use('/pub', express.static('public'))
app.use((req, res) => {
  res.redirect('/todo')
})

app.listen(config.express.port, config.express.ip, () => {
  console.log('Server listening on ' + config.express.ip + ':' + config.express.port)
})
