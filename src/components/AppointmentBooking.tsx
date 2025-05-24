import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../services/appointments';

console.log('*** AppointmentBooking component loaded ***');

const SESSION_TYPE_TO_TITLE: Record<string, string> = {
  WebDev: 'Web Development',
  AppDev: 'App Development',
  Datascience: 'Data Science',
AIML: 'AI & Machine Learning',
 
};

const AppointmentBooking: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    sessionType: '',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('*** AppointmentBooking handleSubmit called ***');
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to book an appointment');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const mappedTitle = SESSION_TYPE_TO_TITLE[formData.sessionType] || formData.sessionType;
      console.log('Selected sessionType:', formData.sessionType);
      console.log('Mapped sessionTitle:', mappedTitle);
      const bookingData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        sessionType: formData.sessionType,
        sessionTitle: mappedTitle,
        date: formData.date,
        time: formData.time,
        userId: currentUser.uid,
        bookingType: 'appointment'
      };
      console.log('Booking data being sent:', bookingData);
      await createBooking(bookingData);
      setSuccess('Appointment booked successfully!');
      setFormData({
        userName: '',
        userEmail: '',
        sessionType: '',
        date: '',
        time: ''
      });
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="userEmail"
            value={formData.userEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Type</label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a session type</option>
            <option value="WebDev">Web Development</option>
            <option value="AppDev">App Development</option>
            <option value="Datascience">Data Science</option>
            <option value="AIML">AI & Machine Learning</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="text"
            name="time"
            placeholder="e.g. 10:00 AM - 11:00 AM or slot number"
            value={formData.time}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentBooking; 