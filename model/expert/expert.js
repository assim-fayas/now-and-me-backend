const mongoose = require('mongoose')

// const profileSchema = new mongoose.Schema({

// })

const expertSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        unique: true,
        default: null
    },
    phone: {
        type: Number,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    isMailVerified: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
        default: null
    },
    dob: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    }

},
    {
        timestamps: {
            createdAt: 'joined',
            updatedAt: 'updated'

        },


    })
module.exports = mongoose.model("Expert", expertSchema)