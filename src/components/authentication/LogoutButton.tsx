import { useState } from 'react';
import supabase from '~/lib/supabase';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        return;
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
      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-70 hover:cursor-pointer"
    >
      {isLoggingOut ? 'Saliendo...' : 'Salir'}
    </button>
  );
}
