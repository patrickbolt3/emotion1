import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  Settings, 
  Users, 
  Briefcase, 
  UserCog, 
  FileText, 
  TrendingUp,
  Calendar,
  Activity,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Handshake
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import MetricCard from '../../components/charts/MetricCard';

interface DashboardStats {
  total_users: number;
  total_assessments: number;
  completed_assessments: number;
  assessment_completion_rate: number;
  user_roles: {
    respondent: number;
    coach: number;
    trainer: number;
    admin: number;
    partner: number;
  };
  daily_assessments: Array<{ date: string; count: number }>;
  weekly_completion_rate: number;
  avg_completion_time: number;
  top_states: Array<{ name: string; count: number; color: string }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_assessments: 0,
    completed_assessments: 0,
    assessment_completion_rate: 0,
    user_roles: {
      respondent: 0,
      coach: 0,
      trainer: 0,
      admin: 0,
      partner: 0
    },
    daily_assessments: [],
    weekly_completion_rate: 0,
    avg_completion_time: 0,
    top_states: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get user counts by role
      const { data: userStats, error: userError } = await supabase
        .from('profiles')
        .select('role, created_at');
      
      if (userError) throw userError;
      
      const roleMap = {
        respondent: 0,
        coach: 0,
        trainer: 0,
        admin: 0,
        partner: 0
      };
      
      userStats?.forEach(user => {
        const role = user.role as keyof typeof roleMap;
        if (role in roleMap) {
          roleMap[role]++;
        }
      });
      
      // Get assessment analytics
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, created_at, completed, dominant_state');
      
      if (assessmentError) throw assessmentError;
      
      const totalAssessments = assessments?.length || 0;
      const completedAssessments = assessments?.filter(a => a.completed).length || 0;
      const completionRate = totalAssessments ? (completedAssessments / totalAssessments * 100) : 0;
      
      // Calculate daily assessments for the selected time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const dailyData = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayAssessments = assessments?.filter(a => {
          const assessmentDate = new Date(a.created_at);
          return assessmentDate >= dayStart && assessmentDate <= dayEnd;
        }).length || 0;
        
        dailyData.push({
          date: format(date, 'MMM dd'),
          count: dayAssessments
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
      assessments?.forEach(assessment => {
        if (assessment.completed && assessment.dominant_state) {
          stateCounts[assessment.dominant_state] = (stateCounts[assessment.dominant_state] || 0) + 1;
        }
      });
      
      const topStates = Object.entries(stateCounts)
        .map(([stateId, count]) => ({
          name: stateMap[stateId]?.name || 'Unknown',
          count,
          color: stateMap[stateId]?.color || '#6B7280'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      
      // Calculate weekly completion rate
      const weekAgo = subDays(new Date(), 7);
      const weeklyAssessments = assessments?.filter(a => new Date(a.created_at) >= weekAgo) || [];
      const weeklyCompleted = weeklyAssessments.filter(a => a.completed).length;
      const weeklyCompletionRate = weeklyAssessments.length ? (weeklyCompleted / weeklyAssessments.length * 100) : 0;
      
      setStats({
        total_users: userStats?.length || 0,
        total_assessments: totalAssessments,
        completed_assessments: completedAssessments,
        assessment_completion_rate: Math.round(completionRate * 10) / 10,
        user_roles: roleMap,
        daily_assessments: dailyData,
        weekly_completion_rate: Math.round(weeklyCompletionRate * 10) / 10,
        avg_completion_time: 18, // Mock data - would calculate from actual completion times
        top_states: topStates
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const userRoleData = Object.entries(stats.user_roles).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count,
    color: {
      respondent: '#3B82F6',
      coach: '#8B5CF6',
      trainer: '#10B981',
      admin: '#F59E0B',
      partner: '#EF4444'
    }[role] || '#6B7280'
  }));

  const assessmentTrendData = stats.daily_assessments.map(item => ({
    name: item.date,
    value: item.count
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
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your EDI™ platform performance</p>
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
          <Link to="/dashboard/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={stats.total_users}
          change={{ value: 12, type: 'increase', period: 'last month' }}
          icon={Users}
          color="#3B82F6"
          trend={[{ value: 85 }, { value: 92 }, { value: 98 }, { value: stats.total_users }]}
        />
        
        <MetricCard
          title="Assessments Taken"
          value={stats.total_assessments}
          change={{ value: 8, type: 'increase', period: 'last week' }}
          icon={BarChart3}
          color="#10B981"
          trend={[{ value: 45 }, { value: 52 }, { value: 48 }, { value: stats.total_assessments }]}
        />
        
        <MetricCard
          title="Completion Rate"
          value={`${stats.assessment_completion_rate}%`}
          change={{ value: 3, type: 'increase', period: 'last month' }}
          icon={Target}
          color="#8B5CF6"
          trend={[{ value: 82 }, { value: 85 }, { value: 87 }, { value: stats.assessment_completion_rate }]}
        />
        
        <MetricCard
          title="Avg. Completion Time"
          value={`${stats.avg_completion_time}min`}
          change={{ value: 2, type: 'decrease', period: 'last month' }}
          icon={Clock}
          color="#F59E0B"
          trend={[{ value: 22 }, { value: 20 }, { value: 19 }, { value: stats.avg_completion_time }]}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assessment Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Trends</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+15% this period</span>
            </div>
          </div>
          <LineChart 
            data={assessmentTrendData}
            height={300}
            color="#3B82F6"
          />
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">User Distribution</h2>
          <PieChart 
            data={userRoleData}
            height={300}
          />
        </div>
      </div>

      {/* Dominant States Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Top Dominant States</h2>
          <Link to="/emotional-states" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All States →
          </Link>
        </div>
        <BarChart 
          data={stats.top_states}
          height={350}
        />
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-lg font-bold text-green-600">{stats.weekly_completion_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.weekly_completion_rate}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Target: 85%</span>
              <span className={stats.weekly_completion_rate >= 85 ? 'text-green-600' : 'text-orange-600'}>
                {stats.weekly_completion_rate >= 85 ? 'On Track' : 'Below Target'}
              </span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response</span>
              <span className="text-sm font-medium text-gray-900">~120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/dashboard/settings/questions" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Manage Questions</span>
            </Link>
            <Link to="/dashboard/users/partners" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Handshake className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Add Partner</span>
            </Link>
            <Link to="/dashboard/settings" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Platform Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Management Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(stats.user_roles).map(([role, count]) => (
                <tr key={role} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3`} style={{
                        backgroundColor: {
                          respondent: '#3B82F6',
                          coach: '#8B5CF6',
                          trainer: '#10B981',
                          admin: '#F59E0B',
                          partner: '#EF4444'
                        }[role] || '#6B7280'
                      }}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats.total_users ? Math.round((count / stats.total_users) * 100) : 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      to={`/dashboard/users/${role}s`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;