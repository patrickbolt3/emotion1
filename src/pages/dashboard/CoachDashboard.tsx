import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import InviteClientModal from '../../components/InviteClientModal';
import { 
  BarChart3, 
  Clock, 
  UserPlus, 
  Users, 
  TrendingUp, 
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Copy,
  Check,
  Save,
  ExternalLink,
  Settings,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import MetricCard from '../../components/charts/MetricCard';

interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  latest_assessment?: {
    id: string;
    created_at: string;
    completed: boolean;
    dominant_state: string | null;
  };
  assessment_count: number;
  completed_count: number;
}

interface CoachAnalytics {
  total_clients: number;
  total_assessments: number;
  completion_rate: number;
  avg_completion_time: number;
  client_engagement: Array<{ date: string; active_clients: number }>;
  state_distribution: Array<{ name: string; count: number; color: string }>;
  client_progress: Array<{ name: string; completed: number; total: number }>;
}

const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [assessmentCode, setAssessmentCode] = useState<string | null>(null);
  const [customCtaLabel, setCustomCtaLabel] = useState('');
  const [customCtaUrl, setCustomCtaUrl] = useState('');
  const [savingCta, setSavingCta] = useState(false);
  const [ctaMessage, setCtaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [analytics, setAnalytics] = useState<CoachAnalytics>({
    total_clients: 0,
    total_assessments: 0,
    completion_rate: 0,
    avg_completion_time: 0,
    client_engagement: [],
    state_distribution: [],
    client_progress: []
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showCopyToast) {
      const timer = setTimeout(() => {
        setShowCopyToast(false);
        setCopySuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopyToast]);

  const fetchCoachProfile = useCallback(async () => {
    try {
      if (!user) return;
      
      // Get coach's assessment code
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('assessment_code, custom_cta_label, custom_cta_url')
        .eq('id', user.id)
        .eq('role', 'coach')
        .single();
      
      if (profileError) throw profileError;
      
      setAssessmentCode(profileData?.assessment_code || null);
      setCustomCtaLabel(profileData?.custom_cta_label || '');
      setCustomCtaUrl(profileData?.custom_cta_url || '');
    } catch (err) {
      console.error('Error fetching coach profile:', err);
    }
  }, [user]);

  const fetchClients = useCallback(async () => {
    try {
      if (!user) return;
      
      // Get clients for this coach with detailed assessment data
      const { data: clientProfiles, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .eq('coach_id', user.id)
        .order('first_name', { ascending: true });
      
      if (clientsError) throw clientsError;
      
      // Get assessment data for each client
      const clientsWithAssessments = await Promise.all(
        (clientProfiles || []).map(async (client) => {
          // Get all assessments for this client
          const { data: assessments, error: assessmentError } = await supabase
            .from('assessments')
            .select('id, created_at, completed, dominant_state')
            .eq('user_id', client.id)
            .order('created_at', { ascending: false });
          
          if (assessmentError) throw assessmentError;
          
          const completedAssessments = assessments?.filter(a => a.completed) || [];
          
          return {
            ...client,
            latest_assessment: assessments && assessments.length > 0 ? assessments[0] : undefined,
            assessment_count: assessments?.length || 0,
            completed_count: completedAssessments.length
          };
        })
      );
      
      setClients(clientsWithAssessments);
      
      // Calculate analytics
      await calculateAnalytics(clientsWithAssessments);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user, timeRange]);

  const calculateAnalytics = async (clientData: ClientProfile[]) => {
    try {
      const clientIds = clientData.map(c => c.id);
      
      // Get all assessments for analytics
      const { data: allAssessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, created_at, completed, dominant_state, user_id')
        .in('user_id', clientIds);
      
      if (assessmentError) throw assessmentError;
      
      const totalAssessments = allAssessments?.length || 0;
      const completedAssessments = allAssessments?.filter(a => a.completed) || [];
      const completionRate = totalAssessments ? (completedAssessments.length / totalAssessments * 100) : 0;
      
      // Calculate daily engagement for the selected time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const engagementData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const activeClients = new Set(
          allAssessments?.filter(a => {
            const assessmentDate = new Date(a.created_at);
            return assessmentDate >= dayStart && assessmentDate <= dayEnd;
          }).map(a => a.user_id)
        ).size;
        
        engagementData.push({
          date: format(date, 'MMM dd'),
          active_clients: activeClients
        });
      }
      
      // Get state distribution
      const { data: stateData, error: stateError } = await supabase
        .from('harmonic_states')
        .select('id, name, color');
      
      if (stateError) throw stateError;
      
      const stateMap = (stateData || []).reduce((acc, state) => {
        acc[state.id] = state;
        return acc;
      }, {} as Record<string, any>);
      
      // Count state occurrences
      const stateCounts: Record<string, number> = {};
      completedAssessments.forEach(assessment => {
        if (assessment.dominant_state) {
          stateCounts[assessment.dominant_state] = (stateCounts[assessment.dominant_state] || 0) + 1;
        }
      });
      
      const stateDistribution = Object.entries(stateCounts)
        .map(([stateId, count]) => ({
          name: stateMap[stateId]?.name || 'Unknown',
          count,
          color: stateMap[stateId]?.color || '#6B7280'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Client progress data
      const clientProgress = clientData.map(client => ({
        name: `${client.first_name} ${client.last_name}`,
        completed: client.completed_count,
        total: client.assessment_count
      })).filter(c => c.total > 0);
      
      setAnalytics({
        total_clients: clientData.length,
        total_assessments: totalAssessments,
        completion_rate: Math.round(completionRate * 10) / 10,
        avg_completion_time: 18, // Mock data
        client_engagement: engagementData,
        state_distribution: stateDistribution,
        client_progress: clientProgress
      });
    } catch (err) {
      console.error('Error calculating analytics:', err);
    }
  };
  
  const handleCopyCode = async () => {
    if (!assessmentCode) return;
    
    try {
      await navigator.clipboard.writeText(assessmentCode);
      setCopySuccess(true);
      setShowCopyToast(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = assessmentCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setShowCopyToast(true);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    fetchClients();
  };
  
  const handleSaveCtaSettings = async () => {
    if (!user) return;
    
   // Validation: Both fields must be filled or both must be empty
   const labelTrimmed = customCtaLabel.trim();
   const urlTrimmed = customCtaUrl.trim();
   
   if ((labelTrimmed && !urlTrimmed) || (!labelTrimmed && urlTrimmed)) {
     setCtaMessage({ type: 'error', text: 'Both Button Label and Button URL are required, or leave both empty for default behavior' });
     return;
   }
   
   if (labelTrimmed && !labelTrimmed.length) {
     setCtaMessage({ type: 'error', text: 'Button Label cannot be empty' });
     return;
   }
   
   if (urlTrimmed && !urlTrimmed.length) {
     setCtaMessage({ type: 'error', text: 'Button URL cannot be empty' });
     return;
   }
   
    setSavingCta(true);
    setCtaMessage(null);
    
    try {
     // Validate URL format if provided
     if (urlTrimmed) {
        try {
         new URL(urlTrimmed);
        } catch {
          setCtaMessage({ type: 'error', text: 'Please enter a valid URL (e.g., https://example.com)' });
          setSavingCta(false);
          return;
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
         custom_cta_label: labelTrimmed || null,
         custom_cta_url: urlTrimmed || null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setCtaMessage({ type: 'success', text: 'Call-to-action settings saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setCtaMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving CTA settings:', err);
      setCtaMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSavingCta(false);
    }
  };
  
  useEffect(() => {
    fetchCoachProfile();
    fetchClients();
  }, [fetchCoachProfile, fetchClients]);

  const engagementTrendData = analytics.client_engagement.map(item => ({
    name: item.date,
    value: item.active_clients
  }));

  const progressData = analytics.client_progress.map(client => ({
    name: client.name,
    value: client.total > 0 ? Math.round((client.completed / client.total) * 100) : 0,
    color: client.completed === client.total ? '#10B981' : client.completed > 0 ? '#F59E0B' : '#EF4444'
  }));
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {showCopyToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <Check className="h-5 w-5" />
          <span className="font-medium">Assessment code copied successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coaching Analytics</h1>
          <p className="text-gray-600 mt-1">Track your clients' progress and engagement</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Client
          </Button>
        </div>
      </div>
      
      {/* Assessment Code Section */}
      {assessmentCode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Assessment Code</h3>
              <p className="text-blue-700 text-sm mb-4">
                Share this code with clients so they can sign up and be automatically assigned to you.
              </p>
              <div className="flex items-center space-x-3">
                <div className="bg-white border border-blue-300 rounded-lg px-4 py-3 font-mono text-xl font-bold text-blue-900 tracking-wider">
                  {assessmentCode}
                </div>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      
      {/* Custom CTA Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Client Call-to-Action Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize the button that appears on your clients' results pages
            </p>
          </div>
        </div>
        
        {ctaMessage && (
          <div className={`mb-4 p-4 rounded-md flex items-center ${
            ctaMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {ctaMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {ctaMessage.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ctaLabel" className="block text-sm font-medium text-gray-700 mb-2">
              Button Label
            </label>
            <input
              id="ctaLabel"
              type="text"
              value={customCtaLabel}
              onChange={(e) => setCustomCtaLabel(e.target.value)}
              placeholder="e.g., Book Free Discovery Call"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to show default "Take Another Assessment" button
            </p>
          </div>
          
          <div>
            <label htmlFor="ctaUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Button URL
            </label>
            <input
              id="ctaUrl"
              type="url"
              value={customCtaUrl}
              onChange={(e) => setCustomCtaUrl(e.target.value)}
              placeholder="https://calendly.com/your-link"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Full URL including https://
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {customCtaLabel && customCtaUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-1">Preview:</p>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                    {customCtaLabel}
                  </div>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSaveCtaSettings}
            disabled={savingCta}
            className="flex items-center"
          >
            {savingCta ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save CTA Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Clients"
          value={analytics.total_clients}
          change={{ value: 15, type: 'increase', period: 'last month' }}
          icon={Users}
          color="#3B82F6"
          trend={[{ value: 8 }, { value: 10 }, { value: 12 }, { value: analytics.total_clients }]}
        />
        
        <MetricCard
          title="Assessments"
          value={analytics.total_assessments}
          change={{ value: 22, type: 'increase', period: 'last week' }}
          icon={BarChart3}
          color="#10B981"
          trend={[{ value: 15 }, { value: 18 }, { value: 20 }, { value: analytics.total_assessments }]}
        />
        
        <MetricCard
          title="Completion Rate"
          value={`${analytics.completion_rate}%`}
          change={{ value: 5, type: 'increase', period: 'last month' }}
          icon={Target}
          color="#8B5CF6"
          trend={[{ value: 75 }, { value: 80 }, { value: 85 }, { value: analytics.completion_rate }]}
        />
        
        <MetricCard
          title="Avg. Time"
          value={`${analytics.avg_completion_time}min`}
          change={{ value: 3, type: 'decrease', period: 'last month' }}
          icon={Clock}
          color="#F59E0B"
          trend={[{ value: 22 }, { value: 20 }, { value: 19 }, { value: analytics.avg_completion_time }]}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Engagement Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Client Engagement</h2>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Active Trend</span>
            </div>
          </div>
          <LineChart 
            data={engagementTrendData}
            height={300}
            color="#3B82F6"
          />
        </div>

        {/* Dominant States Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Dominant States</h2>
          {analytics.state_distribution.length > 0 ? (
            <PieChart 
              data={analytics.state_distribution}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No completed assessments yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Client Progress Analysis */}
      {progressData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Client Progress</h2>
            <div className="text-sm text-gray-500">Assessment completion rates</div>
          </div>
          <BarChart 
            data={progressData}
            height={350}
          />
        </div>
      )}

      {/* Performance Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* This Week Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Assessments</span>
              <span className="text-lg font-bold text-blue-600">
                {analytics.client_engagement.slice(-7).reduce((sum, day) => sum + day.active_clients, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Clients</span>
              <span className="text-lg font-bold text-green-600">
                {Math.max(...analytics.client_engagement.slice(-7).map(d => d.active_clients))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-lg font-bold text-purple-600">{analytics.completion_rate}%</span>
            </div>
          </div>
        </div>

        {/* Client Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Status</h3>
            <Users className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Assessments</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                {clients.filter(c => c.completed_count > 0).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="flex items-center text-yellow-600">
                <Clock className="h-4 w-4 mr-1" />
                {clients.filter(c => c.latest_assessment && !c.latest_assessment.completed).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Not Started</span>
              <span className="flex items-center text-gray-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                {clients.filter(c => !c.latest_assessment).length}
              </span>
            </div>
          </div>
        </div>

        {/* Coaching Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Most Common State</p>
              <p className="text-xs text-blue-600">
                {analytics.state_distribution[0]?.name || 'No data yet'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Engagement Trend</p>
              <p className="text-xs text-green-600">
                {analytics.client_engagement.length > 1 && 
                 analytics.client_engagement[analytics.client_engagement.length - 1].active_clients > 
                 analytics.client_engagement[analytics.client_engagement.length - 2].active_clients
                  ? 'Increasing' : 'Stable'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">Success Rate</p>
              <p className="text-xs text-purple-600">
                {analytics.completion_rate > 80 ? 'Excellent' : analytics.completion_rate > 60 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Client Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
        </div>
        
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-6">
              Invite clients to take the Emotional Dynamics assessment and start coaching them.
            </p>
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Your First Client
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latest Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                          {client.first_name?.[0]}{client.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {format(new Date(client.created_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${client.assessment_count > 0 ? (client.completed_count / client.assessment_count) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {client.completed_count}/{client.assessment_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.latest_assessment ? (
                        <div className="text-sm text-gray-500">
                          {format(new Date(client.latest_assessment.created_at), 'MMM dd')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No activity</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.latest_assessment ? (
                        client.latest_assessment.completed ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        )
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Started
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {client.latest_assessment?.completed ? (
                        <Link 
                          to={`/results/${client.latest_assessment.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Results
                        </Link>
                      ) : (
                        <span className="text-gray-400 mr-3">No Results</span>
                      )}
                      <Link 
                        to={`/dashboard/respondent/${client.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <InviteClientModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default CoachDashboard;