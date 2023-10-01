const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    expert: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
    },
    AppoinmentStatus: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    },
    scheduledAt: {
        slot_time: { type: String },
        slot_date: { type: String },
        date: { type: Date }
    }
}, {
    timestamps: { createdAt: 'created_at' }
});

// Custom validation to make scheduledAt fields required conditionally
appointmentSchema.path('scheduledAt.date').validate(function (value) {
    // Only required if bookingType is not 'chat'
    if (this.bookingType !== 'chat') {
        return typeof value !== 'undefined';
    }
    return true;
}, 'Scheduled date is required when bookingType is not chat');

appointmentSchema.path('scheduledAt.slot_date').validate(function (value) {
    // Only required if bookingType is not 'chat'
    if (this.bookingType !== 'chat') {
        return typeof value !== 'undefined';
    }
    return true;
}, 'Scheduled slot_date is required when bookingType is not chat');

appointmentSchema.path('scheduledAt.slot_time').validate(function (value) {
    // Only required if bookingType is not 'chat'
    if (this.bookingType !== 'chat') {
        return typeof value !== 'undefined';
    }
    return true;
}, 'Scheduled slot_time is required when bookingType is not chat');

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
