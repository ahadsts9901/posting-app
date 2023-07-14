function textAreaSize() {
    var textArea = document.querySelector(".post");
    textArea.style.height = "auto"; // Reset the height to auto to recalculate the size

    // Calculate the maximum height for 5 lines
    var maxHeight = parseInt(window.getComputedStyle(textArea).lineHeight) * 16;

    // Set the height to the scrollHeight, but not exceeding the maximum height
    textArea.style.height = Math.min(textArea.scrollHeight, maxHeight) + "px";
}

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
    measurementId: "G-R119E03BHM",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

function createPost(event) {
    event.preventDefault();

    // get the values
    let post = document.getElementById("post");
    let auth = firebase.auth();
    let user = auth.currentUser;
    let userEmail = user.email;

    // Get the current timestamp
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    db.collection("post")
        .add({
            post: post.value,
            user: userEmail,
            timestamp: timestamp,
        })
        .then((docRef) => {
            console.log("Document written with ID:", docRef.id);
            Swal.fire({
                icon: "success",
                title: "Added",
                text: "Post Done",
                confirmButtonColor: "#212121",
            });
            window.location.href = "./index.html";
            renderPosts();
        })
        .catch((error) => {
            console.error("Error adding document:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could Not Post",
                confirmButtonColor: "#212121",
            });
        });

    post.value = "";
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById("createName").innerText = user.email.slice(0, -10);
        console.log(user.email.slice(0, -10));
    } else {
        window.location.href = "../index.html";
        console.log("not signed in");
    }
});

document.addEventListener("DOMContentLoaded", function() {
    renderPosts();
});

function renderPosts() {
    let container = document.getElementById("postContainer");
    container.innerHTML = "";
    db.collection("post")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerText = "No Post Found";
            } else {
                querySnapshot.forEach(function(doc) {
                    var data = doc.data();
                    var timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
                    let post = document.createElement("div");
                    post.className += " column renderPost";

                    let row = document.createElement("div");
                    row.className += "row";
                    post.appendChild(row);

                    let image = document.createElement("h2");
                    image.className += " bi bi-person-fill";
                    row.appendChild(image);

                    let drop = document.createElement("div");
                    drop.innerHTML = `
                      <div class="dropdown">
                        <button class="drop-down" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <h2 class="bi bi-three-dots-vertical dots"></h2>
                        </button>
                        <ul class="dropdown-menu">
                          <li class="list dropdown-options" type="buttons" onclick="deletePost('${doc.id}')"><i class="bi bi-trash-fill"></i> Delete Post</li>
                          <li class="list dropdown-options" type="buttons" onclick="editPost('${doc.id}')"><i class="bi bi-pencil-fill"></i> Edit Post</li>
                        </ul>
                      </div>`;
                    row.appendChild(drop);

                    let name = document.createElement("p");
                    name.innerText = data.user.slice(0, -10);
                    row.appendChild(name);

                    let time = document.createElement("p");
                    time.className += " postTime";
                    time.innerText = moment(timestamp).fromNow();
                    row.appendChild(time);

                    let text = document.createElement("p");
                    text.className += " text";
                    text.innerText = data.post;
                    post.appendChild(text);

                    let commentRow = document.createElement("div");
                    commentRow.innerHTML = `
                    <div class="dropdown hundred">
                    <button class="drop-down comment-flex" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <p class="bi bi-star" id="like" onclick="like(event)"> Like</p>
                      <p class="bi bi-chat-square-text dots hundred"> Comments</p>
                    </button>
                    <ul class="dropdown-menu commentCont">
                    <form class="commentform row" onsubmit="addComment(event,'${doc.id}')">
                    <textarea rows="3" required class="commentinput" placeholder="Enter your comment..." ></textarea>
                    <button type="submit" class="commentsubmit">+ Add</button>
                    </form>
                    </ul>
                  </div>
                    `;
                    post.appendChild(commentRow);

                    // Render comments
                    let commentsDiv = document.createElement("div");
                    commentsDiv.className = "commentsDiv";

                    db.collection("post")
                        .doc(doc.id)
                        .collection("comments")
                        .orderBy("timestamp", "desc")
                        .get()
                        .then((querySnapshot) => {
                            if (!querySnapshot.empty) {
                                querySnapshot.forEach((commentDoc) => {
                                    let commentData = commentDoc.data();
                                    let commentUser = commentData.user;
                                    let commentText = commentData.comment;

                                    let commentRow = document.createElement("div");
                                    commentRow.className = "commentRow";
                                    commentRow.innerHTML = `<p><p class="dropdown-options commentEditDel" onclick="editComment('${doc.id}', '${commentDoc.id}')"><i class="bi bi-pencil-fill"></i></p>
                                    <p class="dropdown-options commentEditDel" onclick="deleteComment('${doc.id}', '${commentDoc.id}')"><i class="bi bi-trash-fill"></i></p><strong>${commentUser.slice(0, -10)}</strong>: ${commentText}</p>`;
                                    commentsDiv.appendChild(commentRow);
                                });
                            }
                        })
                        .catch((error) => {
                            console.error("Error getting comments:", error);
                        });

                    var ul = commentRow.querySelector(".commentCont"); // Update this line
                    var li = document.createElement("li"); // Update this line
                    li.appendChild(commentsDiv);
                    ul.appendChild(li);

                    container.appendChild(post);
                });
            }
        })
        .catch((error) => {
            console.error("Error getting posts: ", error);
        });
}

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

