const now = new Date();
const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
const dayNumber = now.getDate();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthName = months[now.getMonth()];
const year = now.getFullYear()

async function getWeatherData(query) {
    const apiKey = "b5168d1b12a74713be315035250106";
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        updateUI(data);
    } catch (err) {
        console.error("Fetching error:", err);
        // document.querySelector('.main').textContent = "Data didn't fetch";
        alert("Data didn't fatch");
        return;
    }
}

// 📍 GPS Weather on load
function loadWeatherByGPS() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = `${position.coords.latitude},${position.coords.longitude}`;
            getWeatherData(coords);
        },
        () => {
            console.warn("GPS access denied.");
        }
    );
}

// 🔍 Search event listener
document.getElementById("weatherForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const location = document.getElementById("search_city").value.trim();
    if (location) {
        getWeatherData(location);
        document.getElementById("search_city").value = ""; // Clear input
    }
});

// 🛠️ UI Update logic (from your existing code)
// 3) Rewrite updateUI to branch on the toggle’s state
function updateUI(data) {
  const isCelsius = document.getElementById('toggle').classList.contains('active');
  const unit   = isCelsius ? 'C' : 'F';
  const windU  = isCelsius ? 'km/h' : 'mph';
  
  // helper to pick c/f
  const pick = (c, f) => Math.floor(isCelsius ? c : f);

  // location + date unchanged…
  document.getElementById("country").innerText = data.location.country;
  // … your dayName/dayNumber logic …
  document.querySelector('.place').innerText = `${data.location.name}, ${data.location.region}`;

  //  CURRENT TEMPS
  document.querySelector('.present_temp').innerText = `${pick(data.current.temp_c, data.current.temp_f)}°${unit}`;
  document.querySelector('.feels_like').innerText = `Feels like: ${pick(data.current.feelslike_c, data.current.feelslike_f)}°${unit}`;

  // DATE / DAY
  document.querySelector('.day').innerHTML = `${dayName}`;
  document.querySelector('.date').innerHTML = `${dayNumber + " " + monthName + " " + year}`;
  
  // HIGH / LOW
  const today = data.forecast.forecastday[0].day;
  document.querySelector('.high_temp').innerText = `High: ${pick(today.maxtemp_c, today.maxtemp_f)}°${unit}`;
  document.querySelector('.low_temp').innerText  = `Low:  ${pick(today.mintemp_c, today.mintemp_f)}°${unit}`;

  // WIND
  document.querySelector('.wind_speed').innerText = `${ pick(data.current.wind_kph, data.current.wind_mph) } ${windU}`;
  document.querySelector('.direction').innerText  = `From: ${data.current.wind_dir}`;
  const angle = data.current.wind_degree;
  document.querySelector('.degree').innerText     = `${angle}°`;
  document.getElementById("dir_svg").style.transform = `rotate(${angle}deg)`;

  // STATIC FIELDS
  document.querySelector('.pressure_meter').innerText = Math.floor(data.current.pressure_mb);
  document.querySelector('.uv').innerText            = data.current.uv;
  document.querySelector('.humidity_level').innerText = `${data.current.humidity}%`;
  document.querySelector('.sunrise').innerText        = data.forecast.forecastday[0].astro.sunrise;
  document.querySelector('.sunset').innerText         = data.forecast.forecastday[0].astro.sunset;

  // ICON
  let iconUrl = data.current.condition.icon;
  if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
  document.querySelector('.icon').src = iconUrl;
  document.querySelector('.condition').innerText = data.current.condition.text;

  // HOURLY
  const hourly     = data.forecast.forecastday[0].hour;
  const hourDivs   = document.querySelectorAll('.hour_capsule');
  hourDivs.forEach((div, i) => {
    if (!hourly[i]) return;
    const { time, temp_c, temp_f, chance_of_rain, condition } = hourly[i];
    const hr = new Date(time).getHours();
    div.innerHTML = `
      <div>${ pick(temp_c, temp_f) }°${unit}</div>
      <div>${chance_of_rain}%</div>
      <div><img src="https:${condition.icon}" width="32" height="32"></div>
      <div>${hr}:00</div>
    `;
  });

  // DAILY
  const days     = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const daily    = data.forecast.forecastday;
  const dCaps    = document.querySelectorAll('.daily_capsule');
  dCaps.forEach((div, i) => {
    if (!daily[i]) return;
    const f = daily[i];
    const dn   = days[new Date(f.date).getDay()];
    const rain = f.day.daily_chance_of_rain;
    const ma   = pick(f.day.maxtemp_c, f.day.maxtemp_f);
    const mi   = pick(f.day.mintemp_c, f.day.mintemp_f);
    div.innerHTML = `
      <div>${dn}</div>
      <div>${rain}%</div>
      <div><img src="https:${f.day.condition.icon}" width="32" height="32"></div>
      <span>${ma}°${unit}/${mi}°${unit}</span>
    `;
  });
}

// 4) On toggle click, just re-render with the opposite unit
function toggleTemp() {
  const tog = document.getElementById('toggle');
  tog.classList.toggle('active');
  if (weatherData) updateUI(weatherData);
}

// 5) Wire up events
window.addEventListener('load', loadWeatherByGPS);
document.getElementById('toggle').addEventListener('click', toggleTemp);
