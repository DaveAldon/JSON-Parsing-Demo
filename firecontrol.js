// Initialize Firebase
var config = {
  apiKey: "AIzaSyBpUYA2lX51fEKjHqkKIajJVVAY5cUIcOg",
  authDomain: "json-homework-4.firebaseapp.com",
  databaseURL: "https://json-homework-4.firebaseio.com",
  projectId: "json-homework-4",
  storageBucket: "json-homework-4.appspot.com",
  messagingSenderId: "365368634575"
};
firebase.initializeApp(config);

firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

var database = firebase.database();

function processUpload() {
  var uploadInfo = document.getElementById("upload");
  if ("files" in uploadInfo) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var jsonObj = JSON.parse (event.target.result);
      updateUserData(jsonObj);
    };

    /* file is an array and we are interested only in the first element */
    reader.readAsText(uploadInfo.files[0]);
  }
}

function updateUserData(obj) {
  for (i in obj) {
    var id = ('/users/' + obj[i].name + '/');
    firebase.database().ref(id).set({
      name: obj[i].name,
      phone: obj[i].phone,
      age : obj[i].age
    });
  }
  document.getElementById("num").innerHTML = "Inserted " + obj.length + " records into Firebase";
}
