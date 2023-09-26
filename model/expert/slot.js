const mongoose = require('mongoose');


const slotSchema = new mongoose.Schema({
    expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        required: true,
    },
    slotes: {
        type: [{
            slot_time: {
                type: String,
                required: true,
            },
            date: {
                type: Date
            },
            slot_date: {
                type: String,
                required: true,
            },
            isBooked: {
                type: Boolean,
                required: true,
                default: false
            },
        }],
    },

});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
