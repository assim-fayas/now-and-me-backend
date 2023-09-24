
const Chat = require('../model/chat/chat')
const sendMessage = async (req, res) => {
    try {
        console.log("Inside send message");
        const { sender, receiver, text, senderType, receiverType } = req.body;
        console.log(req.body);
        const senderId = sender;
        const reciverId = receiver;

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
                    text: text,
                    senderType: senderType,
                    senderId: senderId,
                    reciverType: receiverType,
                    reciverId: reciverId,
                    timestamp: Date.now()
                };

                existingConnection.messages.push(newMessage);
                return existingConnection.save();
            })
            .then((result) => {
                res.status(200).send({ message: "Chat saved successfully" });
            })
            .catch((error) => {
                console.log(error);
                res.status(500).send({ message: "Error in message sending" });
            });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in message sending" });
    }
};

//fetching chats

const fetchChats = async (req, res) => {
    try {
        console.log("Inside fetch chats");
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

        console.log(senderId, receiverId);
        return res.json(matchDocument);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error in message fetching" });
    }
}



module.exports = {
    sendMessage,
    fetchChats
}