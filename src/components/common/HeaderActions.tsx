import { useState, useEffect } from 'react';
import LogoutButton from '~/components/authentication/LogoutButton';

export default function HeaderActions() {
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    // Check if current path is dashboard
    const checkPath = () => {
      const path = window.location.pathname;
      setIsDashboard(path === '/dashboard/' || path === '/dashboard');
    };

    // Check initially
    checkPath();

    // Listen for Astro view transitions
    document.addEventListener('astro:page-load', checkPath);
    document.addEventListener('astro:after-swap', checkPath);

    return () => {
      document.removeEventListener('astro:page-load', checkPath);
      document.removeEventListener('astro:after-swap', checkPath);
    };
  }, []);

  if (isDashboard) {
    return <LogoutButton />;
  }

  return (
    <a
      href="/signin/"
      className="cta-gradient font-bold py-2 px-4 rounded-lg inline-block text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      Portal de socios
    </a>
  );
}
