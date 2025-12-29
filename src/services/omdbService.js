import axios from "axios";

export async function fetchMovieFromOMDb(title) {
  const apiKey = process.env.OMDB_API_KEY;

  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      t: title,
      apikey: apiKey
    }
  });

  return response.data;
}
