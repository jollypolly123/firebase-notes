let googleUser;

window.onload = event => {
  // Firebase authentication goes here.
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Console log the user to confirm they are logged in
      console.log("Logged in as: " + user.displayName);
      googleUser = user;
      getNotes(googleUser.uid);
    } else {
      // If not logged in, navigate back to login page.
      window.location = "index.html";
    }
  });
};

const getNotes = userId => {
  const notesRef = firebase.database().ref(`users/${userId}`);

  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const restoreNote = noteId => {
  const noteEdits = {
    archived: false
  };
  firebase
    .database()
    .ref(`users/${googleUser.uid}/${noteId}`)
    .update(noteEdits);
};

const deleteNote = noteId => {
  const deleteNoteModal = document.querySelector("#deleteNoteModal");
  deleteNoteModal.classList.toggle("is-active");
  document.querySelector("#deleteNoteId").value = noteId;
};

const yesDeleteNote = () => {
  const deleteNoteModal = document.querySelector("#deleteNoteModal");
  const noteId = document.querySelector("#deleteNoteId").value;
  console.log(noteId);
  firebase
    .database()
    .ref(`users/${googleUser.uid}/${noteId}`)
    .remove();
  deleteNoteModal.classList.toggle("is-active");
};

const noDeleteNote = () => {
  const deleteNoteModal = document.querySelector("#deleteNoteModal");
  deleteNoteModal.classList.toggle("is-active");
};

//Given a list of notes, render them in HTML
const renderDataAsHtml = data => {
  let cards = ``;
  for (const noteItem in data) {
    if (data[noteItem].archived) {
      const note = data[noteItem];
      cards += createCard(noteItem, note);
    }
  }
  document.querySelector("#app").innerHTML = cards;
};

// Return a note object converted into an HTML card
const createCard = (noteId, note) => {
  let colors = [
    "PaleVioletRed",
    "Salmon",
    "MediumAquaMarine",
    "PowderBlue",
    "Plum",
    "LightCoral",
    "PaleTurquoise"
  ];

  let random_color = colors[`${Math.floor(Math.random() * 7)}`];

  let classLabels = "";
  let joinedLabels = "";
  if (note.labels) {
    joinedLabels = note.labels.join(", ");
    classLabels = note.labels.join(" ");
  }
  const cardId = note.title + note.text;

  let card = ``;
  card += `<div class="column is-one-quarter">
           <div class="card ${classLabels}" id="${cardId}" style="background: ${random_color}">
             <header class="card-header">
               <p class="card-header-title">${note.title} 
               <!-- <button class="button">Delete note :(</button> -->
               </p>
             </header>
             <div class="card-content">
               <div class="content">${note.text}</div>`;

  if (note.image) {
    card += `<img src="${note.image}"/>`;
  }

  card += `<p><strong>Labels:</strong></p>
               ${joinedLabels}
               <br />
               <div class="footer-item">By <strong>${
                 googleUser.email
               }</strong> on ${formatDate(note.created)}</div>
             </div>
             
             <div class="card-footer-item">
               <a id="${noteId}" class="card-footer-item button is-link" onclick="restoreNote('${noteId}')">
                Restore
               </a>
                <a id="${noteId}" href="#" class="card-footer-item button"
                   onclick="deleteNote('${noteId}')">
                   Delete
                </a>
            </div>
               
           </div>
         </div> `;

  return card;
};

const formatDate = dateString => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function filterByLabel() {
  const findLabel = document.querySelector("#findLabel");
  const findLabelVal = "." + findLabel.value;
  const notes = document.querySelectorAll(findLabelVal);

  let cards = ``;
  for (var i = 0; i < notes.length; i++) {
    cards += '<div class="column is-one-quarter">';
    cards += notes[i].outerHTML;
    cards += "</div>";
  }

  document.querySelector("#app").innerHTML = cards;
  findLabel.value = "";
}
