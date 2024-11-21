import SearchBar from "./components/SearchBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <div>
      <Analytics />
      <SpeedInsights />
      <div className="fixed-header">
        <Header />
        <SearchBar />
      </div>
      <Footer />
    </div>
  );
}

export default App;