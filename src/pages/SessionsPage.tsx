// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  getDoc,
  doc,
   deleteDoc,
  serverTimestamp, 
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, User, Clock, CheckCircle, BookOpen, GraduationCap, Brain, Code, Smartphone, Database, Sparkles, X, CreditCard } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  description?: string;
  domain: string;
  level: string;
  whatsappGroupLink?: string;
  price?: number;
}

const DOMAIN_OPTIONS = [
  'All',
  'Web Development',
  'Aptitude',
  'AI & ML',
  'VLSI',
  'IOT and Embedded systems',
  'Java Complete Course',
  'Database Management System',
];

const DOMAIN_ICONS = {
  'Web Development': Code,
  'Aptitude': Database,
  'AI & ML': Brain,
  'VLSI': Sparkles,
  'IOT and Embedded systems': Database,
  'Java Complete Course': Code,
  'Database Management System': Database,
};

function formatTimeTo12Hour(time24: string) {
  const [hour, minute] = time24.split(":");
  const date = new Date();
  date.setHours(Number(hour));
  date.setMinutes(Number(minute));
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  // Listen for Razorpay payment success events
  useEffect(() => {
    // Function to handle Razorpay payment success events
    const handleRazorpayPaymentSuccess = (event) => {
      console.log('Razorpay payment success event received:', event.detail);
      
      // Check if this is our payment
      const bookingId = pendingBookingId || sessionStorage.getItem('pendingBookingId');
      if (bookingId && event.detail && event.detail.razorpay_payment_id) {
        handlePaymentSuccess(event.detail.razorpay_payment_id);
      }
    };
    
    // Add event listener for Razorpay payment success
    window.addEventListener('razorpay.payment.success', handleRazorpayPaymentSuccess);
    
    // Clean up
    return () => {
      window.removeEventListener('razorpay.payment.success', handleRazorpayPaymentSuccess);
    };
  }, [pendingBookingId]);

  // Check on load if there was a successful payment
  useEffect(() => {
    const successPayment = sessionStorage.getItem('paymentSuccess');
    const bookingId = sessionStorage.getItem('pendingBookingId');
    
    if (successPayment === 'true' && bookingId) {
      const completeBookingAfterPayment = async () => {
        try {
          // Get the booking
          const bookingRef = doc(db, 'bookings', bookingId);
          const bookingDoc = await getDoc(bookingRef);
          
          if (bookingDoc.exists()) {
            const bookingData = bookingDoc.data();
            
            // Update booking status if it's still pending
            if (bookingData.status === 'pending') {
              await updateDoc(bookingRef, {
                status: 'booked',
                paymentStatus: 'completed',
                paymentDate: new Date().toISOString()
              });
            }
            
            // Get the session to retrieve WhatsApp link
            const sessionDoc = await getDoc(doc(db, 'sessions', bookingData.sessionId));
            if (sessionDoc.exists()) {
              const sessionData = sessionDoc.data();
              if (sessionData.whatsappGroupLink) {
                setWhatsappLink(sessionData.whatsappGroupLink);
              }
            }
            
            // Show success modal
            setShowSuccess(true);
          }
        } catch (error) {
          console.error('Error completing booking after payment:', error);
        }
        
        // Clear session storage
        sessionStorage.removeItem('paymentSuccess');
        sessionStorage.removeItem('pendingBookingId');
      };
      
      completeBookingAfterPayment();
    }
  }, []);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log('Fetching sessions...');
        const querySnapshot = await getDocs(collection(db, 'sessions'));
        
        // Log raw data for inspection
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('Session ID:', doc.id);
          console.log('Session fields:', Object.keys(data));
          if (data.whatsappGroupLink) {
            console.log('Found WhatsApp link in session:', doc.id, data.whatsappGroupLink);
          }
        });
        
        const fetchedSessions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id,
            ...data,
            price: data.price || 0 // Ensure price field exists
          };
        });
        
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

