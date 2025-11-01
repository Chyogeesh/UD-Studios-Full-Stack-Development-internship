const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  term: {
    type: String,
    required: true,
    // Convert term to lowercase for accurate counting of 'top searches'
    set: (v) => v.toLowerCase().trim(), 
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Search', SearchSchema);
