import { onNavigate } from '../main.js';
import { allFunctions } from '../lib/validFunc.js';
import {
  logOut, getUser, postInFirestore, updatePost, deletePost, stateCheck, editPost,
} from '../firebaseAuth.js';

export const home = () => {
  let userEmail = getUser();
  if (userEmail !== '') {
    userEmail = userEmail.email;
  }
  const homePage = document.createElement('div');
  stateCheck(homePage);
  homePage.setAttribute('id', 'homePage');
  const htmlNodes = `<header id = "wallBanner" >
  <img id="logoWall" src="./imagenes/Imagen1.png">
  <h1 id="petFriendsWall">Pet Friends</h1>
  <img id="signOut" src= "./imagenes/exit.png"></header>
  <h2 id= "welcomeMessage">Bienvenid@ ${userEmail}</h2>
  <p id= "catchPost"></p>
  <div id="postContainer">
  <img id= "yellowDog" src="./imagenes/Güero.png">
  <button id="postInput">Cuéntanos sobre tu petFriend</button>
  </div>   
  <div id="backModal">
  <div id="modal">
  <h3 id="close">x</h3>
  <textarea id="post" placeholder = "Cuéntanos sobre tu petFriend"></textarea>
  <button id="share">Publicar</button>
  </div>
  </div>
  <div id="posts"></div>
  `;
  homePage.innerHTML = htmlNodes;

  const modal = homePage.querySelector('#backModal');
  homePage.querySelector('#signOut').addEventListener('click', () => logOut(onNavigate));

  homePage.querySelector('#postInput').addEventListener('click', () => {
    modal.style.visibility = 'visible';
    homePage.querySelector('#post').value = '';
  });

  homePage.querySelector('#close').addEventListener('click', () => {
    modal.style.visibility = 'hidden';
  });

  homePage.querySelector('#share').addEventListener('click', () => {
    modal.style.visibility = 'hidden';
    // const catchPost = homePage.querySelector('#catchPost');
    const postPublish = homePage.querySelector('#post').value;
    if (allFunctions.validPost(postPublish) === false) {
      alert('No has publicado un post aún');
    } else {
      postInFirestore(postPublish, userEmail);
    }
  });
  const postDivPublish = homePage.querySelector('#posts');

  updatePost((snapshot) => {
    postDivPublish.innerHTML = '';
    snapshot.forEach((doc) => {
      const comentId = doc.id;
      const htmlPostsPublished = `<div id= "recentPostDiv" >
          <p id="userMail">${doc.data().user}:</p>
          <p id="recentPost">${doc.data().post}</p>
          <div id= "divButtons">
          <button id= "edit" class= "btnEdit" data-id= ${comentId} >Editar</button>
          <button id= "deletes" class="btndeletes" data-id= ${comentId} > Eliminar</button>
          <div class="deleteBackModal">
          <div class="deleteModal" >
          <h2 class= "confirmText">¿Estás segur@ que deseas eliminar este post? </h2>
          <button class="si">Si</button>
          <button class="no" >No</button>
          </div>
          </div> 
          <img id="img"  class= "like" src="./imagenes/patitaGris.png">
          </div>
          </div>`;

      postDivPublish.innerHTML += htmlPostsPublished;

      const colorPaw = postDivPublish.querySelectorAll('.like');

      colorPaw.forEach((postLike) => {
        postLike.addEventListener('click', (e) => {
          if (e.target.getAttribute('src') === './imagenes/patitaGris.png') {
            postLike.setAttribute('src', './imagenes/patitaColor.png');
          } else {
            postLike.setAttribute('src', './imagenes/patitaGris.png');
          }
        });
      });
      const deletebtn = postDivPublish.querySelectorAll('.btndeletes');

      const deleteModal = postDivPublish.querySelector('.deleteBackModal');
      deletebtn.forEach((btnDelete) => {
        btnDelete.addEventListener('click', (f) => {
          deleteModal.style.visibility = 'visible';
          const confirmDelete = () => deletePost(f.target.dataset.id);
          deleteModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('si')) {
              confirmDelete();
              deleteModal.style.visibility = 'hidden';
            } else {
              deleteModal.style.visibility = 'hidden';
            }
          });
        });
      });

      const btnEdit = postDivPublish.querySelectorAll('.btnEdit');
      const postValue = homePage.querySelector('#post').value;
      btnEdit.forEach((edtPost) => {
        edtPost.addEventListener('click', (event) => {
          modal.style.visibility = 'visible';
          const id = event.target.dataset.id;
          editPost(id, postValue);
          console.log(event.target.dataset.id);
        });
      });
    });
  });

  return homePage;
};
