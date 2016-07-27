(function(){
  'use strict';

  var messageForm = document.getElementById('message-form');
  var messageInput = document.getElementById('new-post-message');
  var titleInput = document.getElementById('new-post-title');
  var signInButton = document.getElementById('sign-in-button');
  var signOutButton = document.getElementById('sign-out-button');
  var splashPage = document.getElementById('page-splash');
  var addPost = document.getElementById('add-post');
  var addButton = document.getElementById('add');
  var recentPostsSection = document.getElementById('recent-posts-list');
  var userPostsSection = document.getElementById('user-posts-list');
  var topUserPostsSection = document.getElementById('top-user-posts-list');
  var recentMenuButton = document.getElementById('menu-recent');
  var myPostsMenuButton = document.getElementById('menu-my-posts');
  var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');

  function writeNewPost(uid, username, picture,title, body){
    var postData = {
      author:username,
      uid:uid,
      body:body,
      title:title,
      starCount:0,
      authorPic:picture
    };

    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/posts/'+newPostKey] = postData;
    updates['/user-posts/'+uid+'/'+newPostKey] = postData;
    return firebase.database().ref().update(updates);
  }

  function toggleStar(postRef, uid){
    postRef.transaction(function(post){
      if(post){
        if(post.stars && post.stars[uid]){
          post.starCount--;
          post.stars[uid] = null;
        }else{
          post.starCount++;
          if(!post.stars){
            post.stars = {};
          }
          post.stars[uid] = true;
        }
      }
      return post;
    });
  }

  function createPostElement(postId, title, text, author, authorId, authorPic){
    var uid = firebase.auth().currentUser.uid;

    var html =
      '<div class="post mdl-cell mdl-cell--12-col ' +
                  'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
        '<div class="mdl-card mdl-shadow--2dp">' +
          '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
            '<h4 class="mdl-card__title-text"></h4>' +
          '</div>' +
          '<div class="header">' +
            '<div>' +
              '<div class="avatar"></div>' +
              '<div class="username mdl-color-text--black"></div>' +
            '</div>' +
          '</div>' +
          '<span class="star">' +
            '<div class="not-starred material-icons">star_border</div>' +
            '<div class="starred material-icons">star</div>' +
            '<div class="star-count">0</div>' +
          '</span>' +
          '<div class="text"></div>' +
          '<div class="comments-container"></div>' +
          '<form class="add-comment" action="#">' +
            '<div class="mdl-textfield mdl-js-textfield">' +
              '<input class="mdl-textfield__input new-comment" type="text">' +
              '<label class="mdl-textfield__label">Comment...</label>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>';

      var div = document.createElement('div');
      div.innerHTML = html;
      var postElement = div.firstChild;
      componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);

      var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
      var commentInput = postElement.getELementsByClassName('new-comment')[0];
      var star = postElement.getElementsByClassName('starred')[0];
      var unStar = postElement.getElementsByClassName('not-starred')[0];

      postElement.getElementsByClassName('text')[0].innerText = text;
      postElement.getElementsByClassName('mdl0card__tile0text')[0].innerText = title;
      postElement.getElementsByClassName('username')[0].innerText = auther || 'Anonymous';
      postElement.getElementsByClassName('avatar')[0].style.backgroundImage = `url("${authorPic || './silhouette.jpg'}")`;

      var commentsRef = firebase.database().ref('post-comments/'+postId);
      commentsRef.on('child_added', function(data){
        addCommentElement(postElement, data.key, data.val().text, data.val().author);
      });

      commentsRef.on('child_changed', function(data){
        setCommentValues(postElement, data.key, data.val().text, data.val().author);
      });

      commentsRef.on('child_removed', function(data){
        deleteComment(postElement, data.key);
      });

      firebase.database().ref('posts/'+postId+'/starCount').on('value', function(snapshot){
        updateStarCount(postELment, snapshot.val());
      });

      firebase.database().ref('posts/'+postId+ '/stars/'+uid).on('value', function(snapshot){
        updateStarredByCurrentUser(postElement, snapshot.val());
      });

      addCommentForm.onsubmit = function(e){
        e.preventDefault();
        createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
        commentInput.value = '';
        commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
      };

      var onStarClicked = function(){
        var globalPostRef = firebase.database().ref('/posts/'+postId);
        var userPostRef = firebase.database().ref('/user-posts/'+authorId+'/'+postId);
        toggleStar(globalPostRef, uid);
        toggleStar(userPostRef, uid);
      };
      unStar.onclick = onStarClicked;
      star.onclick = onStarClicked;
      return postElement;
  }

  function createNewComment(postId, username, uid, text){
    firebase.database().ref('post-comments/'+postId).puch({
      text:text,
      auther:username,
      uid:uid
    });
  }

  function updateStarredByCurrentUser(postElement, starred){
    if(starred){
      postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
      postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
    }else{
      postElement.getElementsByClassName('starred')[0].style.display = 'none';
      postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
    }
  }

  function updateStarCount(postElement, nbStart){
    postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
  }

  function addCommentElement(postElement, id, text, author){
    var comment = document.createElement('div');
    comment.classList.add('comment-'+id);
    comment.innerHTML = '<span class="username"></span><span class="comment"></span>';
    comment.getElementsByClassName('comment')[0].innerText = text;
    comment.getElementsByClassName('username')[0].innerText = author || 'Anonymous';

    var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
    commentsContainer.appendChild(comment);
  }

  function setCommentValues(postElement, id, text, author){
    var comment = postElement.getElementsByClassName('comment-'+id)[0];
    comment.getElementsByClassName('comment')[0].innerText = text;
    comment.getElementsByClassName('fp-username')[0].innerText = author;
  }

  function deleteComment(postElment, id){
    var comment = postElement.getElementsByClassName('comment-'+id)[0];
    comment.parrentElement.removeChild(comment);
  }

  function startDatabasQueries(){
    var myUserId = firebase.auth().currentUser.uid;
    var topUserPostsRef = firebase.database().ref('user-posts/'+myUserId).orderByChild('starCount');
    var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    var userPostRef = firebase.database().ref('user-posts/'+myUserId);
    var fetchPosts = function(postsRef, sectionElement){
      postsRef.on('child_added', function(data){
        var author = data.val().author || 'Anonymous';
        var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
        containerElement.inserBefore(createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authPic),containerElement.firstChild);
      });
    };

    fetchPosts(topUserPostsRef, topUserPostsSection);
    fetchPosts(recentPostsRef, recentPostsSection);
    fetchPosts(userPostsRef, userPostsSection);
  }

  function writeUserData(userId, name, email, imageUrl){
    firebase.database().ref('users/'+userId).set({
      username:name,
      email:email,
      profile_picture:imageUrl
    });
    
  }

  window.addEventListener('load', function(data){
    signInButton.addEventListener('click', function(){
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    });

    signOutButton.addEventListener('click', function(){
      firebase.auth().signOut();
    });

    firebase.auth().onAuthStateChanged(function(user){
      if(user){
        splashPage.style.display = 'none';
        writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        startDatabaseQueries();
      }else{
        splashPage.style.display = '';
      }
    });

    messageForm.onsubmit = function(e){
      e.preventDefault();
      if(messageInput.value && titleInput.value){
        var postText = messageInput.value;
        messageInput.value = '';
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref('/users/'+userId).once('value').then(function(snapshot){
          var username = snapshot.val().username;
          variteNewPost(firebase.auth().currentUser.uid, firebase.auth().currentUser.displayName, firebase.auth().currentUser.photoURL, titleInput.value, postText).then(function(){
            myPostsMenuButton.click();
          });
        });
      }
    };

    recentMenuButton.onclick = function(){
      recentPostsSection.style.display = 'block';
      userPostsSection.style.display = 'none';
      topUserPostsSection.style.display = 'none';
      addPost.style.display = 'none';
      recentMenuButton.classList.add('is-active');
      myPostsMenuButton.classList.remove('is-active');
      myTopPostsMenuButton.classList.remove('is-active');
    };

    myPostsMenuButton.onclick = function(){
      recentPostsSection.style.display = 'none';
      userPostsSection.style.display = 'block';
      topUserPostsSection.style.display = 'none';
      addPost.style.display = 'none';
      recentMenuButton.classList.remove('is-active');
      myPostsMenuButton.classList.add('is-active');
      myTopPostsMenuButton.classList.remove('is-active');
    };

    myTopPostsMenuButton.onclick = function(){
      recentPostsSection.style.display = 'none';
      userPostsSection.style.display = 'none';
      topUserPostsSection.style.display = 'block';
      addPost.style.display = 'none';
      recentMenuButton.classList.remove('is-active');
      myPostsMenuButton.classList.remove('is-active');
      myTopPostsMenuButton.classList.add('is-active');
    };

    addButton.onclick = function(){
      recentPostsSection.style.display = 'none';
      userPostsSection.style.display = 'none';
      topUserPostsSection.style.display = 'none';
      addPost.style.display = 'block';
      recentMenuButton.classList.remove('is-active');
      myPostsMenuButton.classList.remove('is-active');
      myTopPostsMenuButton.classList.remove('is-active');
      messageInput.value = '';
      titleInput.value = '';
    };
    recentMenuButton.onclick();
  },false);
})();
