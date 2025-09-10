// This file will hold the TypeScript interfaces for all data from the TMDB API.

export interface Genre {
  id: number;
  name: string;
}

// A base interface with properties common to both movies and TV shows
interface BaseMedia {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
}

export interface Movie extends BaseMedia {
  title: string;
  release_date: string;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

export interface TVShow extends BaseMedia {
  name: string;
  first_air_date: string;
  seasons: Season[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
