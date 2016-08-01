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
        pic:photo
      });
    }

    function startDatabaseQueried(){
      var myUserId = firebase.auth().currentUser.uid;
      var userPostsRef = firebase.database().ref('user-posts/'+myUserId);
      var recentPostsRef = firebase.database().ref('posts');

      var fetchPosts = function(postRef){
        //var somethingKewl = [];
        var author;
        postRef.on('child_added', function(data){
           author = data.val().author;
          var posts = data.val().body;

          // would like to have it user/message with out repeating the same user everytime
          $('.showUsers').append('<li>'+author+'</li>');
          $('.showPosts').append('<li>'+posts+'</li>');

            //somethingKewl.push(author);
          // var recipientsArray = somethingKewl.sort();
          // var reportRecipientsDuplicate = [];
          // for(var i = 0; i < recipientsArray.length -1; i++){
          //   if(recipientsArray[i+1] == recipientsArray[i]){
          //     reportRecipientsDuplicate.push(recipientsArray[i]);
          //   }
          //   return reportRecipientsDuplicate;
          // }
          //
          //
          // $('.showOnce').append('<li>'+ reportRecipientsDuplicate+'</li>');

        });

      };
      
      fetchPosts(recentPostsRef);

      //fetchPosts(userPostsRef);
    }



      function knew(){
        var recentPostsRef = firebase.database().ref('posts');
        var somethingKewl = [];
        recentPostsRef.on('child_added',function(data){
          var author = data.val().author;
          somethingKewl.push(author);
        });
        console.log(somethingKewl);
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
