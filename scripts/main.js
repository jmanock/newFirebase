(function(){
  'use strict';

  /*
    * redo how its saved
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
    function save(words){
      var postData ={
        message:words
      };
      var dataPosts ={

      };
      var newPostKey = firebase.database().ref().child('posts').push().key;
      var updates ={};
      updates['/posts/' + newPostKey] = postData;
      updates['/user-posts/'+newPostKey] = dataPosts;
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
      // this works calling recentPostRef
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
          console.log(userId);
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
      if(count <= 0){
        console.log('HELLO FRIEND');
      }
    }
    updateCounter();
    $('#message').change(updateCounter);
    $('#message').keyup(updateCounter);
  });
})();
