import axios from "axios";
import { TMDB_API_KEY } from "@env";
// 1. Import our new, strong types
import { Movie, TVShow, Genre, CastMember } from "../types/api";

const API_KEY = TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

// --- REFACTORED FUNCTIONS ---
export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await apiClient.get("/trending/movie/week");
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await apiClient.get("/movie/popular");
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

export const getMovieDetails = async (
  movieId: number
): Promise<Movie | null> => {
  try {
    const response = await apiClient.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for movie ${movieId}:`, error);
    return null;
  }
};

export const getTrendingTvShows = async (): Promise<TVShow[]> => {
  try {
    const response = await apiClient.get("/trending/tv/week");
    return response.data.results;
  } catch (error) {
    console.error("Error fetching trending TV shows:", error);
    return [];
  }
};

export const getTvShowDetails = async (
  tvId: number
): Promise<TVShow | null> => {
  try {
    const response = await apiClient.get(`/tv/${tvId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for TV show ${tvId}:`, error);
    return null;
  }
};

export const getPopularAnime = async (): Promise<TVShow[]> => {
  try {
    const response = await apiClient.get("/discover/tv", {
      params: {
        with_genres: 16,
        sort_by: "popularity.desc",
        with_original_language: "ja",
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }
};

export const searchMedia = async (
  query: string
): Promise<(Movie | TVShow)[]> => {
  if (!query) return [];
  try {
    const response = await apiClient.get("/search/multi", {
      params: { query },
    });
    return response.data.results.filter(
      (item: any) => item.media_type === "movie" || item.media_type === "tv"
    );
  } catch (error) {
    console.error("Error searching media:", error);
    return [];
  }
};

export const getCredits = async (
  mediaType: "movie" | "tv",
  mediaId: number
): Promise<CastMember[]> => {
  try {
    const response = await apiClient.get(`/${mediaType}/${mediaId}/credits`);
    return response.data.cast;
  } catch (error) {
    console.error("Error fetching credits:", error);
    return [];
  }
};

// --- NEW GENRE FUNCTIONS ---
export const getGenres = async (): Promise<Genre[]> => {
  try {
    // Fetch both movie and TV genres to create a comprehensive list
    const [movieGenres, tvGenres] = await Promise.all([
      apiClient.get("/genre/movie/list"),
      apiClient.get("/genre/tv/list"),
    ]);

    // Combine and remove duplicates
    const allGenres = new Map<number, string>();
    movieGenres.data.genres.forEach((genre: Genre) =>
      allGenres.set(genre.id, genre.name)
    );
    tvGenres.data.genres.forEach((genre: Genre) =>
      allGenres.set(genre.id, genre.name)
    );

    return Array.from(allGenres, ([id, name]) => ({ id, name }));
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

export const discoverMediaByGenre = async (
  genreId: number
): Promise<(Movie | TVShow)[]> => {
  try {
    const response = await apiClient.get("/discover/tv", {
      params: { with_genres: genreId, sort_by: "popularity.desc" },
    });
    return response.data.results;
  } catch (error) {
    console.error(`Error discovering media for genre ${genreId}:`, error);
    return [];
  }
};
