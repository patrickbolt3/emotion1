import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { 
  Brain, 
  BarChart3, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  ChevronDown,
  PlusCircle
} from 'lucide-react';

// Dashboard sub-pages
import RespondentDashboard from './dashboard/RespondentDashboard';
import CoachDashboard from './dashboard/CoachDashboard';
import TrainerDashboard from './dashboard/TrainerDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import NewAssessment from './dashboard/NewAssessment';
import Profile from './dashboard/Profile';
import AdminCoaches from './dashboard/AdminCoaches';
import AdminRespondents from './dashboard/AdminRespondents';
import RespondentDetails from './dashboard/RespondentDetails';
import CoachDetails from './dashboard/CoachDetails';
import NotFound from './NotFound';

// Hook to get user role from database
const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setRole(data?.role || 'respondent');
      } catch (err) {
        console.error('Error fetching user role:', err);
        // If it's a connection error, show a more helpful message
        if (err instanceof TypeError && err.message.includes('fetch')) {
          console.error('Supabase connection failed. Please check your environment variables.');
        }
        setRole('respondent'); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading };
};

const DashboardNav: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { role: userRole } = useUserRole();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 font-semibold text-gray-900">EDI™</span>
            </Link>
            
            <nav className="ml-8 hidden md:flex space-x-4">
              {userRole === 'respondent' && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === '/dashboard' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/dashboard/new-assessment" 
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === '/dashboard/new-assessment' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Take Assessment
                  </Link>
                </>
              )}
              
              {(userRole === 'coach' || userRole === 'trainer' || userRole === 'admin') && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === '/dashboard' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/dashboard/users/respondents" 
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === '/dashboard/users/respondents' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Clients
                  </Link>
                </>
              )}
              
              {(userRole === 'trainer' || userRole === 'admin') && (
                <Link 
                  to="/dashboard/users/coaches" 
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/dashboard/users/coaches' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Coaches
                </Link>
              )}
              
              {userRole === 'admin' && (
                <Link 
                  to="/dashboard/settings" 
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    location.pathname === '/dashboard/settings' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Settings
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-50 p-2 text-gray-700 hover:bg-gray-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    {user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </summary>
                
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-gray-100 bg-white shadow-lg">
                  <div className="p-2">
                    <div className="px-4 py-2 text-sm text-gray-500 break-words">
                      <div>Signed in as</div>
                      <div className="font-medium text-gray-900 break-all overflow-hidden">{user?.email}</div>
                    </div>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <Link 
                      to="/dashboard/profile" 
                      className="flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                    
                    <button 
                      className="flex w-full items-center rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileDashboardNav: React.FC = () => {
  const { user } = useAuth();
  const { role: userRole } = useUserRole();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
      <div className="flex justify-between">
        <Link to="/dashboard" className="flex flex-col items-center px-4 py-2">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <span className="text-xs mt-1 text-gray-600">Dashboard</span>
        </Link>
        
        {userRole === 'respondent' ? (
          <Link to="/dashboard/new-assessment" className="flex flex-col items-center px-4 py-2">
            <PlusCircle className="h-6 w-6 text-blue-600" />
            <span className="text-xs mt-1 text-blue-600">Assessment</span>
          </Link>
        ) : (
          <Link to="/dashboard/users/respondents" className="flex flex-col items-center px-4 py-2">
            <Users className="h-6 w-6 text-gray-600" />
            <span className="text-xs mt-1 text-gray-600">Clients</span>
          </Link>
        )}
        
        <Link to="/dashboard/profile" className="flex flex-col items-center px-4 py-2">
          <Settings className="h-6 w-6 text-gray-600" />
          <span className="text-xs mt-1 text-gray-600">Settings</span>
        </Link>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { role: userRole, loading: roleLoading } = useUserRole();
  
  // Show loading while fetching role
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the appropriate dashboard based on user role
  const getDashboardComponent = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'trainer':
        return <TrainerDashboard />;
      case 'coach':
        return <CoachDashboard />;
      case 'respondent':
      default:
        return <RespondentDashboard />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={getDashboardComponent()} />
          <Route path="/new-assessment" element={<NewAssessment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/coaches" element={<AdminCoaches />} />
          <Route path="/users/respondents" element={<AdminRespondents />} />
          <Route path="/respondent/:id" element={<RespondentDetails />} />
          <Route path="/coach/:id" element={<CoachDetails />} />
        </Routes>
      </main>
      
      <MobileDashboardNav />
    </div>
  );
};

export default Dashboard;