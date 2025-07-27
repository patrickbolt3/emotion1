import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { BarChart3, Clock, PlusCircle } from 'lucide-react';

interface Assessment {
  id: string;
  created_at: string;
  completed: boolean;
  dominant_state: string | null;
}

interface HarmonicState {
  id: string;
  name: string;
  color: string;
}

const RespondentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [states, setStates] = useState<Record<string, HarmonicState>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setAssessments(data || []);
        
        // Fetch harmonic states for completed assessments
        const stateIds = data
          ?.filter(a => a.dominant_state)
          .map(a => a.dominant_state)
          .filter(Boolean) as string[];
        
        if (stateIds && stateIds.length > 0) {
          const { data: statesData, error: statesError } = await supabase
            .from('harmonic_states')
            .select('id, name, color')
            .in('id', stateIds);
          
          if (statesError) throw statesError;
          
          const statesMap = (statesData || []).reduce((acc, state) => {
            acc[state.id] = state;
            return acc;
          }, {} as Record<string, HarmonicState>);
          
          setStates(statesMap);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, [user]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
        <Link to="/dashboard/new-assessment">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>
      
      {assessments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No assessments yet
          </h3>
          <p className="text-gray-600 mb-6">
            Take your first Emotional Dynamics assessment to discover your dominant emotional pattern.
          </p>
          <Link to="/dashboard/new-assessment">
            <Button>Take Assessment</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {assessments.map(assessment => (
            <div key={assessment.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`h-2 ${assessment.dominant_state && states[assessment.dominant_state] 
                ? '' 
                : 'bg-gray-200'}`} 
                style={assessment.dominant_state && states[assessment.dominant_state] 
                  ? { backgroundColor: states[assessment.dominant_state].color } 
                  : {}}
              ></div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {assessment.completed 
                        ? (assessment.dominant_state && states[assessment.dominant_state] 
                          ? states[assessment.dominant_state].name 
                          : 'Completed Assessment')
                        : 'Incomplete Assessment'
                      }
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(assessment.created_at)}
                    </div>
                  </div>
                  
                  {assessment.completed ? (
                    <Link to={`/results/${assessment.id}`}>
                      <Button variant="secondary" size="sm">
                        View Results
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/assessment/${assessment.id}`}>
                      <Button variant="outline" size="sm">
                        Continue
                      </Button>
                    </Link>
                  )}
                </div>
                
                {assessment.completed && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link to={`/results/${assessment.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View detailed results
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RespondentDashboard;