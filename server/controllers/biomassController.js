const BiomassCollection = require('../models/BiomassCollection');
const OptimizationMetric = require('../models/OptimizationMetric');
const asyncHandler = require('express-async-handler');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Get all collections
exports.getCollections = asyncHandler(async (req, res) => {
  const collections = await BiomassCollection.find({ createdBy: req.user._id });
  res.json(collections);
});

// Create new collection
exports.createCollection = asyncHandler(async (req, res) => {
  // Calculate energy potential if not provided
  if (!req.body.energyPotential && req.body.wood) {
    req.body.energyPotential = `${(parseFloat(req.body.wood) * 1.5).toFixed(1)} MWh`;
  }

  const collection = await BiomassCollection.create({
    ...req.body,
    createdBy: req.user._id
  });
  res.status(201).json(collection);
});

// Update collection
exports.updateCollection = asyncHandler(async (req, res) => {
  const collection = await BiomassCollection.findById(req.params.id);
  
  if (!collection) {
    res.status(404);
    throw new Error('Collection not found');
  }

  if (collection.createdBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Calculate energy potential if wood quantity is updated
  if (req.body.wood && !req.body.energyPotential) {
    req.body.energyPotential = `${(parseFloat(req.body.wood) * 1.5).toFixed(1)} MWh`;
  }

  const updatedCollection = await BiomassCollection.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedCollection);
});

// Delete collection
exports.deleteCollection = asyncHandler(async (req, res) => {
  const collection = await BiomassCollection.findById(req.params.id);
  
  if (!collection) {
    res.status(404);
    throw new Error('Collection not found');
  }

  if (collection.createdBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await BiomassCollection.deleteOne({ _id: req.params.id });
  res.json({ message: 'Collection removed' });
});

// Get optimization metrics
exports.getOptimizationMetrics = asyncHandler(async (req, res) => {
  let metrics = await OptimizationMetric.findOne().sort({ updatedAt: -1 });
  
  if (!metrics) {
    metrics = await OptimizationMetric.create({
      routeEfficiency: 85,
      fuelSaved: '120L',
      carbonReduction: '0.5 tons',
      collectionRate: '92%'
    });
  }
  
  res.json(metrics);
});
