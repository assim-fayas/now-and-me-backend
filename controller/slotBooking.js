const mongoose = require('mongoose');
const Slot = require('../model/expert/slot')
const Expert = require('../model/expert/expert')
const moment = require('moment')
const Appointment = require('../model/expert/appoinment');
const { response } = require('express');


const addSlots = async (req, res) => {
    try {
        const ExpertId = req.headers.expertId;
        const { startTime, endTime, date } = req.body;
        if (!date || !startTime || !endTime) {
            return res.status(400).send('All fields are required');
        }

        const startingTime = moment(startTime, 'h:mm A');
        const currentDate = new Date();
        const slotDate = moment(date);
        const formattedSlotDate = slotDate.format('YYYY-MM-DD');
        const endingTime = moment(endTime, 'h:mm A');
        const slotDuration = 60;

        // Validation: Is slotDate greater than the current date?
        if (slotDate.toDate() <= currentDate) {
            return res.status(400).send('Slot must be in the future');
        }

        // Validation: Is ending time greater than starting time?
        if (endingTime.isBefore(startingTime)) {
            return res.status(400).send('Ending time cannot be less than starting time');
        }

        // Calculate the difference in minutes
        const durationInMinutes = endingTime.diff(startingTime, 'minutes');
        if (durationInMinutes < slotDuration) {
            return res.status(400).send('Minimum slot duration is 1 hour');
        }

        // Check if the slot already exists
        const findSlot = await Slot.find({
            expert: ExpertId,
            'slotes': {
                $elemMatch: {
                    'slot_date': formattedSlotDate,
                    $and: [
                        { 'slot_time': { $gte: startingTime.format('h:mm A') } },
                        { 'slot_time': { $lt: endingTime.format('h:mm A') } }
                    ]
                }
            }
        });

        console.log(findSlot, "findSlot if existeddd");



        if (findSlot.length > 0) {
            return res.status(409).send({ message: "Slot already exists" });
        }

        const findSlots = await Slot.findOne({ expert: ExpertId })
        const createSlots = generateTimeSlots(startTime, endTime, slotDuration, date);

        // Function for slot partitioning
        function generateTimeSlots(startTime, endTime, slotDuration, date) {
            console.log("endtimeeeeee", endTime);
            console.log("start time", startTime);
            const slots = [];

            const end = new Date(`${date} ${endTime}`);
            const start = new Date(` ${date} ${startTime} `);

            console.log({ start });
            console.log({ end });
            while (start < end) {
                const slotTime = start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                const slotDoc = {
                    slot_time: slotTime,
                    slot_date: date,
                    date: slotDate.toDate(),
                    isBooked: false
                };
                console.log(slotDoc);
                slots.push(slotDoc);
                start.setMinutes(start.getMinutes() + slotDuration);
            }
            console.log(slots);
            return slots;
        }



        if (!findSlots) {
            const newSlot = new Slot({
                expert: ExpertId,
                slotes: createSlots
            });

            const createdSlot = await newSlot.save();
            return res.status(201).json(createdSlot);
        }

        createSlots.forEach(slot => {
            findSlots.slotes.push(slot);
        });

        await findSlots.save();
        return res.status(200).json(findSlot);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error in slot booking" });
    }
}



//listing all available slotes of expert in userside


const getAllSlots = async (req, res) => {
    try {
        // Get the current date and tomorrow's date
        const currentDate = moment().format('YYYY-MM-DD');
        const tomorrowDate = moment().add(1, 'day').format('YYYY-MM-DD');
        const currentHour = moment().format('h:mm A');

        const expertId = req.params.id;
        console.log("experts", expertId);
        const currentMoment = moment(currentHour, 'h:mm A');

        // Delete invalid slots
        const result = await Slot.updateMany(
            {
                expert: expertId,
                $and: [
                    { 'slotes.slot_date': { $lte: currentDate } },
                    { 'slotes.slot_time': { $lte: currentHour } }
                ]
            },
            {
                $pull: {
                    'slotes': {
                        $and: [
                            { 'slot_date': { $lte: currentDate } },
                            { 'slot_time': { $lte: currentHour } }
                        ]
                    }
                }
            }
        );

        console.log("result", result, "result");
        if (result) {

            console.log("result", result, "result");
        }



        // Find valid slots for today


        // Find valid slots for tomorrow
        const slots = await Slot.findOne({ expert: expertId, 'slotes.slot_date': tomorrowDate });

        if (!slots) {
            return res.status(200).json({ slotTomorrow: [], slotToday: [] });
        }

        // Filter slots for today and tomorrow
        const slotToday = slots.slotes.filter(slot => slot.slot_date === currentDate);
        const slotTomorrow = slots.slotes.filter(slot => slot.slot_date === tomorrowDate);



        return res.status(200).json({ slotTomorrow, slotToday });




    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error in slots fetching" });
    }
}


