(function(){
  'use strict';

  /*
    - show whats in fb
    - log in
    - message that its saved
  */
  $(document).ready(function(){
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
          //This Works just need to put it on screen
          // console.log(data.val().message);
          console.log(data.val().message);
        });
      };
      // this works calling recentPostRef
      fetchPosts(recentPostsRef);
      fetchPosts(userPostsRef);
    }
    load();

    $('#signIn').on('click', function(){
      
    });
  });
})();
