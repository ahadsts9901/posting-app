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

firebase.initializeApp(firebaseConfig);

function logIn(event) {
    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            //console.log("Login successful");
            Swal.fire({
                icon: 'success',
                title: 'Logged In',
                text: 'Login Successfull',
                confirmButtonColor: "#212121"
            })
            window.location.href = "../posting/index.html";
        })
        .catch((error) => {
            //console.log("Login error:", error);
            Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'Invalid email or password. Please enter correct credentials',
                    confirmButtonColor: "#212121"
                })
                // alert("Invalid email or password. Please enter correct credentials.");
        });
}