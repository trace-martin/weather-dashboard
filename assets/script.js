const apiKey = '9d98a835a05f7570c57fc8265a0dbc16';
const today = moment().format('L');
const searchHistoryList = [];

// Function to fetch current weather conditions
function getCurrentWeather(city) {
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function(cityWeatherResponse) {
    console.log(cityWeatherResponse);

    $("#weatherContent").css("display", "block");
    $("#cityDetail").empty();

    const { name, weather, main, wind, coord } = cityWeatherResponse;
    const iconCode = weather[0].icon;
    const iconImage = `https://openweathermap.org/img/w/${iconCode}.png`;

    const currentCity = $(`
      <h2 id="currentCity">
        ${name} ${today} <img src="${iconImage}" alt="${weather[0].description}" />
      </h2>
      <p>Temperature: ${main.temp} °F</p>
      <p>Humidity: ${main.humidity}%</p>
      <p>Wind Speed: ${wind.speed} MPH</p>
    `);

    $("#cityDetail").append(currentCity);

    const { lat, lon } = coord;
    getUVIndex(lat, lon);
    getForecast(lat, lon);
  });
}


function getUVIndex(lat, lon) {
  const uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  $.ajax({
    url: uviQueryURL,
    method: "GET",
  }).then(function(uviResponse) {
    console.log(uviResponse);

    const uvIndex = uviResponse.value;
    const uvIndexP = $(`
      <p>UV Index: 
        <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
      </p>
    `);

    $("#cityDetail").append(uvIndexP);

    // Set UV index color based on conditions
    if (uvIndex >= 0 && uvIndex <= 2) {
      $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
    } else if (uvIndex >= 3 && uvIndex <= 5) {
      $("#uvIndexColor").css("background-color", "#FFF300");
    } else if (uvIndex >= 6 && uvIndex <= 7) {
      $("#uvIndexColor").css("background-color", "#F18B00");
    } else if (uvIndex >= 8 && uvIndex <= 10) {
      $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
    } else {
      $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white");
    }
  });
}

// Function to fetch 5-day forecast
function getForecast(lat, lon) {
  const futureWeatherForcast = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

  $.ajax({
    url: futureWeatherForcast,
    method: "GET",
  }).then(function(futureForcast) {
    console.log(futureForcast);
    $("#fiveDay").empty();

    for (let i = 1; i < 6; i++) {
      const { dt, weather, temp, humidity } = futureForcast.daily[i];
      const currentDate = moment.unix(dt).format("MM/DD/YYYY");
      const iconImage = `<img src="https://openweathermap.org/img/w/${weather[0].icon}.png" alt="${weather[0].main}" />`;

      const futureForcastCard = $(`
        <div class="pl-3">
          <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;">
            <div class="card-body">
              <h5>${currentDate}</h5>
              <p>${iconImage}</p>
              <p>Temp: ${temp.day} °F</p>
              <p>Humidity: ${humidity}%</p>
            </div>
          </div>
        </div>
      `);

      $("#fiveDay").append(futureForcastCard);
    }
  });
}

// Event listener for search button
$("#searchBtn").on("click", function(event) {
  event.preventDefault();

  const city = $("#enterCity").val().trim();
  getCurrentWeather(city);
  if (!searchHistoryList.includes(city)) {
    searchHistoryList.push(city);
    const searchedCity = $(`
      <li class="list-group-item">${city}</li>
    `);
    $("#searchHistory").append(searchedCity);
  }

  localStorage.setItem("city", JSON.stringify(searchHistoryList));
  console.log(searchHistoryList);
});

// Event listener for search history
$(document).on("click", ".list-group-item", function() {
  const listCity = $(this).text();
  getCurrentWeather(listCity);
});

// Display last searched city forecast on page load
$(document).ready(function() {
  const searchHistoryArr = JSON.parse(localStorage.getItem("city"));

  if (searchHistoryArr !== null) {
    const lastSearchedIndex = searchHistoryArr.length - 1;
    const lastSearchedCity = searchHistoryArr[lastSearchedIndex];
    getCurrentWeather(lastSearchedCity);
    console.log(`Last searched city: ${lastSearchedCity}`);
  }
});