var currentTime = new Date();
var secondsSinceMidnight = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
var sunriseTime = 25;
var sunsetTime = 75;

function getSunGradient(){
    var day = [12,101,255];
    var night = [24,5,55];
    var sun = [193,132,53];
    var sunTime = 3
    var sunGradient = {};
    sunGradient[0] = night;
    sunGradient[sunriseTime - sunTime] = night;
    sunGradient[sunriseTime] = sun;
    sunGradient[sunriseTime + sunTime] = day;
    sunGradient[50] = day;
    sunGradient[sunsetTime - sunTime] = day;
    sunGradient[sunsetTime] = sun;
    sunGradient[sunsetTime + sunTime] = night;
    sunGradient[100] = night;
}

var aaa = 0;
animate();
async function animate() {
    var currentTime = new Date();
    // var secondsSinceMidnight = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
    // var timeNormalized = secondsSinceMidnight / 86400;
    var timeNormalized = aaa / 1000;
    aaa += 1;
    var currentColor = evaluateGradient(getSunGradient(), timeNormalized);
    document.body.style.backgroundColor = colorToString(currentColor);
    requestAnimationFrame(animate);
}

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
    var apiURL = "https://api.open-meteo.com/v1/forecast?latitude="+latitude+"&longitude="+longitude+"&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timezone="+timeZone;
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

    sunriseTime = weatherData.daily[0].sunrise;
    console.log("sunriseTime: " + sunriseTime);
    sunsetTime = weatherData.daily[0].sunset;

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



function evaluateGradient(g, t) {
    t = clamp(t*100, 0, 100);
    var keys = Object.keys(g);
    var lowerKey = 0;
    var upperKey = 0;
    for (var i = 0; i < keys.length; i++) {
        if (t < keys[i]) {
            upperKey = keys[i];
            break;
        }
        lowerKey = keys[i];
    }
    var lowerColor = g[lowerKey];
    var upperColor = g[upperKey];
    var tNormalized = (t - lowerKey) / (upperKey - lowerKey);
    return interpolateColor(lowerColor, upperColor, tNormalized);
}
function colorToString(c) {return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";}
function interpolateColor(c1, c2, t) {return [Math.floor(lerp(c1[0], c2[0], t)),Math.floor(lerp(c1[1], c2[1], t)),Math.floor(lerp(c1[2], c2[2], t))]}
function lerp(a, b, t) {return a + (b - a) * clamp(t, 0, 1);}
function clamp(v, min, max) {return Math.min(Math.max(v, min), max);}