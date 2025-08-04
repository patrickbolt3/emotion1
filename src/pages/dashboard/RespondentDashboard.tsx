import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  Clock, 
  PlusCircle, 
  TrendingUp, 
  Target,
  Calendar,
  Brain,
  CheckCircle,
  Activity,
  Award,
  Lightbulb
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import LineChart from '../../components/charts/LineChart';
import MetricCard from '../../components/charts/MetricCard';

interface Assessment {
  id: string;
  created_at: string;
  completed: boolean;
  dominant_state: string | null;
  results?: any;
}

interface HarmonicState {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface PersonalAnalytics {
  total_assessments: number;
  completed_assessments: number;
  completion_rate: number;
  avg_completion_time: number;
  assessment_history: Array<{ date: string; completed: number }>;
  dominant_states: Array<{ name: string; count: number; color: string }>;
  growth_trend: 'improving' | 'stable' | 'declining';
  insights: string[];
}

const RespondentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [states, setStates] = useState<Record<string, HarmonicState>>({});
  const [analytics, setAnalytics] = useState<PersonalAnalytics>({
    total_assessments: 0,
    completed_assessments: 0,
    completion_rate: 0,
    avg_completion_time: 0,
    assessment_history: [],
    dominant_states: [],
    growth_trend: 'stable',
    insights: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPersonalAnalytics();
  }, [user]);

