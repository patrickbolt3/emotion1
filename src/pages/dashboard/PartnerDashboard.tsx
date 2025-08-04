import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { BarChart3, Briefcase, Clock, UserPlus, Users, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  client_count: number;
  latest_assessment?: {
    id: string;
    created_at: string;
    completed: boolean;
  };
}

interface DashboardStats {
  total_coaches: number;
  total_clients: number;
  total_assessments: number;
  recent_assessments: number;
}

const PartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_coaches: 0,
    total_clients: 0,
    total_assessments: 0,
    recent_assessments: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
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
      
      // Get client counts and latest assessments for each coach
      const coachesWithData = await Promise.all(
        (coachProfiles || []).map(async (coach) => {
          // Get client count
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('coach_id', coach.id);
          
          if (countError) throw countError;
          
          // Get latest assessment for any of this coach's clients
          const { data: clientIds, error: clientError } = await supabase
            .from('profiles')
            .select('id')
            .eq('coach_id', coach.id);
          
          if (clientError) throw clientError;
          
          let latestAssessment = undefined;
          if (clientIds && clientIds.length > 0) {
            const { data: assessments, error: assessmentError } = await supabase
              .from('assessments')
              .select('id, created_at, completed')
              .in('user_id', clientIds.map(c => c.id))
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (!assessmentError && assessments && assessments.length > 0) {
              latestAssessment = assessments[0];
            }
          }
          
          return {
            ...coach,
            client_count: count || 0,
            latest_assessment: latestAssessment
          };
        })
      );
      
      setCoaches(coachesWithData);
      
      // Calculate dashboard stats
      const coachIds = coachesWithData.map(c => c.id);
      
      // Total clients
      let totalClients = 0;
      for (const coach of coachesWithData) {
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
        total_coaches: coachesWithData.length,
        total_clients: totalClients,
        total_assessments: assessmentCount || 0,
        recent_assessments: recentCount || 0
      });
    } catch (err) {
      console.error('Error fetching partner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setMessage(null);

    try {
      // Call the edge function to invite the coach
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

      // Success
      setMessage({ 
        type: 'success', 
        text: `Coach invited successfully! Email sent to ${formData.email}. Temporary password: ${result.tempPassword}` 
      });
      setFormData({ firstName: '', lastName: '', email: '' });
      setShowAddForm(false);
      await fetchData();

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error('Error inviting coach:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to invite coach' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
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
        <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Coach</h3>
          
          <form onSubmit={handleAddCoach}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• A coach account will be created with temporary credentials</li>
                <li>• They'll receive an email with their login information</li>
                <li>• They can start inviting and managing their own clients</li>
                <li>• You'll be able to oversee their coaching activities</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ firstName: '', lastName: '', email: '' });
                  setMessage(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Sending Invitation...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <Briefcase className="h-6 w-6 text-blue-600" />
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
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No coaches yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add coaches to your network to start managing their client assessments and coaching activities.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Coach
          </Button>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latest Activity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                        <div className="text-sm text-gray-500">ID: {coach.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{coach.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{coach.client_count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coach.latest_assessment ? (
                      <div className="text-sm text-gray-500">
                        {formatDate(coach.latest_assessment.created_at)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No activity</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coach.latest_assessment ? (
                      coach.latest_assessment.completed ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          In Progress
                        </span>
                      )
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        No Activity
                      </span>
                    )}
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

export default PartnerDashboard;