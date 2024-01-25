import { ICON_MAP } from "./icon-map.js";
import { WEATHER_BACKGROUND_MAP } from "./weather-background-map.js"

const OPEN_WEATHER_URL = "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,pressure_msl,visibility,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,winddirection_10m_dominant&current_weather=true&timeformat=unixtime";
const TOMTOM_API_KEY = "rk6L2GzAepDSd60YHXeMggwc3WwU4Y7G";

const RESULTS_WRAPPER = document.querySelector(".results");
const SEARCH_INPUT = document.getElementById("search-input");
const SEARCH_LIST = document.getElementById("list");

getWeatherCurrentLocation();

// Get the weather for the user's current location when loading the site
function getWeatherCurrentLocation(){
    if("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(function(position){
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            getWeather(lat, lon, Intl.DateTimeFormat().resolvedOptions().timeZone);
        }, function(error) {
            console.error("Error Code: " + error.code + " - " + error.message);
        });
    }else{
        console.log("Geolocation not supported by this browser.");
    }
}

// If the length of the search varies, render a new set of results
SEARCH_INPUT.addEventListener("keyup", () =>{
    let search = SEARCH_INPUT.value;
    if(search.length){
        renderResults(search);
    }else{
        SEARCH_LIST.innerText = "";
    }
});

// Render the suggested locations based on the user's search
function renderResults(search){
    SEARCH_LIST.innerText = "";

    getLocations(search, 5).then(results => {
        if(typeof results !== undefined && results.length){
            for(let i = 0; i < results.length; i++){
                let li = document.createElement("li");
                li.appendChild(document.createTextNode(results[i]));
                li.addEventListener("click", e => {
                    selectInput(results[i]);
                });
                SEARCH_LIST.appendChild(li);
            }
        }
        RESULTS_WRAPPER.style.display = "block";
    }).catch((error) => {
        console.error("Error fetching locations:" + error);
    });
}

// Get the location the user is searching for
async function getLocations(query, limit){
    let apiURL = "https://api.tomtom.com/search/2/search/" + encodeURIComponent(query) + ".json?key=" + TOMTOM_API_KEY + "&typeahead=true&limit=" + limit;
    let results = []

    let locations = await fetch(apiURL).then(resp => resp.json()).then(resp => {
        try{
            results = resp.results;
            let places = [];
            for(let result of results){
                //Is this if statement even necessary. Why don't I just make the name always the freeFormAddress?
                if("poi" in result){
                    places.push(result.poi.name);
                }else{
                    places.push(result.address.freeformAddress);
                }
            }
            return places;
        }catch (error){
            return [];
        }
    });
    return locations;
}

// Select the location the user chooses
function selectInput(location){
    SEARCH_INPUT.value = location;
    SEARCH_LIST.innerText = "";
    getLatLon(location);
}

// Get the latitude and longitude of the location
async function getLatLon(location){
    let locationInfo = await fetch("https://api.tomtom.com/search/2/search/" + encodeURIComponent(location) + "..json?key=" + TOMTOM_API_KEY + "&limit=1").then(resp => resp.json());
    let lat = locationInfo.results[0].position.lat;
    let lon = locationInfo.results[0].position.lon;
    getWeather(lat, lon, Intl.DateTimeFormat().resolvedOptions().timeZone).
    catch(e => {
        console.error(e);
        alert("Error getting weather")
    });
}

// Render the weather data from the API
async function getWeather(lat, lon, timezone){
    let weather = await fetch(OPEN_WEATHER_URL + "&latitude=" + lat + "&longitude=" + lon + "&timezone=" + timezone).then(resp => resp.json()).then(data => {
        return{
           current: parseCurrentWeather(data),
           daily: parseDailyWeather(data),
           hourly: parseHourlyWeather(data)
        };
    })
    renderWeather(weather.current, weather.daily, weather.hourly);
}

// Parse current weather data
function parseCurrentWeather(data){
    return{
        temp: data.current_weather.temperature,
        tempFeel: data.daily.apparent_temperature_max[0],
        windspeed: data.current_weather.windspeed,
        windDirection: data.current_weather.winddirection,
        precipitation: data.daily.precipitation_probability_max[0],
        weathercode: data.current_weather.weathercode,
    };
}

// Parse daily weather data for the week
function parseDailyWeather(data){
    let dailyWeathers = [];
    for(let i = 1; i < 7; i++){
        dailyWeathers[i] = {
            temp: data.daily.temperature_2m_max[i],
            tempFeel: data.daily.apparent_temperature_max[i],
            windDirection: data.daily.winddirection_10m_dominant[i],
            precipitation: data.daily.precipitation_probability_max[i],
            weathercode: data.daily.weathercode[i]
        };
    }
    return dailyWeathers;
}

