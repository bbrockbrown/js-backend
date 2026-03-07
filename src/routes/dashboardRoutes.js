import express from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', dashboardController.getDashboardSummary);

router.get('/trend', dashboardController.getDonationTrend);

router.get('/last7days', dashboardController.getLast7DaysDonations);

router.get('/recent-donations', dashboardController.getRecentDonations)
export default router;