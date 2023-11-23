const mongoose = require('mongoose')



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
    },
    contact: {
        type: String,
        default: null
    },
    governmentId: {
        type: String,
        default: null
    },
    profileImage: {
        type: String,
        default: null
    },
    educationalQualification: {
        type: String,
        default: null
    },
    educationalInstitute: {
        type: String,
        default: null
    },
    specialization: {
        type: String,
        default: null
    },
    experience: {
        type: String,
        default: null
    },
    certification: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    websiteLink: {
        type: String,
        default: null
    },
    services: {
        type: Array,
        default: null
    },
    hourlySessionCharge: {
        type: Number,
        default: null
    },
    languages: {
        type: Array,
        default: null
    },
    idealClient: {
        type: Array,
        default: null
    },
    ratingValue: {
        type: Array,
        default: null
    },
    rating: {
        type: String,
        default: null
    },
    sessionCount: {
        type: Number,
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