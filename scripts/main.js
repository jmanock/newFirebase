(function(){
  'use strict';
  $(document).ready(function(){
    /* Todo
      * show users
      * style change
      * save posts
      * save user/posts
      PROBLEMS
      * different functions to save user and posts not the same
        - save user save posts with user id?
      * think of a better way to do this maybe on function?
      BUGS
      * shows post twice if it loads to fast
      * remove doesnt work just keeps adding or deleting everything
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
          $('.showPosts').show();
          console.log('welcome '+user.displayName);
          writeUserData(user.uid, user.displayName, user.photoURL);
          startDatabaseQueried();
        }
      });
    }

    function signOut(){
      firebase.auth().signOut();
      $('#signIn').show();
      $('#signOut').hide();
      $('.post').hide();
      $('.words').remove();
      console.log('GoodBye');
    }

    function writeUserData(uid, displayName, photo){
      firebase.database().ref('users/'+uid).set({
        user:displayName,
        pic:photo
      });
    }

    function startDatabaseQueried(){
      var recentPostRef = firebase.database().ref('posts');

      var fetchPosts = function(postsRef){
        postsRef.on('child_added', function(data){
          var author = data.val().author;
          var posts = data.val().message;
          $('.showPosts').append('<li class="words">'+posts+'</li>');
        });
      };
      fetchPosts(recentPostRef);
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
