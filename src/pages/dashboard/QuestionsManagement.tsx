import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  harmonic_state: string;
  order: number;
  created_at: string;
  state_name?: string;
  state_color?: string;
}

interface HarmonicState {
  id: string;
  name: string;
  color: string;
}

const QuestionsManagement: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [harmonicStates, setHarmonicStates] = useState<HarmonicState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Form state for new/editing questions
  const [formData, setFormData] = useState({
    question_text: '',
    harmonic_state: '',
    order: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch harmonic states first
      const { data: statesData, error: statesError } = await supabase
        .from('harmonic_states')
        .select('id, name, color')
        .order('name');

      if (statesError) throw statesError;
      setHarmonicStates(statesData || []);

      // Fetch questions with state info
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('order', { ascending: true });

      if (questionsError) throw questionsError;

      // Enhance questions with state info
      const enhancedQuestions = (questionsData || []).map(question => {
        const state = statesData?.find(s => s.id === question.harmonic_state);
        return {
          ...question,
          state_name: state?.name,
          state_color: state?.color
        };
      });

      setQuestions(enhancedQuestions);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      question_text: '',
      harmonic_state: harmonicStates[0]?.id || '',
      order: questions.length + 1
    });
    setEditingQuestion(null);
    setShowAddForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setFormData({
      question_text: question.question_text,
      harmonic_state: question.harmonic_state,
      order: question.order
    });
    setEditingQuestion(question);
    setShowAddForm(true);
  };

  const handleSaveQuestion = async () => {
    if (!formData.question_text.trim() || !formData.harmonic_state) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update({
            question_text: formData.question_text.trim(),
            harmonic_state: formData.harmonic_state,
            order: formData.order
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Question updated successfully' });
      } else {
        // Add new question
        const { error } = await supabase
          .from('questions')
          .insert({
            question_text: formData.question_text.trim(),
            harmonic_state: formData.harmonic_state,
            order: formData.order
          });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Question added successfully' });
      }

      setShowAddForm(false);
      setEditingQuestion(null);
      await fetchData();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving question:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save question' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setQuestionToDelete(questionId);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) {
      setMessage({ type: 'error', text: 'Please select questions to delete' });
      return;
    }
    setQuestionToDelete(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setShowDeleteConfirm(false);

    try {
      if (questionToDelete) {
        // Single delete
        const { error } = await supabase
          .from('questions')
          .delete()
          .eq('id', questionToDelete);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Question deleted successfully' });
      } else {
        // Bulk delete
        const questionIds = Array.from(selectedQuestions);
        const { error } = await supabase
          .from('questions')
          .delete()
          .in('id', questionIds);

        if (error) throw error;
        setMessage({ type: 'success', text: `${questionIds.length} questions deleted successfully` });
        setSelectedQuestions(new Set());
      }

      await fetchData();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to delete question' });
    } finally {
      setDeleting(false);
      setQuestionToDelete(null);
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      harmonic_state: '',
      order: 1
    });
  };

  // Filter questions based on search and state filter
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.state_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterState === 'all' || question.harmonic_state === filterState;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Questions Management</h1>
            <p className="text-gray-600">Manage assessment questions and their harmonic states</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {selectedQuestions.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedQuestions.size})
            </Button>
          )}
          <Button onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All States</option>
                {harmonicStates.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                id="question_text"
                rows={3}
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the question text..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="harmonic_state" className="block text-sm font-medium text-gray-700 mb-2">
                  Harmonic State *
                </label>
                <select
                  id="harmonic_state"
                  value={formData.harmonic_state}
                  onChange={(e) => setFormData({ ...formData, harmonic_state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a state...</option>
                  {harmonicStates.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveQuestion} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Questions ({filteredQuestions.length})
            </h2>
            <div className="text-sm text-gray-500">
              Total: {questions.length} questions
            </div>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterState !== 'all' ? 'No matching questions' : 'No questions found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterState !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first assessment question.'}
            </p>
            {!searchTerm && filterState === 'all' && (
              <Button onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harmonic State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => handleSelectQuestion(question.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{question.order}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {question.question_text}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: question.state_color || '#6B7280' }}
                        ></div>
                        <span className="text-sm text-gray-900">
                          {question.state_name || 'Unknown State'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm Deletion
                  </h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {questionToDelete 
                    ? "Are you sure you want to delete this question? This action cannot be undone."
                    : `Are you sure you want to delete ${selectedQuestions.size} selected questions? This action cannot be undone.`
                  }
                </p>
                
                {!questionToDelete && selectedQuestions.size > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-800 font-medium">
                      Questions to be deleted:
                    </p>
                    <ul className="mt-1 text-sm text-red-700 max-h-32 overflow-y-auto">
                      {filteredQuestions
                        .filter(q => selectedQuestions.has(q.id))
                        .map(q => (
                          <li key={q.id} className="truncate">
                            #{q.order}: {q.question_text.substring(0, 50)}...
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {questionToDelete ? 'Question' : `${selectedQuestions.size} Questions`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsManagement;