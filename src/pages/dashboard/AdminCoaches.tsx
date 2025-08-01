import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Briefcase, Users, Mail, Calendar, MoreVertical } from 'lucide-react';

interface Coach {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  trainer_id: string | null;
  client_count: number;
  trainer_name?: string;
}

const AdminCoaches: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        // Get all coaches with their email from auth.users
        const { data: coachData, error: coachError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            created_at,
            trainer_id
          `)
          .eq('role', 'coach')
          .order('created_at', { ascending: false });

        if (coachError) throw coachError;

        // Get client counts and email for each coach
        const coachesWithCounts = await Promise.all(
          (coachData || []).map(async (coach) => {
            // Get email from auth.users
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(coach.id);
            
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('coach_id', coach.id);

            if (countError) throw countError;

            return {
              ...coach,
              client_count: count || 0,
              email: userData?.user?.email || null
            };
          })
        );

        setCoaches(coachesWithCounts);
      } catch (err: any) {
        console.error('Error fetching coaches:', err);
        setError(err.message || 'Failed to load coaches');
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Coaches</h1>
            <p className="text-gray-600">Manage all coaches in the system</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {coaches.length} coaches
          </div>
        </div>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No coaches found
          </h3>
          <p className="text-gray-600">
            There are no coaches registered in the system yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coaches.map((coach) => (
                  <tr key={coach.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                          {coach.first_name?.[0] || 'C'}{coach.last_name?.[0] || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {coach.first_name || 'Unknown'} {coach.last_name || 'Coach'}
                          </div>
                          <div className="text-sm text-gray-500">ID: {coach.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">No email available</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{coach.client_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(coach.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/dashboard/coach/${coach.id}`}
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

export default AdminCoaches;