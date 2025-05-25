import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Session {
  date: string;
  time: string;
  topic: string;
  maxBookings: number;
  currentBookings: number;
  domain: string;
  instructor: string;
  level: string;
  whatsappGroupLink?: string;
  price: number;
}

const ADMIN_UID = 'jL1HO03wyNU9qcvQU9ilNcuUoiG2';

const SessionManager: React.FC = () => {
  const [session, setSession] = useState<Session>({
    date: '',
    time: '',
    topic: '',
    maxBookings: 1,
    currentBookings: 0,
    domain: '',
    instructor: '',
    level: 'Beginner',
    whatsappGroupLink: '',
    price: 0,
  });

  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [isPaid, setIsPaid] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log('Your UID is:', currentUser.uid);
    }
  }, [currentUser]);

  if (!currentUser || currentUser.uid !== ADMIN_UID) {
    return null;
  }

  function to24Hour(time: string, ampm: 'AM' | 'PM') {
    let [hour, minute] = time.split(':').map(Number);
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  function to12Hour(time: string) {
    if (!time) return '';
    let [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSession({ ...session, time: e.target.value });
  };

  const handleAmpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAmpm(e.target.value as 'AM' | 'PM');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionsRef = collection(db, 'sessions');
      const time24 = to24Hour(session.time, ampm);
      await addDoc(sessionsRef, {
        title: session.topic,
        domain: session.domain,
        instructor: session.instructor,
        level: session.level,
        date: session.date,
        time: time24,
        capacity: session.maxBookings,
        enrolled: session.currentBookings,
        whatsappGroupLink: session.whatsappGroupLink,
        price: session.price,
        createdAt: serverTimestamp(),
        status: 'available',
      });

      setSession({
        date: '',
        time: '',
        topic: '',
        maxBookings: 1,
        currentBookings: 0,
        domain: '',
        instructor: '',
        level: 'Beginner',
        whatsappGroupLink: '',
        price: 0,
      });
      setAmpm('AM');
      setIsPaid(false);
      alert('Session added successfully!');
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Error adding session. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={session.date}
            onChange={(e) => setSession({ ...session, date: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={session.time}
              onChange={handleTimeChange}
              required
              placeholder="hh:mm"
              pattern="^(0[1-9]|1[0-2]):[0-5][0-9]$"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <select
              value={ampm}
              onChange={handleAmpmChange}
              className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          <span className="text-xs text-gray-400">Enter time as hh:mm and select AM/PM</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            value={session.topic}
            onChange={(e) => setSession({ ...session, topic: e.target.value })}
            required
            placeholder="Enter session topic"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Bookings</label>
          <input
            type="number"
            value={session.maxBookings}
            onChange={(e) => setSession({ ...session, maxBookings: parseInt(e.target.value) })}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Domain</label>
          <select
            value={session.domain}
            onChange={(e) => setSession({ ...session, domain: e.target.value })}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select domain</option>
            <option value="Web Development">Web Development</option>
            <option value="Aptitude">Aptitude</option>
            <option value="IOT and Embedded systems">IOT and Embedded systems</option>
            <option value="AI & ML">AI & ML</option>
            <option value="Java Complete Course">Java Complete Course</option>
            <option value="VLSI">VLSI</option>
            <option value="Database Management System">Database Management System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instructor</label>
          <input
            type="text"
            value={session.instructor}
            onChange={(e) => setSession({ ...session, instructor: e.target.value })}
            required
            placeholder="Enter instructor name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Session Type</label>
          <select
            value={isPaid ? 'paid' : 'free'}
            onChange={(e) => {
              const paid = e.target.value === 'paid';
              setIsPaid(paid);
              setSession({ ...session, price: paid ? session.price : 0 });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {isPaid && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              value={session.price}
              onChange={(e) =>
                setSession({ ...session, price: parseFloat(e.target.value) })
              }
              required={isPaid}
              min="0"
              placeholder="Enter price"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">WhatsApp Group Link</label>
          <input
            type="url"
            value={session.whatsappGroupLink}
            onChange={(e) => setSession({ ...session, whatsappGroupLink: e.target.value })}
            placeholder="https://chat.whatsapp.com/your-group-link"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Session
        </button>
      </form>
    </div>
  );
};

export default SessionManager;
