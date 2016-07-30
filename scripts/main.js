(function(){
  'use strict';
  $(document).ready(function(){
    /* Todo
      * make users sign in to post
        - hide show when logged in
      * twitter counter √
      * show posts
      * show users
    */

    $('#signIn').on('click', function(){
      signIn();
    });

    function signIn(){
      var provider = new firebase.auth.GoogleAuthProvider();

      firebase.auth().aignInWithPopup(provider);
      firebase.auth().onAuthStateChanged(function(user){
        if(user){
          var userId = firebase.auth().currentUser.uid;
          $('.posts').show();
          $('#signIn').hide();
          $('#signOut').show();
        }
      });
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
