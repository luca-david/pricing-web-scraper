import { Router } from "express"
import { getCurrentPrices } from "../controllers/priceController.js";

const router = Router();

router.get('/current-prices', getCurrentPrices);

export default router;