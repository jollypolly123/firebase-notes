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

const editNote = noteId => {
  const editNoteModal = document.querySelector("#editNoteModal");
  const notesRef = firebase.database().ref(`users/${googleUser.uid}`);
  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    const noteDetails = data[noteId];
    document.querySelector("#editNoteId").value = noteId;
    document.querySelector("#editTitleInput").value = noteDetails.title;
    document.querySelector("#editTextInput").value = noteDetails.text;
  });

  editNoteModal.classList.toggle("is-active");
};

const saveEditedNote = () => {
  const noteId = document.querySelector("#editNoteId").value;
  const noteTitle = document.querySelector("#editTitleInput").value;
  const noteText = document.querySelector("#editTextInput").value;
  const noteEdits = {
    title: noteTitle,
    text: noteText
  };
  firebase
    .database()
    .ref(`users/${googleUser.uid}/${noteId}`)
    .update(noteEdits);
  closeEditModal();
};

const closeEditModal = () => {
  const editNoteModal = document.querySelector("#editNoteModal");
  editNoteModal.classList.toggle("is-active");
};

const archiveNote = noteId => {
  const noteEdits = {
    archived: true
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
    if (!data[noteItem].archived) {
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
               <a id="${noteId}" class="card-footer-item button is-link" onclick="editNote('${noteId}')">
                Edit
               </a>
               <a id="${noteId}" class="card-footer-item button" onclick="archiveNote('${noteId}')">
                Archive
               </a>
                <a id="${noteId}" href="#" class="card-footer-item button is-danger"
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








function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
//   var array = [];
  
//   const notesRef = firebase.database().ref(`users/${googleUser.uid}`);
//   notesRef.on("value", snapshot => {
//     const data = snapshot.val();
//   });
  
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}
