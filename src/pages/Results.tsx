import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Brain, ChevronRight, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssessmentResult {
  id: string;
  dominantState: string;
  results: Record<string, number>;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface HarmonicState {
  id: string;
  name: string;
  description: string;
  color: string;
  coaching_tips: string | null;
}

const ResultVisual: React.FC<{ state: HarmonicState }> = ({ state }) => {
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

const AIInsight: React.FC<{ state: HarmonicState, firstName: string }> = ({ state, firstName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [insight, setInsight] = useState<string>('');
  
  // Simulate API call to generate AI insight
  useEffect(() => {
    const generateInsight = async () => {
      setIsLoading(true);
      
      // In a real implementation, this would make an API call to OpenAI
      // For now, we'll simulate a delay and return a hardcoded response
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
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-md relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: state.color }}></div>
      
      <div className="flex items-start space-x-4 pl-3">
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
            style={{ 
              backgroundColor: state.color, 
              boxShadow: `0 4px 10px rgba(${hexToRgb(state.color)}, 0.2)` 
            }}
          >
            <Brain className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold" style={{ color: state.color }}>AI Insight</h3>
          
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

// Helper function to convert hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    '79, 70, 229'; // Default blue if parsing fails
}

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [state, setState] = useState<HarmonicState | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!id) {
          setError('Invalid assessment ID');
          return;
        }
        
        // Fetch assessment with dominant state
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .select(`
            id,
            created_at,
            dominant_state,
            results,
            user_id
          `)
          .eq('id', id)
          .single();
        
        if (assessmentError) throw assessmentError;
        if (!assessment) throw new Error('Assessment not found');
        
        // Fetch user profile for the assessment
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', assessment.user_id)
          .single();
        
        if (profileError) throw profileError;
        
        // Fetch the dominant harmonic state details
        if (assessment.dominant_state) {
          const { data: harmonicState, error: stateError } = await supabase
            .from('harmonic_states')
            .select('*')
            .eq('id', assessment.dominant_state)
            .single();
          
          if (stateError) throw stateError;
          setState(harmonicState);
        }
        
        // Set the result
        setResult({
          id: assessment.id,
          dominantState: assessment.dominant_state,
          results: assessment.results,
          user: {
            firstName: profile.first_name || 'User',
            lastName: profile.last_name || '',
          },
          createdAt: assessment.created_at,
        });
      } catch (err: any) {
        console.error('Error loading results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  const handleSavePDF = async () => {
    try {
      // Create PDF with jsPDF
      const pdf = new jsPDF();
      
      // Convert hex color to RGB for PDF
      const hexToRgbForPdf = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [79, 70, 229];
      };
      
      const [r, g, b] = hexToRgbForPdf(state?.color || '#4F46E5');
      
      // Set up the PDF
      pdf.setFontSize(24);
      pdf.setTextColor(r, g, b);
      pdf.text('Emotional Dynamics Indicator™', 20, 30);
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Assessment Results', 20, 45);
      
      // Add a colored line
      pdf.setDrawColor(r, g, b);
      pdf.setLineWidth(2);
      pdf.line(20, 50, 190, 50);
      
      // User info
      pdf.setFontSize(12);
      pdf.text(`Name: ${result?.user.firstName} ${result?.user.lastName}`, 20, 70);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
      
      // Dominant state
      pdf.setFontSize(16);
      pdf.setTextColor(r, g, b);
      pdf.text('Your Dominant Harmonic State:', 20, 100);
      
      pdf.setFontSize(20);
      pdf.text(state?.name || '', 20, 115);
      
      // Description
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const description = state?.description || '';
      const splitDescription = pdf.splitTextToSize(description, 170);
      pdf.text(splitDescription, 20, 135);
      
      // Add coaching tips if available
      if (state?.coaching_tips) {
        pdf.setFontSize(14);
        pdf.setTextColor(r, g, b);
        pdf.text('Coaching Recommendations:', 20, 180);
        
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        const splitTips = pdf.splitTextToSize(state.coaching_tips, 170);
        pdf.text(splitTips, 20, 195);
      }
      
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by Emotional Dynamics Indicator™', 20, 280);
      
      // Save the PDF
      pdf.save(`EDI-Results-${result?.user.firstName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setSaveMessage('Results saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving results:', error);
      setSaveMessage('Failed to save results');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  
  const handleShare = async () => {
    try {
      const shareData = {
        title: 'My Emotional Dynamics Results',
        text: `I just completed the Emotional Dynamics Indicator™ assessment and discovered my dominant state is ${state?.name}!`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Results shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setShareMessage('Link copied to clipboard!');
      }
      
      setTimeout(() => setShareMessage(null), 3000);
    } catch (error) {
      console.error('Error sharing results:', error);
      setShareMessage('Failed to share results');
      setTimeout(() => setShareMessage(null), 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="rounded-full h-16 w-16 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (error || !result || !state) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Brain className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error || 'Results not available'}</p>
        <Button className="mt-6" onClick={() => window.location.href = '/'}>
          Return to Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${state.color}, transparent 70%)`,
        }}
      ></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-6 w-6" style={{ color: state.color }} />
            <span className="ml-2 font-semibold text-gray-900">Emotional Dynamics Indicator™</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSavePDF}>
              <Download className="h-4 w-4 mr-2" />
              Save PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
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
              Hi {result.user.firstName}, your dominant harmonic state is:
            </motion.p>
          </div>
          
          {/* Dominant State Visualization */}
          <ResultVisual state={state} />
          
          {/* AI Insight */}
          <AIInsight 
            state={state} 
            firstName={result.user.firstName}
          />
          
          {/* Understanding your state */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 bg-white rounded-xl shadow-md p-6 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: state.color }}></div>
            
            <h3 className="text-lg font-bold pl-3 mb-4" style={{ color: state.color }}>Understanding Your Dominant State</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" style={{ borderLeftColor: state.color, borderLeftWidth: '3px' }}>
                <h4 className="font-bold text-gray-800 mb-3" style={{ color: state.color }}>Strengths of {state.name}</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: state.color }}>•</span>
                    <span>{state.name === "Curiosity" ? "Strong drive to learn and expand knowledge" : 
                           state.name === "Enthusiasm" ? "Energetic engagement with people and ideas" :
                           state.name === "Presence" ? "Full engagement with the current moment" :
                           state.name === "Confidence" ? "Assured belief in your capabilities" :
                           state.name === "Harmony" ? "Ability to create balance and cohesion" :
                           "Connection to your unique strengths"}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: state.color }}>•</span>
                    <span>{state.name === "Curiosity" ? "Ability to make interesting connections between ideas" : 
                           state.name === "Enthusiasm" ? "Ability to inspire and motivate others" :
                           state.name === "Presence" ? "Direct experience unfiltered by past or future" :
                           state.name === "Confidence" ? "Capacity for decisive action" :
                           state.name === "Harmony" ? "Seeing multiple perspectives simultaneously" :
                           "Distinctive emotional perspective"}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: state.color }}>•</span>
                    <span>{state.name === "Curiosity" ? "Natural aptitude for asking insightful questions" : 
                           state.name === "Enthusiasm" ? "Quick to engage with new possibilities" :
                           state.name === "Presence" ? "Heightened awareness of subtle signals" :
                           state.name === "Confidence" ? "Clear boundaries and strong sense of self" :
                           state.name === "Harmony" ? "Creating flow and coherence in complex situations" :
                           "Unique contributions only you can offer"}</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300" style={{ borderLeftColor: state.color, borderLeftWidth: '3px' }}>
                <h4 className="font-bold text-gray-800 mb-3" style={{ color: state.color }}>Growth Opportunities</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: state.color }}>•</span>
                    <span>{state.name === "Curiosity" ? "Develop more focus on completing projects" : 
                           state.name === "Enthusiasm" ? "Practice focused attention on one initiative" :
                           state.name === "Presence" ? "Connect momentary awareness to long-term vision" :
                           state.name === "Confidence" ? "Remain open to feedback and refinement" :
                           state.name === "Harmony" ? "Engage constructively with necessary tension" :
                           "Exploring transformative development options"}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: state.color }}>•</span>
                    <span>{state.name === "Curiosity" ? "Practice deeper inquiry versus breadth in some areas" : 
                           state.name === "Enthusiasm" ? "Develop systems for evaluating opportunities" :
                           state.name === "Presence" ? "Create structures that support present awareness" :
                           state.name === "Confidence" ? "Balance certainty with humility" :
                           state.name === "Harmony" ? "Distinguish true harmony from conflict avoidance" :
                           "Building on current strengths"}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-xl" style={{ color: state.color }}>•</span>
                    <span>{state.name === "Curiosity" ? "Balance exploration with practical implementation" : 
                           state.name === "Enthusiasm" ? "Channel energy strategically for sustained impact" :
                           state.name === "Presence" ? "Integrate presence into daily activities" :
                           state.name === "Confidence" ? "Know when to be certain vs. when to question" :
                           state.name === "Harmony" ? "Include and transcend differences" :
                           "Evolving your emotional patterns"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-12 rounded-xl p-8 text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${state.color}15, ${state.color}30)`,
              border: `1px solid ${state.color}40`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: state.color }}></div>
            
            <h3 className="text-xl font-bold text-gray-900">Want to shift this pattern?</h3>
            <p className="mt-2 text-gray-600">
              Work with one of our certified coaches to develop strategies for transforming your emotional patterns.
            </p>
            <div className="mt-6">
              <a href="/register?role=coach">
                <Button 
                  rounded="full" 
                  emotionColor={state.color}
                  variant="emotion"
                  className="px-8 shadow-lg"
                >
                  Find a Coach
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Results;