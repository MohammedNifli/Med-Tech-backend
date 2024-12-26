import { parentPort, workerData } from 'worker_threads';
import { ITimeSlotDetails } from '../models/slotModel.js';

function convertTo24HourFormat(time: string, period: string) {
    const [hour, minute] = time.split(':').map(Number);
    let hoursIn24 = hour;

    if (period === 'PM' && hour !== 12) {
        hoursIn24 += 12; // Convert PM to 24-hour format
    } else if (period === 'AM' && hour === 12) {
        hoursIn24 = 0; // Midnight case
    }

    return { hours: hoursIn24, minutes: minute };
}

function formatTo12Hour(time: Date): string {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format
    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
    return formattedTime;
}

function convertUTCToIST(date: Date): Date {
    // IST is UTC+5:30
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; 
    return new Date(date.getTime() + IST_OFFSET);
}

function generateTimeSlots(
    startDate: Date,
    endDate: Date,
    timeSlots: string[],
    doctorId: string,
    availableDays: string[],
    consultationMode: string
  ): any[]  {
    const slots = [];
    let currentDate = new Date(startDate);
    const amPmFormatRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9]) ?([AP]M)$/; 
    startDate = convertUTCToIST(startDate);
    endDate = convertUTCToIST(endDate);

    while (currentDate <= endDate) {
        for (let time of timeSlots) {
            const match = time.match(amPmFormatRegex);
            if (match) {
                const period = match[3]; 
                const hours = parseInt(match[1], 10); 
                const minutes = parseInt(match[2], 10); 

                // Day setting
                const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

                const slotStartTime = new Date(currentDate); // Initialize with current date
                slotStartTime.setHours(hours, minutes, 0, 0); // Set hours and minutes

                // Check if the constructed slotStartTime is valid
                if (isNaN(slotStartTime.getTime())) {
                    console.error('Invalid start time:', slotStartTime);
                    continue; // Skip this iteration if the time is invalid
                }

                const slotEndTime = new Date(slotStartTime);
                slotEndTime.setMinutes(slotEndTime.getMinutes() + 30); // Assuming each slot is 30 minutes

                // Check if the constructed slotEndTime is valid
                if (isNaN(slotEndTime.getTime())) {
                    console.error('Invalid end time:', slotEndTime);
                    continue; // Skip this iteration if the time is invalid
                }

                // Use dayOfWeek to check availability correctly
                const status = availableDays.includes(dayOfWeek) ? 'available' : 'not available';

                // Push the slot with the correct status
                slots.push({
                    startDateTime: slotStartTime,
                    endDateTime: slotEndTime,

                    status: status, // Use the computed status
                    consultationMode,
                    day:dayOfWeek,
                });
            }
        }
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return slots;
}

const generatedSlots = generateTimeSlots(
    new Date(workerData.startDate),
    new Date(workerData.endDate),
    workerData.timeSlots,
    workerData.doctorId,
    workerData.availableDays,
    workerData.consultationMode
);

// Optionally log the slots in 12-hour format for verification
generatedSlots.forEach(slot => {
    console.log(`Slot: ${formatTo12Hour(slot.startDateTime)} - ${formatTo12Hour(slot.endDateTime)}`);
});

parentPort?.postMessage(generatedSlots);
