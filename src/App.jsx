import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import Home from "./components/Home";
import VisaFreeCountries from "./components/VisaFreeCountries";
import About from "./components/About";

import"./styles/NavBar.css";

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/visa-free-countries">Visa Free Countries</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/visa-free-countries" element={<VisaFreeCountries />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