function deletePost(postId) {
    const user = firebase.auth().currentUser;

    if (!user) {
        // User not signed in
        return;
    }

    db.collection("post")
        .doc(postId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                // Post document not found
                return;
            }

            const post = doc.data();

            if (post.user !== user.email) {
                // User is not the owner of the post
                console.log("no owner");
                Swal.fire({
                    icon: "error",
                    title: `Could'nt Delete Post`,
                    text: "You are not the owner of this post",
                    confirmButtonColor: "#212121",
                });
                return;
            }

            // User is the owner of the post, proceed with deletion
            Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#212121",
                cancelButtonColor: "#212121",
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    db.collection("post")
                        .doc(postId)
                        .delete()
                        .then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "Deleted",
                                text: "Post has been deleted.",
                                confirmButtonColor: "#212121",
                            });
                            renderPosts();
                        })
                        .catch((error) => {
                            console.error("Error deleting post:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Error deleting post.",
                                confirmButtonColor: "#212121",
                            });
                        });
                }
            });
        })
        .catch((error) => {
            console.error("Error getting post:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error getting post.",
                confirmButtonColor: "#212121",
            });
        });
}

function editPost(postId) {
    const user = firebase.auth().currentUser;

    if (!user) {
        // User not signed in
        return;
    }

    db.collection("post")
        .doc(postId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                // Post document not found
                return;
            }

            const post = doc.data();

            if (post.user !== user.email) {
                // User is not the owner of the post
                Swal.fire({
                    icon: "error",
                    title: `Could Not Edit Post`,
                    text: "You are not the owner of this post",
                    confirmButtonColor: "#212121",
                });
                return;
            }

            Swal.fire({
                title: "Edit Post",
                html: `
            <textarea required id="editPostTextarea" class="post" rows="8" oninput="textAreaSize">${post.post}</textarea>
          `,

                showCancelButton: true,
                confirmButtonColor: "#212121",
                cancelButtonColor: "#212121",
                confirmButtonText: "Save",
                cancelButtonText: "Cancel",
                preConfirm: () => {
                    const updatedPost = document
                        .getElementById("editPostTextarea")
                        .value.trim();
                    if (updatedPost.trim() === "") {
                        Swal.showValidationMessage("Please fill in the field");
                        return;
                    }
                    return updatedPost;
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedPost = result.value;

                    db.collection("post")
                        .doc(postId)
                        .update({
                            post: updatedPost,
                        })
                        .then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "Updated",
                                text: "Post has been updated.",
                                confirmButtonColor: "#212121",
                            });
                            renderPosts();
                        })
                        .catch((error) => {
                            console.error("Error updating post:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Error updating post.",
                                confirmButtonColor: "#212121",
                            });
                        });
                }
            });
        })
        .catch((error) => {
            console.error("Error getting post:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error getting post.",
                confirmButtonColor: "#212121",
            });
        });
}