  const fetchPersonalAnalytics = async () => {
    try {
      if (!user) return;
      
      // Get all assessments for this user
      const { data: assessmentData, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAssessments(assessmentData || []);
      
      // Fetch harmonic states
      const { data: statesData, error: statesError } = await supabase
        .from('harmonic_states')
        .select('*');
      
      if (statesError) throw statesError;
      
      const statesMap = (statesData || []).reduce((acc, state) => {
        acc[state.id] = state;
        return acc;
      }, {} as Record<string, HarmonicState>);
      
      setStates(statesMap);
      
      // Calculate analytics
      const completedAssessments = assessmentData?.filter(a => a.completed) || [];
      const totalAssessments = assessmentData?.length || 0;
      const completionRate = totalAssessments ? (completedAssessments.length / totalAssessments * 100) : 0;
      
      // Assessment history over last 30 days
      const historyData = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayAssessments = completedAssessments.filter(a => {
          const assessmentDate = new Date(a.created_at);
          return assessmentDate.toDateString() === date.toDateString();
        }).length;
        
        historyData.push({
          date: format(date, 'MMM dd'),
          completed: dayAssessments
        });
      }
      
      // Dominant states analysis
      const stateCounts: Record<string, number> = {};
      completedAssessments.forEach(assessment => {
        if (assessment.dominant_state) {
          stateCounts[assessment.dominant_state] = (stateCounts[assessment.dominant_state] || 0) + 1;
        }
      });
      
      const dominantStates = Object.entries(stateCounts)
        .map(([stateId, count]) => ({
          name: statesMap[stateId]?.name || 'Unknown',
          count,
          color: statesMap[stateId]?.color || '#6B7280'
        }))
        .sort((a, b) => b.count - a.count);
      
      // Generate insights
      const insights = generatePersonalInsights(completedAssessments, dominantStates, statesMap);
      
      // Determine growth trend
      const recentAssessments = completedAssessments.slice(0, 3);
      const olderAssessments = completedAssessments.slice(3, 6);
      const growthTrend = recentAssessments.length > olderAssessments.length ? 'improving' : 
                        recentAssessments.length < olderAssessments.length ? 'declining' : 'stable';
      
      setAnalytics({
        total_assessments: totalAssessments,
        completed_assessments: completedAssessments.length,
        completion_rate: Math.round(completionRate * 10) / 10,
        avg_completion_time: 18, // Mock data
        assessment_history: historyData,
        dominant_states: dominantStates,
        growth_trend: growthTrend,
        insights: insights
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalInsights = (
    assessments: Assessment[], 
    dominantStates: Array<{ name: string; count: number }>,
    statesMap: Record<string, HarmonicState>
  ): string[] => {
    const insights = [];
    
    if (dominantStates.length > 0) {
      insights.push(`Your most frequent dominant state is ${dominantStates[0].name}`);
    }
    
    if (assessments.length > 1) {
      insights.push(`You've completed ${assessments.length} assessments, showing commitment to growth`);
    }
    
    if (dominantStates.length > 2) {
      insights.push(`You show variety in emotional patterns across ${dominantStates.length} different states`);
    }
    
    return insights;
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const historyTrendData = analytics.assessment_history.map(item => ({
    name: item.date,
    value: item.completed
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
          <h1 className="text-3xl font-bold text-gray-900">Your Analytics</h1>
          <p className="text-gray-600 mt-1">Track your emotional dynamics journey and growth</p>
        </div>
        <Link to="/dashboard/new-assessment">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </Link>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Assessments"
          value={analytics.total_assessments}
          change={{ value: 25, type: 'increase', period: 'last month' }}
          icon={BarChart3}
          color="#3B82F6"
          trend={[{ value: 2 }, { value: 3 }, { value: 4 }, { value: analytics.total_assessments }]}
        />
        
        <MetricCard
          title="Completed"
          value={analytics.completed_assessments}
          change={{ value: 33, type: 'increase', period: 'last month' }}
          icon={CheckCircle}
          color="#10B981"
          trend={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: analytics.completed_assessments }]}
        />
        
        <MetricCard
          title="Completion Rate"
          value={`${analytics.completion_rate}%`}
          change={{ value: 10, type: 'increase', period: 'last month' }}
          icon={Target}
          color="#8B5CF6"
          trend={[{ value: 75 }, { value: 85 }, { value: 90 }, { value: analytics.completion_rate }]}
        />
        
        <MetricCard
          title="Avg. Time"
          value={`${analytics.avg_completion_time}min`}
          change={{ value: 5, type: 'decrease', period: 'last assessment' }}
          icon={Clock}
          color="#F59E0B"
          trend={[{ value: 25 }, { value: 22 }, { value: 20 }, { value: analytics.avg_completion_time }]}
        />
      </div>

      {/* Assessment History Chart */}
      {analytics.assessment_history.some(h => h.completed > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Activity</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                {analytics.growth_trend === 'improving' ? 'Growing' : 
                 analytics.growth_trend === 'declining' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
          <LineChart 
            data={historyTrendData}
            height={300}
            color="#3B82F6"
          />
        </div>
      )}

      {/* Insights and Progress */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Insights</h3>
            <Lightbulb className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {analytics.insights.length > 0 ? (
              analytics.insights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Complete more assessments to see personalized insights</p>
            )}
          </div>
        </div>

        {/* Dominant States */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Patterns</h3>
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            {analytics.dominant_states.slice(0, 3).map((state, index) => (
              <div key={state.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: state.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{state.name}</span>
                </div>
                <span className="text-sm text-gray-500">{state.count}x</span>
              </div>
            ))}
            {analytics.dominant_states.length === 0 && (
              <p className="text-sm text-gray-500">No patterns identified yet</p>
            )}
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <Award className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {analytics.completed_assessments > 0 && (
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">First Assessment</p>
                  <p className="text-xs text-green-600">Completed your first EDI™ assessment</p>
                </div>
              </div>
            )}
            {analytics.completed_assessments >= 3 && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Consistent Explorer</p>
                  <p className="text-xs text-blue-600">Completed 3+ assessments</p>
                </div>
              </div>
            )}
            {analytics.completion_rate === 100 && analytics.total_assessments > 0 && (
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Perfect Completion</p>
                  <p className="text-xs text-purple-600">100% completion rate</p>
                </div>
              </div>
            )}
            {analytics.completed_assessments === 0 && (
              <p className="text-sm text-gray-500">Complete assessments to unlock achievements</p>
            )}
          </div>
        </div>
      </div>

      {/* Assessment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Assessment History</h2>
        </div>
        
        {assessments.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-600 mb-6">
              Take your first Emotional Dynamics assessment to discover your dominant emotional pattern.
            </p>
            <Link to="/dashboard/new-assessment">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Take Your First Assessment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assessments.map((assessment, index) => {
              const state = assessment.dominant_state ? states[assessment.dominant_state] : null;
              
              return (
                <div key={assessment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: state?.color || '#6B7280' }}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {assessment.completed 
                            ? (state ? state.name : 'Completed Assessment')
                            : 'Assessment In Progress'
                          }
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(assessment.created_at)}
                        </div>
                        {state && (
                          <p className="text-sm text-gray-600 mt-2 max-w-md">
                            {state.description.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {assessment.completed ? (
                        <>
                          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Completed
                          </span>
                          <Link to={`/results/${assessment.id}`}>
                            <Button variant="outline" size="sm">
                              View Results
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            In Progress
                          </span>
                          <Link to={`/assessment/${assessment.id}`}>
                            <Button size="sm">
                              Continue
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RespondentDashboard;