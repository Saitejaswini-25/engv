import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Star, User, Briefcase, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Dialog } from '@headlessui/react';

const domains = ['All', 'Business And Management', 'Engineering', 'Tech', 'Design'];

const MentorBookingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [mentors, setMentors] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingService, setBookingService] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const razorpayContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'mentors'));
      const mentorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMentors(mentorList);
      setSelectedMentor(mentorList[0] || null);
      setLoading(false);
    };
    fetchMentors();
  }, []);

 useEffect(() => {
  if (bookingModalOpen && bookingService?.price !== 0 && bookingService?.price !== '0') {
    setTimeout(() => {
      if (razorpayContainerRef.current) {
        razorpayContainerRef.current.innerHTML = ''; // clear old script if any
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.setAttribute('data-payment_button_id', 'pl_QZQCMR4tWobPfx'); // ✅ your correct ID
        script.async = true;
        razorpayContainerRef.current.appendChild(script);
      }
    }, 300); // wait for modal to mount
  }
}, [bookingModalOpen, bookingService]);


  const filteredMentors = selectedDomain === 'All'
    ? mentors
    : mentors.filter(m => (m.expertise || m.domain) === selectedDomain);

  const handleBookNow = (service: any) => {
    setBookingService(service);
    setBookingDate('');
    setBookingTime('');
    setBookingError('');
    setBookingSuccess('');
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    if (!currentUser || !selectedMentor || !bookingService) return;
    if (!bookingDate || !bookingTime) {
      setBookingError('Please select date and time.');
      return;
    }
    setBookingLoading(true);
    try {
      await addDoc(collection(db, 'mentorshipBookings'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        mentorId: selectedMentor.id,
        mentorName: selectedMentor.name,
        mentorExpertise: selectedMentor.expertise,
        service: bookingService,
        date: bookingDate,
        time: bookingTime,
        status: 'booked',
        createdAt: new Date()
      });
      setBookingSuccess('Session booked successfully!');
      setBookingModalOpen(false);
    } catch (err) {
      setBookingError('Failed to book session. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto flex flex-col md:flex-row gap-6 py-8">
          <section className="flex-1 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-80 bg-white rounded-xl shadow p-4 overflow-y-auto max-h-[70vh]">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Mentors</h2>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading mentors...</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredMentors.map(mentor => (
                    <div
                      key={mentor.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${selectedMentor && selectedMentor.id === mentor.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-900">{mentor.name}</span>
                          {mentor.topMentor && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-bold">Top Mentor</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Star className="w-4 h-4 text-green-500" /> {mentor.rating} &bull; {mentor.experience} years &bull; {mentor.reviews} Reviews
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 bg-white rounded-xl shadow p-6 min-h-[400px]">
              {loading || !selectedMentor ? (
                <div className="text-center text-gray-400 py-8">Select a mentor to view details</div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-blue-900">{selectedMentor.name}</span>
                      {selectedMentor.topMentor && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-bold">Top Mentor</span>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4" /> {selectedMentor.experience} years
                      <Star className="w-4 h-4 text-green-500" /> {selectedMentor.rating} ({selectedMentor.reviews} reviews)
                    </div>
                    {selectedMentor.expertise && (
                      <div className="text-xs text-blue-700 font-medium mb-2">{selectedMentor.expertise}</div>
                    )}
                    <div className="text-gray-700 mb-4">{selectedMentor.bio}</div>
                    <div className="flex gap-2 mb-4">
                      {selectedMentor.linkedin && (
                        <a href={selectedMentor.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Services</h3>
                      {(!selectedMentor.services || selectedMentor.services.length === 0) ? (
                        <div className="text-gray-400 italic py-4">No services listed by this mentor yet.</div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {selectedMentor.services.map((service: any, idx: number) => (
                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl px-5 py-4 shadow-sm transition-transform hover:scale-[1.02]">
                              <div>
                                <div className="font-semibold text-blue-900 text-lg flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500" /> {service.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{service.type} &bull; {service.duration}</div>
                              </div>
                              <div className="flex items-center gap-4 mt-3 md:mt-0">
                                <span className={service.price === 0 || service.price === '0' ? 'font-bold text-green-600 text-xl' : 'font-bold text-blue-700 text-xl'}>{service.price === 0 || service.price === '0' ? 'Free' : `₹${service.price}`}</span>
                                {currentUser ? (
                                  <button className="btn btn-primary px-5 py-2 text-sm rounded-lg shadow hover:bg-blue-700 transition" onClick={() => handleBookNow(service)}>Book Now</button>
                                ) : (
                                  <button className="btn bg-gray-200 text-gray-500 px-5 py-2 text-sm rounded-lg cursor-not-allowed" onClick={() => navigate('/login')}>Login to Book</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />

      {/* Book Now Modal */}
      <Dialog open={bookingModalOpen} onClose={() => setBookingModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-lg font-bold mb-2">Book 1:1 Session</Dialog.Title>
            <div className="mb-2 font-medium text-blue-900">{selectedMentor?.name}</div>
            <div className="mb-2 text-sm text-gray-700">{bookingService?.name} ({bookingService?.type}, {bookingService?.duration})</div>

            {bookingService?.price === 0 || bookingService?.price === '0' ? (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3 mt-2">
                <label className="font-medium">Date:</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="border rounded px-3 py-2" required />
                <label className="font-medium">Time:</label>
                <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="border rounded px-3 py-2" required />
                {bookingError && <div className="text-red-600 text-sm">{bookingError}</div>}
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={bookingLoading}>
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                  <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setBookingModalOpen(false)}>Cancel</button>
                </div>
                {bookingSuccess && <div className="text-green-600 mt-2">{bookingSuccess}</div>}
              </form>
            ) : (
              <>
                <div className="flex flex-col gap-3 mt-2">
                  <label className="font-medium">Date:</label>
                  <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="border rounded px-3 py-2" required />
                  <label className="font-medium">Time:</label>
                  <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="border rounded px-3 py-2" required />
                </div>
         <form ref={razorpayContainerRef} className="mt-4"></form>


                <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mt-2" onClick={() => setBookingModalOpen(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default MentorBookingPage;
