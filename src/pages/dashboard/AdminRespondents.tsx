import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, User, BarChart3, Calendar, MoreVertical, CheckCircle, Clock, XCircle, Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface Respondent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  coach_id: string | null;
  coach_name?: string | null;
  assessment_count: number;
  completed_assessments: number;
  latest_assessment?: {
    id: string;
    created_at: string;
    completed: boolean;
    dominant_state: string | null;
  };
}

const AdminRespondents: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'assessment_count' | 'coach'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserRole();
      await fetchRespondents();
    };
    initializeData();
  }, [user]);

  const fetchRespondents = async () => {
    if (!user) return;
    
    try {
      // First get the current user's role
      const { data: currentUserProfile, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (roleError) throw roleError;
      
      const currentUserRole = currentUserProfile?.role;
      
      // Get respondents based on user role - for partners, only show clients of their coaches
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          created_at,
          coach_id,
          coach:coach_id (
            first_name,
            last_name
          )
        `)
        .eq('role', 'respondent');

      // If user is a partner, only show clients of coaches they manage
      if (currentUserRole === 'partner') {
        // First get the coach IDs managed by this partner
        const { data: partnerCoaches, error: coachError } = await supabase
          .from('profiles')
          .select('id')
          .eq('trainer_id', user?.id)
          .eq('role', 'coach');

        if (coachError) throw coachError;

        const coachIds = partnerCoaches?.map(c => c.id) || [];
        
        if (coachIds.length === 0) {
          // No coaches, so no clients to show
          setRespondents([]);
          setLoading(false);
          return;
        }

        query = query.in('coach_id', coachIds);
      }

      const { data: respondentData, error: respondentError } = await query.order('created_at', { ascending: false });

      if (respondentError) throw respondentError;

      // Get assessment data for each respondent
      const respondentsWithAssessments = await Promise.all(
        (respondentData || []).map(async (respondent: any) => {
          // Get all assessments for this respondent
          const { data: assessments, error: assessmentError } = await supabase
            .from('assessments')
            .select('id, created_at, completed, dominant_state')
            .eq('user_id', respondent.id)
            .order('created_at', { ascending: false });

          if (assessmentError) throw assessmentError;

          const completedAssessments = (assessments || []).filter((a: any) => a.completed) || [];
          const latestAssessment = assessments && assessments.length > 0 ? assessments[0] : undefined;

          return {
            ...respondent,
            assessment_count: assessments?.length || 0,
            completed_assessments: completedAssessments.length,
            latest_assessment: latestAssessment,
            coach_name: respondent.coach 
              ? `${respondent.coach.first_name || ''} ${respondent.coach.last_name || ''}`.trim()
              : null
          } as Respondent;
        })
      );

      setRespondents(respondentsWithAssessments);
    } catch (err: any) {
      console.error('Error fetching respondents:', err);
      setError(err.message || 'Failed to load respondents');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  // Filter and sort respondents
  const filteredAndSortedRespondents = React.useMemo(() => {
    let filtered = respondents.filter(respondent => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${respondent.first_name || ''} ${respondent.last_name || ''}`.toLowerCase();
      const coachName = respondent.coach_name?.toLowerCase() || '';
      
      const matchesSearch = (
        fullName.includes(searchLower) ||
        respondent.email.toLowerCase().includes(searchLower) ||
        coachName.includes(searchLower)
      );
      
      if (!matchesSearch) return false;
      
      // Apply status filter
      if (filterStatus === 'all') return true;
      
      const hasAssessment = !!respondent.latest_assessment;
      const isCompleted = hasAssessment && respondent.latest_assessment!.completed;
      const isInProgress = hasAssessment && !respondent.latest_assessment!.completed;
      
      switch (filterStatus) {
        case 'completed':
          return isCompleted;
        case 'in_progress':
          return isInProgress;
        case 'not_started':
          return !hasAssessment;
        default:
          return true;
      }
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'assessment_count':
          aValue = a.assessment_count;
          bValue = b.assessment_count;
          break;
        case 'coach':
          aValue = a.coach_name?.toLowerCase() || '';
          bValue = b.coach_name?.toLowerCase() || '';
          break;
        default:
          aValue = a.first_name || '';
          bValue = b.first_name || '';
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [respondents, searchTerm, filterStatus, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (respondent: Respondent) => {
    if (!respondent.latest_assessment) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (respondent.latest_assessment.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (respondent: Respondent) => {
    if (!respondent.latest_assessment) {
      return 'No assessments';
    }
    if (respondent.latest_assessment.completed) {
      return 'Completed';
    }
    return 'In progress';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
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
            <h1 className="text-2xl font-bold text-gray-900">Respondents</h1>
            <p className="text-gray-600">Manage all respondents in the system</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Showing: {filteredAndSortedRespondents.length} of {respondents.length} respondents
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search respondents by name, email, or coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="created_at">Sort by Date Joined</option>
              <option value="assessment_count">Sort by Assessments</option>
              <option value="coach">Sort by Coach</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedRespondents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No respondents found
          </h3>
          <p className="text-gray-600">
            There are no respondents registered in the system yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Respondent
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {sortBy === 'email' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('coach')}
                  >
                    <div className="flex items-center">
                      Coach
                      {sortBy === 'coach' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('assessment_count')}
                  >
                    <div className="flex items-center">
                      Assessments
                      {sortBy === 'assessment_count' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Joined
                      {sortBy === 'created_at' && (
                        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRespondents.map((respondent) => (
                  <tr key={respondent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                          {respondent.first_name?.[0] || 'R'}
                          {respondent.last_name?.[0] || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {respondent.first_name || 'Unknown'} {respondent.last_name || 'User'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {respondent.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{respondent.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {respondent.coach_name ? (
                        <div className="text-sm text-gray-900">{respondent.coach_name}</div>
                      ) : (
                        <span className="text-sm text-gray-400">No coach assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {respondent.completed_assessments}/{respondent.assessment_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(respondent)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(respondent)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(respondent.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {respondent.latest_assessment?.completed && (
                          <Link 
                            to={`/results/${respondent.latest_assessment.id}`}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            View Results
                          </Link>
                        )}
                        <Link 
                          to={`/dashboard/respondent/${respondent.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRespondents;