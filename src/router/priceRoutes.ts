import { Router } from "express"
import { getCurrentPricesCAndA } from "../controllers/priceController.js";

const router = Router();

router.get('/current-prices-canda', getCurrentPricesCAndA);

export default router;