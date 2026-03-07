import express from 'express';
import donationController from '../controllers/donationController.js';

const router = express.Router();

router.get('/', donationController.getDonations);
router.get('/:id', donationController.getDonationDetail);

export default router;