const mongoose = require('mongoose');

const optimizationMetricSchema = new mongoose.Schema({
  routeEfficiency: {
    type: Number,
    required: true
  },
  fuelSaved: {
    type: String,
    required: true
  },
  carbonReduction: {
    type: String,
    required: true
  },
  collectionRate: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OptimizationMetric', optimizationMetricSchema);
