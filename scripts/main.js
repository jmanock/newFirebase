(function(){
  'use strict';
  $(document).ready(function(){
    /* FUCKS
      * Not sure why it adds everything twice or more
        - lets try to put a wait on the load
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
    }
    firebase.auth().onAuthStateChanged(function(user){
        var userId = firebase.auth().currentUser.uid;
        var author = user.displayName;
        $('.post').show();
        $('#signIn').hide();
        $('#signOut').show();
        $('.showPosts').show();
        console.log('welcome '+author);
        writeUserData(user.uid, author, user.photoURL);
        startDatabaseQueried();

    });

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
        pic:photo,
        uid:uid
      });
    }

    function startDatabaseQueried(){
      var myUserId = firebase.auth().currentUser.uid;
      var userPostsRef = firebase.database().ref('user-posts/'+myUserId);
      var recentPostsRef = firebase.database().ref('posts');

      var fetchPosts = function(postRef){

        postRef.on('child_added', function(data){
          var author = data.val().author;
          var posts = data.val().body;

          // would like to have it user/message with out repeating the same user everytime
          $('.showUsers').append('<li>'+author+'</li>');
          $('.showPosts').append('<li>'+posts+'</li>');

        });

      };

      //fetchPosts(recentPostsRef);
      fetchPosts(userPostsRef);

    }

    firebase.database().ref('users/').on('child_added', function(snapshot){
      var something = [];
      something.push(snapshot.val().uid);
      for(var i = 0; i<something.length; i++){
        sucks(something[i]);
        // Maybe ill send the id and names from here
      }
    });

    function sucks(x){
      firebase.database().ref('user-posts/'+x).on('child_added', function(snapshot){
        console.log(snapshot.val().body, snapshot.val().author);
        // this works but still need it to be user --> post, post user --> post, post
        // not user --> post user --> post
        // Whats happening is I am skipping the uid and going striagth to posts
      });
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
