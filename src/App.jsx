import "./App.css";
import { useEffect, useState } from "react";
import Search from "./components/Search";
import Loader from "./components/Loader";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";

import { TMDB_API_KEY } from "./config/env";
import { getTrendingMovies, updateSearchCount } from "./config/appwrite";
function App() {
  // States
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  useDebounce(() => setDebouncedSearchText(searchText), 500, [searchText]);
  console.log("search", debouncedSearchText);

  // API Variables
  const API_BASE_URL = "https://api.themoviedb.org/3/";
  // const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
  };

  // Function to fetch movies from the API
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
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
      if (query && data.results.length > 0) {
        await updateSearchCount(debouncedSearchText, data.results[0]);
      }
    } catch (error) {
      console.log(error, "error fetching movies");
      setErrorMessage("Error fetching movies. Please try again later. ");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    setIsLoading(true)
    try {
      const movies = await getTrendingMovies();
      console.log("Trending movies", movies);
      setTrendingMovies(movies);
    } catch (error) {
      console.log("Error fetching trending movies", error);
    } finally {
      setIsLoading(false)
    }
  };
  useEffect(() => {
    loadTrendingMovies();
  }, []);
  // Effect to fetch the movies
  useEffect(() => {
    fetchMovies(debouncedSearchText);
  }, [debouncedSearchText]);

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

        <section className="trending min-h-[200px]">
          <h2>Trending Movies</h2>
          { (trendingMovies.length === 0 || isLoading) ? <Loader/>  : (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt="" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="all-movies">
          <h2 className="">Popular Movies</h2>
          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
