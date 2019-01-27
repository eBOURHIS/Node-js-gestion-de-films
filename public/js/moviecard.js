
var search = ''

let baseURL = 'https://api.themoviedb.org/3/'
let configData = null
let key = 'a485789acb361bb44ec9e6a128f3d6e9'
let baseImageURL = null

function getConfig () {
  search = document.getElementById('searchText').value
  let url = ''.concat(baseURL, 'configuration?api_key=', key)
  fetch(url)
    .then((result) => {
      return result.json()
    })
    .then((data) => {
      baseImageURL = data.images.secure_base_url
      configData = data.images
      console.log('config:', data)
      console.log('config fetched')
      runSearch(search)
    })
    .catch(function (err) {
      alert(err)
    })
}
function AfficheFilm (id) {
  let url = ''.concat(baseURL, 'movie/', id, '?api_key=', key, '&language=fr')
  // fetch(url).then(result=>result.json()).then((data)=>{
  fetch(url).then(result => result.json()).then((data) => {
    str = JSON.stringify(data, null, 4)
    obj = JSON.parse(str)

    note = obj.vote_average
    note = note / 2

    if (note >= 4.25) { grade = '&#9733; &#9733; &#9733; &#9733; &#9733;' }
    if (note < 4.25 && note >= 4) { grade = '&#9733; &#9733; &#9733; &#9733; &#9734;' }
    if (note < 4 && note >= 3) { grade = '&#9733; &#9733; &#9733; &#9734; &#9734;' }
    if (note < 3 && note >= 2) { grade = '&#9733; &#9733; &#9734; &#9734; &#9734;' }
    if (note < 2) { grade = '&#9733; &#9734; &#9734; &#9734; &#9734;' }

    var img = 'https://image.tmdb.org/t/p/w185' + obj.poster_path
    var ID = obj.id
    document.getElementById('poster').src = img
    document.getElementById('bgposter').src = img
    document.getElementById('title').innerHTML = obj.title
    document.getElementById('note').innerHTML = grade
    document.getElementById('sortie').innerHTML = obj.release_date
    document.getElementById('duration').innerHTML = obj.runtime + ' minutes'
    for (var i = 0; i < obj.genres.length; i++) {
      document.getElementById('genre').innerHTML += obj.genres[i].name + ', '
      document.getElementById('inputgenre').value += obj.genres[i].name + ', '
    }

    document.getElementById('description').innerHTML = obj.overview
    // document.getElementById('sortie').innerHTML = obj.release_date;
    getCred(id)

    // document.getElementById("idTMDB").value = obj.id;
    document.getElementById('inputtitle').value = obj.title
    // document.getElementById("Image").value = img;
    document.getElementById('inputDateBegin').value = obj.release_date
    document.getElementById('inputdesc').value = obj.overview
    // document.getElementById("Duree").value = document.getElementById('duration').innerHTML;
  })
}

function getCred (id) {
  let url = ''.concat(baseURL, 'movie/', id, '/credits?api_key=', key, '&language=fr')
  // fetch(url).then(result=>result.json()).then((data)=>{
  fetch(url).then(result => result.json()).then((data) => {
    str = JSON.stringify(data, null, 4)
    obj = JSON.parse(str)
    for (var i = 0; i < 10; i++) {
      document.getElementById('actor').innerHTML += ' ' + obj.cast[i].name + ','
    }
    for (var i = 0; i < obj.crew.length; i++) {
      if (obj.crew[i].job == 'Producer') {
        document.getElementById('producer').innerHTML += ' ' + obj.crew[i].name + ','
      }

      if (obj.crew[i].job == 'Director') {
        document.getElementById('director').innerHTML += ' ' + obj.crew[i].name + ','
      }

      document.getElementById('inputreal').value = document.getElementById('director').innerHTML
      // document.getElementById("Producteur").value = document.getElementById('producer').innerHTML;
      // document.getElementById("Acteur").value = document.getElementById('actor').innerHTML;
    }
  })
}
