  // Initialize Firebase
  var config = {
      apiKey: "AIzaSyAnkFw1BGwXBwhftNmGU3Onu70lAjExGTQ",
      authDomain: "train-ea4eb.firebaseapp.com",
      databaseURL: "https://train-ea4eb.firebaseio.com",
      projectId: "train-ea4eb",
      storageBucket: "train-ea4eb.appspot.com",
      messagingSenderId: "853899437848"
  };
  firebase.initializeApp(config);
  // Database Variable
  var database = firebase.database();
  var trainId = 0;
  var name = "";
  var destination = "";
  var time = 0;
  var duration = "";
  var times2 = "";
  var min_away = 0;
  var dt = new Date();
  var key = "";

  $(document).ready(function() {
      $("#delete").hide(); // This action will hide the delete button from the beginning
      // function to add values to database 'train child'
      function writeUserData(name, destination, time, duration) {
          database.ref('train/').push({
              train_name: name,
              destination: destination,
              time: time,
              duration: duration,
          });
      }
      // /////////////////////////////////////////////////////////
      // Function to update values on database 'train clild'
      function updateUserData(name, destination, time, duration, key) {
          database.ref('train/' + key).set({
              train_name: name,
              destination: destination,
              time: time,
              duration: duration,
          });
      }
      //////////////////////////////////////////////////////////////
      function emptyform() {
          //   Empty the form
          $("#train_name").val('');
          $("#destination").val('');
          $("#time").val('');
          $("#duration").val('');
          $("#delete").hide();
          $("#sent").text("Submit");

      }

      //   function to return the next train in hours and minutes lefts////////////
      function nexttrain(starttime, frecuency) {
          var dt = new Date();
          // console.log("Present Time: " + dt);
          /////////////////////////////////////////////////////////////
          var star = starttime;
          var x = parseInt(frecuency); //minutes interval
          var tt = parseInt(star.slice(0, 2)) * 60; // take the hour portion and make it integer
          tt = tt + parseInt(star.slice(-2)); //take the minutes portion and add it
          var ap = [' AM', ' PM']; // AM-PM
          var curtime = dt.getHours() * 60 + dt.getMinutes(); // this math make the current time and conver to minutes 
          // loop and find the next closer time//
          for (var i = 0; tt < 24 * 60;) {
              if (tt > curtime) {
                  var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
                  var mm = (tt % 60); // getting minutes of the hour in 0-55 format
                  times2 = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ap[Math.floor(hh / 12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
                  var min_away = tt - curtime;
                  break;
              }
              tt = tt + x;
          }
          return [times2, min_away];
      }
      // Retrive data from the Database for print out on the table
      database.ref('train/').on("value", function(snapshot) {
              //this action will prevento to have duplicate listing. Important
              $("tbody").empty();
              //   Creating of the loop to evaluate the opject snapshot
              snapshot.forEach(function(child) {
                  var childkey = child.key;

                  var child_train = "<td>" + child.val().train_name + "</td>";
                  var child_destination = "<td>" + child.val().destination + "</td>";
                  var child_time = "<td>" + child.val().duration + "</td>";
                  var caltime = child.val().time; // pulling from database the starting time
                  var next_hour = nexttrain(caltime, child.val().duration); //would add the next train using the nextrain fuction
                  next_hour2 = "<td>" + next_hour[0] + "</td>"; //add the firts return "time "
                  var min_left = "<td>" + next_hour[1] + "</td>"; // add the second return "minutes left"
                  if (next_hour[1] > 30) {
                      icon = '<td><i class="fa fa-train" aria-hidden="true" id="train_detail"></i></td>';
                  } else if (next_hour[1] > 5) {
                      icon = '<td><i class="fa fa-train yellow" aria-hidden="true" id="train_detail"></i></td>';
                  } else {
                      icon = '<td><i class="fa fa-train red" aria-hidden="true" id="train_detail"></i></td>';
                  }
                  var final = icon + child_train + child_destination + child_time + next_hour2 + min_left; //Combining all Cells
                  var table_print = $("<tr>"); //buiding the response insede "tbody" tag
                  table_print.append(final);
                  table_print.attr("data-key", childkey);
                  table_print.addClass("train-detail");
                  $("tbody").append(table_print);
              })
          })
          //   ************************END OF WRITING INTO TABLE FUNCION**************************
          // Function to update the train details
      $("#train_details").on("click", "tr", function(event) { //On table important to pull firts the table id, and them the tag
          key = ($(this).attr("data-key")); //collect the key from the DOM attibute data-key
          database.ref('train/' + key).on("value", function(snapshot) { //start pulling the information
              if (snapshot.val() !== null) {
                  $("#train_name").val(snapshot.val().train_name);
                  $("#destination").val(snapshot.val().destination);
                  $("#time").val(snapshot.val().time);
                  $("#duration").val(snapshot.val().duration);
                  $("#sent").text("Update");
                  $("#sent").attr("data-status", "mod_on"); // change the status of the data-status atributte
                  $("#delete").show(); // show the button to delete
              }
          })
      })

      //Add or Update action button 
      $("#sent").on("click", function(event) {
          event.preventDefault();
          var mod_status = $(this).attr("data-status")
              // Colecting data from the Form
          name = $("#train_name").val().trim();
          destination = $("#destination").val().trim();
          time = $("#time").val().trim();
          duration = $("#duration").val().trim();
          if (mod_status == "mod_off") { //evaluate the status of the data-status attribute
              writeUserData(name, destination, time, duration); //this would send into the database
          } else {
              updateUserData(name, destination, time, duration, key);
          }
          emptyform();
      })
      $("#delete").on("click", function(event) {
          event.preventDefault();
          database.ref('train/' + key).remove()
              .then(function() {
                  console.log("Remove succeeded.")
              })
              .catch(function(error) {
                  console.log("Remove failed: " + error.message)
              });
          emptyform();
      })
  })