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
      {countries.map((country, index) => (
        <div
          key={index}
          className={`countryBox ${
            country.visaRequirement === "Visa not required"
              ? "visaNotRequired"
              : ""
          }`}
        >
          <h2>{country.country}</h2>
          <p>Visa Requirement: {country.visaRequirement}</p>
          <p>Maximum Stay: {country.duration}</p>
          <p>Passport must be validit at least: </p>
          <p>Notes: {country.notes}</p>
          <p>
            Source: <a href="#">link</a>
          </p>{" "}
          {/* Replace # with the actual source URL */}
        </div>
      ))}
    </div>
  );
}

export default SearchBar;