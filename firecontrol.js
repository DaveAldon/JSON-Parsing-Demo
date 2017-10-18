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

var userRef = firebase.database().ref('/users/');

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

userRef.orderByChild("playerScore").on("value", function(snapshot) {
  console.log(snapshot.val());
  var jsonObj = JSON.stringify(snapshot.val());
  jsonObj = JSON.parse(jsonObj);
  updateTable(jsonObj);
});

function updateTable(json) {
  tbody = document.getElementById("liveContents");
  tbody.innerHTML = "";
  for(i in json) {
    var phone = json[i].phone;
    if (phone.length == 7) {
      phone = phone.replace(/(\d{3})(\d{4})/, "$1-$2");
    }
    else if (phone.length == 10) {
      phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    tbody.innerHTML += "<tr><td>" + json[i].name + "</td>"
                    + "<td>" + phone + "</td>"
                    + "<td>" + json[i].age + "</td></tr>";
  }
}

function submitForm(form) {
  var name = document.getElementById("nameIn");
  var phone = document.getElementById("phoneIn");
  var age = document.getElementById("ageIn");

  var id = ('/users/' + name.value + '/');
  firebase.database().ref(id).set({
    name: name.value,
    phone: phone.value,
    age : age.value
  });

  name.value = "";
  phone.value = "";
  age.value = "";
  return false;
}

function search() {
  var searchTerm = document.getElementById("searchIn").value;
  userRef.orderByChild('name').startAt("\uf8ff").endAt(searchTerm).once('value')
  //userRef.orderByChild('name').startAt("[a-zA-Z0-9]*").endAt(searchTerm).once('value')
    .then((function (snapshot) {
      console.log(snapshot.val());
    }));
}
