import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface BookingDetails {
  userId: string;
  userEmail: string;
  userName: string;
  sessionType: string;
  date: string;
  time: string;
  reference: string;
}

export const sendBookingConfirmationEmail = async (bookingDetails: BookingDetails) => {
  try {
    // Store the booking in Firestore
    const bookingsRef = collection(db, 'bookings');
    await addDoc(bookingsRef, {
      ...bookingDetails,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      bookingType: 'appointment'
    });

    // In a real application, you would trigger a Cloud Function here to send the email
    // For now, we'll just log the email details
    console.log('Booking confirmation email would be sent with details:', bookingDetails);
    
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
}; 