(function(){
  'use strict';
  $(document).ready(function(){
    /* Todo
      * show posts
      * show users
      * style change
      PROBLEMS
      * different functions to save user and posts not the same
        - save user save posts with user id?
      * think of a better way to do this maybe on function?
    */

    $('#signIn').on('click', function(){
      signIn();
    });

    $('#signOut').on('click', function(){
      signOut();
    });

    function signIn(){
      var provider = new firebase.auth.GoogleAuthProvider();

      firebase.auth().signInWithPopup(provider);
      firebase.auth().onAuthStateChanged(function(user){
        if(user){
          var userId = firebase.auth().currentUser.uid;
          $('.post').show();
          $('#signIn').hide();
          $('#signOut').show();
          console.log('welcome '+user.displayName);
        }
      });
    }

    function signOut(){
      firebase.auth().signOut();
      $('#signIn').show();
      $('#signOut').hide();
      $('.post').hide();
    }

    function updateCounter(){
      var count = 140 - $('#message').val().length;
      $('.countdown').text(count);
    }

    updateCounter();
    $('#message').change(updateCounter);
    $('#message').keyup(updateCounter);
  });
})();
