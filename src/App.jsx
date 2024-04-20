import SearchBar from "./components/SearchBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";

function App() {
  return (
    <div>
      <div className="fixed-header">
        <Header />
        <SearchBar />
      </div>
      <Footer /> 
      
    </div>
  );
}

export default App;
