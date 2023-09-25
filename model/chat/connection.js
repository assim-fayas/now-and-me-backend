const mongoose = require('mongoose')
const connectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expert: {
        type: mongoose.Types.ObjectId,
        ref: 'Expert',
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Connection', connectionSchema)