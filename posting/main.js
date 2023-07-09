function textAreaSize() {
    var textArea = document.querySelector(".post");
    textArea.style.height = "auto"; // Reset the height to auto to recalculate the size
    textArea.style.height = textArea.scrollHeight + "px"; // Set the height to the scrollHeight of the content

}

// let timerInterval;
// Swal.fire({
//     title: "Loading...",
//     html: "I will close in <b></b> milliseconds.",
//     timer: 3000,
//     timerProgressBar: true,
//     didOpen: () => {
//         Swal.showLoading();
//         const b = Swal.getHtmlContainer().querySelector("b");
//         timerInterval = setInterval(() => {
//             b.textContent = Swal.getTimerLeft();
//         }, 100);
//     },
//     willClose: () => {
//         clearInterval(timerInterval);
//     },
// }).then((result) => {
//     /* Read more about handling dismissals below */
//     if (result.dismiss === Swal.DismissReason.timer) {
//         // console.log('I was closed by the timer')
//     }
// });

// const firebaseConfig = {
//     apiKey: "AIzaSyD9KXRY5-0GZLAhGdrMiMVBKuLiZ39FJ_Q",
//     authDomain: "posting-f8d23.firebaseapp.com",
//     projectId: "posting-f8d23",
//     storageBucket: "posting-f8d23.appspot.com",
//     messagingSenderId: "651573332789",
//     appId: "1:651573332789:web:93c68d33bc5c22e8041a7c",
//     measurementId: "G-R119E03BHM"
//   };

const firebaseConfig = {
    apiKey: "AIzaSyD9KXRY5-0GZLAhGdrMiMVBKuLiZ39FJ_Q",
    authDomain: "posting-f8d23.firebaseapp.com",
    projectId: "posting-f8d23",
    storageBucket: "posting-f8d23.appspot.com",
    messagingSenderId: "651573332789",
    appId: "1:651573332789:web:93c68d33bc5c22e8041a7c",
    measurementId: "G-R119E03BHM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

function createPost(event) {
    event.preventDefault();

    // get the values
    let post = document.getElementById("post")


    // Get the current timestamp
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    db.collection("post")
        .add({
            post: post.value,
            timestamp: timestamp,
        })
        .then((docRef) => {
            console.log("Document written with ID:", docRef.id);
            Swal.fire({
                icon: 'success',
                title: 'Added',
                text: 'Post Done',
                confirmButtonColor: "#0099ff"
            })
            window.location.href = "./index.html"
            renderPosts();
        })
        .catch((error) => {
            console.error("Error adding document:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could Not Post',
                confirmButtonColor: "#0099ff"
            })
        });

    post.value = ""
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById("user").innerText = user.email.slice(0, -10);
        console.log(user.email.slice(0, -10));
    } else {
        document.getElementById("user").innerText = "Unknown";
        // window.location.href = "../index.html"
        console.log("not signed in");
    }
});

function renderPosts() {
    let container = document.getElementById("postContainer");
    // console.log(container.innerHTML)
    container.innerHTML = `
        <a href="./create.html">
            <h2 class="add"><i style="{ fontSize: '0.8em!important';}" class="bi bi-pencil-fill"></i> Create a post</h2>
        </a>`; // Clear the container before rendering new posts
    db.collection("post")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerText = "No Post Found";
            } else {
                querySnapshot.forEach(function(doc) {
                    var data = doc.data();
                    let post = document.createElement("div");
                    post.className += " column renderPost";

                    let row = document.createElement("div");
                    row.className += " row";
                    post.appendChild(row);

                    let drop = document.createElement("div");
                    drop.innerHTML = `
                      <div class="dropdown">
                        <button class="drop-down" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <h2 class="bi bi-three-dots-vertical dots"></h2>
                        </button>
                        <ul class="dropdown-menu">
                          <li class="list dropdown-options" type="buttons" onclick=""><i class="bi bi-trash-fill"></i> Delete Post</li>
                          <li class="list dropdown-options" type="buttons" onclick=""><i class="bi bi-pencil-fill"></i> Edit Post</li>
                        </ul>
                      </div>`;
                    row.appendChild(drop);

                    firebase.auth().onAuthStateChanged(function(user) {
                        if (user) {
                            let nameText = user.email.slice(0, -10);
                            let name = document.createElement("h2");
                            name.innerText = nameText;
                            row.appendChild(name);
                        }
                    });

                    container.appendChild(post);
                });

            }
        })
        .catch((error) => {
            console.error("Error getting polls: ", error);
        });
}


document.addEventListener("DOMContentLoaded", async function() {
    renderPosts();
    // await countPolls()
});

// logout function

function logOut() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            console.log("Sign out successful");
            // Redirect to the sign-in page or any other desired destination
            window.location.href = "../sign_in/index.html";
        })
        .catch((error) => {
            console.log("Sign out error:", error);
        });
}

function deletePoll(pollId) {
    Swal.fire({
        title: 'Enter password',
        input: 'password',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonColor: "#252525",
        confirmButtonColor: "#252525",
        showLoaderOnConfirm: true,
        preConfirm: (max) => {
            // Perform password validation here
            if (max === '48597555') { // Replace 'your_password' with the actual password
                return db.collection('polls')
                    .doc(pollId)
                    .delete()
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted',
                            text: 'Poll has been deleted.',
                            confirmButtonColor: '#252525',
                        });
                        renderPosts();
                    })
                    .catch((error) => {
                        console.error('Error deleting poll:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error deleting poll.',
                            confirmButtonColor: '#252525',
                        });
                    });
            } else {
                Swal.showValidationMessage('Incorrect password');
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isDismissed) {
            // Handle cancel button click
        }
    });
}