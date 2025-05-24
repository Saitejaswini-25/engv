import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, Booking, deleteBooking } from '../services/appointments';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Session {
  id: string;
  title: string;
  domain: string;
  date: string;
  time: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  level: string;
}

// Helper function for date formatting
function formatDMY(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
}

// Helper function for 12-hour time with am/pm
function formatTime12h(time: string) {
  if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) return time;
  const [h, m] = time.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${m} ${ampm}`;
}

const UserSessionsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<{bookingId?: string, sessionId?: string} | null>(null);

  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const userBookings: Booking[] = await getUserBookings(currentUser.uid);
        setBookings(userBookings);
        const filteredBookings = userBookings.filter(b => b.bookingType === 'session');
        const sessionIds = filteredBookings.map(b => b.sessionId).filter(Boolean);
        const sessionPromises = sessionIds.map(async (id) => {
          if (!id) return null;
          const docRef = doc(db, 'sessions', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Session;
          }
          return null;
        });
        const sessionsData = (await Promise.all(sessionPromises)).filter(Boolean) as Session[];
        setSessions(sessionsData);
      } catch (err) {
        setError('Failed to fetch your sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchUserSessions();
  }, [currentUser]);

  const handleCancel = (sessionId: string) => {
    // Find the booking for this session
    const booking = bookings.find(b => b.sessionId === sessionId);
    if (booking) {
      setCancelInfo({ bookingId: booking.id, sessionId });
      setShowConfirm(true);
    }
  };

  const confirmCancel = async () => {
    if (!cancelInfo?.bookingId) {
      setShowConfirm(false);
      return;
    }
    // Debug logs to help trace 400 errors
    console.log('Cancel Info:', cancelInfo);
    console.log('Booking ID to delete:', cancelInfo.bookingId);
    console.log('Session ID to update:', cancelInfo.sessionId);
    try {
      await deleteBooking(cancelInfo.bookingId, cancelInfo.sessionId);
      setSessions(sessions.filter(s => s.id !== cancelInfo.sessionId));
    } catch (err) {
      alert('Failed to cancel session.');
      console.error('Error deleting booking:', err);
    } finally {
      setShowConfirm(false);
      setCancelInfo(null);
    }
  };

  const cancelModal = () => {
    setShowConfirm(false);
    setCancelInfo(null);
  };

  if (loading) return <div>Loading your sessions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (sessions.length === 0) return (
    <div>
      You have no upcoming sessions.<br />
      <a href="/sessions" className="text-blue-600 underline">Book a session now!</a>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition-shadow">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-lg font-bold text-blue-700 mr-4">{session.title}</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Enrolled</span>
              </div>
              <div className="flex flex-wrap items-center text-gray-600 text-sm mb-1">
                <span className="mr-4"><strong>Date:</strong> {formatDMY(session.date)}</span>
                <span className="mr-4"><strong>Time:</strong> {formatTime12h(session.time)}</span>
                <span className="mr-4"><strong>Domain:</strong> {session.domain}</span>
                <span><strong>Instructor:</strong> {session.instructor}</span>
              </div>
             
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
              <button
                onClick={() => handleCancel(session.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
              >
                Cancel Session
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Cancel Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Cancel Session</h3>
            <p className="mb-6">Are you sure you want to cancel this session?</p>
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

export default UserSessionsList; 
