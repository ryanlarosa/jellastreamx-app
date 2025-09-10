// src/api/vidsrc.ts

// Define our new list of available servers with their specific URL structures
export const servers = [
  {
    name: "VidSrc.cc",
    // Standard URL structure for VidSrc
    getUrl: (type: "movie" | "tv", id: number, s?: number, e?: number) => {
      if (type === "tv") {
        return `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
      }
      return `https://vidsrc.cc/v2/embed/movie/${id}`;
    },
  },
  {
    name: "VidRock",
    // Custom URL structure for VidRock
    getUrl: (type: "movie" | "tv", id: number, s?: number, e?: number) => {
      if (type === "tv") {
        return `https://vidrock.net/tv/${id}/${s}/${e}`;
      }
      return `https://vidrock.net/movie/${id}`;
    },
  },
  // You can add more servers here in the future
];

/**
 * Gets the streamable URL for a movie from a specific server.
 * @param tmdbId The TMDB ID of the movie.
 * @param server The server object containing name and getUrl function.
 * @returns The full embed URL.
 */
export const getMovieStreamUrl = (
  tmdbId: number,
  server: { getUrl: Function }
): string => {
  return server.getUrl("movie", tmdbId);
};

/**
 * Gets the streamable URL for a TV show episode from a specific server.
 * @param tmdbId The TMDB ID of the TV show.
 * @param seasonNumber The season number.
 * @param episodeNumber The episode number.
 * @param server The server object containing name and getUrl function.
 * @returns The full embed URL for the episode.
 */
export const getTvStreamUrl = (
  tmdbId: number,
  seasonNumber: number,
  episodeNumber: number,
  server: { getUrl: Function }
): string => {
  return server.getUrl("tv", tmdbId, seasonNumber, episodeNumber);
};
