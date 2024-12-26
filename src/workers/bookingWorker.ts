// import { workerData, parentPort } from 'worker_threads';
// import mongoose from 'mongoose';
// import AppointmentRepo from '../repositories/appointmentRepo.js'; 
// import { IAppointment } from '../models/appointmentModel.js'; 

// (async () => {
//     const { userId, doctorId, patientId, appointmentDate, timeSlot, consultationMode }  = workerData;

//     try {
//         const appointmentRepo = new AppointmentRepo();

//         // Check if the time slot is already booked
//         const existingAppointment = await appointmentRepo.findAppointmentBySlot(doctorId, appointmentDate, timeSlot);
//         if (existingAppointment) {
//             parentPort?.postMessage({ success: false, message: 'Time slot already booked' });
//             return;
//         }

//         // Create the appointment if the slot is available
//         const appointmentData = {
//             userId,
//             doctorId,
//             patientId,
//             appointmentDate,
//             timeSlot,
//             consultationMode,
//             status: 'confirmed',  // Initial status can be confirmed if booking is successful
//             paymentStatus: 'unpaid', // Default payment status
//         };

//         const newAppointment = await appointmentRepo.createAppointment(appointmentData);
//         parentPort?.postMessage({ success: true, message: 'Appointment booked successfully', appointment: newAppointment });
//     } catch (error: any) {
//         console.error('Error in booking:', error);
//         parentPort?.postMessage({ success: false, message: 'Error booking appointment', error: error.message });
//     }
// })();
