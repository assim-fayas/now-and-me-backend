const mongoose = require('mongoose')


const chatSchema = new mongoose.Schema(
    {



        members: [String],
        messages: [
            {
                text: {
                    type: String,
                    required: true,
                },
                senderType: {
                    type: String,
                    enum: ["user", "expert"],
                    required: true,
                },
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "senderType",
                    required: true,
                },
                reciverType: {
                    type: String,
                    enum: ["user", "expert"],
                    required: true,
                },
                reciverId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "reciverType",
                    required: true,
                },


                timestamp: {
                    type: Date,
                    default: Date.now()
                }

            },
        ],
    },
);

module.exports = mongoose.model("Chat", chatSchema);

