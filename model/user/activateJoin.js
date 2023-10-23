const mongoose = require('mongoose');

const activateJoinSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment', // Reference to the Appointment model
        required: true,
    },
    slot_date: {
        type: String,
        required: true,
    },
    slot_time: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the Appointment model
        required: true,
    }
});

const ActivateJoin = mongoose.model('ActivateJoin', activateJoinSchema);

module.exports = ActivateJoin;
