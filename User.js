const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Unique ID provided by the OAuth provider (e.g., Google or GitHub)
  providerId: {
    type: String,
    required: true,
    unique: true,
  },
  provider: {
    type: String, // 'google', 'github', etc.
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // Note: OAuth providers might not always guarantee a unique email across providers
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
