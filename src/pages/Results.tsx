import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import PDFGenerator from '../components/PDFGenerator';
import { getStateDetailsByName, type HarmonicStateDetails } from '../data/harmonicStateDetails';
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
  coach_id: string | null;
}

interface CoachProfile {
  custom_cta_label: string | null;
  custom_cta_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface StateScore {
  state: HarmonicState;
  score: number;
  percentage: number;
  questionCount: number;
  averageScore: number;
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
  const [stateScores, setStateScores] = useState<StateScore[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [stateDetails, setStateDetails] = useState<HarmonicStateDetails | null>(null);
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
          .select('first_name, last_name, email, coach_id')
          .eq('id', assessmentData.user_id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);

        // Debug: Log client's coach_id
        console.log('Client profile data:', profileData);
        console.log('Client coach_id:', profileData?.coach_id);

        // Get coach's custom CTA settings if user has a coach
        if (profileData?.coach_id) {
          console.log('Fetching coach data for coach_id:', profileData.coach_id);
          
          const { data: coachData, error: coachError } = await supabase
            .from('profiles')
            .select('custom_cta_label, custom_cta_url, first_name, last_name')
            .eq('id', profileData.coach_id)
            .eq('role', 'coach')
            .maybeSingle();
          
          console.log('Coach query result:', { coachData, coachError });
          
          if (!coachError && coachData) {
            console.log('Setting coach profile:', coachData);
            setCoachProfile(coachData);
          } else {
            console.log('No coach data found or error occurred:', coachError);
          }
        } else {
          console.log('No coach_id found for this client');
        }

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
            
            // Get comprehensive state details
            const comprehensiveDetails = getStateDetailsByName(dominantStateData.name);
            setStateDetails(comprehensiveDetails);
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

        // Calculate scores for all harmonic states
        const calculatedStateScores = calculateAllStateScores(
          statesData || [],
          questionsData || [],
          responsesData || []
        );
        setStateScores(calculatedStateScores);

      } catch (err: any) {
        console.error('Error loading results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  const calculateAllStateScores = (
    states: HarmonicState[],
    questions: Question[],
    responses: Response[]
  ): StateScore[] => {
    const stateScoreMap: Record<string, { totalScore: number; questionCount: number }> = {};
    
    // Initialize all states
    states.forEach(state => {
      stateScoreMap[state.id] = { totalScore: 0, questionCount: 0 };
    });
    
    // Calculate scores for each state based on responses
    responses.forEach(response => {
      const question = questions.find(q => q.id === response.question_id);
      if (question && question.harmonic_state) {
        stateScoreMap[question.harmonic_state].totalScore += response.score;
        stateScoreMap[question.harmonic_state].questionCount += 1;
      }
    });
    
    // Calculate total possible score for percentage calculation
    const totalPossibleScore = responses.length * 7; // Max score per question is 7
    const totalActualScore = responses.reduce((sum, r) => sum + r.score, 0);
    
    // Create StateScore objects
    const stateScores = states.map(state => {
      const stateData = stateScoreMap[state.id];
      const score = stateData.totalScore;
      const questionCount = stateData.questionCount;
      const averageScore = questionCount > 0 ? score / questionCount : 0;
      const percentage = totalActualScore > 0 ? (score / totalActualScore) * 100 : 0;
      
      return {
        state,
        score,
        percentage,
        questionCount,
        averageScore
      };
    });
    
    // Sort by score (highest first)
    return stateScores.sort((a, b) => b.score - a.score);
  };

  const generateDynamicInsights = (userStateScores: StateScore[], userResponses: Response[], userQuestions: Question[]): string[] => {
    const insights: string[] = [];
    const topStates = userStateScores.slice(0, 3);
    const dominantScore = userStateScores[0];
    
    if (dominantScore) {
      insights.push(`Your strongest pattern is ${dominantScore.state.name} with a score of ${dominantScore.score} (${dominantScore.percentage.toFixed(1)}% of your total responses).`);
    }
    
    if (topStates.length > 1) {
      const secondState = topStates[1];
      insights.push(`Your secondary pattern is ${secondState.state.name} with ${secondState.score} points, showing you also have capacity in this area.`);
    }
    
    if (topStates.length > 2) {
      const thirdState = topStates[2];
      insights.push(`You also show significant presence in ${thirdState.state.name} (${thirdState.score} points), indicating emotional range and flexibility.`);
    }
    
    // Analyze response patterns
    const highScores = userResponses.filter(r => r.score >= 6).length;
    const lowScores = userResponses.filter(r => r.score <= 2).length;
    
    if (highScores > userResponses.length * 0.3) {
      insights.push(`You gave high ratings (6-7) to ${highScores} questions, showing strong self-awareness and confidence in your responses.`);
    }
    
    if (lowScores > userResponses.length * 0.2) {
      insights.push(`You gave low ratings (1-2) to ${lowScores} questions, indicating clear boundaries about what doesn't resonate with you.`);
    }
    
    // Average score insight
    const avgScore = userResponses.reduce((sum, r) => sum + r.score, 0) / userResponses.length;
    if (avgScore >= 5.5) {
      insights.push(`Your overall response average of ${avgScore.toFixed(1)} suggests you generally identify strongly with the patterns you recognize in yourself.`);
    } else if (avgScore <= 3.5) {
      insights.push(`Your overall response average of ${avgScore.toFixed(1)} suggests you may be in a period of transition or questioning your current patterns.`);
    }
    
    return insights;
  };

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
  const dynamicInsights = generateDynamicInsights(stateScores, responses, questions);

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
    stateDetails: stateDetails ? {
      theme: stateDetails.theme,
      coreBeliefs: stateDetails.coreBeliefs,
      behaviorPatterns: stateDetails.behaviorPatterns,
      communicationPatterns: stateDetails.communicationPatterns,
      coachingNotes: stateDetails.coachingNotes,
      connection: stateDetails.connection,
      reality: stateDetails.reality,
      understanding: stateDetails.understanding,
      change: stateDetails.change,
      responsibility: stateDetails.responsibility,
      help: stateDetails.help,
      work: stateDetails.work,
      emotionalDriver: stateDetails.emotionalDriver
    } : undefined,
    totalScore: assessment.results?.[dominantState.id] || 0,
    completionDate: assessment.created_at,
    aiInsight: dynamicInsights.join(' ')
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
                {stateScores.find(s => s.state.id === dominantState.id)?.score || 0}
              </div>
              <h3 className="text-3xl font-bold mt-4 mb-4" style={{ color: dominantState.color }}>
                {dominantState.name}
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {dominantState.description}
              </p>
            </div>
          </motion.div>
          
          {/* Comprehensive State Analysis */}
          {stateDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Theme Header */}
              <div 
                className="px-6 py-4 text-white relative overflow-hidden"
                style={{ backgroundColor: dominantState.color }}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold" style={{ color: getHarmonicStateTextColor(dominantState.color) }}>
                    Understanding Your {dominantState.name}
                  </h3>
                  <p className="text-sm opacity-90 mt-1" style={{ color: getHarmonicStateTextColor(dominantState.color) }}>
                    {stateDetails.theme}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>
              </div>
              
              {/* 12 Detailed Aspects Grid */}
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Core Beliefs */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">💭</span>
                      Core Beliefs
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.coreBeliefs.map((belief, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">"{belief}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Behavior Patterns */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🎭</span>
                      Behavior Patterns
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.behaviorPatterns.map((pattern, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Communication Patterns */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">💬</span>
                      Communication
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.communicationPatterns.map((pattern, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Coaching Notes */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🎯</span>
                      Coaching Notes
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.coachingNotes.map((note, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connection */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🤝</span>
                      Connection
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.connection.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reality */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🌍</span>
                      Reality
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.reality.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Understanding */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🧠</span>
                      Understanding
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.understanding.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Change */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🔄</span>
                      Change
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.change.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Responsibility */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">⚖️</span>
                      Responsibility
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.responsibility.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Help */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🤲</span>
                      Help
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.help.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Work */}
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: dominantState.color }}>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">💼</span>
                      Work
                    </h4>
                    <ul className="space-y-2">
                      {stateDetails.work.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-sm" style={{ color: dominantState.color }}>•</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Emotional Driver - Full Width */}
                <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-full h-1" 
                    style={{ backgroundColor: dominantState.color }}
                  ></div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                        style={{ backgroundColor: dominantState.color }}
                      >
                        <span className="text-lg">⚡</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-2 text-lg">
                        Emotional Driver: {stateDetails.emotionalDriver.title}
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {stateDetails.emotionalDriver.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Personalized Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-md relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ background: `linear-gradient(to right, ${dominantState.color}, #8B5CF6)` }}
            ></div>
            
            <div className="flex items-start space-x-4 pl-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${dominantState.color}, #8B5CF6)`, 
                    boxShadow: `0 4px 10px rgba(${hexToRgb(dominantState.color)}, 0.2)` 
                  }}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold" style={{ 
                  background: `linear-gradient(to right, ${dominantState.color}, #8B5CF6)`, 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Personalized Insights
                </h3>
                
                <div className="mt-3 space-y-3">
                  {dynamicInsights.map((insight, index) => (
                    <p key={index} className="text-gray-600 text-sm leading-relaxed">
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Harmonic scale context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
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
                    left: `${(allStates.findIndex(s => s.name === dominantState.name) / Math.max(allStates.length - 1, 1)) * 85}%`, 
                    transform: 'translateX(-50%)',
                    backgroundColor: dominantState.color
                  }}
                ></div>
                <div 
                  className="absolute -bottom-6 text-xs font-medium text-white"
                  style={{ 
                    left: `${(allStates.findIndex(s => s.name === dominantState.name) / Math.max(allStates.length - 1, 1)) * 85}%`, 
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
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-12 rounded-xl p-8 text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${dominantState.color}15, ${dominantState.color}30)`,
              border: `1px solid ${dominantState.color}40`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: dominantState.color }}></div>
            
            {coachProfile?.custom_cta_label && coachProfile?.custom_cta_url && (
              <>
                {console.log('Rendering CTA section with:', { 
                  label: coachProfile.custom_cta_label, 
                  url: coachProfile.custom_cta_url,
                  coachName: coachProfile.first_name + ' ' + coachProfile.last_name
                })}
                <h3 className="text-xl font-bold text-gray-900">Continue Your Journey</h3>
                <div>
                  <p className="mt-2 text-gray-600">
                    Ready to take the next step in your emotional development journey?
                  </p>
                  {coachProfile.first_name && (
                    <p className="mt-1 text-sm text-gray-500">
                      Connect with your coach {coachProfile.first_name} {coachProfile.last_name}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => window.open(coachProfile.custom_cta_url!, '_blank')}
                    rounded="full" 
                    variant="gradient"
                    className="px-8 shadow-lg"
                  >
                    {coachProfile.custom_cta_label}
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
              </>
            )}
          </motion.div>
        </div>
      </main>
      
      {/* Footer spectrum */}
      <div className="h-2 bg-spectrum-gradient"></div>
    </div>
  );
};

export default Results;