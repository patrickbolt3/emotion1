import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { BarChart3, Settings, Users, Briefcase as BriefcaseBusiness, UserCog, FileText, Book, UserPlus } from 'lucide-react';

interface DashboardStats {
  total_users: number;
  total_assessments: number;
  assessment_completion_rate: number;
  user_roles: {
    respondent: number;
    coach: number;
    trainer: number;
    admin: number;
  };
}

interface StateDistribution {
  state_id: string;
  state_name: string;
  count: number;
  percentage: number;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_assessments: 0,
    assessment_completion_rate: 0,
    user_roles: {
      respondent: 0,
      coach: 0,
      trainer: 0,
      admin: 0
    }
  });
  const [stateDistribution, setStateDistribution] = useState<StateDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user counts by role
        const { data: userStats, error: userError } = await supabase
          .from('profiles')
          .select('role')
        
        if (userError) throw userError;
        
        const roleMap = {
          respondent: 0,
          coach: 0,
          trainer: 0,
          admin: 0
        };
        
        userStats?.forEach(user => {
          const role = user.role as keyof typeof roleMap;
          if (role in roleMap) {
            roleMap[role]++;
          }
        });
        
        // Get assessment stats
        const { count: totalAssessments, error: assessmentError } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true });
        
        if (assessmentError) throw assessmentError;
        
        // Get completed assessments count
        const { count: completedAssessments, error: completedError } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true);
        
        if (completedError) throw completedError;
        
        // Calculate completion rate
        const completionRate = totalAssessments ? (completedAssessments || 0) / totalAssessments * 100 : 0;
        
        setStats({
          total_users: (userStats?.length || 0),
          total_assessments: totalAssessments || 0,
          assessment_completion_rate: Math.round(completionRate * 10) / 10,
          user_roles: roleMap
        });
        
        // Get state distribution from completed assessments
        const { data: stateData, error: stateError } = await supabase
          .from('assessments')
          .select('dominant_state')
          .not('dominant_state', 'is', null)
          .eq('completed', true);
        
        if (stateError) throw stateError;
        
        // Count occurrences of each state
        const stateCounts: Record<string, number> = {};
        stateData?.forEach(assessment => {
          if (assessment.dominant_state) {
            stateCounts[assessment.dominant_state] = (stateCounts[assessment.dominant_state] || 0) + 1;
          }
        });
        
        // Get details for each state
        const stateIds = Object.keys(stateCounts);
        if (stateIds.length > 0) {
          const { data: states, error: statesError } = await supabase
            .from('harmonic_states')
            .select('id, name, color')
            .in('id', stateIds);
          
          if (statesError) throw statesError;
          
          // Create distribution with percentages
          const totalCompletedAssessments = stateData?.length || 0;
          const distribution = states?.map(state => ({
            state_id: state.id,
            state_name: state.name,
            count: stateCounts[state.id],
            percentage: totalCompletedAssessments ? (stateCounts[state.id] / totalCompletedAssessments * 100) : 0,
            color: state.color
          })) || [];
          
          // Sort by count descending
          distribution.sort((a, b) => b.count - a.count);
          
          setStateDistribution(distribution);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link to="/dashboard/settings/questions">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Questions
            </Button>
          </Link>
          <Link to="/dashboard/settings">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Platform Settings
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4 mb-10">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 mr-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Assessments</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_assessments}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-yellow-100 mr-4">
              <Book className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.assessment_completion_rate}%</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 mr-4">
              <BriefcaseBusiness className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Coaches</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.user_roles.coach}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two Column Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* State Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dominant State Distribution</h3>
          
          {stateDistribution.length > 0 ? (
            <div className="space-y-4">
              {stateDistribution.slice(0, 5).map(state => (
                <div key={state.state_id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{state.state_name}</span>
                    <span className="text-sm text-gray-500">{state.count} ({Math.round(state.percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${state.percentage}%`,
                        backgroundColor: state.color || '#4F46E5'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {stateDistribution.length > 5 && (
                <Link to="/dashboard/analytics" className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-2">
                  View all states
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No completed assessments yet
            </div>
          )}
        </div>
        
        {/* User Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
          
          <div className="space-y-4">
            <Link to="/dashboard/users/respondents" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
              <div className="rounded-full p-2 bg-blue-100 mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Respondents</h4>
                <p className="text-sm text-gray-500">{stats.user_roles.respondent} users</p>
              </div>
              <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link to="/dashboard/users/coaches" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
              <div className="rounded-full p-2 bg-indigo-100 mr-3">
                <BriefcaseBusiness className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Coaches</h4>
                <p className="text-sm text-gray-500">{stats.user_roles.coach} users</p>
              </div>
              <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link to="/dashboard/users/trainers" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
              <div className="rounded-full p-2 bg-purple-100 mr-3">
                <UserCog className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Trainers</h4>
                <p className="text-sm text-gray-500">{stats.user_roles.trainer} users</p>
              </div>
              <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link to="/dashboard/users/admins" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
              <div className="rounded-full p-2 bg-red-100 mr-3">
                <Settings className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Administrators</h4>
                <p className="text-sm text-gray-500">{stats.user_roles.admin} users</p>
              </div>
              <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/dashboard/users/create" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center text-center">
            <UserPlus className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="text-base font-medium text-gray-900">Add User</h4>
            <p className="text-sm text-gray-500 mt-1">Create a new user account</p>
          </Link>
          
          <Link to="/dashboard/settings/questions" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center text-center">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="text-base font-medium text-gray-900">Manage Questions</h4>
            <p className="text-sm text-gray-500 mt-1">Edit assessment questions</p>
          </Link>
          
          <Link to="/dashboard/settings/states" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center text-center">
            <Book className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="text-base font-medium text-gray-900">Harmonic States</h4>
            <p className="text-sm text-gray-500 mt-1">Configure harmonic states</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;