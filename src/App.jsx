import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import CountryExperience from './components/CountryExperience';
import Header from "./components/Header";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Analytics />
      <SpeedInsights />
      <SEO />
      <Header />
      <main className="pt-2 sm:pt-4 pb-20 sm:pb-16 flex-grow"> {/* Add padding to account for fixed header and footer */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <Router>
            <Routes>
              <Route path="/" element={<SearchBar />} />
              <Route path="/country/:countryName" element={<CountryExperience />} />
            </Routes>
          </Router>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
