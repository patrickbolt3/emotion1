import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Handshake, Users, Calendar, Briefcase, UserCog, Eye } from 'lucide-react';

interface PartnerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Coach {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  client_count: number;
}

interface Trainer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  coach_count: number;
}

const PartnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (!id) return;

      try {
        // Get partner profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            created_at,
            updated_at
          `)
          .eq('id', id)
          .eq('role', 'partner')
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Partner not found');

        setPartner(profileData);

        // Get all coaches managed by this partner
        const { data: coachData, error: coachError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, created_at')
          .eq('trainer_id', id)
          .eq('role', 'coach')
          .order('created_at', { ascending: false });

        if (coachError) throw coachError;

        // Get client counts for each coach
        const coachesWithCounts = await Promise.all(
          (coachData || []).map(async (coach) => {
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('coach_id', coach.id);

            if (countError) throw countError;

            return {
              ...coach,
              client_count: count || 0
            };
          })
        );

        setCoaches(coachesWithCounts);

        // Get all trainers managed by this partner
        const { data: trainerData, error: trainerError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, created_at')
          .eq('trainer_id', id)
          .eq('role', 'trainer')
          .order('created_at', { ascending: false });

        if (trainerError) throw trainerError;

        // Get coach counts for each trainer
        const trainersWithCounts = await Promise.all(
          (trainerData || []).map(async (trainer) => {
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .eq('trainer_id', trainer.id)
              .eq('role', 'coach');

            if (countError) throw countError;

            return {
              ...trainer,
              coach_count: count || 0
            };
          })
        );

        setTrainers(trainersWithCounts);
      } catch (err: any) {
        console.error('Error fetching partner details:', err);
        setError(err.message || 'Failed to load partner details');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-gray-200 h-64 rounded-lg mb-6"></div>
        <div className="bg-gray-200 h-48 rounded-lg"></div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Partner not found'}
      </div>
    );
  }

  const totalCoaches = coaches.length;
  const totalTrainers = trainers.length;
  const totalClients = coaches.reduce((sum, coach) => sum + coach.client_count, 0);

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link to="/dashboard/users/partners" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {partner.first_name} {partner.last_name}
          </h1>
          <p className="text-gray-600">Partner Details</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
                {partner.first_name?.[0] || 'P'}{partner.last_name?.[0] || ''}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-900">
                  {partner.first_name || 'Unknown'} {partner.last_name || 'Partner'}
                </h3>
                <p className="text-sm text-gray-500">Partner</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm font-mono text-gray-900 break-all bg-gray-50 p-2 rounded">
                  {partner.id}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(partner.created_at)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(partner.updated_at)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Management Summary</label>
              <div className="flex items-center text-sm text-gray-900">
                <Users className="h-4 w-4 mr-2" />
                {totalTrainers} trainers, {totalCoaches} coaches, {totalClients} total clients
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trainers List */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trainers ({trainers.length})</h2>
        
        {trainers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No trainers assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coaches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainers.map((trainer) => (
                  <tr key={trainer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                          {trainer.first_name?.[0] || 'T'}{trainer.last_name?.[0] || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {trainer.first_name || 'Unknown'} {trainer.last_name || 'Trainer'}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {trainer.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trainer.coach_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(trainer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/dashboard/trainer/${trainer.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coaches List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coaches ({coaches.length})</h2>
        
        {coaches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No coaches assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                          <div className="text-sm text-gray-500 font-mono">
                            {coach.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coach.client_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(coach.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        to={`/dashboard/coach/${coach.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDetails;