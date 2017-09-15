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

  //   function to return the next train in hours and minutes lefts////////////
  function nexttrain(starttime, frecuency) {
      var dt = new Date();
      // console.log("Present Time: " + dt);
      /////////////////////////////////////////////////////////////
      var star = starttime;
      console.log(star);
      var x = parseInt(frecuency); //minutes interval
      console.log(x);
      var tt = parseInt(star.slice(0, 2)) * 60; // take the hour portion and make it integer
      tt = tt + parseInt(star.slice(-2)); //take the minutes portion and add it
      var ap = [' AM', ' PM']; // AM-PM
      var curtime = dt.getHours() * 60 + dt.getMinutes(); // this math make the current time and conver to minutes 
      // loop and find the next closer time//
      for (var i = 0; tt < 24 * 60;) {
          if (tt > curtime) {
              console.log(tt);
              var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
              var mm = (tt % 60); // getting minutes of the hour in 0-55 format
              times2 = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ap[Math.floor(hh / 12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
              var min_away = tt - curtime;
              break;
          }
          tt = tt + x;
      }
      console.log(min_away);
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
              var next_hour = nexttrain(caltime, child.val().duration);
              next_hour = "<td>" + next_hour[0] + "</td>";
              var min_left = "<td>" + next_hour[1] + "</td>";
              console.log(next_hour[1]);
              var final = child_train + child_destination + child_time + next_hour + min_left; //Combining all Cells
              var table_print = $("<tr>"); //buiding the response insede "tbody" tag
              table_print.append(final);
              $("tbody").append(table_print);
          })
      })
      //   ************************END OF WRITING INTO TABLE FUNCION**************************


  $("#sent").on("click", function(event) {
      event.preventDefault();
      // Colecting data from the Form
      name = $("#train_name").val().trim();
      destination = $("#destination").val().trim();
      time = $("#time").val().trim();
      duration = $("#duration").val().trim();
      writeUserData(name, destination, time, duration); //this would send into the database
      //   Empty the form
      $("#train_name").val('');
      $("#destination").val('');
      $("#time").val('');
      $("#duration").val('');
  })