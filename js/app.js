/*---------- función que centraliza al resto de las funciones ----------*/
function loadPage() {
  loadSplashView();
  loadMainView();
  $('.login-facebook').click(providerFacebook);
  $('.login-google').click(loginGoogle);
 }

 function loadHomePage() {
   dataApi();
   $('.publicar-busqueda').click(saveSearchingPost);
   readPostSaved();
   readUserPostSaved();
 }

/*---------- Función que hace desaparecer la imagen principal ----------*/
function loadSplashView() {
  setTimeout(function() {
      $("#view-splash").fadeOut(1500);
    },3000);
};

/*---------- Función que hace aparecer la siguiente pantalla ----------*/
function loadMainView() {
    setTimeout(function() {
      $("#second-section").fadeIn(1500);
    },3000);
};

/*---------- Initialize Firebase ----------*/
var config = {
  apiKey: "AIzaSyBF3Q7Sg2rKOCriKyo6kCb20d4a7C0S-_w",
  authDomain: "ticket-hack.firebaseapp.com",
  databaseURL: "https://ticket-hack.firebaseio.com",
  projectId: "ticket-hack",
  storageBucket: "ticket-hack.appspot.com",
  messagingSenderId: "642426168856"
};

firebase.initializeApp(config);

/*---------- llamar esta función al dar click sobre el botón correspondiente ---------- */
function providerFacebook(e){
  e.preventDefault();
  var provider = new firebase.auth.FacebookAuthProvider();
  authenticationWithFacebook(provider);
}

/*---------- función que autentifica el acceso del usuario utilizando su cuenta de FB ----------*/
function authenticationWithFacebook(provider) {
  firebase.auth().signInWithPopup(provider).then(function(result) {
  var token = result.credential.accessToken;
  var user = result.user;
  // console.log(user);
  window.location.href = 'views/home.html';
  saveDataUser(user);
}).catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  var email = error.email;
  var credential = error.credential;
});
}

/*---------- autenticacion con Google ----------*/
function loginGoogle(e){
  e.preventDefault();
  var provider = new firebase.auth.GoogleAuthProvider();
  authentication(provider);
}

function authentication(provider){
  firebase.auth().signInWithPopup(provider).then(function(result) {
    var token = result.credential.accessToken;
    var user = result.user;
    console.log(user);
    window.location.href = 'views/home.html';
    saveDataUser(user);
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });
}

var database = firebase.database();

var loggedUser = localStorage.getItem('userId');

/*---------- función para almacenar al usuario en la base de datos ----------*/
function saveDataUser(user) {
  firebase.database().ref('ticket-hack-user/' + user.uid)
  .once('value').then(function(snapshot){
   var userData = snapshot.val();
   var updatedUserData = {};
     updatedUserData.uid = userData && userData.uid || user.uid;
     updatedUserData.name = userData && userData.name || user.displayName;
     updatedUserData.email = userData && userData.email || user.email;
     updatedUserData.photo = userData && userData.photo || user.photoURL;
     updatedUserData.posts = userData && userData.posts || []
   firebase.database().ref('ticket-hack-user/' + user.uid)
   .set(updatedUserData)
   localStorage.setItem('userId', user.uid);
   // console.log(localStorage.getItem('userId'));
  })

}

/*---------- función para almacenar el nuevo post del usuario logeado ----------*/
function saveSearchingPost() {
  var loggedUser = localStorage.getItem('userId');
  var newpost = {
    text: $('.searching-textarea').val(),
    timestamp: Date.now(),
    type: 'searching',
    userId: loggedUser
  }

  var newPostKey = firebase.database().ref('ticket-hack-user/' + loggedUser + '/posts/').push().key;

  var updates = {};
  updates['ticket-hack-user/' + loggedUser + '/posts/' + newPostKey] = newpost;
  updates['ticket-hack-posts/' + newPostKey] = newpost;

  return firebase.database().ref().update(updates);
}

