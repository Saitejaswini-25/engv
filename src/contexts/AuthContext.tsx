import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  applyActionCode,
  reload,
  getAuth,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  sendWelcomeMessage, 
  sendVerificationMessage,
  validateWhatsAppNumber 
} from '../services/whatsappService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, phone: string, whatsapp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isVerified: boolean;
  verifyEmail: (oobCode: string) => Promise<void>;
  checkEmailVerification: () => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateVerificationStatus = async (user: User | null) => {
    if (user) {
      try {
        await reload(user);
        const verified = user.emailVerified;
        setIsVerified(verified);
        
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          isVerified: verified,
          lastLogin: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating verification status:', error);
        setIsVerified(false);
      }
    } else {
      setIsVerified(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await updateVerificationStatus(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkEmailVerification = async () => {
    if (currentUser) {
      await updateVerificationStatus(currentUser);
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string, whatsapp: string) => {
    try {
      // Validate WhatsApp number
      if (!validateWhatsAppNumber(whatsapp)) {
        throw new Error('Please enter a valid WhatsApp number with country code');
      }

      // Create the user first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: name
      });

      // Send email verification
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      };
      await sendEmailVerification(user, actionCodeSettings);
      
      // IMPORTANT: Store user data in Firestore with explicit error handling
      try {
        const userData = {
          email: user.email,
          name,
          displayName: name,
          phone,
          whatsapp,
          createdAt: new Date().toISOString(),
          isVerified: false
        };

        console.log('Attempting to store user data:', userData);
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('User data successfully stored in Firestore');
      } catch (firestoreError) {
        console.error('Failed to store user data in Firestore:', firestoreError);
        // Don't throw here - we want to continue even if Firestore fails
      }

      // WhatsApp notification logic
      try {
        await sendWelcomeMessage(name, whatsapp);
        const verificationLink = await getAuth().currentUser?.getIdToken();
        if (verificationLink) {
          await sendVerificationMessage(name, whatsapp, `${window.location.origin}/verify-email?token=${verificationLink}`);
        }
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp messages:', whatsappError);
      }

      // Remove this navigation - let the component handle it
      // navigate('/profile');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Unknown error occurred');
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      } else {
        throw error;
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateVerificationStatus(user);
      // Do not navigate here; let the page handle navigation after currentUser is set
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      } else {
      throw error;
    }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsVerified(false);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);
      if (currentUser) {
        await updateVerificationStatus(currentUser);
      }
      navigate('/profile');
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async () => {
    if (!currentUser) return;

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true
      };

      await sendEmailVerification(currentUser, actionCodeSettings);
      
      // Get user's WhatsApp number from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.whatsapp) {
          const verificationLink = await currentUser.getIdToken();
          await sendVerificationMessage(
            userData.name,
            userData.whatsapp,
            `${window.location.origin}/verify-email?token=${verificationLink}`
          );
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    isVerified,
    verifyEmail,
    checkEmailVerification,
    resendVerification,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};