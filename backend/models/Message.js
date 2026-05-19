// 📁 CREATE THIS FILE AT: backend/models/Message.js

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  session: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Session',
    required: true,
  },
  sender: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  senderName: {
    type:    String,
    default: '',
  },
  text: {
    type:     String,
    required: true,
  },
  type: {
    type:    String,
    default: 'text',
    enum:    ['text', 'image', 'file'],
  },
  fileName: {
    type:    String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);