useEffect(() => {
  if (showPayment) {
    const existingScript = document.getElementById('razorpay-button-script');
    if (existingScript) return; // Avoid re-adding script

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.dataset.payment_button_id = 'pl_QW1fJCrtt19YE2';
    script.id = 'razorpay-button-script';

    const form = document.getElementById('razorpay-form'); // ✅ <- not container
    if (form) form.appendChild(script); // ✅ script inside <form>
  }
}, [showPayment]);

  const handleBookNow = (session: Session) => {
    if (!currentUser) {
      alert('You must be logged in to book a session');
      return;
    }
    
    // Log session data for debugging
    console.log('Selected session:', session);
    console.log('Session fields:', Object.keys(session));
    console.log('WhatsApp link in session:', session.whatsappGroupLink);
    
    setSelectedSession(session);
    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    if (!currentUser || !selectedSession) {
      setShowConfirm(false);
      alert('You must be logged in to book a session');
      return;
    }
    
    if (bookingInProgress) {
      return;
    }
    
    setBookingInProgress(true);
    let debugOutput = '';
    
    try {
      console.log('Starting booking process...');
      debugOutput += 'Starting booking process...\n';
      
      // Store the WhatsApp link immediately
      let whatsappGroupLinkValue = selectedSession.whatsappGroupLink;
      debugOutput += `Initial WhatsApp link: ${whatsappGroupLinkValue || 'not found'}\n`;
      
      // Directly fetch the session document again to ensure we have fresh data
      try {
        const sessionDoc = await getDoc(doc(db, 'sessions', selectedSession.id));
        if (sessionDoc.exists()) {
          const freshData = sessionDoc.data();
          debugOutput += `Fresh session data fields: ${Object.keys(freshData).join(', ')}\n`;
          if (freshData.whatsappGroupLink) {
            whatsappGroupLinkValue = freshData.whatsappGroupLink;
            debugOutput += `Found WhatsApp link in fresh data: ${whatsappGroupLinkValue}\n`;
          }
        }
      } catch (fetchError) {
        console.error('Error fetching fresh session data:', fetchError);
        debugOutput += `Error fetching fresh data: ${fetchError}\n`;
      }
      
      // Check for existing bookings
    // Check for existing bookings
const bookingsRef = collection(db, 'bookings');
const q = query(
  bookingsRef, 
  where('userId', '==', currentUser.uid),
  where('sessionId', '==', selectedSession.id)
);
const querySnapshot = await getDocs(q);

let alreadyBooked = false;

for (const docSnap of querySnapshot.docs) {
  const booking = docSnap.data();
  
  if (booking.status === 'booked') {
    alreadyBooked = true;
    break;
  }

  // Optional cleanup: remove any pending bookings
  if (booking.status === 'pending') {
    await deleteDoc(doc(db, 'bookings', docSnap.id));
  }
}

if (alreadyBooked) {
  setShowConfirm(false);
  setBookingInProgress(false);
  alert('You have already booked this session');
  return;
}

      
      // Check if session is free or paid
      const sessionPrice = selectedSession.price || 0;
      
      if (sessionPrice === 0) {
        // FREE SESSION FLOW
        // Create booking data
        const bookingData = {
          userId: currentUser.uid,
          userEmail: currentUser.email || '',
          userName: currentUser.displayName || '',
          sessionId: selectedSession.id,
          sessionTitle: selectedSession.title,
          date: selectedSession.date,
          time: selectedSession.time,
          instructor: selectedSession.instructor,
          status: 'booked',
          createdAt: serverTimestamp(),
          bookingType: 'session',
          domain: selectedSession.domain || '',
          whatsappGroupLink: whatsappGroupLinkValue, // Store link in booking
          price: 0,
          paymentStatus: 'free'
        };
        
        // Save booking to Firestore
        await addDoc(collection(db, 'bookings'), bookingData);
        
        // Set WhatsApp link for success modal
        if (whatsappGroupLinkValue) {
          setWhatsappLink(whatsappGroupLinkValue);
          debugOutput += `Setting WhatsApp link for modal: ${whatsappGroupLinkValue}\n`;
        } else {
          debugOutput += 'No WhatsApp link to display\n';
        }
        
        setDebugInfo(debugOutput);
        setShowConfirm(false);
        setShowSuccess(true);
      } else {
        // PAID SESSION FLOW
        // Create pending booking
        const pendingBookingData = {
          userId: currentUser.uid,
          userEmail: currentUser.email || '',
          userName: currentUser.displayName || '',
          sessionId: selectedSession.id,
          sessionTitle: selectedSession.title,
          date: selectedSession.date,
          time: selectedSession.time,
          instructor: selectedSession.instructor,
          status: 'pending',
          createdAt: serverTimestamp(),
          bookingType: 'session',
          domain: selectedSession.domain || '',
          whatsappGroupLink: whatsappGroupLinkValue,
          price: sessionPrice,
          paymentStatus: 'pending'
        };
        
        // Save pending booking
        const pendingBookingRef = await addDoc(collection(db, 'bookings'), pendingBookingData);
        const bookingId = pendingBookingRef.id;
        console.log('Created pending booking:', bookingId);
        setPendingBookingId(bookingId);
        
        // Store booking ID for after payment
        sessionStorage.setItem('pendingBookingId', bookingId);
        
        // Close confirmation modal and show payment
        setShowConfirm(false);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Booking error:', error);
      debugOutput += `Booking error: ${error.message}\n`;
      setDebugInfo(debugOutput);
      setShowConfirm(false);
      alert(`Failed to book the session: ${error.message}`);
    } finally {
      setBookingInProgress(false);
    }
  };




  const cancelBooking = () => {
    setShowConfirm(false);
    setSelectedSession(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const filteredSessions = sessions.filter((session: Session) => {
    const domainMatch =
      selectedDomain === 'All' ||
      (selectedDomain === 'Web Development'
        ? ['Front End Development', 'Python Full Stack Development'].includes(session.domain)
        : session.domain === selectedDomain);
    return domainMatch && session.date >= today;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Expand Your Knowledge with Expert-Led Sessions
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join interactive learning sessions led by industry experts. Master new skills and advance your career.
            </p>
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <BookOpen className="w-5 h-5" />
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <GraduationCap className="w-5 h-5" />
                <span>Interactive Learning</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Sparkles className="w-5 h-5" />
                <span>Career Growth</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Section */}
      <section className="section py-16 bg-gradient-to-br from-gray-50 to-blue-50 min-h-[60vh]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-72 bg-white rounded-2xl shadow-lg p-6 mb-8 md:mb-0 md:mr-8 flex-shrink-0 border border-blue-100">
            <h3 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Filter by Domain
            </h3>
            <div className="flex flex-col gap-3">
              {DOMAIN_OPTIONS.map(domain => {
                const Icon = DOMAIN_ICONS[domain] || BookOpen;
                return (
                  <label
                    key={domain}
                    className={`flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-all duration-200 ${
                      selectedDomain === domain
                        ? 'bg-blue-50 border border-blue-200 shadow-sm'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="domain"
                      value={domain}
                      checked={selectedDomain === domain}
                      onChange={() => setSelectedDomain(domain)}
                      className="accent-blue-600"
                    />
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">{domain}</span>
                  </label>
                );
              })}
            </div>
          </aside>

          {/* Sessions Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sessions...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-blue-100">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No sessions available for the selected domain. Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSessions.map(session => {
                  const DomainIcon = DOMAIN_ICONS[session.domain] || BookOpen;
                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl shadow-lg flex flex-col justify-between border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all duration-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <DomainIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">{session.domain}</span>
                          </div>
                          
                          {/* Price Tag */}
                          {session.price > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CreditCard className="w-3 h-3 mr-1" />
                              ₹{session.price}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Free
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight">{session.title}</h2>
                        <div className="space-y-3 mb-4">
                          <p className="flex items-center text-gray-700">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            <span className="font-medium">Instructor:</span>
                            <span className="ml-1">{session.instructor}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <Calendar className="w-5 h-5 mr-2 text-green-600" />
                            <span className="font-medium">Date:</span>
                            <span className="ml-1">{session.date}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <Clock className="w-5 h-5 mr-2 text-purple-600" />
                            <span className="font-medium">Time:</span>
                            <span className="ml-1">{formatTimeTo12Hour(session.time)}</span>
                          </p>
                        </div>
                        {session.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{session.description}</p>
                        )}
                      </div>
                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                          onClick={() => handleBookNow(session)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking Confirmation Modal */}
      {showConfirm && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
              <button
                onClick={cancelBooking}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to book the following session?
              </p>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedSession.title}
                </h4>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Instructor:</span>
                    <span className="ml-1">{selectedSession.instructor}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">{selectedSession.date}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-1">{formatTimeTo12Hour(selectedSession.time)}</span>
                  </p>
                </div>
                
                {/* Show price if it's a paid session */}
                {selectedSession.price > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <p className="font-medium flex justify-between">
                      <span>Session Fee:</span>
                      <span>₹{selectedSession.price}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={cancelBooking}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                disabled={bookingInProgress}
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className={`flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 ${
                  bookingInProgress ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={bookingInProgress}
              >
                {bookingInProgress ? 'Processing...' : selectedSession.price > 0 ? 'Proceed to Payment' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-xl mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedSession.title}</h4>
                
                <div className="space-y-2 mb-4">
                  <p className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Instructor:</span>
                    <span className="ml-1">{selectedSession.instructor}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">{selectedSession.date}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-1">{formatTimeTo12Hour(selectedSession.time)}</span>
                  </p>
                </div>
                
                <div className="border-t border-blue-200 pt-3">
                  <p className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Amount:</span>
                    <span className="font-bold text-lg text-green-700">₹{selectedSession.price}</span>
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 text-center">
                Complete the payment to confirm your booking.
              </p>
              
              {/* Razorpay Payment Button */}
    <form className="bg-white rounded-lg mb-4" id="razorpay-form">
  <div id="razorpay-button-container"></div>
</form>


              
              {/* For development/testing only - remove in production */}
    

            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your session has been booked successfully. You can view your bookings in your profile.
            </p>
            {whatsappLink ? (
              <div className="mb-6 bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-gray-800 mb-2">Join the WhatsApp group for this session:</p>
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Join WhatsApp Group
                </a>
              </div>
            ) : (
                           <p className="italic text-gray-500 mb-4">No WhatsApp group link is available for this session.</p>
            )}
            <button
              onClick={() => {
                setShowSuccess(false);
                setWhatsappLink(null);
                setSelectedSession(null);
                setDebugInfo('');
              }}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionsPage;
