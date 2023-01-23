var currentTime = new Date();
var currentHour = currentTime.getHours();

getLocation();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

function success(position) {
    var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var apiURL = "https://api.open-meteo.com/v1/forecast?latitude="+latitude+"&longitude="+longitude+"&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone="+timeZone;
    var weatherData = new XMLHttpRequest();
    weatherData.open("GET", apiURL, true);
    weatherData.send();
    weatherData.onload = function() {
        setData(weatherData.responseText);
    }
    setLocationDisplay(latitude, longitude);
}

function error() {
    alert("Unable to retrieve your location");
}

function setData(data) {
    var weatherData = JSON.parse(data);
    console.log("weatherData: " + JSON.stringify(weatherData, null, "\t"));

    var currentTemp = celciusToFahrenheit(weatherData.current_weather.temperature);
    var currentWeatherCode = weatherData.current_weather.weathercode;
    document.getElementById("currentTempTemp").innerHTML = currentTemp + "°F";
    document.getElementById("currentTempText").innerHTML = weatherCodeToTitle(currentWeatherCode);

}

function celciusToFahrenheit(celcius) {
    return Math.round(celcius * 9/5 + 32);
}

function weatherCodeToTitle(code){
    var weatherCodes = { 0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Heavy drizzle", 56: "Light freezing drizzle", 57: "Heavy freezing drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Light freezing rain", 67: "Heavy freezing rain", 71: "Light snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains", 80: "Light rain showers", 81: "Moderate rain showers", 82: "Violent rain showers", 85: "Light snow showers", 86: "Heavy snow showers", 95: "Light thunderstorm", 96: "Moderate thunderstorm", 99: "Heavy thunderstorm"};
    return weatherCodes[code] || "";
}

async function setLocationDisplay(lat, lon){
    var locationDisplay = document.getElementById("locationDisplay");
    var xml = new XMLHttpRequest();
    xml.open("GET", "https://geocode.maps.co/reverse?lat="+lat+"&lon="+lon, true);
    xml.send();
    xml.onload = function() {
        var locationData = JSON.parse(xml.responseText);
        locationDisplay.innerHTML = locationData.address.city;
    }
}

var sun = document.getElementById("sunPath");
var moon = document.getElementById("moonPath");

