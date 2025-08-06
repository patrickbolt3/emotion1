import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import PDFGenerator from '../components/PDFGenerator';
import { Brain, ChevronRight, Share2, Sparkles, Info, BarChart3, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { getHarmonicStateTextColor } from '../lib/utils';

interface Assessment {
  id: string;
  created_at: string;
  completed: boolean;
  dominant_state: string | null;
  results: any;
  user_id: string;
}

interface HarmonicState {
  id: string;
  name: string;
  description: string;
  color: string;
  coaching_tips: string | null;
}

interface Question {
  id: string;
  question_text: string;
  harmonic_state: string;
  order: number;
}

interface Response {
  id: string;
  question_id: string;
  score: number;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '79, 70, 229'; // Default blue if parsing fails
}

const AIInsight: React.FC<{ state: HarmonicState, firstName: string }> = ({ state, firstName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [insight, setInsight] = useState<string>('');
  
  // Simulate API call to generate AI insight
  useEffect(() => {
    const generateInsight = async () => {
      setIsLoading(true);
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedInsight = `Hey ${firstName}! It looks like you're currently operating from a state of ${state.name}. This doesn't mean you're stuck — it means you have a particular emotional pattern that influences how you perceive and interact with the world. Understanding this can be a powerful first step toward growth and transformation. Want to learn how to evolve this into an even more empowering state?`;
      
      setInsight(generatedInsight);
      setIsLoading(false);
    };
    
    generateInsight();
  }, [state, firstName]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-md relative overflow-hidden"
    >
      <div 
        className="absolute top-0 left-0 w-full h-1" 
        style={{ background: `linear-gradient(to right, ${state.color}, #8B5CF6)` }}
      ></div>
      
      <div className="flex items-start space-x-4 pl-3">
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md animate-pulse-slow"
            style={{ 
              background: `linear-gradient(135deg, ${state.color}, #8B5CF6)`, 
              boxShadow: `0 4px 10px rgba(${hexToRgb(state.color)}, 0.2)` 
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold" style={{ 
            background: `linear-gradient(to right, ${state.color}, #8B5CF6)`, 
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI Insight
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse mt-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : (
            <p className="text-gray-600 mt-2">{insight}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [dominantState, setDominantState] = useState<HarmonicState | null>(null);
  const [allStates, setAllStates] = useState<HarmonicState[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!id) {
          setError('Invalid assessment ID');
          return;
        }

        // Get assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', id)
          .single();

        if (assessmentError) throw assessmentError;
        if (!assessmentData) throw new Error('Assessment not found');
        if (!assessmentData.completed) {
          navigate(`/assessment/${id}`);
          return;
        }

        setAssessment(assessmentData);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', assessmentData.user_id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);

        // Get all harmonic states
        const { data: statesData, error: statesError } = await supabase
          .from('harmonic_states')
          .select('*');

        if (statesError) throw statesError;
        setAllStates(statesData || []);

        // Get dominant state details
        if (assessmentData.dominant_state) {
          const dominantStateData = statesData?.find(s => s.id === assessmentData.dominant_state);
          if (dominantStateData) {
            setDominantState(dominantStateData);
          }
        }

        // Get all questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('order');

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Get all responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('*')
          .eq('assessment_id', id);

        if (responsesError) throw responsesError;
        setResponses(responsesData || []);

      } catch (err: any) {
        console.error('Error loading results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment || !dominantState || !userProfile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Brain className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Unable to load results</h2>
        <p className="mt-2 text-gray-600">{error || 'Results not found'}</p>
        <div className="mt-6 flex space-x-4">
          <Button onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate state breakdown for PDF
  const stateBreakdown = allStates.map(state => {
    const stateScore = assessment.results?.[state.id] || 0;
    const totalScore = Object.values(assessment.results || {}).reduce((sum: number, score: any) => sum + (score || 0), 0);
    const percentage = totalScore > 0 ? (stateScore / totalScore) * 100 : 0;
    
    return {
      name: state.name,
      score: stateScore,
      color: state.color,
      percentage
    };
  }).filter(state => state.score > 0).sort((a, b) => b.score - a.score);

  // Prepare detailed responses for PDF
  const detailedResponses = responses.map(response => {
    const question = questions.find(q => q.id === response.question_id);
    const questionState = allStates.find(s => s.id === question?.harmonic_state);
    
    return {
      question: question?.question_text || 'Unknown question',
      score: response.score,
      state: questionState?.name || 'Unknown state',
      stateColor: questionState?.color || '#6B7280'
    };
  }).sort((a, b) => {
    const questionA = questions.find(q => q.question_text === a.question);
    const questionB = questions.find(q => q.question_text === b.question);
    return (questionA?.order || 0) - (questionB?.order || 0);
  });

  const pdfData = {
    user: {
      firstName: userProfile.first_name || 'Unknown',
      lastName: userProfile.last_name || 'User',
      email: userProfile.email
    },
    dominantState: {
      name: dominantState.name,
      description: dominantState.description,
      color: dominantState.color,
      coaching_tips: dominantState.coaching_tips
    },
    totalScore: assessment.results?.[dominantState.id] || 0,
    completionDate: assessment.created_at,
    responses: detailedResponses,
    stateBreakdown,
    aiInsight: `Hey ${userProfile.first_name}! It looks like you're currently operating from a state of ${dominantState.name}. This doesn't mean you're stuck — it means you have a particular emotional pattern that influences how you perceive and interact with the world. Understanding this can be a powerful first step toward growth and transformation. Want to learn how to evolve this into an even more empowering state?`
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-radial from-white/80 to-gray-50/30 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-spectrum-gradient"></div>
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${dominantState.color}, transparent 70%)`,
        }}
      ></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Brain className="h-6 w-6" style={{ color: dominantState.color }} />
            <span className="ml-2 font-semibold text-gray-900">Emotional Dynamics Indicator™</span>
          </div>
          <div className="flex space-x-2">
            <PDFGenerator assessmentData={pdfData} />
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900"
            >
              Your Emotional Dynamics Results
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-gray-600"
            >
              Hi {userProfile.first_name}, here are your assessment results:
            </motion.p>
          </div>
          
          {/* Dominant State Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center relative overflow-hidden"
            style={{ 
              boxShadow: `0 10px 25px -5px rgba(${hexToRgb(dominantState.color)}, 0.2), 0 10px 10px -5px rgba(${hexToRgb(dominantState.color)}, 0.1)` 
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: dominantState.color }}></div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Dominant Harmonic State</h2>
              <div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-full text-white font-bold text-2xl shadow-lg mx-auto"
                style={{ 
                  backgroundColor: dominantState.color,
                  color: getHarmonicStateTextColor(dominantState.color),
                  border: dominantState.color === '#FFFFFF' ? '2px solid #E5E7EB' : 'none'
                }}
              >
                {assessment.results?.[dominantState.id] || 0}
              </div>
              <h3 className="text-3xl font-bold mt-4 mb-4" style={{ color: dominantState.color }}>
                {dominantState.name}
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {dominantState.description}
              </p>
            </div>
          </motion.div>
          
          {/* AI Insight */}
          <AIInsight 
            state={dominantState} 
            firstName={userProfile.first_name || 'there'}
          />
          
          {/* Question Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Question Breakdown</h3>
              <p className="text-sm text-gray-600">Your responses across all harmonic states</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question, index) => {
                    const response = responses.find(r => r.question_id === question.id);
                    const questionState = allStates.find(s => s.id === question.harmonic_state);
                    
                    if (!response) return null;
                    
                    return (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {question.order}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            {question.question_text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                            style={{ 
                              backgroundColor: questionState?.color || '#6B7280',
                              color: questionState ? getHarmonicStateTextColor(questionState.color) : '#FFFFFF',
                              border: questionState?.color === '#FFFFFF' ? '2px solid #E5E7EB' : 'none'
                            }}
                          >
                            {response.score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ 
                                backgroundColor: questionState?.color || '#6B7280',
                                border: questionState?.color === '#FFFFFF' ? '1px solid #E5E7EB' : 'none'
                              }}
                            ></div>
                            <span className="text-sm text-gray-900">{questionState?.name || 'Unknown'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
          
          {/* Coaching Tips */}
          {dominantState.coaching_tips && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-8 bg-white rounded-xl shadow-md p-6 relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ backgroundColor: dominantState.color }}
              ></div>
              
              <h3 className="text-lg font-bold pl-3 mb-4" style={{ color: dominantState.color }}>
                Coaching Recommendations
              </h3>
              <div className="pl-3">
                <p className="text-gray-700 leading-relaxed">
                  {dominantState.coaching_tips}
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Understanding Your State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-8 bg-white rounded-xl shadow-md p-6 mb-8 relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: dominantState.color }}
            ></div>
            
            <h3 className="text-lg font-bold pl-3 mb-4" style={{ color: dominantState.color }}>
              Understanding Your Dominant State
            </h3>
            <div className="grid gap-4 md:grid-cols-2 pl-3">
              <div 
                className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1" 
                style={{ borderLeftColor: dominantState.color, borderLeftWidth: '3px' }}
              >
                <h4 className="font-bold text-gray-800 mb-3" style={{ color: dominantState.color }}>
                  Strengths of {dominantState.name}
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: dominantState.color }}>•</span>
                    <span>Natural capacity for this emotional pattern</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: dominantState.color }}>•</span>
                    <span>Ability to access this state consistently</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: dominantState.color }}>•</span>
                    <span>Potential for growth from this foundation</span>
                  </li>
                </ul>
              </div>
              <div 
                className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1" 
                style={{ borderLeftColor: dominantState.color, borderLeftWidth: '3px' }}
              >
                <h4 className="font-bold text-gray-800 mb-3" style={{ color: dominantState.color }}>
                  Growth Opportunities
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: dominantState.color }}>•</span>
                    <span>Develop awareness of this pattern</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: dominantState.color }}>•</span>
                    <span>Practice accessing higher states</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: dominantState.color }}>•</span>
                    <span>Build emotional flexibility and range</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Harmonic scale context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8 p-6 mb-8 relative overflow-hidden bg-gray-900 rounded-xl text-white shadow-xl"
          >
            <div className="absolute inset-0 bg-spectrum-gradient opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Your Place on the Harmonic Scale</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                The Harmonic Scale represents a complete spectrum of emotional states. Your current dominant state of {dominantState.name} is just one point on this spectrum.
              </p>
              
              <div className="w-full h-4 bg-gray-800 rounded-full mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-spectrum-gradient"></div>
                <div 
                  className="absolute top-0 bottom-0 w-4 h-4 rounded-full border-2 border-white shadow-glow transition-all duration-500"
                  style={{ 
                    left: `${(stateBreakdown.findIndex(s => s.name === dominantState.name) / Math.max(stateBreakdown.length - 1, 1)) * 100}%`, 
                    transform: 'translateX(-50%)',
                    backgroundColor: dominantState.color
                  }}
                ></div>
                <div 
                  className="absolute -bottom-6 text-xs font-medium text-white"
                  style={{ 
                    left: `${(stateBreakdown.findIndex(s => s.name === dominantState.name) / Math.max(stateBreakdown.length - 1, 1)) * 100}%`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {dominantState.name}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 mb-4">
                <span>Lower States</span>
                <span>Higher States</span>
              </div>
            </div>
          </motion.div>
          
          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-12 rounded-xl p-8 text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${dominantState.color}15, ${dominantState.color}30)`,
              border: `1px solid ${dominantState.color}40`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: dominantState.color }}></div>
            
            <h3 className="text-xl font-bold text-gray-900">Continue Your Journey</h3>
            <p className="mt-2 text-gray-600">
              Understanding your dominant state is just the beginning. Work with a coach to develop strategies for growth and transformation.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/dashboard/new-assessment')}
                rounded="full" 
                variant="gradient"
                className="px-8 shadow-lg"
              >
                Take Another Assessment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                rounded="full" 
                variant="outline"
                className="px-8"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Footer spectrum */}
      <div className="h-2 bg-spectrum-gradient"></div>
    </div>
  );
};

export default Results;