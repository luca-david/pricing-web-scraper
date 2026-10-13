import { Router } from "express"
import { getCurrentPricesCAndA, getCurrentPricesLeBab, getCurrentPricesRollMaster } from "../controllers/priceController.js";

const router = Router();

router.get('/current-prices-canda', getCurrentPricesCAndA);
router.get('/current-prices-roll-master', getCurrentPricesRollMaster)
router.get('/current-prices-le-bab', getCurrentPricesLeBab)

export default router;