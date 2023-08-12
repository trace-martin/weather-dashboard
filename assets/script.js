const APIKey = "9d98a835a05f7570c57fc8265a0dbc16";

const elements = {
    city: document.getElementById("enterCity"),
    search: document.getElementById("searchButton"),
    clear: document.getElementById("clearHistory"),
    name: document.getElementById("cityName"),
    currentPic: document.getElementById("currentPic"),
    currentTemp: document.getElementById("temperature"),
    currentHumidity: document.getElementById("humidity"),
    currentWind: document.getElementById("windSpeed"),
    currentUV: document.getElementById("UVindex"),
    history: document.getElementById("history"),
    fiveday: document.getElementById("fivedayHeader"),
    todayweather: document.getElementById("todayWeather"),
    forecast: document.querySelectorAll(".forecast")
};

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

function degreeChange(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}

function setUVBadge(value) {
    const badgeClass = value < 4 ? "badge-success" :
                      value < 8 ? "badge-warning" : "badge-danger";
    const span = document.createElement("span");
    span.classList.add("badge", badgeClass);
    span.innerText = value;
    return span;
}

function displayWeatherData(data) {
    const date = new Date(data.dt * 1000);
    elements.name.innerHTML = `${data.name} (${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`;
    elements.currentPic.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    elements.currentPic.alt = data.weather[0].description;
    elements.currentTemp.innerHTML = `Temperature: ${degreeChange(data.main.temp)} &#176F`;
    elements.currentHumidity.innerHTML = `Humidity: ${data.main.humidity}%`;
    elements.currentWind.innerHTML = `Wind Speed: ${data.wind.speed} MPH`;
    elements.todayweather.classList.remove("d-none");
}

function getUVIndex(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&cnt=1`;
    return axios.get(url).then(response => {
        const uvBadge = setUVBadge(response.data[0].value);
        elements.currentUV.innerHTML = "UV Index: ";
        elements.currentUV.appendChild(uvBadge);
    });
}

function getForecast(cityID) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${APIKey}`;
    return axios.get(url).then(response => {
        elements.fiveday.classList.remove("d-none");
        const forecastData = response.data.list;
        
        elements.forecast.forEach((forecastEl, index) => {
            const forecastIndex = index * 8 + 4;
            const data = forecastData[forecastIndex];
            const date = new Date(data.dt * 1000);

            forecastEl.innerHTML = `
                <p class="mt-2 mb-1 forecastDate">${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}</p>
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                <p>Temp: ${degreeChange(data.main.temp)} &#176F</p>
                <p>Humidity: ${data.main.humidity}%</p>
            `;
        });
    });
}

function getWeather(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;
    axios.get(url).then(response => {
        displayWeatherData(response.data);
        getUVIndex(response.data.coord.lat, response.data.coord.lon);
        return response.data.id;
    }).then(cityID => {
        getForecast(cityID);
    });
}

elements.search.addEventListener("click", () => {
    const searchTerm = elements.city.value;
    getWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    displayHistory();
});

elements.clear.addEventListener("click", () => {
    localStorage.clear();
    searchHistory = [];
    displayHistory();
});

function displayHistory() {
    elements.history.innerHTML = "";
    for (let term of searchHistory) {
        const item = document.createElement("input");
        item.type = "text";
        item.readOnly = true;
        item.classList.add("formControl", "d-block", "bg-light");
        item.value = term;
        item.addEventListener("click", () => getWeather(item.value));
        elements.history.appendChild(item);
    }
}

displayHistory();
if (searchHistory.length) {
    getWeather(searchHistory[searchHistory.length - 1]);
}