import SearchBar from "./components/SearchBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <div className="min-h-[100dvh] bg-zinc-900 text-zinc-100">
      <Analytics />
      <SpeedInsights />
      <Header />
      <main className="pt-2 sm:pt-4 pb-20 sm:pb-16"> {/* Add padding to account for fixed header and footer */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <SearchBar />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
