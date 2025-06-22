const apiKey = "b5168d1b12a74713be315035250106";

function updateDate(localDateStr) {
    const dateObj = new Date(localDateStr);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();

    document.querySelector('.day').textContent = weekday;
    document.querySelector('.date').textContent = `${day} ${month}, ${year}`;
}

function updateUI(data) {
    updateDate(data.location.localtime);

    document.getElementById("country").textContent = data.location.country;
    document.querySelector('.place').textContent = `${data.location.name}, ${data.location.region}`;
    document.querySelector('.present_temp').textContent = `${Math.floor(data.current.temp_c)}°C`;
    document.querySelector('.high_temp').textContent = `High: ${Math.floor(data.forecast.forecastday[0].day.maxtemp_c)}°C`;
    document.querySelector('.low_temp').textContent = `Low: ${Math.floor(data.forecast.forecastday[0].day.mintemp_c)}°C`;

    let iconUrl = data.current.condition.icon;
    if (iconUrl.startsWith("//")) iconUrl = "https:" + iconUrl;
    document.querySelector('.icon').src = iconUrl;

    document.querySelector('.condition').textContent = data.current.condition.text;
    document.querySelector('.feels_like').textContent = `Feels like: ${Math.floor(data.current.feelslike_c)}°C`;
    document.querySelector('.sunrise').textContent = data.forecast.forecastday[0].astro.sunrise;
    document.querySelector('.sunset').textContent = data.forecast.forecastday[0].astro.sunset;
    document.querySelector('.uv').textContent = data.current.uv;
    document.querySelector('.pressure_meter').innerHTML = `${data.current.pressure_mb}`;
    document.querySelector('.wind_speed').textContent = `${data.current.wind_kph} K/h`;
    document.querySelector('.direction').textContent = `From: ${data.current.wind_dir}`;
    document.querySelector('.degree').textContent = `${data.current.wind_degree}°`;
    document.getElementById("dir_svg").style.transform = `rotate(${data.current.wind_degree}deg)`;
    document.querySelector('.humidity_level').textContent = data.current.humidity;

    const hourlyData = data.forecast.forecastday[0].hour;
    const hourlyDivs = document.querySelectorAll('.hour_capsule');
    hourlyDivs.forEach((div, index) => {
        if (index < hourlyData.length) {
            const dateTime = new Date(hourlyData[index].time);
            const hour = dateTime.getHours();
            const temp = hourlyData[index].temp_c;
            const c_o_rain = hourlyData[index].chance_of_rain;
            const img = hourlyData[index].condition.icon;
            div.innerHTML = `
                <div>${temp}°C</div>
                <div>${c_o_rain}%</div>
                <div><img src="https:${img}" width="32" height="32"></div>
                <div>${hour}:00</div>
            `;
        }
    });

    const dailyData = data.forecast.forecastday; // Ensure data is loaded properly.
        const dailyDivs = document.querySelectorAll('.daily_capsule');
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

        dailyDivs.forEach((div, index) => {
            if (index < dailyData.length) {
                const forecastItem = dailyData[index];
                const dailyDate = new Date(forecastItem.date);
                const dayName = days[dailyDate.getDay()];

                // Access properties under the "day" key
                const maxtemp = Math.floor(forecastItem.day.maxtemp_c);
                const mintemp = Math.floor(forecastItem.day.mintemp_c);
                const raining = forecastItem.day.daily_chance_of_rain;
                const image = forecastItem.day.condition.icon;

                div.innerHTML = `
            <div>${dayName}</div>
            <div>${raining}%</div>
            <div><img src="https:${image}" width="32" height="32"></div>
            <span>${maxtemp}°C/${mintemp}°C</span>
        `;
            }
        });
}

async function fetchWeather(query) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Weather data not available.");
        const data = await response.json();
        updateUI(data);
    } catch (err) {
        console.error("Weather fetch error:", err);
        alert("Could not fetch weather data");
    }
}

// Auto-fetch on load via geolocation
navigator.geolocation.getCurrentPosition(
    (position) => {
        const loc = `${position.coords.latitude},${position.coords.longitude}`;
        fetchWeather(loc);
    },
    (err) => {
        console.warn("Geolocation error:", err);
        alert("Location access denied");
        return;
    }
);

// Manual search form
document.getElementById("weatherForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const city = document.getElementById("search_city").value.trim();
    if (city) fetchWeather(city);
});
