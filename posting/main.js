let timerInterval;
Swal.fire({
    title: "Loading...",
    html: "I will close in <b></b> milliseconds.",
    timer: 3000,
    timerProgressBar: true,
    didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
        }, 100);
    },
    willClose: () => {
        clearInterval(timerInterval);
    },
}).then((result) => {
    /* Read more about handling dismissals below */
    if (result.dismiss === Swal.DismissReason.timer) {
        // console.log('I was closed by the timer')
    }
});

const firebaseConfig = {
    apiKey: "AIzaSyA93YcqOxOMeHDcoCQslObQ1FtCmRNnufY",
    authDomain: "polling-f42f3.firebaseapp.com",
    projectId: "polling-f42f3",
    storageBucket: "polling-f42f3.appspot.com",
    messagingSenderId: "29956748026",
    appId: "1:29956748026:web:f0502c192a36adc5e44f43",
    measurementId: "G-C56MRZG7DG",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

function createPoll(event) {
    event.preventDefault();

    Swal.fire({
        title: "Create Poll",
        html: `
        <column>
        <input id="swal-poll-question" class="swal2-input input-sw" placeholder="Enter your question" required>
        <button id="swal-add-option-btn" class="swal2-styled add-option" type="button">+ Add Option</button>
        <div id="swal-option-container">
          <input id="swal-option1" class="swal2-input input-sw" placeholder="Option 1" required minLength="2" maxLength="16">
          <input id="swal-option2" class="swal2-input input-sw" placeholder="Option 2" required minLength="2" maxLength="16">
        </div>
        </column>
      `,
        confirmButtonColor: "#252525",
        confirmButtonText: "Add Poll",
        showCancelButton: true,
        cancelButtonColor: "#252525",
        focusConfirm: true,
        preConfirm: () => {
            const question = document.getElementById("swal-poll-question").value;

            const optionContainer = document.getElementById("swal-option-container");
            const optionInputs = optionContainer.getElementsByTagName("input");

            const options = [];

            if (question.trim() === "" || optionInputs.length < 2) {
                Swal.showValidationMessage(
                    "Please fill in the question and at least two options"
                );
                return;
            }

            for (let i = 0; i < optionInputs.length; i++) {
                const optionValue = optionInputs[i].value.trim();
                if (optionValue !== "") {
                    options.push({ text: optionValue, votes: 0 });
                }
            }

            // Get the current timestamp
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();

            db.collection("polls")
                .add({
                    question: question,
                    options: options,
                    timestamp: timestamp,
                })
                .then((docRef) => {
                    console.log("Document written with ID:", docRef.id);
                    Swal.fire({
                        icon: 'success',
                        title: 'Added',
                        text: 'Poll Added Succesfully',
                        confirmButtonColor: "#252525"
                    })
                    renderPolls();
                })
                .catch((error) => {
                    console.error("Error adding document:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error In Adding Poll',
                        confirmButtonColor: "#252525"
                    })
                });
        },
        didOpen: () => {
            const addOptionButton = Swal.getPopup().querySelector(
                "#swal-add-option-btn"
            );
            addOptionButton.addEventListener("click", addOptionToSwal);
        },
    });
}

function addOptionToSwal() {
    const optionContainer = document.getElementById("swal-option-container");

    const optionCount = optionContainer.childElementCount + 1;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Option " + optionCount;
    input.required = true;
    input.className += " swal2-input input-sw";
    // input.min = "2"
    // input.max = "16"
    input.minLength = "2"
    input.maxLength = "16"

    optionContainer.appendChild(input);
}

function renderPolls() {
    let container = document.getElementById("vote-container");
    container.innerHTML = ""; // Clear the container before rendering new polls

    db.collection("polls")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerText = "No Polls Found";
            } else {
                querySnapshot.forEach(function(doc) {

                    // random colors
                    var data = doc.data();
                    let voteCont = document.createElement("div");
                    voteCont.className = "column border";
                    voteCont.dataset.pollId = doc.id; // Set the poll ID in the dataset

                    let voteHead = document.createElement("h3");
                    voteHead.innerText = data.question;
                    voteHead.className += " scroll"
                    voteCont.appendChild(voteHead);

                    let optCont = document.createElement("div");
                    optCont.className = "column opt-cont";

                    if (data.options && data.options.length > 0) {
                        let totalVotes = 0;

                        // Calculate the total number of votes
                        data.options.forEach(function(option) {
                            totalVotes += option.votes;
                        });

                        data.options.forEach(function(option, index) {
                            let optionElement = document.createElement("div");
                            optionElement.className += " row";
                            let percentage =
                                totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                            optionElement.innerHTML = `${option.text} (${percentage.toFixed(
                2
              )}%)`;
                            optionElement.style.width = `${percentage.toFixed(2)}%`;
                            if (optionElement.style.width !== "0%") {
                                optionElement.style.width = `${percentage.toFixed(2)}%`;
                                optionElement.style.background = "#dadada";
                                optionElement.style.color = "#252525"
                            } else {
                                optionElement.style.background = "white";
                            }
                            optionElement.style.padding = "0.5em";
                            optionElement.style.wordSpacing = "0.5em";
                            optionElement.dataset.index = index; // Set custom data attribute for referencing the option
                            optionElement.addEventListener("click", voteOnOption);
                            optCont.appendChild(optionElement);
                        });
                    } else {
                        let noOptions = document.createElement("p");
                        noOptions.innerText = "No options available";
                        optCont.appendChild(noOptions);
                    }

                    voteCont.appendChild(optCont);

                    let del = document.createElement("p")
                    del.innerHTML = `<i class="bi bi-trash-fill"></i>`
                    del.className += " right"
                    del.addEventListener('click', () => deletePoll(doc.id));
                    voteCont.appendChild(del)

                    container.appendChild(voteCont);
                });
            }
        })
        .catch((error) => {
            console.error("Error getting polls: ", error);
        });
}

function voteOnOption(event) {
    let optionIndex = event.target.dataset.index;
    let pollId = event.target.closest(".border").dataset.pollId;

    // Increment the vote count for the selected option
    db.collection("polls")
        .doc(pollId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                let pollData = doc.data();
                let options = pollData.options;
                options[optionIndex].votes++;
                return db.collection("polls").doc(pollId).update({
                    options: options,
                });
            }
        })
        .then(() => {
            console.log("Vote recorded");
            // Set a flag indicating that the user has voted on this poll
            // setVotedFlag(pollId);
            renderPolls();
        })
        .catch((error) => {
            console.error("Error voting on option: ", error);
        });
}

document.addEventListener("DOMContentLoaded", async function() {
    renderPolls();
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

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById("user").innerText = user.email.slice(0, -10);
        console.log(user.email.slice(0, -10));
    } else {
        document.getElementById("user").innerText = "Unknown";
        window.location.href = "../index.html"
        console.log("not signed in");
    }
});

function setVotedCookie() {
    document.cookie = "voted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT";
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
                        renderPolls();
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