//add appoinment

const addAppoinment = async (req, res) => {

    try {
        console.log("inside add appoinment");
        console.log(req.body);
        console.log("stopped");

        const { expertId, userId, slotId, consultingFee, paymentStatus, bookingType } = req.body
        console.log(expertId, userId, slotId, consultingFee, paymentStatus, bookingType);
        console.log(slotId, "slot iddddd");
        if (paymentStatus == 'pending') {
            console.log("payment not completed,please compleate the payment");
        }

        if (bookingType == 'video') {
            const slotid = new mongoose.Types.ObjectId(slotId);
            console.log(slotid, "moongoose");

            const slot = await Slot.aggregate([
                {
                    $match: {
                        'slotes._id': slotid
                    }
                },
                {
                    $project: {
                        matchingSlot: {
                            $filter: {
                                input: '$slotes',
                                as: 'slot',
                                cond: { $eq: ['$$slot._id', slotid] }
                            }
                        }
                    }
                }
            ]);

            if (slot.length > 0) {
                const matchingSlotObject = slot[0].matchingSlot[0];
                console.log('Matching slot object:', matchingSlotObject);
                // Access values from the matchingSlotObject
                const slot_time = matchingSlotObject.slot_time;
                const slot_date = matchingSlotObject.slot_date;
                const date = matchingSlotObject.date;

                console.log('slot_time:', slot_time);
                console.log('slot_date:', slot_date);
                console.log('date:', date);




                const Appoinment = new Appointment({
                    expert: expertId,
                    user: userId,
                    consultingFee: consultingFee,
                    bookingType: bookingType,
                    paymentStatus: paymentStatus,
                    scheduledAt: {
                        slot_time: slot_time,
                        slot_date: slot_date,
                        date: date
                    }

                })

                if (Appoinment) {
                    await Appoinment.save()

                    result = await Slot.findOneAndUpdate(
                        { 'slotes._id': slotid },
                        {
                            $pull: {
                                slotes: { _id: slotid }
                            }
                        },
                        { new: true }
                    );
                    if (result) {
                        res.status(200).send({ message: "Appoinment added and slote deleted successfully" })
                    }
                }



            } else {
                console.log('No matching slot found.');
            }
        }
        if (bookingType == 'chat') {


            console.log("insideeee chattttt section");
            const currentDate = moment().startOf('day');
            console.log(currentDate);

            //make the appoinment status expired if appoinment  date is less than the current date 

            const ValidatebookedChatDate = await Appointment.updateMany({ bookingType: "chat" }, { $and: [{ created_at: { $lt: currentDate.toDate() } }, { AppoinmentStatus: "active" }] }, { $set: { AppoinmentStatus: "expired", status: "consulted" } })
            console.log(ValidatebookedChatDate, "validate check date");


            //validating the user can only book an expert only once in a day

            const validateChat = await Appointment.find({
                bookingType: "chat",
                expert: expertId, user: userId, AppoinmentStatus: "active"
            }).count()
            console.log(validateChat);

            if (validateChat >= 1) {
                return res.status(403).send({ message: "you have already booked for the chat" })
            }


            //validating the total number of appoinments must range between 1 and 5 in a day

            const countOfAvailableChat = await Appointment.find({ expert: expertId, AppoinmentStatus: "active" }).count()
            if (countOfAvailableChat > 5) {
                return res.status(404).send({ message: "current expert is full.cureently not available for chatting.try tommarow" })
            }


            const chatAppoinment = new Appointment({
                expert: expertId,
                user: userId,
                consultingFee: consultingFee,
                bookingType: bookingType,
                paymentStatus: paymentStatus,


            })

            if (chatAppoinment) {
                await chatAppoinment.save()
                return res.status(200).send({ message: "chat appoinment added  successfully" })
            }
            return res.status(404).json("error in chat appoinment");
        }
    }

    catch (error) {
        console.log(error);
    }

}



