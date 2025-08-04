import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import InviteClientModal from '../../components/InviteClientModal';
import { BarChart3, Clock, UserPlus, Users } from 'lucide-react';

interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  latest_assessment?: {
    id: string;
    created_at: string;
    completed: boolean;
    dominant_state: string | null;
  };
}

const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  
  const fetchClients = useCallback(async () => {
    try {
      if (!user) return;
      
      // Get clients for this coach
      const { data: clientProfiles, error: clientsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('coach_id', user.id)
        .order('first_name', { ascending: true });
      
      if (clientsError) throw clientsError;
      
      // Get latest assessment for each client
      const clientsWithAssessments = await Promise.all(
        (clientProfiles || []).map(async (client) => {
          const { data: assessments, error: assessmentError } = await supabase
            .from('assessments')
            .select('id, created_at, completed, dominant_state')
            .eq('user_id', client.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (assessmentError) throw assessmentError;
          
          return {
            ...client,
            latest_assessment: assessments && assessments.length > 0 ? assessments[0] : undefined
          };
        })
      );
      
      setClients(clientsWithAssessments);
      setTotalClients(clientsWithAssessments.length);
      
      // Count total assessments
      const { count, error: countError } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .in('user_id', clientsWithAssessments.map(c => c.id));
      
      if (countError) throw countError;
      
      setAssessmentsCount(count || 0);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    fetchClients(); // Refresh the client list
  };
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map(i => (
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
        <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Client
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalClients}</h3>
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
              <h3 className="text-2xl font-bold text-gray-900">{assessmentsCount}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 mr-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {clients.filter(c => 
                  c.latest_assessment && 
                  new Date(c.latest_assessment.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length}
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Client List */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Clients</h2>
      
      {clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clients yet
          </h3>
          <p className="text-gray-600 mb-6">
            Invite clients to take the Emotional Dynamics assessment and coach them based on their results.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latest Assessment
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
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        {client.first_name?.[0]}{client.last_name?.[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.first_name} {client.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Email not available</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.latest_assessment ? (
                      <div className="text-sm text-gray-500">
                        {new Date(client.latest_assessment.created_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
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
                        No Assessment
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {client.latest_assessment?.completed ? (
                      <Link 
                        to={`/dashboard/client/${client.id}/assessment/${client.latest_assessment.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Results
                      </Link>
                    ) : (
                      <Link 
                        to={`/dashboard/client/${client.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <InviteClientModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default CoachDashboard;