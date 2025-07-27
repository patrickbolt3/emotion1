import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAssessmentStore } from '../../store/assessmentStore';
import { Button } from '../../components/ui/Button';
import { Brain, CheckCircle, Clock } from 'lucide-react';

const NewAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initializeAssessment } = useAssessmentStore();
  
  const handleStartAssessment = async () => {
    if (!user) {
      setError('You must be signed in to take an assessment');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const assessmentId = await initializeAssessment(user.id);
      navigate(`/assessment/${assessmentId}`);
    } catch (err: any) {
      console.error('Error creating assessment:', err);
      setError(err.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Take the Emotional Dynamics Assessment</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex items-center justify-center mb-6">
          <Brain className="h-16 w-16 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
          Discover Your Dominant Emotional Pattern
        </h2>
        <p className="text-gray-600 text-center mb-8">
          This assessment consists of 98 questions that will help identify your dominant emotional state and provide insights for growth and transformation.
        </p>
        
        <Button
          className="w-full py-3 text-lg"
          onClick={handleStartAssessment}
          disabled={loading}
        >
          {loading ? 'Creating Assessment...' : 'Start Assessment'}
        </Button>
      </div>
      
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Before you begin:</h3>
        
        <ul className="space-y-4">
          <li className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-600">
              Answer honestly based on how you generally think, feel, and behave, not how you wish to be.
            </span>
          </li>
          <li className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-600">
              There are no right or wrong answers. The assessment is designed to identify patterns, not judge them.
            </span>
          </li>
          <li className="flex">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-600">
              The assessment takes approximately 15-20 minutes to complete. You can save your progress and return later.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NewAssessment;