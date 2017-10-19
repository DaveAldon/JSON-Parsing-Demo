// Firebase and json interactiion - David Crawford

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

// For storing local keys to be used in searching
var masterNames = [];
// Global path to the records location on firebase
var userRef = firebase.database().ref('/users/');

// Sign in without credentials to the app
firebase.auth().signInAnonymously().catch(function(error) {
  alert(error.code + error.message);
});

// Processes the json file provided by the user
function processUpload() {
  var uploadInfo = document.getElementById("upload");
  if ("files" in uploadInfo) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var jsonObj = JSON.parse (event.target.result);
      updateUserData(jsonObj);
    };
    // file is an array and we are interested only in the first element
    reader.readAsText(uploadInfo.files[0]);
  }
}

// Passes a json object to firebase, replacing its contents with the new ones
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

// Listener for changes to the user path
userRef.orderByChild("name").on("value", function(snapshot) {
  var jsonObj = JSON.stringify(snapshot.val());
  jsonObj = JSON.parse(jsonObj);
  // Clear the master list to avoid duplicates, we'd use a hashtable but we're cutting
  // down on dependencies
  masterNames = [];
  // Add the names to the list so that we can search for them later
  for (i in jsonObj) {
    masterNames.push(jsonObj[i].name);
  }
  var table = document.getElementById("liveContents");
  table.innerHTML = "";
  updateTable(jsonObj, table);
});

// Receives a json object and updates a passed element's table with formatting
function updateTable(json, tbody) {
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

// Passes user input into firebase for manual data entry
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
  // We reset the values because the form doesn't reload the page
  name.value = "";
  phone.value = "";
  age.value = "";
  // Passed to the form, stops it from reloading while letting us use native HTML validation
  return false;
}

// Searches the master list for anything that contains the inputted string.
// Anything it finds it asks for the full json from firebase.
// The reason for using local arrays for searching is because firebase does not support
// partial string matching without external dependancies or server logic.
function search() {
  // We want lowercase in order to support insensitive case matching
  var searchTerm = document.getElementById("searchIn").value.toLowerCase();
  var table = document.getElementById("liveSearch");
  // Our standard resets
  table.innerHTML = "";
  var results = [];

  // Gets lowercase values from the master list and checks if it contains what we provide
  for (i in masterNames) {
    if (masterNames[i].toLowerCase().indexOf(searchTerm) != -1) {
      // Push successful match to a match array
      results.push(masterNames[i]);
    }
  }
  // Runs through each value in match array and asks for the full corresponding json from firebase
  for (i in results) {
    firebase.database().ref('/users/' + results[i]).once('value', function(snapshot) {
      // We don't need to add the key, but it lets us use only one updateTable() function, which is cleaner
      var json = '{\"' + snapshot.key + '\":' + JSON.stringify(snapshot) + '}';
      json = JSON.parse(json);
      updateTable(json, table);
    });
  }
}

// Prompts the user to remove all records under the given reference
function clearDB() {
  if (confirm("Are you sure you want to erase the contents of the database? This cannot be undone.") == true) {
    userRef.remove();
  }
}
