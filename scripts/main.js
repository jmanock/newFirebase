(function(){
  'use strict';
  $(document).ready(function(){
    $('button').on('click',function(){
      var yes = $('textarea').val();
      if(yes === ''){
        console.log('there has to be something here stupid');
      }else{
        something(yes);
        $('textarea').val('');
      }

    });
    function something(words){
      var postData ={
        message:words
      };
      var newPostKey = firebase.database().ref().child('posts').push().key;
      var updates ={};
      updates['/posts/' + newPostKey] = postData;
      updates['/user-posts/'+newPostKey] = postData;
      return firebase.database().ref().update(updates);
    }
  });
})();
