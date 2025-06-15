// Weather App Script
const API_KEY = '168771779c71f3d64106d8a88376808a'; // Replace with your OpenWeatherMap API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
let cityNameEl, weatherDescEl, weatherEmojiEl, temperatureEl;
let windSpeedEl, humidityEl, cloudCoverEl;
let searchInput, searchBtn, locationBtn, searchCityBtn;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeElements();
    setupEventListeners();
    loadUserLocation();
});

// Initialize DOM elements
function initializeElements() {
    cityNameEl = document.querySelector('[city-name]');
    weatherDescEl = document.querySelector('[data]');
    weatherEmojiEl = document.querySelector('[emoji]');
    temperatureEl = document.querySelector('[tempareture]');

    // Get weather details elements
    const weatherDetails = document.querySelectorAll('.bg-sky-900\\/40 .text-white');
    windSpeedEl = weatherDetails[0];
    humidityEl = weatherDetails[1];
    cloudCoverEl = weatherDetails[2];

    // Get form elements
    searchInput = document.querySelector('input[type="text"]');
    searchBtn = document.querySelector('button[type="submit"], .rounded-r-xl');

    // Get navigation buttons
    const navButtons = document.querySelectorAll('.flex-1');
    locationBtn = navButtons[0];
    searchCityBtn = navButtons[1];
}

// Setup event listeners
function setupEventListeners() {
    // Search form submission
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleSearch);
    }

    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Navigation buttons
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            switchTab('location');
            loadUserLocation();
        });
    }

    if (searchCityBtn) {
        searchCityBtn.addEventListener('click', () => {
            switchTab('search');
            searchInput.focus();
        });
    }

    // Enter key in search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
            }
        });
    }
}

// Handle search form submission
function handleSearch(e) {
    e.preventDefault();

    const city = searchInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        searchInput.value = '';
    }
}

// Switch between navigation tabs
function switchTab(activeTab) {
    const buttons = document.querySelectorAll('.flex-1');

    buttons.forEach(btn => {
        btn.classList.remove('bg-sky-700', 'text-sky-100', 'shadow-inner');
        btn.classList.add('text-sky-300');
    });

    if (activeTab === 'location') {
        locationBtn.classList.add('bg-sky-700', 'text-sky-100', 'shadow-inner');
        locationBtn.classList.remove('text-sky-300');
    } else {
        searchCityBtn.classList.add('bg-sky-700', 'text-sky-100', 'shadow-inner');
        searchCityBtn.classList.remove('text-sky-300');
    }
}

// Load user's current location weather
function loadUserLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                showError('Unable to get your location. Showing default city.');
                fetchWeatherByCity('Nagpur'); // Fallback to default city
            }
        );
    } else {
        console.error('Geolocation not supported');
        showError('Geolocation not supported. Showing default city.');
        fetchWeatherByCity('Nagpur'); // Fallback to default city
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        showLoading();
        const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the city name.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateWeatherDisplay(data);
        switchTab('search');
    } catch (error) {
        console.error('Error fetching weather by city:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    }
}

// Update weather display with API data
function updateWeatherDisplay(data) {
    hideLoading();

    // Update city name
    if (cityNameEl) {
        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    }

    // Update weather description
    if (weatherDescEl) {
        weatherDescEl.textContent = data.weather[0].description.toUpperCase();
    }

    // Update temperature
    if (temperatureEl) {
        const temp = Math.round(data.main.temp);
        temperatureEl.innerHTML = `${temp}<span class="text-3xl align-top">°C</span>`;
    }

    // Update weather emoji
    if (weatherEmojiEl) {
        weatherEmojiEl.textContent = getWeatherEmoji(data.weather[0].main, data.weather[0].id);
    }

    // Update weather details
    if (windSpeedEl) {
        const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
        windSpeedEl.textContent = `${windSpeed} km/h`;
    }

    if (humidityEl) {
        humidityEl.textContent = `${data.main.humidity}%`;
    }

    if (cloudCoverEl) {
        cloudCoverEl.textContent = `${data.clouds.all}%`;
    }
}

// Get weather emoji based on weather condition
function getWeatherEmoji(main, id) {
    // Weather condition mapping
    const weatherEmojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '💨',
        'Fog': '🌫️',
        'Sand': '💨',
        'Ash': '💨',
        'Squall': '💨',
        'Tornado': '🌪️'
    };

    // Special cases based on weather ID for more precise emojis
    if (id >= 200 && id < 300) return '⛈️'; // Thunderstorm
    if (id >= 300 && id < 400) return '🌦️'; // Drizzle
    if (id >= 500 && id < 600) return '🌧️'; // Rain
    if (id >= 600 && id < 700) return '❄️'; // Snow
    if (id >= 700 && id < 800) return '🌫️'; // Atmosphere
    if (id === 800) return '☀️'; // Clear
    if (id > 800) return '☁️'; // Clouds

    return weatherEmojis[main] || '🌤️';
}

// Show loading state
function showLoading() {
    if (temperatureEl) {
        temperatureEl.innerHTML = '<span class="text-2xl">Loading...</span>';
    }
    if (cityNameEl) {
        cityNameEl.textContent = 'Loading...';
    }
}

// Hide loading state
function hideLoading() {
    // Loading state is automatically hidden when updateWeatherDisplay is called
}

// Show error message
function showError(message) {
    hideLoading();

    if (cityNameEl) {
        cityNameEl.textContent = 'Error';
    }

    if (weatherDescEl) {
        weatherDescEl.textContent = message.toUpperCase();
    }

    if (temperatureEl) {
        temperatureEl.innerHTML = '--<span class="text-3xl align-top">°C</span>';
    }

    if (weatherEmojiEl) {
        weatherEmojiEl.textContent = '❌';
    }

    // Reset weather details
    if (windSpeedEl) windSpeedEl.textContent = '--';
    if (humidityEl) humidityEl.textContent = '--';
    if (cloudCoverEl) cloudCoverEl.textContent = '--';

    // Show error for 3 seconds, then try to load default city
    setTimeout(() => {
        fetchWeatherByCity('Nagpur');
    }, 3000);
}

// Utility function to capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

// Handle network errors and API key validation
function validateApiKey() {
    if (API_KEY === 'your_openweathermap_api_key_here') {
        console.warn('⚠️ Please replace the API_KEY with your actual OpenWeatherMap API key');
        showError('API key not configured. Please add your OpenWeatherMap API key.');
        return false;
    }
    return true;
}

// Initialize API key validation
document.addEventListener('DOMContentLoaded', () => {
    if (!validateApiKey()) {
        // Show demo data if no API key
        showDemoData();
    }
});

// // Show demo data when API key is not configured
// function showDemoData() {
//     const demoData = {
//         name: 'Nagpur',
//         sys: { country: 'IN' },
//         weather: [{
//             main: 'Clouds',
//             description: 'broken clouds',
//             id: 803
//         }],
//         main: {
//             temp: 27,
//             humidity: 64
//         },
//         wind: { speed: 1.39 }, // m/s
//         clouds: { all: 40 }
//     };

//     setTimeout(() => {
//         updateWeatherDisplay(demoData);
//     }, 1000);
// }

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getWeatherEmoji,
        capitalizeWords,
        updateWeatherDisplay
    };
}