import { useEffect, useState } from 'react';
import HLSPlayer from './HLSPlayer';
import Weather from './Weather';
import LoadingSpinner from '../common/LoadingSpinner';
import LogoutButton from '../authentication/LogoutButton';
import { getAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';
import hlsOverlayUrl from '~/assets/images/hls-overlay.png?url';

const Dashboard = () => {
  /* --------------------------------- STATES --------------------------------- */
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [playStream, setPlayStream] = useState(false);

  /* --------------------------------- EFFECTS -------------------------------- */
  // Check authentication on component mount
  useEffect(() => {
    setIsLoading(true);

    const checkAuthentication = async () => {
      try {
        const response = await getAllauthClientV1AuthSession('browser');
        if (!response.data?.user) {
          // Redirect to signin page if user is not authenticated
          window.location.href = '/signin/';
        } else {
          setUserRole(response.data.user.role);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Redirect to signin page if there's an authentication error
        window.location.href = '/signin/';
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

  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER';

  return (
    <div id="dashboard" className="mx-4">
      <section className="relative w-full h-full flex flex-col items-center justify-center mt-20">
        <h1 className="text-2xl font-bold mb-6">Portal de socios</h1>

        {isAdmin && (
          <div className="w-full max-w-3xl mb-6 text-center">
            <a
              href="/admin/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
            >
              Portal administrativo
            </a>
          </div>
        )}

        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-4">Heaven Cam en vivo</h2>
          {playStream ? (
            <HLSPlayer
              streamUrl="https://cam.heavenclub.es/heaven_cam/index.m3u8"
              className="w-full aspect-video"
              title="Heaven Cam en vivo"
            />
          ) : (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <img
                src={hlsOverlayUrl}
                alt="Heaven Cam overlay"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                aria-label="Reproducir Heaven Cam"
                onClick={() => setPlayStream(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-lg transition cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8 ml-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xl font-semibold mb-4">El tiempo en Heaven</h2>
          <Weather />
        </div>

        <LogoutButton />

        <div className="mb-40"></div>
      </section>
    </div>
  );
};

export default Dashboard;
