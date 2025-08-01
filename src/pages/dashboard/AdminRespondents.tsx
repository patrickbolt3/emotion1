import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, User, BarChart3, Calendar, MoreVertical, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Respondent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  coach_id: string | null;
  coach_name?: string;
  assessment_count: number;
  completed_assessments: number;
  latest_assessment?: {
    id: string;
    created_at: string;
    completed: boolean;
    dominant_state: string | null;
  };
}

const AdminRespondents: React.FC = () => {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRespondents = async () => {
      try {
        // Get all respondents with their coach info
        const { data: respondentData, error: respondentError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            created_at,
            coach_id,
            coach:coach_id (
              first_name,
              last_name
            )
          `)
          .eq('role', 'respondent')
          .order('created_at', { ascending: false });

        if (respondentError) throw respondentError;

        // Get assessment data for each respondent
        const respondentsWithAssessments = await Promise.all(
          (respondentData || []).map(async (respondent) => {
            // Get all assessments for this respondent
            const { data: assessments, error: assessmentError } = await supabase
              .from('assessments')
              .select('id, created_at, completed, dominant_state')
              .eq('user_id', respondent.id)
              .order('created_at', { ascending: false });

            if (assessmentError) throw assessmentError;

            const completedAssessments = assessments?.filter(a => a.completed) || [];
            const latestAssessment = assessments && assessments.length > 0 ? assessments[0] : undefined;

            return {
              ...respondent,
              assessment_count: assessments?.length || 0,
              completed_assessments: completedAssessments.length,
              latest_assessment: latestAssessment,
              coach_name: respondent.coach 
                ? `${respondent.coach.first_name || ''} ${respondent.coach.last_name || ''}`.trim()
                : null
            };
          })
        );

        setRespondents(respondentsWithAssessments);
      } catch (err: any) {
        console.error('Error fetching respondents:', err);
        setError(err.message || 'Failed to load respondents');
      } finally {
        setLoading(false);
      }
    };

    fetchRespondents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (respondent: Respondent) => {
    if (!respondent.latest_assessment) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (respondent.latest_assessment.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (respondent: Respondent) => {
    if (!respondent.latest_assessment) {
      return 'No assessments';
    }
    if (respondent.latest_assessment.completed) {
      return 'Completed';
    }
    return 'In progress';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Respondents</h1>
            <p className="text-gray-600">Manage all respondents in the system</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {respondents.length} respondents
          </div>
        </div>
      </div>

      {respondents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No respondents found
          </h3>
          <p className="text-gray-600">
            There are no respondents registered in the system yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Respondent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessments
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {respondents.map((respondent) => (
                  <tr key={respondent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                          {respondent.first_name?.[0] || 'R'}{respondent.last_name?.[0] || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {respondent.first_name || 'Unknown'} {respondent.last_name || 'User'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {respondent.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {respondent.coach_name ? (
                        <div className="text-sm text-gray-900">{respondent.coach_name}</div>
                      ) : (
                        <span className="text-sm text-gray-400">No coach assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {respondent.completed_assessments}/{respondent.assessment_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(respondent)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(respondent)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(respondent.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {respondent.latest_assessment?.completed && (
                          <Link 
                            to={`/results/${respondent.latest_assessment.id}`}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            View Results
                          </Link>
                        )}
                        <Link 
                          to={`/dashboard/respondent/${respondent.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRespondents;