const mongoose = require('mongoose');
const Chat = require('../model/chat/chat')
const Appointment = require('../model/expert/appoinment')
const Expert = require('../model/expert/expert')
const moment = require('moment')
const sendMessage = async (message) => {
    try {
        console.log("Inside send message");
        const senderId = message.sender;
        const reciverId = message.receiver;

        let existingConnection;

        await Chat.findOne({ members: { $all: [senderId, reciverId] } })
            .then((chat) => {
                if (!chat) {
                    existingConnection = new Chat({
                        members: [senderId, reciverId],
                        messages: []
                    });
                } else {
                    existingConnection = chat;
                }

                const newMessage = {
                    text: message.text,
                    senderType: message.senderType,
                    senderId: senderId,
                    reciverType: message.receiverType,
                    reciverId: reciverId,
                    timestamp: Date.now()
                };

                existingConnection.messages.push(newMessage);
                return existingConnection.save();
            })
            .then((result) => {
                console.log({ message: "Chat saved successfully" });;
            })
            .catch((error) => {
                console.log({ message: "Error in message sending" });

            });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in message sending" });
    }
};

//fetching chats

const fetchChats = async (req, res) => {
    try {
        // console.log("Inside fetch chats");
        const receiverId = req.params.receiver;
        const senderId = req.params.sender;



        const matchDocument = await Chat.aggregate([
            {
                $match: {
                    members: {
                        $all: [senderId, receiverId]
                    }
                }
            },
            {
                $project: {
                    messages: 1
                }
            }
        ]);

        // console.log(senderId, receiverId);
        return res.json(matchDocument);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in message fetching" });
    }
}

// updating the status of inactive chats and fetching the active chats

const ActiveChats = async (req, res) => {
    try {

        //make the appoinment status expired if appoinment  date is less than the current date 
        const currentDate = moment().startOf('day');
        console.log(currentDate);
        const ValidatebookedChatDate = await Appointment.updateMany({ $and: [{ created_at: { $lt: currentDate.toDate() } }, { AppoinmentStatus: "active" }] }, { $set: { AppoinmentStatus: "expired", status: "consulted" } })
        // console.log(ValidatebookedChatDate, "validate check date");


        // getting only the active chats
        const userId = req.headers.userId
        const activeChats = await Appointment.find({ user: userId, bookingType: 'chat', AppoinmentStatus: 'active' }).populate('expert', 'name')
        console.log("active chaaaaatttttttttt", activeChats);
        if (activeChats) {
            return res.status(200).json(activeChats)
        } else {
            return res.status(500).send({ message: "error in active chats" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in active chats" })
    }
}

// fetch all previouse chat of this user

const previousChats = async (req, res) => {
    try {
        console.log("insid previouse chats");
        const user = req.headers.userId
        const findAllchatWitUser = await Appointment.find({ user: user, AppoinmentStatus: "expired", status: "consulted", bookingType: "chat" }).populate('expert', 'name')


        //select only the unique object from the array
        const uniqueObjects = new Map();
        for (const obj of findAllchatWitUser) {
            const expertId = obj.expert._id.toString(); // Convert ObjectId to string
            if (!uniqueObjects.has(expertId)) {
                uniqueObjects.set(expertId, obj);
            }
        }

        // Convert the map values back to an array
        const uniqueChats = Array.from(uniqueObjects.values());

        console.log(uniqueChats);


        return res.status(200).json(uniqueChats)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "error in previouse chats" })
    }
}



module.exports = {
    sendMessage,
    fetchChats,
    ActiveChats,
    previousChats

}