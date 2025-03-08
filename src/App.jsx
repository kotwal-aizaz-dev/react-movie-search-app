import "./App.css";
import { useEffect, useState } from "react";
import Search from "./components/Search";
import Loader from "./components/Loader";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";

import { TMDB_API_KEY } from "./config/env";
import { getTrendingMovies, updateSearchCount } from "./config/appwrite";

function App() {
  // State Management
  const [searchText, setSearchText] = useState(""); // Stores the current search input
  const [errorMessage, setErrorMessage] = useState(null); // Stores error messages
  const [movieList, setMovieList] = useState([]); // Stores the list of movies from API
  const [trendingMovies, setTrendingMovies] = useState([]); // Stores trending movies
  const [isLoading, setIsLoading] = useState(false); // Loading state flag
  const [debouncedSearchText, setDebouncedSearchText] = useState(""); // Debounced search text to prevent excessive API calls
  
  // Debounce the search input by 500ms to reduce API calls
  useDebounce(() => setDebouncedSearchText(searchText), 500, [searchText]);

  // API Configuration
  const API_BASE_URL = "https://api.themoviedb.org/3/";
  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_API_KEY}`,
    },
  };

  /**
   * Fetches movies from TMDB API based on search query
   * If no query is provided, fetches popular movies
   * @param {string} query - Search query for movies
   */
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Determine the endpoint based on whether there's a search query
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
      
      setMovieList(data.results || []);
      // Update search count in database if search returns results
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

  /**
   * Loads trending movies from the database
   */
  const loadTrendingMovies = async () => {
    setIsLoading(true)
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log("Error fetching trending movies", error);
    } finally {
      setIsLoading(false)
    }
  };

  // Load trending movies on component mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Fetch movies whenever the debounced search text changes
  useEffect(() => {
    fetchMovies(debouncedSearchText);
  }, [debouncedSearchText]);

  return (
    <main>
      <div className="pattern"></div>
      <div className="wrapper">
        {/* Header Section */}
        <header>
          <img src="./hero.png" alt="hero banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy
            Without the Hassle
          </h1>
          <Search searchText={searchText} onSearch={setSearchText} />
        </header>

        {/* Trending Movies Section */}
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

        {/* Popular/Search Results Section */}
        <section className="all-movies">
          <h2 className="">
            {
              debouncedSearchText ? `Showing "${debouncedSearchText}"` : 
            "Popular Movies"
          }
          </h2>
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
