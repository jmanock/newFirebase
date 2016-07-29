(function(){
  'use strict';

  /*
    * redo how its saved
      - problem
        sending vars from two different functions to the same function wont work this way
    * get names out of fb
    * make it manditory to sign in
  */
  $(document).ready(function(){
    $('#signOut').hide();
    $('#post').on('click',function(){
      var yes = $('textarea').val();
      if(yes === ''){
        console.log('there has to be something here stupid');
      }else{
        save(yes);
        $('textarea').val('');
      }

    });
    function save(uid, username, picture, words){
      var postData ={
        message:words
      };
      // var dataPosts ={
      //   message:words,
      //   author:username,
      //   uid:uid,
      //   authorPic:picture
      // };
      var newPostKey = firebase.database().ref().child('posts').push().key;
      var updates ={};
      updates['/posts/' + newPostKey] = postData;
      //updates['/user-post'+uid+'/'+newPostKey] = dataPosts;
      console.log('username '+username+'picture '+picture+'uid '+uid+' words '+words);
      return firebase.database().ref().update(updates);
    }

    // Function to load the content
    function load(){
      var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
      var userPostsRef = firebase.database().ref('user-posts');
      var fetchPosts = function(postsRef){
        postsRef.on('child_added', function(data){
          var showSomething = data.val().message;
          $('.showSomething').append('<li>'+showSomething+'</li>');
        });
      };

      fetchPosts(recentPostsRef);
      //fetchPosts(userPostsRef);
    }
    load();

    $('#signIn').on('click', function(){
      signIn();
    });

    function signIn(){
      var provider = new firebase.auth.GoogleAuthProvider();

      firebase.auth().signInWithPopup(provider);
      firebase.auth().onAuthStateChanged(function(user){
        if(user){
          var userId = firebase.auth().currentUser.uid;
          save(user.uid, user.displayName, user.photoURL);
          $('#signIn').hide();
          $('#signOut').show();
          //console.log(user.uid, user.displayName, user.email, user.photoURL);
        }
      });
    }

    $('#signOut').on('click', function(){
      firebase.auth().signOut();
      $('#signIn').show();
      $('#signOut').hide();
    });

    function updateCounter(){
      var count = 140 - $('#message').val().length;
      $('.countdown').text(count);
    }

    updateCounter();
    $('#message').change(updateCounter);
    $('#message').keyup(updateCounter);
  });
})();
