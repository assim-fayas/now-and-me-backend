const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
    validate: {
      validator: function (tags) {
        return tags.length <= 3;
      },
      message: 'At MOST three tags are required.',
    },
  },
  anonymous: {
    type: Boolean,
    default: false, // By default, posts are not anonymous
  },
  flags: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: {
        report: String,
        reason: String// Optional reason for flagging
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  block: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: false
  },
  pronouns: {
    type: String,
    default: false
  },
  location:{
    type:String,
    default:false
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;