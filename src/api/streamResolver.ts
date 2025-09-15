import axios from "axios";

// We will use a public instance of a popular scraper API.
const RESOLVER_API_BASE_URL = "https://api.consumet.org/movies/flixhq";

// Define the shape of a stream source for type safety
export interface StreamSource {
  url: string; // The direct .m3u8 link
  quality: string; // e.g., "1080p", "720p", "auto"
  isM3U8: boolean;
}

// This function finds all available streams for a given movie or episode
export const resolveStreams = async (
  title: string, // The scraper works best with titles
  releaseYear?: number,
  season?: number,
  episode?: number
): Promise<StreamSource[]> => {
  try {
    // 1. Search for the media to get its internal ID from the provider
    const searchRes = await axios.get(
      `${RESOLVER_API_BASE_URL}/${encodeURIComponent(title)}`
    );
    // We'll assume the first result is the best match
    const media = searchRes.data.results.find(
      (item: any) =>
        item.releaseDate == releaseYear || item.type === "TV Series"
    );

    if (!media || !media.id) {
      console.log("Media not found on resolver.");
      return [];
    }

    // 2. Fetch the episode list if it's a TV show
    let episodeId = media.id;
    if (season && episode && media.type === "TV Series") {
      const episodesRes = await axios.get(
        `${RESOLVER_API_BASE_URL}/info?id=${media.id}`
      );
      const foundEpisode = episodesRes.data.episodes.find(
        (e: any) => e.season === season && e.number === episode
      );
      if (foundEpisode) {
        episodeId = foundEpisode.id;
      } else {
        console.log("Episode not found.");
        return [];
      }
    }

    // 3. Fetch the actual stream sources (e.g., VidCloud, UpCloud)
    const linksRes = await axios.get(
      `${RESOLVER_API_BASE_URL}/watch?episodeId=${episodeId}&mediaId=${media.id}`
    );

    // 4. Return the list of high-quality HLS (.m3u8) streams
    return linksRes.data.sources.filter((s: StreamSource) => s.isM3U8);
  } catch (error) {
    console.error("Error resolving streams:", error);
    return [];
  }
};
