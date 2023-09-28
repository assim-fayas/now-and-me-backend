const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    expert: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: {
        slot_time: { type: String, required: true },
        slot_date: { type: String, required: true },
        date: { type: Date, required: true },
        isBooked: { type: Boolean, default: true }
    },
    consultingFee: { type: Number, required: true },
    isConsulted: { type: Boolean, default: false },
    bookingType: { type: String, enum: ['video', 'chat'] },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['consulted', 'cancelled', 'notConsulted', 'cancellation-requested'],
        default: 'notConsulted'
    }
}, {
    timestamps: { createdAt: 'created_at' } // You can specify a custom field name for the created timestamp
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
