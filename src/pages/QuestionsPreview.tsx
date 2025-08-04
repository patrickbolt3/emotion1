import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, Brain, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample questions for the preview
const sampleQuestions = [
  {
    id: "q1",
    question_text: "I feel disconnected from my emotions and find it difficult to care about what happens around me.",
    harmonic_state: "apathy",
    color: "#7E7E7E" // apathy
  },
  {
    id: "q2",
    question_text: "I often feel a sense of loss that's difficult to put into words or explain to others.",
    harmonic_state: "grief",
    color: "#5B7399" // grief
  },
  {
    id: "q3",
    question_text: "I worry about potential problems even when things are going well in my life.",
    harmonic_state: "fear",
    color: "#9575CD" // fear
  },
  {
    id: "q4",
    question_text: "I say yes when I mean no and resent it later.",
    harmonic_state: "covertResistance",
    color: "#64B5F6" // covert resistance
  },
  {
    id: "q5",
    question_text: "I find myself ready to take decisive action toward meaningful goals.",
    harmonic_state: "action",
    color: "#5C6BC0" // action
  }
];

const LikertScale: React.FC<{
  value: number;
  onChange: (value: number) => void;
  color: string;
}> = ({ value, onChange, color }) => {
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
            style={value === rating ? { backgroundColor: color } : {}}
            onClick={() => onChange(rating)}
          >
            {rating}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const QuestionsPreview: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const totalQuestions = sampleQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  
  // Helper function to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
      '79, 70, 229'; // Default blue if parsing fails
  };
  
  useEffect(() => {
    // Load saved rating if available
    const savedRating = answers[currentQuestion.id] || 0;
    setCurrentRating(savedRating);
  }, [currentQuestionIndex]);
  
  const handleNext = () => {
    if (!currentRating) return;
    
    // Save the current answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: currentRating
    }));
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCompleted(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCompleted(false);
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Brain className="h-6 w-6" style={{ color: completed ? "#4F46E5" : currentQuestion.color }} />
            <span className="ml-2 font-semibold text-gray-900">Emotional Dynamics Indicator™</span>
          </Link>
          <div className="text-sm font-medium" style={{ color: currentQuestion.color }}>
            {completed ? "Preview Completed" : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white shadow-sm">
        <div 
          className="h-1.5 transition-all duration-500" 
          style={{ 
            width: completed ? "100%" : `${progress}%`, 
            backgroundColor: completed ? "#4F46E5" : currentQuestion.color 
          }}
        ></div>
      </div>
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 py-3 px-4 text-center">
        <div className="container mx-auto">
          <p className="text-purple-700 text-sm font-medium">
            This is a preview of the assessment experience. 
            <Link to="/register" className="underline ml-1 font-bold">Sign up</Link> to take the full assessment!
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 relative">
        {/* Background gradient based on color */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-5"
          style={{ 
            background: completed 
              ? `radial-gradient(circle at 50% 50%, #4F46E5, transparent 70%)`
              : `radial-gradient(circle at 50% 50%, ${currentQuestion.color}, transparent 70%)`,
          }}
        ></div>
        
        <div className="max-w-2xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="completed"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                className="bg-white rounded-xl shadow-lg p-8 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                
                <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-blue-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Preview Completed!
                </h2>
                
                <p className="text-gray-600 mb-8">
                  You've experienced a small sample of the Emotional Dynamics Indicator™ assessment. The full assessment includes 98 questions across 14 harmonic states to give you a comprehensive analysis of your emotional patterns.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <Button 
                    onClick={handleReset}
                    variant="outline" 
                    className="min-w-36"
                  >
                    Try Again
                  </Button>
                  
                  <Link to="/results-preview">
                    <Button 
                      variant="gradient"
                      className="min-w-36"
                    >
                      Preview Results
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Ready for the full assessment?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover your dominant emotional pattern and get personalized insights for growth.
                  </p>
                  <Link to="/register">
                    <Button 
                      variant="gradient" 
                      rounded="full"
                      className="px-6"
                    >
                      Take the Full Assessment
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestionIndex}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
              >
                {/* Colored accent on card */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: currentQuestion.color }}
                ></div>
                
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  {currentQuestion.question_text}
                </h2>
                
                <p className="text-center text-gray-500 text-sm mb-6">
                  Reflect on how this statement applies to your typical thoughts, feelings, and behaviors.
                </p>

                <LikertScale
                  value={currentRating}
                  onChange={setCurrentRating}
                  color={currentQuestion.color}
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
                    emotionColor={currentQuestion.color}
                    variant="emotion"
                    className="min-w-32"
                    style={{ 
                      boxShadow: `0 4px 14px 0 rgba(${hexToRgb(currentQuestion.color)}, 0.39)` 
                    }}
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      'Complete Preview'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h3 className="text-white text-xl font-bold mb-2">Ready to discover your dominant emotional state?</h3>
          <p className="text-blue-100 mb-6">
            The full assessment includes 98 questions designed to identify your core emotional pattern.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full">
                Take the Full Assessment
              </Button>
            </Link>
            <Link to="/results-preview">
              <Button variant="outline" className="text-white border-white hover:bg-white/10 rounded-full">
                Preview Results
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Color spectrum footer */}
      <div className="h-2 bg-spectrum-gradient"></div>
    </div>
  );
};

export default QuestionsPreview;