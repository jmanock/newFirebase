(function(){
  'use strict';
  $(document).ready(function(){
    /* NOTES
      * LOGG IN BUTTON CLICK
        - writeUserData(uid, displayName, phono)
      * ONSUBMIT BUTTON CLICK
        - writeNewPost(uid, displayName, photo, text)
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
          var author = user.displayName;
          $('.post').show();
          $('#signIn').hide();
          $('#signOut').show();
          $('.showPosts').show();
          console.log('welcome '+author);
          writeUserData(user.uid, author, user.photoURL);
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

    $('#share').on('click', function(){
      share();
    });

    function share(){
      var userId = firebase.auth().currentUser.uid;
      var postText = $('textarea').val();
      firebase.database().ref('/users/'+userId).once('value').then(function(snapshot){
        var username = snapshot.val().username;
        writeNewPost(firebase.auth().currentUser.uid, firebase.auth().currentUser.displayName, firebase.auth().currentUser.photoURL, postText);

      });
    }

    function writeNewPost(uid, username, picture, body){
      var postData = {
        author:username,
        uid:uid,
        body:body,
        authorPic:picture
      };
      var newPostKey = firebase.database().ref().child('posts').push().key;
      var updates = {};
      updates['/posts/'+newPostKey] = postData;
      updates['/user-posts/'+uid+'/'+newPostKey] = postData;
      return firebase.database().ref().update(updates);
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
