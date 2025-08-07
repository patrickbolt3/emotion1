import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, User, BarChart3, Calendar, Mail, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

interface RespondentProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
  coach_id: string | null;
  coach_name?: string;
}

interface Assessment {
  id: string;
  created_at: string;
  completed: boolean;
  dominant_state: string | null;
  state_name?: string;
  state_color?: string;
}

const RespondentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [respondent, setRespondent] = useState<RespondentProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRespondentDetails = async () => {
      if (!id) return;

      try {
        // Get respondent profile with coach info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            created_at,
            updated_at,
            coach_id,
            coach:coach_id (
              first_name,
              last_name
            )
          `)
          .eq('id', id)
          .eq('role', 'respondent')
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Respondent not found');

        const respondentProfile = {
          ...profileData,
          coach_name: profileData.coach 
            ? `${profileData.coach.first_name || ''} ${profileData.coach.last_name || ''}`.trim()
            : null
        };

        setRespondent(respondentProfile);

        // Get all assessments for this respondent
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('id, created_at, completed, dominant_state')
          .eq('user_id', id)
          .order('created_at', { ascending: false });

        if (assessmentError) throw assessmentError;

        // Get harmonic state details for completed assessments
        const stateIds = assessmentData
          ?.filter(a => a.dominant_state)
          .map(a => a.dominant_state)
          .filter(Boolean) as string[];

        let statesMap: Record<string, any> = {};
        if (stateIds.length > 0) {
          const { data: statesData, error: statesError } = await supabase
            .from('harmonic_states')
            .select('id, name, color')
            .in('id', stateIds);

          if (statesError) throw statesError;

          statesMap = (statesData || []).reduce((acc, state) => {
            acc[state.id] = state;
            return acc;
          }, {} as Record<string, any>);
        }

        // Enhance assessments with state info
        const enhancedAssessments = (assessmentData || []).map(assessment => ({
          ...assessment,
          state_name: assessment.dominant_state ? statesMap[assessment.dominant_state]?.name : null,
          state_color: assessment.dominant_state ? statesMap[assessment.dominant_state]?.color : null,
        }));

        setAssessments(enhancedAssessments);
      } catch (err: any) {
        console.error('Error fetching respondent details:', err);
        setError(err.message || 'Failed to load respondent details');
      } finally {
        setLoading(false);
      }
    };

    fetchRespondentDetails();
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

  const getStatusIcon = (assessment: Assessment) => {
    if (assessment.completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-yellow-500" />;
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

  if (error || !respondent) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Respondent not found'}
      </div>
    );
  }

  const completedAssessments = assessments.filter(a => a.completed);
  const inProgressAssessments = assessments.filter(a => !a.completed);

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link to="/dashboard/users/respondents" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Respondents
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {respondent.first_name} {respondent.last_name}
          </h1>
          <p className="text-gray-600">Respondent Details</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                {respondent.first_name?.[0] || 'R'}{respondent.last_name?.[0] || ''}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900">
                  {respondent.first_name || 'Unknown'} {respondent.last_name || 'User'}
                </h3>
                <p className="text-sm text-gray-500">Respondent</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm font-mono text-gray-900 break-all bg-gray-50 p-2 rounded">
                  {respondent.id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center text-sm text-gray-900">
                  <Mail className="h-4 w-4 mr-2" />
                  {respondent.email}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Coach</label>
                <p className="text-sm text-gray-900">
                  {respondent.coach_name || 'No coach assigned'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(respondent.created_at)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(respondent.updated_at)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Assessment Summary</label>
              <div className="flex items-center text-sm text-gray-900">
                <BarChart3 className="h-4 w-4 mr-2" />
                {completedAssessments.length} completed, {inProgressAssessments.length} in progress
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment History</h2>
        
        {assessments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No assessments taken yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dominant State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Assessment #{assessment.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(assessment)}
                        <span className="ml-2 text-sm text-gray-900">
                          {assessment.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assessment.state_name ? (
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: assessment.state_color || '#6B7280' }}
                          ></div>
                          <span className="text-sm text-gray-900">{assessment.state_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(assessment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {assessment.completed ? (
                        <Link 
                          to={`/results/${assessment.id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Results
                        </Link>
                      ) : (
                        <span className="text-gray-400">In Progress</span>
                      )}
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

export default RespondentDetails;