import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const VerifyEmail = () => {
  const { currentUser, isVerified, verifyEmail, checkEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (oobCode) {
      setIsChecking(true);
      verifyEmail(oobCode)
        .catch((error) => {
          console.error('Error verifying email:', error);
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [oobCode, verifyEmail]);

  useEffect(() => {
    // Check verification status every 5 seconds
    const interval = setInterval(async () => {
      if (!isVerified && !isChecking) {
        await checkEmailVerification();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isVerified, isChecking, checkEmailVerification]);

  useEffect(() => {
    if (isVerified) {
      navigate('/profile');
    }
  }, [isVerified, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification email to {currentUser?.email}
          </p>
          <p className="mt-2 text-gray-600">
            Please check your inbox and click the verification link to continue.
          </p>
          {(oobCode || isChecking) && (
            <p className="mt-4 text-green-600">
              {oobCode ? 'Verifying your email...' : 'Checking verification status...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 