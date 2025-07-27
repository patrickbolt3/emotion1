import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { BarChart3, Briefcase as BriefcaseBusiness, Clock, UserPlus, Users } from 'lucide-react';

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  client_count: number;
}

interface DashboardStats {
  total_coaches: number;
  total_clients: number;
  total_assessments: number;
  recent_assessments: number;
}

const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_coaches: 0,
    total_clients: 0,
    total_assessments: 0,
    recent_assessments: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        
        // Get coaches managed by this trainer
        const { data: coachProfiles, error: coachesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('trainer_id', user.id)
          .eq('role', 'coach')
          .order('first_name', { ascending: true });
        
        if (coachesError) throw coachesError;
        
        // Get client counts for each coach
        const coachesWithCounts = await Promise.all(
          (coachProfiles || []).map(async (coach) => {
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('coach_id', coach.id);
            
            if (countError) throw countError;
            
            return {
              ...coach,
              client_count: count || 0
            };
          })
        );
        
        setCoaches(coachesWithCounts);
        
        // Calculate dashboard stats
        const coachIds = coachesWithCounts.map(c => c.id);
        
        // Total clients
        let totalClients = 0;
        for (const coach of coachesWithCounts) {
          totalClients += coach.client_count;
        }
        
        // Get client IDs for all coaches
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('id')
          .in('coach_id', coachIds);
        
        if (clientError) throw clientError;
        
        const clientIds = (clientData || []).map(c => c.id);
        
        // Total assessments
        const { count: assessmentCount, error: assessmentError } = await supabase
          .from('assessments')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds);
        
        if (assessmentError) throw assessmentError;
        
        // Recent assessments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentCount, error: recentError } = await supabase
          .from('assessments')
          .select('id', { count: 'exact', head: true })
          .in('user_id', clientIds)
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        if (recentError) throw recentError;
        
        setStats({
          total_coaches: coachesWithCounts.length,
          total_clients: totalClients,
          total_assessments: assessmentCount || 0,
          recent_assessments: recentCount || 0
        });
      } catch (err) {
        console.error('Error fetching trainer data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
        <Link to="/dashboard/invite-coach">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Coach
          </Button>
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Coaches</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_coaches}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-indigo-100 mr-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_clients}</h3>
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
            <div className="rounded-full p-3 bg-purple-100 mr-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last 30 Days</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.recent_assessments}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Coaches List */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Coaches</h2>
      
      {coaches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No coaches yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add coaches to your team to start managing their client assessments.
          </p>
          <Link to="/dashboard/invite-coach">
            <Button>Add Coach</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coach
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clients
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coaches.map((coach) => (
                <tr key={coach.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                        {coach.first_name?.[0]}{coach.last_name?.[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {coach.first_name} {coach.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{coach.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{coach.client_count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
  );
};

export default TrainerDashboard;