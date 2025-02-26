const mongoose = require('mongoose');

const biomassCollectionSchema = new mongoose.Schema({
  species: {
    type: String,
    required: true,
    // Added more biomass types to match the Kaggle dataset
    enum: ['Crop Residue', 'Wood Waste', 'Agricultural Waste', 'Forest Residue', 'Sawdust', 'Pine', 'Oak', 'Maple']
  },
  location: {
    type: String,
    required: true
  },
  wood: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Available'
  },
  date: {
    type: Date,
    required: true
  },
  bark: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low']
  },
  energyPotential: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BiomassCollection', biomassCollectionSchema);