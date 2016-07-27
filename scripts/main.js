(function(){
  'use strict';

  /*
    - show whats in fb
    - log in
    - message that its saved
  */
  $(document).ready(function(){
    $('button').on('click',function(){
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
      var newPostKey = firebase.database().ref().child('posts').push().key;
      var updates ={};
      updates['/posts/' + newPostKey] = postData;
      updates['/user-posts/'+newPostKey] = postData;
      return firebase.database().ref().update(updates);
    }

    // Function to load the content
    function load(){
      var myUserId = firebase.auth().currentUser.uid;
      var topUserPostsRef = firebase.database().ref('user-posts/'+myUserId).orderByChild('starCount');
      var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
      var userPostsRef = firebase.database().ref('user-posts/'+myUserId);
      var fetchPosts = function(postRef, sectionElement){
        postsRef.on('child_added', function(data){
          var author = data.val().author;
          var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            containerElement.insertBefore(
              createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic), containerElement.firstChild
            );
        });
      };
      fetchPosts(topUserPostRef, topUserPostsSection);
      fetchPosts(recentPostsRef, recentPostssection);
      fetchPosts(userPostsRef, userPostsSection);
    }
    load();
  });
})();