function addComment(event, postId) {
    event.preventDefault();

    const commentForm = event.target;
    const commentInput = commentForm.querySelector(".commentinput");
    const comment = commentInput.value.trim();

    if (comment === "") {
        return;
    }

    const user = firebase.auth().currentUser;

    if (!user) {
        // User not signed in
        return;
    }

    const commentData = {
        comment: comment,
        user: user.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (!postId) {
        console.error("Invalid post ID");
        return;
    }

    db.collection("post")
        .doc(postId)
        .collection("comments")
        .add(commentData)
        .then((docRef) => {
            console.log("Comment added with ID:", docRef.id);
            Swal.fire({
                icon: "success",
                title: "Added",
                text: "Comment added successfully",
                confirmButtonColor: "#212121",
            });
            renderPosts();
        })
        .catch((error) => {
            console.error("Error adding comment:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not add comment",
                confirmButtonColor: "#212121",
            });
        });

    commentInput.value = "";
}

function editComment(postId, commentId) {
    const user = firebase.auth().currentUser;

    if (!user) {
        // User not signed in
        return;
    }

    db.collection("post")
        .doc(postId)
        .collection("comments")
        .doc(commentId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                // Comment document not found
                return;
            }

            const comment = doc.data();

            if (comment.user !== user.email) {
                // User is not the owner of the comment
                Swal.fire({
                    icon: "error",
                    title: "Could Not Edit Comment",
                    text: "You are not the owner of this comment",
                    confirmButtonColor: "#212121",
                });
                return;
            }

            Swal.fire({
                title: "Edit Comment",
                html: `
                    <textarea required placeholder="Write a comment" id="editCommentTextarea" class="post" rows="2">${comment.comment}</textarea>
                `,
                showCancelButton: true,
                confirmButtonColor: "#212121",
                cancelButtonColor: "#212121",
                confirmButtonText: "Save",
                cancelButtonText: "Cancel",
                preConfirm: () => {
                    const updatedComment = document.getElementById("editCommentTextarea").value.trim();
                    if (updatedComment.trim() === "") {
                        Swal.showValidationMessage("Please fill in the field");
                        return;
                    }
                    return updatedComment;
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedComment = result.value;

                    db.collection("post")
                        .doc(postId)
                        .collection("comments")
                        .doc(commentId)
                        .update({
                            comment: updatedComment,
                        })
                        .then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "Updated",
                                text: "Comment has been updated.",
                                confirmButtonColor: "#212121",
                            });
                            renderPosts();
                        })
                        .catch((error) => {
                            console.error("Error updating comment:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Error updating comment.",
                                confirmButtonColor: "#212121",
                            });
                        });
                }
            });
        })
        .catch((error) => {
            console.error("Error getting comment:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error getting comment.",
                confirmButtonColor: "#212121",
            });
        });
}

function deleteComment(postId, commentId) {
    const user = firebase.auth().currentUser;

    if (!user) {
        // User not signed in
        return;
    }

    db.collection("post")
        .doc(postId)
        .collection("comments")
        .doc(commentId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                // Comment document not found
                return;
            }

            const comment = doc.data();

            if (comment.user !== user.email) {
                // User is not the owner of the comment
                Swal.fire({
                    icon: "error",
                    title: "Could'nt Delete Comment",
                    text: "You are not the owner of this comment",
                    confirmButtonColor: "#212121",
                });
                return;
            }

            Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#212121",
                cancelButtonColor: "#212121",
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    db.collection("post")
                        .doc(postId)
                        .collection("comments")
                        .doc(commentId)
                        .delete()
                        .then(() => {
                            Swal.fire({
                                icon: "success",
                                title: "Deleted",
                                text: "Comment has been deleted.",
                                confirmButtonColor: "#212121",
                            });
                            renderPosts();
                        })
                        .catch((error) => {
                            console.error("Error deleting comment:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Error deleting comment.",
                                confirmButtonColor: "#212121",
                            });
                        });
                }
            });
        })
        .catch((error) => {
            console.error("Error getting comment:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error getting comment.",
                confirmButtonColor: "#212121",
            });
        });
}

function like(event) {
    event.preventDefault();

    if (event.target.className.includes("bi-star-fill")) {
        event.target.className = "bi bi-star";
    } else {
        event.target.className = "bi bi-star-fill";
    }
}