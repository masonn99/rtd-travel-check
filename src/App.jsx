import { useState } from 'react';
import TableView from './components/TableView';
import WorldGlobe from './components/Globe';
import Header from "./components/Header";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import "./styles/App.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const [currentView, setCurrentView] = useState('globe');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Analytics />
      <SpeedInsights />
      <Header 
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
      />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SEO />
          {currentView === 'globe' ? <WorldGlobe /> : <TableView />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
