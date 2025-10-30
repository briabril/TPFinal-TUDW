import express from "express";
import { getCountryList, getCitiesByCountry , getCountryFlag } from "../controllers/countryController";

const router = express.Router();



router.get("/list", getCountryList);

router.get("/:iso/city", getCitiesByCountry );

router.get("/:iso/flag", getCountryFlag );

export default router;