// Parse hourly weather data for each day of the week
function parseHourlyWeather(data){
    let hourlyWeathers = [];
    for(let i = 0; i < 168; i++){
        hourlyWeathers[i] = {
            temp: data.hourly.temperature_2m[i],
            tempFeel: data.hourly.apparent_temperature[i],
            windspeed: data.hourly.windspeed_10m[i],
            windDirection: data.hourly.winddirection_10m[i],
            precipitation: data.hourly.precipitation_probability[i],
            pressure: data.hourly.pressure_msl[i],
            humidity: data.hourly.relativehumidity_2m[i],
            visibility: data.hourly.visibility[i],
            weathercode: data.hourly.weathercode[i],
        }
    }
    return hourlyWeathers;
}

// Render the complete weather data
function renderWeather(current, daily, hourly){
    renderCurrentWeather(current, hourly);
    renderDailyWeather(daily, hourly);
    renderHourlyWeather(hourly, 0);
}

// Render the current weather
function renderCurrentWeather(current, hourly){
    const icon = document.querySelector(".preview-icon");
    icon.src = getIconURL(current.weathercode);

    document.querySelector(".day-temp").innerText = current.temp + "°";
    document.querySelector(".day-feel").innerText = current.tempFeel + "°";

    let day = document.getElementById("day-0");
    day.addEventListener("click", () => {
        renderHourlyWeather(hourly, 0)
    })
    changeWeatherBackground(current.weathercode)
}

// Change the weather background image depending on the current weather
function changeWeatherBackground(weathercode){
    const background = document.querySelector(".weather-background");
    background.src = getWeatherBackgroundURL(weathercode);
}

// Render the weather across the week
function renderDailyWeather(daily, hourly){
    for(let i = 1; i < 7; i++){
        let dayNumber = `day-${i}`;
        let day = document.getElementById(dayNumber);
        let icon = day.querySelector(".preview-icon");
        icon.src = getIconURL(daily[i].weathercode);
        
        day.querySelector(".day-temp").innerText = daily[i].temp + "°";
        day.querySelector(".day-feel").innerText = daily[i].tempFeel + "°";

        day.addEventListener("click", () => {
            renderHourlyWeather(hourly, i)
        })
    }
}

// Render the hourly weather across each day of the week
function renderHourlyWeather(hourlyData, day){
    let hourOfTheWeek = day * 24;
    for(let i = 0; i < 24; i++){
        let hourOfTheDay = `hour-${i}`;
        let hour = document.getElementById(hourOfTheDay);
        let hourData = hourlyData[hourOfTheWeek];

        renderHourlyWeatherPreview(hour, hourData);
        renderHourlyWeatherExpandedInfo(hour, hourData);
        hourOfTheWeek++;
    }
}

// Render the preview weather information for each hour
function renderHourlyWeatherPreview(hour, hourData) {
    let icon = hour.querySelector(".hourly-weather-icon");
    icon.src = getIconURL(hourData.weathercode);
    hour.querySelector(".preview-temp").innerText = hourData.temp + "°";
    hour.querySelector(".preview-precipitation").innerText = hourData.precipitation + "%";
    hour.querySelector(".preview-wind").innerText = hourData.windspeed + " mph\n" + hourData.windDirection + "°";
}

// Render the expanded weather information for the selected hour
function renderHourlyWeatherExpandedInfo(hour, hourData) {
    hour.querySelector(".expanded-temp").innerText = "Temperature: " + hourData.temp + "°";
    hour.querySelector(".expanded-feel").innerText = "Feels like: " + hourData.tempFeel + "°";
    hour.querySelector(".expanded-precipitation").innerText = "Precipitation: " + hourData.precipitation + "%";
    hour.querySelector(".expanded-humidity").innerText = "Humidity: " + hourData.humidity + "%";
    hour.querySelector(".expanded-visibility").innerText = "Visibility: " + hourData.visibility + "%";
    hour.querySelector(".expanded-windspeed").innerText = "Wind speed: " + hourData.windspeed + " mph";
    hour.querySelector(".expanded-winddirection").innerText = "Wind direction: " + hourData.winddirection + "°";
    hour.querySelector(".expanded-pressure").innerText = "Pressure: " + hourData.pressure + " mb";
}

// Get the appropriate weather icon URL
function getIconURL(weathercode){
    return `images/icons/${ICON_MAP.get(weathercode)}.png`;
}

// Get the appropriate weather background URL
function getWeatherBackgroundURL(weathercode){
    return `images/backgrounds/${WEATHER_BACKGROUND_MAP.get(weathercode)}.png`;
}