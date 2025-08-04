import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAssessmentStore } from '../store/assessmentStore';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const LikertScale: React.FC<{
  value: number;
  onChange: (value: number) => void;
  activeColor?: string;
}> = ({ value, onChange, activeColor = '#4F46E5' }) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between mb-2 text-xs text-gray-500">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
          <motion.button
            key={rating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 h-14 rounded-md border-2 transition-all duration-300 shadow-sm ${
              value === rating
                ? 'border-transparent text-white font-medium shadow-md'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
            style={value === rating ? { backgroundColor: activeColor } : {}}
            onClick={() => onChange(rating)}
          >
            {rating}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const Assessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [activeColor, setActiveColor] = useState<string>('#4F46E5');
  
  const { 
    assessmentId,
    questions,
    currentQuestionIndex,
    responses,
    loadQuestions,
    saveResponse,
    nextQuestion,
    prevQuestion,
    completeAssessment
  } = useAssessmentStore();

  // Load assessment and questions
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        if (!id) {
          setError('Invalid assessment ID');
          return;
        }

        // Check if assessment exists and is valid
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', id)
          .single();

        if (assessmentError) throw assessmentError;
        if (!assessment) throw new Error('Assessment not found');
        if (assessment.completed) {
          navigate(`/results/${id}`);
          return;
        }

        // Set active assessment in store
        useAssessmentStore.setState({ assessmentId: id });

        // Load questions
        await loadQuestions();

        // Load existing responses
        const { data: existingResponses, error: responsesError } = await supabase
          .from('responses')
          .select('*')
          .eq('assessment_id', id);

        if (responsesError) throw responsesError;

        // Update responses in store
        if (existingResponses && existingResponses.length > 0) {
          const responseMap = existingResponses.reduce((acc: Record<string, any>, response) => {
            acc[response.question_id] = {
              questionId: response.question_id,
              score: response.score
            };
            return acc;
          }, {});
          
          useAssessmentStore.setState({ responses: responseMap });
        }
      } catch (err: any) {
        console.error('Error loading assessment:', err);
        setError(err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, loadQuestions, navigate]);

  // Set current rating based on existing response
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      const existingResponse = responses[currentQuestion.id];
      setCurrentRating(existingResponse?.score || 0);
      
      // Get harmonic state color for current question
      const getQuestionColor = async () => {
        try {
          const { data: state, error } = await supabase
            .from('harmonic_states')
            .select('color')
            .eq('id', currentQuestion.harmonic_state)
            .single();
          
          if (error) {
            console.error('Error fetching harmonic state color:', error);
            setActiveColor('#4F46E5'); // Default color
            return;
          }
          
          if (state && state.color) {
            setActiveColor(state.color);
          } else {
            setActiveColor('#4F46E5'); // Default color if no color found
          }
        } catch (err) {
          console.error('Network error getting question color:', err);
          setActiveColor('#4F46E5'); // Default color
        }
      };
      
      getQuestionColor();
    }
  }, [currentQuestionIndex, questions, responses]);

  const handleNext = async () => {
    if (!currentRating) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Safety check to ensure currentQuestion exists
    if (!currentQuestion) {
      console.error('Current question is undefined');
      return;
    }
    
    await saveResponse(currentQuestion.id, currentRating);
    
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      // Complete assessment and go to results
      await completeAssessment();
      navigate(`/results/${assessmentId}`);
    }
  };

  const handlePrevious = () => {
    prevQuestion();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Brain className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  // Check if questions are available
  if (!loading && questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Brain className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">No Questions Available</h2>
        <p className="mt-2 text-gray-600">This assessment doesn't have any questions configured.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Additional safety check for currentQuestion
  if (!loading && (!currentQuestion || currentQuestionIndex >= questions.length)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Brain className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Question Loading Error</h2>
        <p className="mt-2 text-gray-600">Unable to load question {currentQuestionIndex + 1} of {questions.length}.</p>
        <p className="mt-1 text-gray-500">Current index: {currentQuestionIndex}, Total questions: {questions.length}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-6 w-6" style={{ color: activeColor }} />
            <span className="ml-2 font-semibold text-gray-900">Emotional Dynamics Indicator™</span>
          </div>
          <div className="text-sm font-medium" style={{ color: activeColor }}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white shadow-sm">
        <div className="h-1.5 transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: activeColor }}></div>
      </div>

      {/* Background gradient based on color */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-5"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${activeColor}, transparent 70%)`,
        }}
      ></div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-md p-8 relative overflow-hidden">
          {/* Colored accent on card */}
          <div 
            className="absolute top-0 left-0 w-2 h-full"
            style={{ backgroundColor: activeColor }}
          ></div>
          
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="pl-4"
          >
            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              {currentQuestion?.question_text}
            </h2>

            <LikertScale
              value={currentRating}
              onChange={setCurrentRating}
              activeColor={activeColor}
            />

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={currentQuestionIndex === 0 ? 'invisible' : ''}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!currentRating}
                emotionColor={activeColor}
                variant="emotion"
                className="min-w-32"
              >
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'Complete Assessment'
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Bottom indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center space-x-1">
          {[...Array(Math.min(7, totalQuestions))].map((_, i) => {
            // Show indicators for questions around current
            const showDetailedIndicator = i === 0 || 
                                         i === 6 || 
                                         Math.abs(i - Math.min(6, currentQuestionIndex)) <= 2;
            
            if (showDetailedIndicator) {
              return (
                <motion.div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= Math.min(6, currentQuestionIndex) ? 'bg-opacity-100' : 'bg-opacity-30'
                  }`}
                  style={{ 
                    backgroundColor: activeColor,
                    width: i === Math.min(6, currentQuestionIndex) ? '20px' : '10px',
                  }}
                  animate={{ 
                    width: i === Math.min(6, currentQuestionIndex) ? '20px' : '10px',
                    opacity: i <= Math.min(6, currentQuestionIndex) ? 1 : 0.3
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              );
            }
            
            return (
              <motion.div 
                key={i} 
                className="h-1 w-1 rounded-full bg-gray-300"
              ></motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Assessment;