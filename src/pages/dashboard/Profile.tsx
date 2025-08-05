import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Check, User, X } from 'lucide-react';

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