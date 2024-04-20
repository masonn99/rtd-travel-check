import React, { useState, useEffect } from 'react';
import "../styles/SearchBar.css";
import data from '/data.json'; // Adjust the path based on your project structure

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const sortedCountries = data.sort((a, b) => a.country.localeCompare(b.country));
    setCountries(sortedCountries);
  }, []);

  const handleSearch = event => {
    setSearchTerm(event.target.value);
    if (event.target.value !== '') {
      const filteredCountries = data.filter(country =>
        country.country.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setCountries(filteredCountries);
    } else {
      const sortedCountries = data.sort((a, b) => a.country.localeCompare(b.country));
      setCountries(sortedCountries);
    }
  };

  return (
    <div className="wrap">
      <div className="search">
        <input
          type="text"
          className="searchTerm"
          placeholder="Which country are you travelling to?"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button type="submit" className="searchButton">
          <i className="fa fa-search"></i>
        </button>
      </div>
      <div>
        {countries.map((country, index) => (
          <div key={index}>{country.country}</div>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;