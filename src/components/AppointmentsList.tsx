import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, Booking, deleteBooking } from '../services/appointments';

const SLOT_ID_TO_TIME: Record<string, string> = {
  '1': '9:00 AM - 10:00 AM',
  '2': '10:00 AM - 11:00 AM',
  '3': '11:00 AM - 12:00 PM',
  '4': '1:00 PM - 2:00 PM',
  '5': '2:00 PM - 3:00 PM',
  '6': '3:00 PM - 4:00 PM',
  '7': '4:00 PM - 5:00 PM',
  '8': '5:00 PM - 6:00 PM',
};

const AppointmentsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<{id?: string, sessionId?: string} | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      try {
        const userBookings = await getUserBookings(currentUser.uid);
        // Only show bookings made as appointments
        const filtered = userBookings.filter(b => b.bookingType === 'appointment');
        setBookings(filtered);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentUser]);

  // Helper to convert "10:00 AM" to "10:00" (24-hour format)
  function convertTo24Hour(time12h: string) {
    if (!time12h || typeof time12h !== 'string' || !time12h.includes(':')) return '12:00';
    const [time, modifier] = time12h.split(' ');
    if (!modifier) return '12:00';
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (isNaN(h) || isNaN(parseInt(minutes))) return '12:00';
    if (modifier === 'PM' && h !== 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
  }

  // Format time as 1-hour slot (e.g., 10:00 AM - 11:00 AM)
  function getOneHourSlot(time: string) {
    if (!time || typeof time !== 'string') return 'Invalid time';
    if (time.includes('-')) return time;
    const [timeStr, modifier] = time.split(' ');
    if (!modifier || !timeStr || !timeStr.includes(':')) return 'Invalid time';
    let [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    if (isNaN(h) || isNaN(parseInt(minutes))) return 'Invalid time';
    let nextH = h + 1;
    let nextModifier = modifier;
    if (nextH === 12) {
      nextModifier = modifier === 'AM' ? 'PM' : 'AM';
    } else if (nextH > 12) {
      nextH = 1;
      nextModifier = modifier === 'AM' ? 'PM' : 'AM';
    }
    return `${h}:${minutes} ${modifier} - ${nextH}:${minutes} ${nextModifier}`;
  }

  const getAppointmentStatus = (date: string, time: string) => {
    let startTime = '12:00 PM';
    if (time && typeof time === 'string') {
      startTime = time.split(' - ')[0] || '12:00 PM';
    }
    const appointmentDateTime = new Date(`${date}T${convertTo24Hour(startTime)}`);
    const now = new Date();
    if (isNaN(appointmentDateTime.getTime())) {
      // If date is invalid, fallback to comparing just the date
      const today = new Date();
      const apptDate = new Date(date);
      return apptDate > today ? 'Upcoming' : 'Completed';
    }
    return appointmentDateTime > now ? 'Upcoming' : 'Completed';
  };

  const handleCancel = async (id?: string, sessionId?: string) => {
    setCancelInfo({ id, sessionId });
    setShowConfirm(true);
  };

  const confirmCancel = async () => {
    if (!cancelInfo?.id) {
      setShowConfirm(false);
      return;
    }
    try {
      await deleteBooking(cancelInfo.id, cancelInfo.sessionId);
      setBookings(bookings.filter(b => b.id !== cancelInfo.id));
    } catch (err) {
      alert('Failed to cancel appointment.');
    } finally {
      setShowConfirm(false);
      setCancelInfo(null);
    }
  };

  const cancelModal = () => {
    setShowConfirm(false);
    setCancelInfo(null);
  };

  // Helper function for date formatting
  function formatDMY(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  }

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (bookings.length === 0) return <div>No bookings found</div>;

  return (
    <>
      <div className="space-y-6">
        {bookings.map((booking) => {
          const status = getAppointmentStatus(booking.date, booking.time);
          const fullName = booking.sessionTitle || booking.sessionType;
          const timeSlot = SLOT_ID_TO_TIME[booking.time as string] || booking.time || 'N/A';
          return (
            <div key={booking.id || booking.reference || fullName + booking.date} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition-shadow">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg font-bold text-blue-700 mr-4">{fullName}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'Upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{status}</span>
                </div>
                <div className="flex flex-wrap items-center text-gray-600 text-sm mb-1">
                  <span className="mr-4"><strong>Date:</strong> {formatDMY(booking.date)}</span>
                  <span className="mr-4"><strong>Time Slot:</strong> {timeSlot}</span>
                  <span><strong>Type:</strong> {fullName}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                {status === 'Upcoming' && (
                  <button
                    onClick={() => handleCancel(booking.id, booking.sessionId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Cancel Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Cancel Appointment</h3>
            <p className="mb-6">Are you sure you want to cancel this appointment?</p>
            <div className="flex justify-end gap-4">
              <button onClick={cancelModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">No</button>
              <button onClick={confirmCancel} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsList; 