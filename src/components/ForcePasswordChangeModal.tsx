import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  userEmail: string;
  onPasswordChanged: () => void;
}

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ 
  isOpen, 
  userEmail, 
  onPasswordChanged 
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain uppercase, lowercase, and numbers');
      setLoading(false);
      return;
    }

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Mark password as updated in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_password_updated: true })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't fail the entire process if profile update fails
      }

      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      
      // Notify parent component
      onPasswordChanged();
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Change Required
            </h2>
            <p className="text-gray-600">
              For security reasons, you must change your temporary password before continuing.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Account: <span className="font-medium">{userEmail}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Password Requirements</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className={newPassword.length >= 8 ? 'text-green-700' : ''}>
                      • At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-700' : ''}>
                      • At least one uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'text-green-700' : ''}>
                      • At least one lowercase letter
                    </li>
                    <li className={/\d/.test(newPassword) ? 'text-green-700' : ''}>
                      • At least one number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-700' : ''}>
                      • Special characters recommended
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              This is required for security. You cannot access the dashboard until you change your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChangeModal;