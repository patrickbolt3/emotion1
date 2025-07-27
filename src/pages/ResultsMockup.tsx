import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Brain, ChevronRight, Download, Share2, Sparkles, Info, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

// Sample data for mockup
const mockState = {
  id: "123",
  name: "Creative Power",
  description: "You naturally bring new ideas into existence through imaginative action. This state allows you to transform concepts into reality by accessing your innate capacity to generate what didn't previously exist.",
  color: "#AB47BC",
  coaching_tips: "Help direct creative energy toward specific channels and sustained projects. Balance creative generation with practical implementation. Cultivate discipline to bring ideas to completion."
};

const mockUser = {
  firstName: "Alex",
  lastName: "Sample"
};

// Helper function to convert hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '79, 70, 229'; // Default blue if parsing fails
}

const ResultVisual: React.FC<{ state: typeof mockState }> = ({ state }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8 text-center mb-8 relative"
      style={{ 
        boxShadow: `0 10px 25px -5px rgba(${hexToRgb(state.color)}, 0.2), 0 10px 10px -5px rgba(${hexToRgb(state.color)}, 0.1)` 
      }}
    >
      <div className="absolute inset-0 bg-gradient-radial from-white to-gray-50 opacity-50"></div>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: state.color }}></div>
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3 
          }}
          className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl"
          style={{ 
            backgroundColor: state.color,
            boxShadow: `0 10px 25px rgba(${hexToRgb(state.color)}, 0.3)` 
          }}
        >
          <Brain className="h-14 w-14 text-white" />
        </motion.div>
        
        <motion.h3 
          className="text-3xl font-bold mb-4"
          style={{ color: state.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {state.name}
        </motion.h3>
        
        <motion.div
          className="h-2 w-3/4 max-w-md mx-auto rounded-full mb-8 shadow-sm"
          style={{ backgroundColor: state.color }}
          initial={{ width: "0%" }}
          animate={{ width: "75%" }}
          transition={{ duration: 1, delay: 0.5 }}
        ></motion.div>
        
        <motion.p 
          className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {state.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

const AIInsight: React.FC<{ state: typeof mockState, firstName: string }> = ({ state, firstName }) => {
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

const ResultsMockup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-radial from-white/80 to-gray-50/30 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-spectrum-gradient"></div>
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${mockState.color}, transparent 70%)`,
        }}
      ></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Brain className="h-6 w-6" style={{ color: mockState.color }} />
            <span className="ml-2 font-semibold text-gray-900">Emotional Dynamics Indicator™</span>
          </Link>
          <div className="flex space-x-2">
            <div className="text-sm text-blue-600 font-medium mr-4 bg-blue-50 px-3 py-1 rounded-full flex items-center">
              <Info className="h-3.5 w-3.5 mr-1" />
              Sample Results
            </div>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Save PDF
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
            >
              Your Emotional Dynamics Results
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-gray-600"
            >
              Hi {mockUser.firstName}, your dominant harmonic state is:
            </motion.p>
          </div>
          
          {/* Dominant State Visualization */}
          <ResultVisual state={mockState} />
          
          {/* AI Insight */}
          <AIInsight 
            state={mockState} 
            firstName={mockUser.firstName}
          />
          
          {/* Additional insights section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 bg-white rounded-xl shadow-md p-6 mb-8 relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: mockState.color }}
            ></div>
            
            <h3 className="text-lg font-bold pl-3 mb-4" style={{ color: mockState.color }}>Understanding Your Dominant State</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div 
                className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1" 
                style={{ borderLeftColor: mockState.color, borderLeftWidth: '3px' }}
              >
                <h4 className="font-bold text-gray-800 mb-3" style={{ color: mockState.color }}>Strengths of {mockState.name}</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: mockState.color }}>•</span>
                    <span>Ability to generate new ideas and solutions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: mockState.color }}>•</span>
                    <span>Natural capacity to turn imagination into action</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: mockState.color }}>•</span>
                    <span>Visionary thinking combined with practical implementation</span>
                  </li>
                </ul>
              </div>
              <div 
                className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1" 
                style={{ borderLeftColor: mockState.color, borderLeftWidth: '3px' }}
              >
                <h4 className="font-bold text-gray-800 mb-3" style={{ color: mockState.color }}>Growth Opportunities</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: mockState.color }}>•</span>
                    <span>Develop sustainable creative practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: mockState.color }}>•</span>
                    <span>Balance innovative thinking with follow-through</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: mockState.color }}>•</span>
                    <span>Create structure to support completing creative projects</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Harmonic scale context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-8 p-6 mb-8 relative overflow-hidden bg-gray-900 rounded-xl text-white shadow-xl"
          >
            <div className="absolute inset-0 bg-spectrum-gradient opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Your Place on the Harmonic Scale</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                The Harmonic Scale represents a complete spectrum of emotional states. Your current dominant state of {mockState.name} is just one point on this spectrum.
              </p>
              
              <div className="w-full h-4 bg-gray-800 rounded-full mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-spectrum-gradient"></div>
                <div 
                  className="absolute top-0 bottom-0 w-4 h-4 rounded-full border-2 border-white shadow-glow transition-all duration-500"
                  style={{ 
                    left: '85%', 
                    transform: 'translateX(-50%)',
                    backgroundColor: mockState.color
                  }}
                ></div>
                <div 
                  className="absolute -bottom-6 text-xs font-medium text-white"
                  style={{ left: '85%', transform: 'translateX(-50%)' }}
                >
                  {mockState.name}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 mb-4">
                <span>Apathy</span>
                <span>Grief</span>
                <span>Fear</span>
                <span>Anger</span>
                <span>Willingness</span>
                <span>Creative Power</span>
                <span>Pure Awareness</span>
              </div>
            </div>
          </motion.div>
          
          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-12 rounded-xl p-8 text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${mockState.color}15, ${mockState.color}30)`,
              border: `1px solid ${mockState.color}40`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: mockState.color }}></div>
            
            <div className="absolute -bottom-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-white/5 to-white/0"></div>
            <div className="absolute -top-14 -left-14 w-48 h-48 rounded-full bg-gradient-to-br from-white/5 to-white/0"></div>
            
            <h3 className="text-xl font-bold text-gray-900">Ready to discover YOUR emotional dynamics?</h3>
            <p className="mt-2 text-gray-600">
              Take the free assessment and get personalized insights into your dominant emotional pattern.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  rounded="full" 
                  variant="gradient"
                  className="px-8 shadow-lg"
                >
                  Take the Assessment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/questions-preview">
                <Button 
                  rounded="full" 
                  variant="outline"
                  className="px-8"
                >
                  Preview Questions
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Footer spectrum */}
      <div className="h-2 bg-spectrum-gradient"></div>
    </div>
  );
};

export default ResultsMockup;