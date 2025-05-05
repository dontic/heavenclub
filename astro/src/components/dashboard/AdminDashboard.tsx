import { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';

const AdminDashboard = () => {
  /* --------------------------------- STATES --------------------------------- */
  const [isLoading, setIsLoading] = useState(true);

  /* --------------------------------- EFFECTS -------------------------------- */
  // Check authentication and authorization on component mount
  useEffect(() => {
    setIsLoading(true);

    const checkAuthenticationAndRole = async () => {
      try {
        const response = await getAllauthClientV1AuthSession('browser');

        if (!response.data?.user) {
          // Redirect to signin page if user is not authenticated
          window.location.href = '/signin/';
        } else {
          // Check if user has the required role (OWNER or ADMIN)
          const userRole = response.data.user?.role;
          if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
            // Redirect to regular dashboard if not authorized
            window.location.href = '/dashboard/';
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Redirect to signin page if there's an authentication error
        window.location.href = '/signin/';
      }
    };

    checkAuthenticationAndRole();
  }, []);

  /* --------------------------------- RENDER --------------------------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return <div>AdminDashboard</div>;
};

export default AdminDashboard;
