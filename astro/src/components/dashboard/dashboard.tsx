import { useEffect, useState } from 'react';
import HLSPlayer from './HLSPlayer';
import supabase from '~/lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import LogoutButton from '../authentication/LogoutButton';

const Dashboard = () => {
  /* --------------------------------- STATES --------------------------------- */
  const [isLoading, setIsLoading] = useState(true);

  /* --------------------------------- EFFECTS -------------------------------- */
  // Check authentication on component mount
  useEffect(() => {
    setIsLoading(true);

    const checkAuthentication = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // Redirect to signin page if user is not authenticated
          window.location.href = '/signin/';
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    checkAuthentication();
  }, []);

  /* --------------------------------- RENDER --------------------------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div id="dashboard" className="mx-4">
      <section className="relative w-full h-full flex flex-col items-center justify-center mt-20">
        <h1 className="text-2xl font-bold mb-6">Portal de socios</h1>

        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-4">Heaven Cam en vivo</h2>
          <HLSPlayer
            streamUrl="https://cam.heavenclub.es/heaven_cam/index.m3u8"
            className="w-full aspect-video"
            title="Heaven Cam en vivo"
          />
        </div>

        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-4">Monteros Cam en vivo</h2>
          <HLSPlayer
            streamUrl="https://flus.spotfav.com:443/marbella-los-monteros-spotfav/index.m3u8?token=4cde82546522b95fd69e9527807195fad414b9c5-31134306-bea182a25c116318c722128da0e199794619c4ffe1ba03856d-1746465733-1746461833"
            className="w-full aspect-video"
            title="Monteros Cam en vivo"
          />
        </div>

        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-4">El tiempo en Heaven</h2>
          <p>Disponible próximamente</p>
        </div>

        <LogoutButton />

        <div className="mb-40"></div>
      </section>
    </div>
  );
};

export default Dashboard;
