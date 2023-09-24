const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    connectionId: {
        type: mongoose.Types.ObjectId,
        ref: 'Connection',
        required: true
    }
    ,
    from: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    to: {
        type: mongoose.Types.ObjectId,
        require: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    capped: { size: 102400, max: 50 },
})

module.exports = mongoose.model("Message", messageSchema)