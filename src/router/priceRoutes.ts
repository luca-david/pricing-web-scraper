import { Router } from "express"
import { getCurrentPricesCAndA, getCurrentPricesRollMaster } from "../controllers/priceController.js";

const router = Router();

router.get('/current-prices-canda', getCurrentPricesCAndA);
router.get('/current-prices-roll-master', getCurrentPricesRollMaster)

export default router;