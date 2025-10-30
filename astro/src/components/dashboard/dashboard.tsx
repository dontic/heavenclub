import { useEffect, useState } from 'react';
import HLSPlayer from './HLSPlayer';
import Weather from './Weather';
import WindGuru from './WindGuru';
import LoadingSpinner from '../common/LoadingSpinner';
import LogoutButton from '../authentication/LogoutButton';
import { getAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';
import hlsOverlayUrl from '~/assets/images/hls-overlay.png?url';
import heavenBeachClubLogo from '~/assets/images/heavenbeachclub_logo.png';
import danielEsAvatar from '~/assets/images/daniel_es_avatar.jpeg';

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
        // window.location.href = '/signin/';
        setIsLoading(false);
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
    <div id="dashboard" className="mx-4 relative">
      <button
        onClick={() => window.location.reload()}
        className="absolute top-4 right-0 md:hidden p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors duration-200 flex items-center justify-center z-50"
        aria-label="Recargar página"
        title="Recargar página"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-gray-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
      <section className="relative w-full h-full flex flex-col items-center justify-center mt-10 d:mt-20">
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

        <div className="w-full max-w-6xl mb-8">
          <h2 className="text-xl font-semibold mb-4">La previ del Heaven</h2>
          <WindGuru className="w-full" />
        </div>

        {/* Sponsored Card - Heaven Beach Bar */}
        <div className="w-full max-w-3xl mb-8">
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 p-[2px] shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300">
            <div className="relative bg-slate-900 rounded-2xl p-8 backdrop-blur-sm">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Content */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-teal-400/20 rounded-full text-cyan-300 text-sm font-medium mb-3 border border-cyan-500/30">
                    Patrocinado por
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Heaven Beach Bar</h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Este portal es posible gracias al apoyo de Heaven Beach Bar, que nos permite hacer uso de sus
                    instalaciones para instalar nuestra cámara y estación meteorológica.
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <div className="relative group/logo">
                    <a
                      href="https://heavenbeachbar.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-umami-event="heavenbeachbar-link"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-xl blur-xl opacity-50 group-hover/logo:opacity-75 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="relative bg-white rounded-xl p-4 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={heavenBeachClubLogo.src}
                          alt="Heaven Beach Club Logo"
                          className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        />
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Developer Credit Card */}
        <div className="w-full max-w-3xl mb-8">
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 p-[2px] shadow-2xl hover:shadow-purple-500/50 transition-all duration-300">
            <div className="relative bg-slate-900 rounded-2xl p-8 backdrop-blur-sm">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Content */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full text-purple-300 text-sm font-medium mb-3 border border-purple-500/30">
                    Desarrollado por
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Daniel.es</h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-3">
                    Web y aplicación desarrolladas por Daniel. Ofrezco servicios profesionales de desarrollo de páginas
                    web y aplicaciones web.
                  </p>
                  <a
                    href="https://daniel.es/website-design/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200 cursor-pointer"
                    data-umami-event="daniel.es-link"
                  >
                    <span>Visita daniel.es</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>

                <div className="flex-shrink-0">
                  <div className="relative group/icon">
                    <a
                      href="https://daniel.es/website-design/"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-umami-event="daniel.es-link"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="relative bg-white rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={danielEsAvatar.src}
                          alt="Daniel.es Avatar"
                          className="h-30 w-30 md:h-40 md:w-40 object-cover rounded-xl"
                        />
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </div>

        <LogoutButton />

        <div className="mb-40"></div>
      </section>
    </div>
  );
};

export default Dashboard;
