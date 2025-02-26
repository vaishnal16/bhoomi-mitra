const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const router = express.Router();
const protect = require('../middleware/auth');

const {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getOptimizationMetrics
} = require('../controllers/biomassController');

// Path to your downloaded Kaggle biomass dataset
const biomassFilePath = path.join(__dirname, '../biomass.csv');

// Route to fetch biomass data from the CSV file
router.get('/external', async (req, res) => {
    try {
        const results = [];

        fs.createReadStream(biomassFilePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
              res.json(results); // Send parsed CSV data as JSON
          });
    } catch (error) {
        console.error("Error reading biomass data:", error.message);
        res.status(500).json({ error: "Failed to fetch biomass data" });
    }
});

// Existing protected routes
router.route('/')
  .get(protect, getCollections)
  .post(protect, createCollection);

router.route('/:id')
  .put(protect, updateCollection)
  .delete(protect, deleteCollection);

router.get('/metrics', protect, getOptimizationMetrics);

module.exports = router;
