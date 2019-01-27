var _createClass = (function () { function defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor) } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor } }())

function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

function _possibleConstructorReturn (self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called") } return call && (typeof call === 'object' || typeof call === 'function') ? call : self }

function _inherits (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass) } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass }

// components/Movie.js
// import React from 'react';
// import PropTypes from 'prop-types';

var Movie = function Movie (props) {
  var note = props.vote_average
  note = note / 2

  if (note > 4) { grade = '\u2605 \u2605 \u2605 \u2605 \u2605' }
  if (note <= 4 && note > 3) { grade = '\u2605 \u2605 \u2605 \u2605 \u2606' }
  if (note <= 3 && note > 2) { grade = '\u2605 \u2605 \u2605 \u2606 \u2606' }
  if (note <= 2 && note > 1) { grade = '\u2605 \u2605 \u2606 \u2606 \u2606' }
  if (note <= 1) { grade = '\u2605 \u2606 \u2606 \u2606 \u2606' }

  return React.createElement('div', { className: 'card h-100' },
    React.createElement('img', { src: 'https://image.tmdb.org/t/p/w185' + props.poster_path, className: 'card-img-top' }),
    React.createElement('h4', { className: 'card-body' },
      React.createElement('a', { className: 'card-title', href: 'fiche/' + props.id }, props.title)),
    React.createElement('small', { className: 'card-footer' }, grade))
}

Movie.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  poster_path: PropTypes.string,
  vote_average: PropTypes.number
}

// export default Movie;

// components/Movies.js

// import React from 'react';
// import PropTypes from 'prop-types';

// import Movie from './Movie';

var Movies = function Movies (props) {
  return React.createElement(
    'ul',
    { className: 'movies' },
    props.movies.map(function (movie) {
      return React.createElement(
        'li',
        { key: movie.id },
        React.createElement(Movie, movie)
      )
    })
  )
}

Movies.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.object)
}

// export default Movie;

// components/Search.js
// import React from 'react';
// import PropTypes from 'prop-types';

var Search = function Search (props) {
  return React.createElement(
    'form',
    { className: 'search',
      onInput: function onInput (event) {
        return props.onInput(event.target.value)
      } },
    React.createElement('input', { type: 'search', value: props.query, placeholder: props.placeholder })
  )
}

Search.propTypes = {
  query: PropTypes.string.isRequired,
  onInput: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}

// export default Search;

// components/App.js
// import React from 'react';

// import Movies from './Movies';
// import Search from './Search';

var App = (function (_React$Component) {
  _inherits(App, _React$Component)

  function App (props) {
    _classCallCheck(this, App)

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props))

    _this.state = {
      movies: [],
      query: ''
    }

    _this.onInput = _this.onInput.bind(_this)
    return _this
  }

  _createClass(App, [{
    key: 'onInput',
    value: function onInput (query) {
      this.setState({
        query: query
      })

      this.searchMovie(query)
    }
  }, {
    key: 'getPopularMovies',
    value: function getPopularMovies () {
      var _this2 = this

      var url = 'https://api.themoviedb.org/3/movie/popular?api_key=cfe422613b250f702980a3bbf9e90716&language=fr'

      fetch(url).then(function (response) {
        return response.json()
      }).then(function (data) {
        _this2.setState({
          movies: data.results
        })
      })
    }
  }, {
    key: 'searchMovie',
    value: function searchMovie (query) {
      var _this3 = this

      var url = 'https://api.themoviedb.org/3/search/movie?query=' + query + '&api_key=cfe422613b250f702980a3bbf9e90716&language=fr'

      fetch(url).then(function (response) {
        return response.json()
      }).then(function (data) {
        _this3.setState({
          movies: data.results
        })
      })
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount () {
      this.getPopularMovies()
    }
  }, {
    key: 'render',
    value: function render () {
      var _state = this.state

      var movies = _state.movies

      var query = _state.query

      var isSearched = function isSearched (query) {
        return function (item) {
          return !query || item.title.toLowerCase().includes(query.toLowerCase())
        }
      }

      return React.createElement(
        'div',
        { className: 'app' },
        React.createElement(Search, { query: query, onInput: this.onInput, placeholder: 'rechercher' }),
        React.createElement(Movies, { movies: movies.filter(isSearched(query)) })
      )
    }
  }])

  return App
}(React.Component))

ReactDOM.render(React.createElement(App, null), document.getElementById('root'))
