import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, BookOpen, Edit2, Save, X, Mail, MessageCircle, GraduationCap, Clock } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import UserSessionsList from '../components/UserSessionsList';
import { Link } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  whatsapp: string;
  education: {
    degree: string;
    specialization: string;
    college: string;
    collegeLocation: string;
    currentYear: string;
    graduationYear: string;
  };
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  sessionType: string;
  status: 'booked' | 'completed' | 'cancelled';
  reference: string;
}

interface Session {
  id: string;
  title: string;
  instructor: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

const ProfilePage: React.FC = () => {
  const { currentUser, loading: authLoading, isVerified } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'sessions'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileCompletionPrompt, setShowProfileCompletionPrompt] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [mentorBookings, setMentorBookings] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    console.log('ProfilePage: currentUser', currentUser);
    console.log('ProfilePage: profileData', profileData);
  }, [currentUser, profileData]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch profile data by UID
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as ProfileData;
          setProfileData(userData);
          
          // Check if profile needs completion
          if (!userData.name || !userData.email || !userData.whatsapp) {
            setShowProfileCompletionPrompt(true);
          }
        } else {
          setProfileData(null);
        }

        // Fetch mentor bookings
        console.log('Current user UID:', currentUser.uid);
        const mentorBookingsQuery = query(
          collection(db, 'mentorshipBookings'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        const mentorBookingsSnapshot = await getDocs(mentorBookingsQuery);
        const bookings = mentorBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched mentorBookings:', bookings);
        setMentorBookings(bookings);

        // Fetch all bookings for the current user
        const appointmentsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'booked'), 
          orderBy('date', 'desc')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(appointmentsData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const updateCompletedStatuses = async () => {
      const now = new Date();
      for (const booking of mentorBookings) {
        if (booking.status === 'booked' && booking.date && booking.time) {
          const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
          if (bookingDateTime < now) {
            // Update status to completed in Firestore
            await updateDoc(doc(db, 'mentorshipBookings', booking.id), { status: 'completed' });
            booking.status = 'completed';
          }
        }
      }
    };
    if (mentorBookings.length > 0) {
      updateCompletedStatuses();
    }
  }, [mentorBookings]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!profileData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profileData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!profileData?.whatsapp?.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(profileData.whatsapp)) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp number with country code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setProfileData(prev => {
      if (!prev) return prev;
      
      // Handle nested education fields
      if (name.startsWith('education.')) {
        const field = name.split('.')[1];
        return {
          ...prev,
          education: {
            ...prev.education,
            [field]: value
          }
        };
      }
      
      // Handle regular fields
      return {
        ...prev,
        [name]: value
      };
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const userDocRef = doc(db, 'users', currentUser?.uid!);
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: new Date()
      });
      setShowProfileCompletionPrompt(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    await updateDoc(doc(db, 'mentorshipBookings', bookingId), { status: 'cancelled' });
    setMentorBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const isEducationIncomplete = (profile: ProfileData | null) => {
    if (!profile || !profile.education) return true;
    const edu = profile.education;
    return !edu.degree || !edu.specialization || !edu.college || !edu.collegeLocation || !edu.currentYear || !edu.graduationYear;
  };

  useEffect(() => {
    if (profileData && isEducationIncomplete(profileData)) {
      setIsEditing(true);
      setShowProfileCompletionPrompt(true);
    }
  }, [profileData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Please log in to view your profile</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">We couldn't find your profile data. Please contact support or try logging out and logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Email Verification Reminder */}
      {!isVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please verify your email address to access all features. 
                <Link to="/verify-email" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                  Click here to verify
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-6"
          >
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <User className="h-16 w-16 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{profileData?.name || 'User'}</h1>
              <p className="mt-2 text-gray-600 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-400" />
                {profileData?.email}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Prompt */}
        {(showProfileCompletionPrompt || isEducationIncomplete(profileData)) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-blue-800">Complete Your Educational Details</h3>
                <p className="mt-1 text-blue-700">
                  Please fill in all educational details to continue using your account. This is mandatory.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <nav className="flex space-x-8 px-6 py-4">
            {['profile', 'appointments', 'sessions'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (!isEducationIncomplete(profileData)) setActiveTab(tab as 'profile' | 'appointments' | 'sessions');
                }}
                className={`$
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200
                  ${isEducationIncomplete(profileData) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isEducationIncomplete(profileData)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <div className="flex items-center space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      disabled={isEducationIncomplete(profileData)}
                    >
                      <Edit2 className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { if (!isEducationIncomplete(profileData)) setIsEditing(false); }}
                        className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
                        disabled={isEducationIncomplete(profileData)}
                      >
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={profileData?.name || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-900">{profileData?.name}</p>
                        </div>
                      )}
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={profileData?.email || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">{profileData?.email}</p>
                        </div>
                      )}
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="tel"
                          name="whatsapp"
                          value={profileData?.whatsapp || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your WhatsApp number with country code (e.g., +1234567890)"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.whatsapp ? 'border-red-300' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">{profileData?.whatsapp || 'Not provided'}</p>
                        </div>
                      )}
                      {errors.whatsapp && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.whatsapp}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          name="education.degree"
                          value={profileData?.education?.degree || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your degree (e.g., B.Tech, M.Tech)"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <select
                          name="education.specialization"
                          value={profileData?.education?.specialization || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Specialization</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Civil">Civil</option>
                          <option value="Chemical">Chemical</option>
                          <option value="Aerospace">Aerospace</option>
                          <option value="Biotechnology">Biotechnology</option>
                          <option value="Other">Other</option>
                        </select>
                        <input
                          type="text"
                          name="education.college"
                          value={profileData?.education?.college || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your college name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <input
                          type="text"
                          name="education.collegeLocation"
                          value={profileData?.education?.collegeLocation || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your college location"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <select
                          name="education.currentYear"
                          value={profileData?.education?.currentYear || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Current Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          
                        </select>
                        <input
                          type="text"
                          name="education.graduationYear"
                          value={profileData?.education?.graduationYear || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your graduation year (e.g., 2024)"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">
                            {profileData?.education?.degree || 'Not provided'}
                            {profileData?.education?.specialization && ` in ${profileData.education.specialization}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">
                            {profileData?.education?.college || 'Not provided'}
                            {profileData?.education?.collegeLocation && `, ${profileData.education.collegeLocation}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-gray-400" />
                          <p className="text-gray-900">
                            {profileData?.education?.currentYear || 'Not provided'}
                            {profileData?.education?.graduationYear && ` (Expected Graduation: ${profileData.education.graduationYear})`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-xl font-bold mb-4">Your Mentor Bookings</h2>
              {mentorBookings.length === 0 ? (
                <div className="text-gray-500">
                  No mentor bookings found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentorBookings.map(booking => {
                    const isFuture = (() => {
                      if (!booking.date || !booking.time) return false;
                      const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
                      return bookingDateTime > new Date();
                    })();
                    return (
                      <div key={booking.id} className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                        <h3 className="text-lg font-bold mb-1">{booking.mentorName}</h3>
                        {booking.service?.name && (
                          <p className="text-blue-700 font-medium mb-1">Service: {booking.service.name}</p>
                        )}
                        <p className="text-gray-600 text-center mb-2">Date: {booking.date ? (() => { const d = new Date(booking.date); return d.toLocaleDateString('en-GB'); })() : booking.date}</p>
                        <p className="text-gray-600 text-center mb-4">Time: {booking.time ? (() => { const [h, m] = booking.time.split(':'); const hour = parseInt(h, 10); const ampm = hour >= 12 ? 'PM' : 'AM'; const hour12 = hour % 12 || 12; return `${hour12}:${m} ${ampm}`; })() : booking.time}</p>
                        <p className={`text-center mb-2 font-semibold ${
                          booking.status === 'cancelled' ? 'text-yellow-600' : booking.status === 'booked' ? 'text-green-600' : 'text-gray-500'
                        }`}>Status: {booking.status}</p>
                        {booking.status === 'booked' && isFuture && (
                          <button
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <UserSessionsList />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 

