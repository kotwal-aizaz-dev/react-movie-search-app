import "./App.css";
import { useEffect, useState } from "react";
import Search from "./components/Search";
import Loader from "./components/Loader";
import MovieCard from "./components/MovieCard";
function App() {
  // States
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // API Variables
  const API_BASE_URL = "https://api.themoviedb.org/3/";
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  // Function to fetch movies from the API
  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`,
        API_OPTIONS
      );
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();
      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }
      console.log(data);
      setMovieList(data.results || []);
    } catch (error) {
      console.log(error, "error fetching movies");
      setErrorMessage("Error fetching movies. Please try again later. ");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch the movies
  useEffect(() => {
    fetchMovies();
  }, []);

  // JSX
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
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
