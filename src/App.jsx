import SearchBar from "./components/SearchBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <Analytics />
      <SpeedInsights />
      <Header />
      <main className="pt-1 pb-16"> {/* Add padding to account for fixed header and footer */}
        <SearchBar />
      </main>
      <Footer />
    </div>
  );
}

export default App;