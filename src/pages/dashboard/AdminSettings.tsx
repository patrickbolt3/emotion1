import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Users, 
  Mail, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface SystemStats {
  total_users: number;
  total_assessments: number;
  total_questions: number;
  total_states: number;
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    total_users: 0,
    total_assessments: 0,
    total_questions: 0,
    total_states: 0
  });
  const [settings, setSettings] = useState({
    site_name: 'Emotional Dynamics Indicator™',
    allow_registration: true,
    require_email_verification: false,
    max_assessments_per_user: 10,
    assessment_timeout_minutes: 60,
    enable_coach_invitations: true,
    enable_ai_insights: true
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchSystemStats();
    // In a real app, you'd fetch settings from a settings table
    setLoading(false);
  }, []);

  const fetchSystemStats = async () => {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Get assessment count
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true });

      if (assessmentError) throw assessmentError;

      // Get question count
      const { count: questionCount, error: questionError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      if (questionError) throw questionError;

      // Get harmonic states count
      const { count: stateCount, error: stateError } = await supabase
        .from('harmonic_states')
        .select('*', { count: 'exact', head: true });

      if (stateError) throw stateError;

      setStats({
        total_users: userCount || 0,
        total_assessments: assessmentCount || 0,
        total_questions: questionCount || 0,
        total_states: stateCount || 0
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // In a real implementation, you'd save these to a settings table
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshStats = async () => {
    setLoading(true);
    await fetchSystemStats();
    setLoading(false);
    setMessage({ type: 'info', text: 'System statistics refreshed' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefreshStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
          'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
          {message.type === 'error' && <AlertTriangle className="h-5 w-5 mr-2" />}
          {message.type === 'info' && <Info className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* System Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          System Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_assessments}</div>
            <div className="text-sm text-gray-500">Assessments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total_questions}</div>
            <div className="text-sm text-gray-500">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.total_states}</div>
            <div className="text-sm text-gray-500">Harmonic States</div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          General Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              id="site_name"
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="max_assessments" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Assessments per User
            </label>
            <input
              id="max_assessments"
              type="number"
              min="1"
              max="100"
              value={settings.max_assessments_per_user}
              onChange={(e) => setSettings({ ...settings, max_assessments_per_user: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Timeout (minutes)
            </label>
            <input
              id="timeout"
              type="number"
              min="15"
              max="180"
              value={settings.assessment_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, assessment_timeout_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* User Management Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          User Management
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Allow Public Registration</h3>
              <p className="text-sm text-gray-500">Allow users to register without invitation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_registration}
                onChange={(e) => setSettings({ ...settings, allow_registration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Require Email Verification</h3>
              <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_email_verification}
                onChange={(e) => setSettings({ ...settings, require_email_verification: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Enable Coach Invitations</h3>
              <p className="text-sm text-gray-500">Allow coaches to invite clients via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_coach_invitations}
                onChange={(e) => setSettings({ ...settings, enable_coach_invitations: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Feature Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Feature Settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Enable AI Insights</h3>
              <p className="text-sm text-gray-500">Provide AI-generated coaching recommendations in results</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_ai_insights}
                onChange={(e) => setSettings({ ...settings, enable_ai_insights: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <Database className="h-4 w-4 mr-2" />
            Backup Database
          </Button>
          
          <Button variant="outline" className="justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Test Email Settings
          </Button>
          
          <Button variant="outline" className="justify-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;