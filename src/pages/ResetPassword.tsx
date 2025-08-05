import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Brain, Lock, Check, AlertCircle, Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token and type from URL params (from Supabase auth verification)
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const redirectTo = searchParams.get('redirect_to');

  useEffect(() => {
    const verifyToken = async () => {
      setVerifying(true);
      
      // Check if we have the required parameters
      if (!token || type !== 'recovery') {
        setError('Invalid or missing reset token. Please request a new password reset.');
        setValidToken(false);
        setVerifying(false);
        return;
      }

      try {
        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });

        if (error) {
          console.error('Token verification error:', error);
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setValidToken(false);
        } else if (data.user) {
          console.log('Token verified successfully for user:', data.user.email);
          setValidToken(true);
          setError(null);
        } else {
          setError('Invalid reset token. Please request a new password reset.');
          setValidToken(false);
        }
      } catch (err: any) {
        console.error('Unexpected error during token verification:', err);
        setError('An error occurred while verifying your reset link. Please try again.');
        setValidToken(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Reset Link</h2>
              <p className="text-gray-600">
                Please wait while we verify your password reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!validToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">
                {error || 'This password reset link is invalid or has expired. Please request a new one.'}
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/login')} className="w-full">
                  Back to Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8">
            <div className="text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated successfully. You will be redirected to the login page shortly.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Continue to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Brain className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set your new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose a strong password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your new password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update password
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Password Security Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use at least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Avoid common words or personal information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;