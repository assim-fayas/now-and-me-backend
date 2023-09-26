const Slot = require('../model/expert/slot')
const moment = require('moment')

const addSlots = async (req, res) => {
    try {
        console.log("inside addSlots");
        const ExpertId = req.headers.expertId
        const { startTime, endTime, date } = req.body

        console.log(date);
        console.log(new Date(date));


        if (date == date) {
            console.log(true);
        }


        const startingTime = moment(startTime, 'h:mm A')
        const currentDate = new Date();
        const slotDate = moment(date);
        const endingTime = moment(endTime, 'h:mm A');
        const slotDuration = 60
        //Is every field filled

        if (!date || !startTime || !endTime) {
            return res.staus(404).send('All fields are required')
        }
        console.log(slotDate.toDate());

        //validation Is slote date greater than current date? 
        if (slotDate.toDate() <= currentDate) {
            console.log("slote must be in future");
        }

        //validation Is ending time greater than starting time
        const expectedEndingTime = startingTime.clone().add(slotDuration, 'minutes');
        if (endingTime.isSameOrBefore(expectedEndingTime)) {
            console.log('Slotes must have 1 hour duration');
        }
        if (endingTime.isBefore(startingTime)) {
            console.log('Ending time cannot be less than starting time');
        }

        const isSlotExist = await Slot.find


        const findSlot = await Slot.findOne({
            expert: ExpertId, 'slotes.date': new Date(date),
            $or: [
                {
                    $and: [
                        { 'slotes.slot_time': { $gte: startingTime } },
                        { 'slotes.slot_time': { $lt: endingTime } }
                    ]


                },
                {
                    $and: [
                        { 'slotes.slot_time': { $gte: new Date(`2000-01-01 ${startingTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }) } },
                        { 'slotes.slot_time': { $lt: new Date(`2000-01-01 ${endingTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }) } }
                    ]
                }
            ]
        });

        if (findSlot) {
            return res.status(409).send({ message: "slote alredy exist" })
        }

        const createSlotes = generateTimeSlots(startTime, endTime, slotDuration, date)
        function generateTimeSlots(startTime, endTime, slotDuration, slotDate) {

            const slots = [];
            const start = new Date(`${slotDate} ${startTime}`);
            const end = new Date(`${slotDate} ${endTime}`);

            while (start < end) {
                const slotTime = start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                const sloteDoc = {
                    slot_time: slotTime,
                    slot_date: date,
                    date: date,
                    isBooked: false
                }
                slots.push(sloteDoc);
                start.setMinutes(start.getMinutes() + slotDuration);
            }
            return slots;
        }



        // const newSlote = {
        //     expert: ExpertId,
        //     date: date,
        //     startTime: startTime,
        //     endTime: endTime
        // }


    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "error in slot booking" })
    }
}























module.exports = {
    addSlots
}