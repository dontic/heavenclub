import { useState } from 'react';
import { deleteAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';

interface ErrorWithResponse {
  response?: {
    status: number;
  };
}

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      try {
        await deleteAllauthClientV1AuthSession('browser');
      } catch (error: unknown) {
        // 401 response means successful logout (user is no longer authenticated)
        // Any other error should be treated as an actual error
        const err = error as ErrorWithResponse;
        if (!err.response || err.response.status !== 401) {
          throw error;
        }
      }

      // Redirect to home page after successful logout
      window.location.href = '/';
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-8 py-2 rounded-md bg-red-500 text-white hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
    >
      {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </button>
  );
}
