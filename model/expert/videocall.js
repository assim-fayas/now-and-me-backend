const mongoose = require('mongoose');

const videoCallSchema = new mongoose.Schema({
    // Reference to an Appointment ObjectId
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
    // URL as a string
    url: {
        type: String,
    },
    // Status with a default value of "active"
    status: {
        type: String,
        default: "active",
    },

});

const VideoCall = mongoose.model('VideoCall', videoCallSchema);

module.exports = VideoCall;