/*---------- función para leer los post guardados en la app ----------*/
function readPostSaved() {
  var loggedUser = localStorage.getItem('userId');
  var postsRef = firebase.database().ref('ticket-hack-posts');
  postsRef.on('value', function(snapshot){

    var appPosts = snapshot.val();
      for(var key in appPosts){
        var post = appPosts[key].text;
        paintPost(post);
        // console.log(post);
      }
  })


}

function paintPost(post){
  var $tarjeta = $('<p />');
  // console.log($tarjeta);
  $tarjeta.text(post);
  $('#home-post').append($tarjeta);
}

/*---------- función para leer los post guardados del usuario loggeado ----------*/
function readUserPostSaved() {
  var loggedUser = localStorage.getItem('userId');
  // console.log(loggedUser);
  var postsRef = firebase.database().ref('ticket-hack-user/' + loggedUser + '/posts');
  postsRef.on('value', function(snapshot){

    var userPosts = snapshot.val();
    console.log(userPosts);
  })
}

/*---------- función para pintar en el html los post de busqueda en newsfeed----------*/
function paintSearchingPost(newpost){
}

function dataApi() {
    $.ajax({
        type:"GET",
        url:"https://app.ticketmaster.com/discovery/v2/events.json?countryCode=MX&apikey=PjwwXnpkUrZt7R0wCNGZli5VGDAsZmSJ" ,
        async:true,
        dataType: "json",
        success: function(json) {
          
                    //console.log(json);

                   var event = json._embedded.events
                // console.log(event);

                   for(var i=0; i < event.length; i++ ){
                    var nameEvent= event[i].name; //nombre del evento
                    var infoEvent = event[i].info; //descripcion del evento
                    var datesObject= event[i].dates;
                    var urlEvent = event[i].url; //sitio Web 
                    var adressEvent = event[i]._embedded.venues[0].name;//lugar del evento
                    var dateEvent = datesObject.start.localDate; //fecha del evento
                    var timeEvent = datesObject.start.localTime; //hora del evento
                     
                    printEvents(nameEvent, infoEvent, dateEvent, timeEvent, adressEvent,urlEvent);
                    
                   }
                 },
        error: function(xhr, status, err) {
                    // This time, we do not end up here!
                 }
      });
}

function printEvents(nameEvent,infoEvent,dateEvent,timeEvent,adressEvent,urlEvent){
  //creando elementos dimamicamnte//
  var $eventBox = $('<div/>').addClass('event col-xs-12 card');
  var $nameEventBox = $('<h4/>').addClass('name-event');
  var $imgEventBox = $('<img/>').attr({
      class:'img-event band',
      src: "../assets/images/event.jpg",
     });


  var $adressEventBox = $('<p/>').addClass('adress-event');
  var $dateEventBox = $('<span/>').addClass('date-event');
  var $space = $('<br/>')
  var $timeEventBox = $('<span/>').addClass('time-event');
  var $urlEventBox = $('<div/>').addClass('url-event');

  // Agregando texto dinamicamente

  $nameEventBox.text(nameEvent);
 
  $adressEventBox.text("Lugar:" + " " +adressEvent);
  $dateEventBox.text("Fecha:" + " " + dateEvent);
  $timeEventBox.text("Hora:" + " " + timeEvent);
  $urlEventBox.text("Mas Info:" + " " + urlEvent);

   // Agregando a contenedor

   $eventBox.append($nameEventBox);
   $eventBox.append($imgEventBox);
   $eventBox.append($adressEventBox);
   $eventBox.append($dateEventBox);
   $eventBox.append($space);
   $eventBox.append($timeEventBox);
   $eventBox.append($urlEventBox);
   $('.events-container').append($eventBox);

}

  //Función de estrellas
  var $star_rating = $('.star-rating .fa');
  var SetRatingStar = function () {
    return $star_rating.each(function () {
      if (parseInt($star_rating.siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
        return $(this).removeClass('fa-star-o').addClass('fa-star');
      } else {
        return $(this).removeClass('fa-star').addClass('fa-star-o');
      }
    });
  }; //termina función setrating
  $star_rating.on('click', function () {
    $star_rating.siblings('input.rating-value').val($(this).data('rating'));
    return SetRatingStar();
  }); 

$(document).ready(loadPage);
$(document).ready(loadHomePage);