// get all user video  appoinments

const getAppoinments = async (req, res) => {
    try {
        let Id

        if (req.headers.userId) {
            Id = req.headers.userId
        } else {
            Id = req.headers.expertId
        }
        console.log('inside get all appoinments');
        const user = Id;
        const currentDate = moment().format('YYYY-MM-DD');
        console.log(currentDate);
        const currentTime = moment().format('h:mm A');
        console.log(currentDate, currentTime);

        const userId = new mongoose.Types.ObjectId(user);

        if (req.headers.userId) {
            // Define the conditions to select the appointments to update
            const conditions = {
                user: userId,
                bookingType: 'video',
                paymentStatus: 'success',
                AppoinmentStatus: 'active',
                status: 'notConsulted',
                'scheduledAt.slot_date': { $lt: currentDate },
                'scheduledAt.slot_time': { $lt: currentTime },
            };
            console.log(conditions);

            // Define the update to set AppoinmentStatus to "expired"
            const update = {
                $set: { AppoinmentStatus: 'expired' },
            };

            // Update the appointments that meet the conditions
            const updateResult = await Appointment.updateMany(conditions, update);

            console.log(`Updated ${updateResult.nModified} appointments.`);

            // Fetch the remaining appointments
            const findAppointments = await Appointment.find({
                user: userId,
                bookingType: 'video',
                paymentStatus: 'success',
                AppoinmentStatus: 'active',
                status: 'notConsulted',
            }).populate('expert', 'name');

            console.log(findAppointments);

            return res.status(200).json(findAppointments);
        } else {

            const conditions = {
                expert: userId,
                bookingType: 'video',
                paymentStatus: 'success',
                AppoinmentStatus: 'active',
                status: 'notConsulted',
                'scheduledAt.slot_date': { $lt: currentDate },
                'scheduledAt.slot_time': { $lt: currentTime },
            };
            console.log(conditions);

            // Define the update to set AppoinmentStatus to "expired"
            const update = {
                $set: { AppoinmentStatus: 'expired' },
            };

            // Update the appointments that meet the conditions
            const updateResult = await Appointment.updateMany(conditions, update);

            console.log(`Updated ${updateResult.nModified} appointments.`);

            // Fetch the remaining appointments
            const findAppointments = await Appointment.find({
                expert: userId,
                bookingType: 'video',
                paymentStatus: 'success',
                AppoinmentStatus: 'active',
                status: 'notConsulted',
            }).populate('user', 'name');

            console.log(findAppointments);

            return res.status(200).json(findAppointments);



        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'error in appointment fetching' });
    }
}





// get previouse appoinment of user

const getpreviousvideoAppoinments = async (req, res) => {

    try {
        let Id
        console.log("inside previouse appoinment");
        if (req.headers.userId) {
            Id = req.headers.userId
        } else {
            Id = req.headers.expertId
        }
        if (req.headers.userId) {
            const appoinmentHistory = await Appointment.find({ user: Id, bookingType: "video", status: "consulted", AppoinmentStatus: "expired" }).populate('expert', 'name')
            console.log(appoinmentHistory);
            return res.status(200).json(appoinmentHistory)
        } else {
            const appoinmentHistory = await Appointment.find({ expert: Id, bookingType: "video", status: "consulted", AppoinmentStatus: "expired" }).populate('user', 'name')
            console.log(appoinmentHistory);
            return res.status(200).json(appoinmentHistory)
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in  previous appoinment fetching" })

    }

}

// get all  expert video  appoinments

const expertAppoinment = async (req, res) => {

}


const expertPreviousAppoinment = async (req, res) => {

}




module.exports = {
    addSlots,
    getAllSlots,
    addAppoinment,
    getAppoinments,
    getpreviousvideoAppoinments,
    expertAppoinment,
    expertPreviousAppoinment

}