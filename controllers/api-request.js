var express = require('express');
var my_api_key = 'MreeZBU8nfEU6g8h8MBxZIJ5hyzudGud1TYU3gJ2Ase5M7RfyD';
var my_api_secret = 'Ejd0jr7oLaZChdQMDc2zZIKkw0q3rlktniwc2OqY';
var org = 'TX1318';
var app = express();
app.locals.body = "";

var petfinder = require("@petfinder/petfinder-js");
var client = new petfinder.Client({apiKey: my_api_key, secret: my_api_secret});

client.animal.search({
  organization: "TX1318",
  status: "adoptable"
})
  .then(resp => { 
    //console.log(resp);
    var temp = resp.data;
    body = temp.animals;
    console.log(body);
  })

  .catch(function (err) {
    // Handle the error
    console.log('something went wrong', err);
});
