import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Check, User, X, Lock, Eye, EyeOff } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;
        
        // Get user profile
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        const profileData = {
          id: user.id,
          first_name: data?.first_name,
          last_name: data?.last_name,
          email: user.email || '',
          role: data?.role || 'respondent'
        };
        
        setProfile(profileData);
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
    setError(null);
    
    try {
      if (!user) return;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setUpdateSuccess(true);
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          first_name: firstName,
          last_name: lastName
        });
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setPasswordSuccess(false);
    setPasswordError(null);
    
    // Validation
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setPasswordUpdating(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordUpdating(false);
      return;
    }
    
    try {
      // First verify current password by attempting to sign in
      if (!user?.email) {
        throw new Error('User email not found');
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordUpdating(false);
    }
  };
  
  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };
  
  if (loading) {
    return (
      <div className="animate-pulse max-w-3xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mt-8"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Failed to load profile. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold mb-4">
              {firstName ? firstName[0] : ''}{lastName ? lastName[0] : ''}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {firstName} {lastName}
            </h2>
            <p className="text-gray-600 mt-1">{profile.email}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
              {profile.role}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <X className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          {updateSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Profile updated successfully
            </div>
          )}
          
          {passwordSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Password updated successfully
            </div>
          )}
          
          {passwordError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <X className="h-5 w-5 mr-2" />
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    disabled
                    value={profile.email}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1">
                  <input
                    id="role"
                    name="role"
                    type="text"
                    disabled
                    value={profile.role}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 text-gray-500 capitalize sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Role can only be changed by an administrator</p>
              </div>
              
              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  {!showPasswordForm && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  )}
                </div>
                
                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
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
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
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
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelPasswordChange}
                        disabled={passwordUpdating}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={passwordUpdating}
                        className="flex-1"
                      >
                        {passwordUpdating ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">
                    Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                
                <Button
                  type="submit"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;