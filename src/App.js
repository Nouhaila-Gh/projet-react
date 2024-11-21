import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import { Oval } from 'react-loader-spinner';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    error: false,
  });
  const [favorites, setFavorites] = useState([]);
  const [theme, setTheme] = useState('day');

  const toDateFunction = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDate = new Date();
    const date =`${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      fetchWeatherData(input);
    }
  };

  const fetchWeatherData = async (query) => {
    setWeather({ ...weather, loading: true });
    const url = 'https://api.openweathermap.org/data/2.5/forecast';
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

    await axios
      .get(url, {
        params: {
          q: query,
          units: 'metric',
          appid: api_key,
        },
      })
      .then((res) => {
        setWeather({ data: res.data, loading: false, error: false });
        updateTheme(res.data.city.timezone); // Update theme based on timezone
      })
      .catch(() => {
        setWeather({ ...weather, data: {}, error: true });
        setInput('');
      });
  };

  const updateTheme = (timezone) => {
    const localTime = new Date(new Date().getTime() + timezone * 1000);
    const hour = localTime.getUTCHours();
    setTheme(hour >= 6 && hour <= 18 ? 'day' : 'night');
  };

  const addToFavorites = () => {
    if (input && !favorites.includes(input)) {
      const updatedFavorites = [...favorites, input];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  const loadFavorites = () => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  };

  const loadFavoriteWeather = (city) => {
    setInput(city);
    fetchWeatherData(city);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = 'https://api.openweathermap.org/data/2.5/forecast';
        const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

        setWeather({ ...weather, loading: true });
        await axios
          .get(url, {
            params: {
              lat: latitude,
              lon: longitude,
              units: 'metric',
              appid: api_key,
            },
          })
          .then((res) => {
            setWeather({ data: res.data, loading: false, error: false });
            updateTheme(res.data.city.timezone); // Update theme based on timezone
          })
          .catch(() => {
            setWeather({ ...weather, data: {}, error: true });
          });
      });
    } else {
      alert('La géolocalisation n’est pas prise en charge par votre navigateur.');
    }
  };

  useEffect(() => {
    loadFavorites();                                                       
    getUserLocation(); // Detect user location on component mount
  }, []);

  return (
    <div className={`App ${theme}`}>
      <h1 className="app-name">Application Météo grp204</h1>
      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
        <button onClick={addToFavorites}>Ajouter aux favoris</button>
      </div>
      {weather.loading && <Oval type="Oval" color="black" height={100} width={100} />}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}
      {weather && weather.data && weather.data.list && (
        <div className="forecast">
          {weather.data.list.slice(0, 5).map((day, index) => (
            <div key={index} className="forecast-card">
              <span>{new Date(day.dt * 1000).toLocaleDateString()}</span>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt={day.weather[0].description}
              />
              <p>{Math.round(day.main.temp)}°C</p>
              <p>Vitesse du vent : {day.wind.speed} m/s</p>
            </div>
          ))}
        </div>
      )}
      <div className="favorites">
        <h2>Villes Favorites</h2>
        <ul>
          {favorites.map((city, index) => (
            <li key={index} onClick={() => loadFavoriteWeather(city)}>
              {city}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Grp204WeatherApp;
