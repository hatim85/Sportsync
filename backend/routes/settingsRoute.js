import express from "express";
import { getPricingSettings, updatePricingSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/pricing", getPricingSettings);
router.put("/pricing", updatePricingSettings);

export default router;