// CONST API key
const apiKey = '9d98a835a05f7570c57fc8265a0dbc16'
// Declare var for search history
var searchHistory = [];
// Declare other var
var searchForm = $('#searchForm');
var searchButton = $('#searchButton');
var clearButton = $('#clearButton');
var currentWeather = $('#currentWeather');
var currentTemp = $('#currentTemperature');
var currentHumidty = $('#humidity')


searchButton.addEventListener('click', getCurrentWeather());

function getCurrentWeather(){

    var queryURL = 'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apiKey
    console.log("queryURL");
    fetch(queryURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        catPic = data[0];
        console.log("Here is the cat picture: " + catPic);
      });
      // delay is here to ensure the call to the api is complete otherwise we might set the attribute while data is empty
    await delay(500); 
  }