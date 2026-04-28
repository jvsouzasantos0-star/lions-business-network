const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { adminRequired } = require('../middlewares/admin');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(authRequired, adminRequired);

// Companies
router.get('/companies', adminController.listAdminCompanies);
router.post('/companies', adminController.createCompany);
router.get('/companies/:id', adminController.getCompany);
router.put('/companies/:id', adminController.updateCompany);
router.delete('/companies/:id', adminController.deleteCompany);

// Offers
router.get('/offers', adminController.listAdminOffers);
router.post('/offers', adminController.createOffer);
router.get('/offers/:id', adminController.getOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// Stats
router.get('/stats', adminController.getStats);

// Categories
router.get('/categories', adminController.listAdminCategories);
router.post('/categories', adminController.createCategory);

module.exports = router;
