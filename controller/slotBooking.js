const Slot = require('../model/expert/slot')
const moment = require('moment')
const Appointment = require('../model/expert/appoinment')

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
        const findSlot = await Slot.findOne({
            expert: ExpertId,

            'slotes': {
                $elemMatch: {
                    'slot_time': { $gte: startingTime.format('h:mm A'), $lt: endingTime.format('h:mm A') }
                }
            }
        })
        console.log(findSlot, "findSlot");



        if (findSlot) {
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
        console.log("inside get all slotes");
        const expertId = req.params.id
        console.log(expertId);
        const slots = await Slot.find({ expert: expertId })
        if (slots) {
            console.log(slots);
            return res.status(200).json(slots);
        } else {
            return res.status(404).json("No slots avilable for this expert");
        }

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
        const { expertId, userId, slotId, consultingFee, paymentStatus, bookingType } = req.body

        const findSlots = await Slot.findOne({})


        const Appoinment = new Appointment({
            expert: expertId,
            user: userId,
            consultingFee: consultingFee,
            bookingType: bookingType,
            paymentStatus: paymentStatus,
            // createdAt:

        })

    } catch (error) {
        console.log(error);
    }

}














module.exports = {
    addSlots,
    getAllSlots,
    addAppoinment
}