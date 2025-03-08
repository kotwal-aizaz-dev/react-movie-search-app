import { Client, Databases, ID, Query } from "appwrite";
import {
  APPWRITE_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_PROJECT_ID,
} from "./env";

// Initialize Appwrite client with endpoint and project ID
const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(APPWRITE_PROJECT_ID);

// Create a database instance using the initialized client
const database = new Databases(client);
/**
 * Updates the search count for a movie in the database or creates a new record if it doesn't exist
 * @param {string} searchText - The search term used to find the movie
 * @param {Object} movie - The movie object containing id and poster_path
 * @returns {Promise<void>}
 */
export const updateSearchCount = async (searchText, movie) => {
  try {
    // Check if a document with the same search text exists
    const result = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.equal("searchText", searchText)]
    );

    if (result.documents.length > 0) {
      // If document exists, increment the count
      const doc = result.documents[0];

      await database.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        doc.$id,
        {
          count: doc.count + 1,
        }
      );
    } else {
      // If document doesn't exist, create a new one
      await database.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        {
          searchText,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    // Display error message to user if database operation fails
    alert(
      "An error occurred while fetching trending movies. Please try again later.",
      error.message
    );
  }
};

/**
 * Fetches the top 5 trending movies sorted by search count in descending order
 * @param {number} [limit=5] - Number of trending movies to fetch (default: 5)
 * @param {string} [orderBy="count"] - Field to order results by (default: count)
 * @returns {Promise<Array>} Array of trending movie documents
 */
export const getTrendingMovies = async (limit = 5, orderBy = "count") => {
  try {
    const result = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.limit(limit), Query.orderDesc(orderBy)]
    );

    return result.documents;
  } catch (error) {
    alert("Error occured while fetching the trending movies:", error.message);
  }
};
