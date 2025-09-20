import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIdFixer } from '../utils/userIdFix';

export const useUserIdValidation = () => {
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateUserId = async () => {
      if (!user) {
        setIsValid(false);
        return;
      }

      setIsValidating(true);
      setError(null);

      try {
        console.log('🔍 Validating user ID:', user.id);
        
        // Check if the current user ID is valid
        const isValid = await UserIdFixer.isUserIdValid(user.id);
        
        if (isValid) {
          console.log('✅ User ID is valid');
          setIsValid(true);
        } else {
          console.log('🚨 User ID is invalid, attempting to fix...');
          
          // Try to fix the user ID automatically
          const fixedUser = await UserIdFixer.fixUserId();
          
          if (fixedUser) {
            console.log('✅ User ID fixed successfully');
            setIsValid(true);
            // Force a page reload to pick up the new user data
            // Use setTimeout to avoid concurrent rendering issues
            setTimeout(() => {
              window.location.reload();
            }, 0);
          } else {
            console.log('❌ Failed to fix user ID');
            setIsValid(false);
            setError('User account not found. Please log in again.');
          }
        }
      } catch (err) {
        console.error('Error validating user ID:', err);
        setIsValid(false);
        setError('Failed to validate user account.');
      } finally {
        setIsValidating(false);
      }
    };

    validateUserId();
  }, [user]);

  const retryValidation = async () => {
    if (!user) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      const fixedUser = await UserIdFixer.fixUserId();
      
      if (fixedUser) {
        setIsValid(true);
        // Use setTimeout to avoid concurrent rendering issues
        setTimeout(() => {
          window.location.reload();
        }, 0);
      } else {
        setError('Unable to fix user account. Please log out and log in again.');
      }
    } catch (err) {
      setError('Failed to fix user account.');
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    isValid,
    error,
    retryValidation
  };
};
