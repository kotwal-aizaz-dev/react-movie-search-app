import "./App.css";
import { useState } from "react";
import Search from "./components/Search";
function App() {
  const [searchText, setSearchText] = useState("");
  return (
    <main>
      <div className="pattern"></div>
      <div className="wrapper">
        {/* // ?header starts */}
        <header>
          <img src="./hero.png" alt="hero banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy
            Without the Hassle
          </h1>
          {/* //? Search Component */}
          <Search searchText={searchText} onSearch={setSearchText} />
        </header>
      </div>
    </main>
  );
}

export default App;
