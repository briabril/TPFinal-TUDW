import api from "@tpfinal/api";

export async function fetchWeatherByCity(city: string, country_iso?: string) {
  const params: any = { city };
  if (country_iso) params.country_iso = country_iso;
  const res = await api.get("/weather", { params });
  return res.data;
}

export async function fetchWeatherByCoords(lat: number, lon: number) {
  const res = await api.get("/weather", { params: { lat, lon } });
  return res.data;
}

export default { fetchWeatherByCity, fetchWeatherByCoords };
