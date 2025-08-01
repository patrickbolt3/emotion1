import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Briefcase, Users, Calendar, Mail, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

interface CoachProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  trainer_id: string | null;
  trainer_name?: string;
}

interface Client {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  assessment_count: number;
  completed_assessments: number;
  latest_assessment?: {
    id: string;
    created_at: string;
    completed: boolean;
    dominant_state: string | null;
  };
}

const CoachDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoachDetails = async () => {
      if (!id) return;

      try {
        // Get coach profile with trainer info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            created_at,
            updated_at,
            trainer_id,
            trainer:trainer_id (
              first_name,
              last_name
            )
          `)
          .eq('id', id)
          .eq('role', 'coach')
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Coach not found');

        const coachProfile = {
          ...profileData,
          trainer_name: profileData.trainer 
            ? `${profileData.trainer.first_name || ''} ${profileData.trainer.last_name || ''}`.trim()
            : null
        };

        setCoach(coachProfile);

        // Get all clients for this coach
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, created_at')
          .eq('coach_id', id)
          .eq('role', 'respondent')
          .order('created_at', { ascending: false });

        if (clientError) throw clientError;

        // Get assessment data for each client
        const clientsWithAssessments = await Promise.all(
          (clientData || []).map(async (client) => {
            // Get all assessments for this client
            const { data: assessments, error: assessmentError } = await supabase
              .from('assessments')
              .select('id, created_at, completed, dominant_state')
              .eq('user_id', client.id)
              .order('created_at', { ascending: false });

            if (assessmentError) throw assessmentError;

            const completedAssessments = assessments?.filter(a => a.completed) || [];
            const latestAssessment = assessments && assessments.length > 0 ? assessments[0] : undefined;

            return {
              ...client,
              assessment_count: assessments?.length || 0,
              completed_assessments: completedAssessments.length,
              latest_assessment: latestAssessment,
            };
          })
        );

        setClients(clientsWithAssessments);
      } catch (err: any) {
        console.error('Error fetching coach details:', err);
        setError(err.message || 'Failed to load coach details');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (client: Client) => {
    if (!client.latest_assessment) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (client.latest_assessment.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (client: Client) => {
    if (!client.latest_assessment) {
      return 'No assessments';
    }
    if (client.latest_assessment.completed) {
      return 'Completed';
    }
    return 'In progress';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg mb-6"></div>
        <div className="bg-gray-200 h-48 rounded-lg"></div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Coach not found'}
      </div>
    );
  }

  const totalAssessments = clients.reduce((sum, client) => sum + client.assessment_count, 0);
  const totalCompleted = clients.reduce((sum, client) => sum + client.completed_assessments, 0);

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link to="/dashboard/users/coaches" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coaches
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {coach.first_name} {coach.last_name}
          </h1>
          <p className="text-gray-600">Coach Details</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                {coach.first_name?.[0] || 'C'}{coach.last_name?.[0] || ''}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900">
                  {coach.first_name || 'Unknown'} {coach.last_name || 'Coach'}
                </h3>
                <p className="text-sm text-gray-500">Coach</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm font-mono text-gray-900 break-all bg-gray-50 p-2 rounded">
                  {coach.id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Trainer</label>
                <p className="text-sm text-gray-900">
                  {coach.trainer_name || 'No trainer assigned'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(coach.created_at)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(coach.updated_at)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Client Summary</label>
              <div className="flex items-center text-sm text-gray-900">
                <Users className="h-4 w-4 mr-2" />
                {clients.length} clients, {totalCompleted}/{totalAssessments} assessments completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clients ({clients.length})</h2>
        
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No clients assigned yet</p>
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
                    Assessments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
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
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                          {client.first_name?.[0] || 'C'}{client.last_name?.[0] || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name || 'Unknown'} {client.last_name || 'User'}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {client.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.completed_assessments}/{client.assessment_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(client)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(client)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {client.latest_assessment?.completed && (
                          <Link 
                            to={`/results/${client.latest_assessment.id}`}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Results
                          </Link>
                        )}
                        <Link 
                          to={`/dashboard/respondent/${client.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Details
                        </Link>
                      </div>
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

export default CoachDetails;