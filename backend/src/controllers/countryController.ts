import { Request, Response } from "express";
import axios from "axios";

const BASE_URL = "https://countriesnow.space/api/v0.1";

export const getCountryList = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${BASE_URL}/countries/positions`);
    const countries = response.data.data.map((c: any) => ({
      name: c.name,
      iso2: c.iso2,
    }));
    res.json(countries);
  } catch (error: any) {
    console.error("Error al obtener países:", error.message);
    res.status(500).json({ error: "Error al obtener la lista de países" });
  }
};

export const getCitiesByCountry = async (req:Request, res: Response) => {
  const { iso } = req.params;
  try {
    const all = await axios.get(`${BASE_URL}/countries`);
    const match = all.data.data.find((c: any) => c.iso2 === iso.toUpperCase());
    if (!match) return res.status(404).json({ error: "País no encontrado" });

    res.json(match.cities.map((city: string) => ({ name: city })));
  } catch (error: any) {
    console.error("Error al obtener ciudades:", error.message);
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
};

export const getCountryFlag = async (req: Request, res: Response) => {
  const iso = req.params.iso.toUpperCase();

  try {
    const response = await axios.get(`${BASE_URL}/countries/flag/images`);
    const countries = response.data.data;

    const country = countries.find((c: any) => c.iso2 === iso);

    if (!country) {
      return res.status(404).json({ error: "País no encontrado" });
    }

    res.json({
      iso: country.iso2,
      name: country.name,
      flag: country.flag, 
    });
  } catch (error: any) {
    console.error("Error al obtener bandera:", error.message);
    res.status(500).json({ error: "Error al obtener bandera del país" });
  }
};