import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  Briefcase, 
  Clock, 
  UserPlus, 
  Users, 
  TrendingUp,
  Target,
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Network
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import MetricCard from '../../components/charts/MetricCard';

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  client_count: number;
  assessment_count: number;
  completion_rate: number;
}

interface PartnerAnalytics {
  total_coaches: number;
  total_clients: number;
  total_assessments: number;
  network_completion_rate: number;
  coach_performance: Array<{ name: string; clients: number; completion_rate: number }>;
  daily_activity: Array<{ date: string; assessments: number }>;
  state_distribution: Array<{ name: string; count: number; color: string }>;
  growth_metrics: {
    new_coaches_this_month: number;
    new_clients_this_month: number;
    assessments_this_month: number;
  };
}

const PartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [analytics, setAnalytics] = useState<PartnerAnalytics>({
    total_coaches: 0,
    total_clients: 0,
    total_assessments: 0,
    network_completion_rate: 0,
    coach_performance: [],
    daily_activity: [],
    state_distribution: [],
    growth_metrics: {
      new_coaches_this_month: 0,
      new_clients_this_month: 0,
      assessments_this_month: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  useEffect(() => {
    fetchNetworkAnalytics();
  }, [user, timeRange]);

  const fetchNetworkAnalytics = async () => {
    try {
      if (!user) return;
      
      // Get coaches managed by this partner
      const { data: coachProfiles, error: coachesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .eq('trainer_id', user.id)
        .eq('role', 'coach')
        .order('first_name', { ascending: true });
      
      if (coachesError) throw coachesError;
      
      // Get detailed analytics for each coach
      const coachesWithAnalytics = await Promise.all(
        (coachProfiles || []).map(async (coach) => {
          // Get client count
          const { data: clientData, error: clientError } = await supabase
            .from('profiles')
            .select('id, created_at')
            .eq('coach_id', coach.id);
          
          if (clientError) throw clientError;
          
          const clientIds = (clientData || []).map(c => c.id);
          
          // Get assessment data
          const { data: assessments, error: assessmentError } = await supabase
            .from('assessments')
            .select('id, created_at, completed')
            .in('user_id', clientIds);
          
          if (assessmentError) throw assessmentError;
          
          const totalAssessments = assessments?.length || 0;
          const completedAssessments = assessments?.filter(a => a.completed).length || 0;
          const completionRate = totalAssessments ? (completedAssessments / totalAssessments * 100) : 0;
          
          return {
            ...coach,
            client_count: clientData?.length || 0,
            assessment_count: totalAssessments,
            completion_rate: Math.round(completionRate * 10) / 10
          };
        })
      );
      
      setCoaches(coachesWithAnalytics);
      
      // Calculate network analytics
      await calculateNetworkAnalytics(coachesWithAnalytics);
    } catch (err) {
      console.error('Error fetching network analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetworkAnalytics = async (coachData: Coach[]) => {
    try {
      const totalClients = coachData.reduce((sum, coach) => sum + coach.client_count, 0);
      const totalAssessments = coachData.reduce((sum, coach) => sum + coach.assessment_count, 0);
      
      // Get all client IDs across the network
      const allClientIds: string[] = [];
      for (const coach of coachData) {
        const { data: clientIds, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('coach_id', coach.id);
        
        if (!error && clientIds) {
          allClientIds.push(...clientIds.map(c => c.id));
        }
      }
      
      // Get all assessments for network completion rate
      const { data: allAssessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, created_at, completed, dominant_state')
        .in('user_id', allClientIds);
      
      if (assessmentError) throw assessmentError;
      
      const completedCount = allAssessments?.filter(a => a.completed).length || 0;
      const networkCompletionRate = totalAssessments ? (completedCount / totalAssessments * 100) : 0;
      
      // Calculate daily activity
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const activityData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayAssessments = allAssessments?.filter(a => {
          const assessmentDate = new Date(a.created_at);
          return assessmentDate >= dayStart && assessmentDate <= dayEnd;
        }).length || 0;
        
        activityData.push({
          date: format(date, 'MMM dd'),
          assessments: dayAssessments
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
      
      const stateCounts: Record<string, number> = {};
      allAssessments?.forEach(assessment => {
        if (assessment.completed && assessment.dominant_state) {
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
        .slice(0, 6);
      
      // Coach performance data
      const coachPerformance = coachData.map(coach => ({
        name: `${coach.first_name} ${coach.last_name}`,
        clients: coach.client_count,
        completion_rate: coach.completion_rate
      }));
      
      // Growth metrics (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const newCoaches = coachData.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;
      
      // Get new clients in last 30 days
      const { data: recentClients, error: recentError } = await supabase
        .from('profiles')
        .select('id')
        .in('coach_id', coachData.map(c => c.id))
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (recentError) throw recentError;
      
      const recentAssessments = allAssessments?.filter(a => 
        new Date(a.created_at) >= thirtyDaysAgo
      ).length || 0;
      
      setAnalytics({
        total_coaches: coachData.length,
        total_clients: totalClients,
        total_assessments: totalAssessments,
        network_completion_rate: Math.round(networkCompletionRate * 10) / 10,
        coach_performance: coachPerformance,
        daily_activity: activityData,
        state_distribution: stateDistribution,
        growth_metrics: {
          new_coaches_this_month: newCoaches,
          new_clients_this_month: recentClients?.length || 0,
          assessments_this_month: recentAssessments
        }
      });
    } catch (err) {
      console.error('Error calculating network analytics:', err);
    }
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-coach`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          trainerId: user?.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite coach');
      }

      setMessage({ 
        type: 'success', 
        text: `Coach invited successfully! Email sent to ${formData.email}. Temporary password: ${result.tempPassword}` 
      });
      setFormData({ firstName: '', lastName: '', email: '' });
      setShowAddForm(false);
      await fetchNetworkAnalytics();

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error('Error inviting coach:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to invite coach' });
    } finally {
      setSaving(false);
    }
  };

  const activityTrendData = analytics.daily_activity.map(item => ({
    name: item.date,
    value: item.assessments
  }));

  const performanceData = analytics.coach_performance.map(coach => ({
    name: coach.name,
    value: coach.completion_rate,
    color: coach.completion_rate >= 80 ? '#10B981' : coach.completion_rate >= 60 ? '#F59E0B' : '#EF4444'
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your coaching network and track organizational growth</p>
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
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Coach
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Add Coach Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Coach</h3>
          
          <form onSubmit={handleAddCoach} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ firstName: '', lastName: '', email: '' });
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Coaches"
          value={analytics.total_coaches}
          change={{ value: analytics.growth_metrics.new_coaches_this_month, type: 'increase', period: 'this month' }}
          icon={Briefcase}
          color="#3B82F6"
          trend={[{ value: analytics.total_coaches - 3 }, { value: analytics.total_coaches - 2 }, { value: analytics.total_coaches - 1 }, { value: analytics.total_coaches }]}
        />
        
        <MetricCard
          title="Network Clients"
          value={analytics.total_clients}
          change={{ value: analytics.growth_metrics.new_clients_this_month, type: 'increase', period: 'this month' }}
          icon={Users}
          color="#10B981"
          trend={[{ value: analytics.total_clients - 8 }, { value: analytics.total_clients - 5 }, { value: analytics.total_clients - 2 }, { value: analytics.total_clients }]}
        />
        
        <MetricCard
          title="Total Assessments"
          value={analytics.total_assessments}
          change={{ value: analytics.growth_metrics.assessments_this_month, type: 'increase', period: 'this month' }}
          icon={BarChart3}
          color="#8B5CF6"
          trend={[{ value: analytics.total_assessments - 15 }, { value: analytics.total_assessments - 10 }, { value: analytics.total_assessments - 5 }, { value: analytics.total_assessments }]}
        />
        
        <MetricCard
          title="Network Completion"
          value={`${analytics.network_completion_rate}%`}
          change={{ value: 5, type: 'increase', period: 'last month' }}
          icon={Target}
          color="#F59E0B"
          trend={[{ value: 75 }, { value: 80 }, { value: 85 }, { value: analytics.network_completion_rate }]}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Network Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Network Activity</h2>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Daily Assessments</span>
            </div>
          </div>
          <LineChart 
            data={activityTrendData}
            height={300}
            color="#3B82F6"
          />
        </div>

        {/* State Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dominant States Across Network</h2>
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

      {/* Coach Performance Analysis */}
      {performanceData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Coach Performance</h2>
            <div className="text-sm text-gray-500">Completion rates by coach</div>
          </div>
          <BarChart 
            data={performanceData}
            height={350}
          />
        </div>
      )}

      {/* Network Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Growth Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Growth This Month</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Coaches</span>
              <span className="text-lg font-bold text-blue-600">+{analytics.growth_metrics.new_coaches_this_month}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Clients</span>
              <span className="text-lg font-bold text-green-600">+{analytics.growth_metrics.new_clients_this_month}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assessments</span>
              <span className="text-lg font-bold text-purple-600">+{analytics.growth_metrics.assessments_this_month}</span>
            </div>
          </div>
        </div>

        {/* Network Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Network Health</h3>
            <Network className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Coaches</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                {coaches.filter(c => c.client_count > 0).length}/{analytics.total_coaches}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Clients/Coach</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.total_coaches ? Math.round(analytics.total_clients / analytics.total_coaches * 10) / 10 : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Network Efficiency</span>
              <span className={`text-sm font-medium ${
                analytics.network_completion_rate >= 80 ? 'text-green-600' : 
                analytics.network_completion_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analytics.network_completion_rate >= 80 ? 'Excellent' : 
                 analytics.network_completion_rate >= 60 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <UserPlus className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Add Coach</span>
            </button>
            <Link to="/dashboard/users/coaches" className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Briefcase className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Manage Coaches</span>
            </Link>
            <Link to="/dashboard/users/respondents" className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">View All Clients</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Coach Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Coach Performance Details</h2>
        </div>
        
        {coaches.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coaches yet</h3>
            <p className="text-gray-600 mb-6">
              Add coaches to your network to start building your coaching organization.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Coach
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                          {coach.first_name?.[0]}{coach.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {coach.first_name} {coach.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{coach.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{coach.client_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coach.assessment_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              coach.completion_rate >= 80 ? 'bg-green-500' :
                              coach.completion_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${coach.completion_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{coach.completion_rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        coach.completion_rate >= 80 ? 'bg-green-100 text-green-800' :
                        coach.completion_rate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coach.completion_rate >= 80 ? 'Excellent' :
                         coach.completion_rate >= 60 ? 'Good' : 'Needs Support'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/dashboard/coach/${coach.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;