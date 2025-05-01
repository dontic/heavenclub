import { useState, useEffect } from 'react';
import supabase from '~/lib/supabase';

type SignInState = 'EMAIL_INPUT' | 'OTP_INPUT' | 'ERROR';

interface SignInProps {
  onSuccess?: () => void;
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export default function SignIn({ onSuccess }: SignInProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [state, setState] = useState<SignInState>('EMAIL_INPUT');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on component mount
    const checkAuthentication = async () => {
      try {
        setCheckingAuth(true);
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          // User is already authenticated, redirect to dashboard
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/dashboard/';
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [onSuccess]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        // Check for "Signups not allowed" error and display a more user-friendly message
        if (error.message.includes('Signups not allowed')) {
          setErrorMessage(
            'Este correo electrónico no está registrado como socio. Por favor, contacta con el club para más información.'
          );
        } else {
          setErrorMessage(error.message);
        }
        setState('EMAIL_INPUT');

        return;
      }

      setState('OTP_INPUT');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage('Error al enviar el código de verificación');
      setState('EMAIL_INPUT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        setErrorMessage(error.message);
        setState('OTP_INPUT');
        return;
      }

      if (data?.session) {
        // Redirect to dashboard or call a success callback
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/dashboard/';
        }
      } else {
        setErrorMessage('No se pudo crear la sesión');
        setState('EMAIL_INPUT');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage('Error al verificar el código');
      setState('OTP_INPUT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmailForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
      <div className="-space-y-px rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="sr-only">
            Dirección de correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="Dirección de correo electrónico"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-gradient font-semibold w-full justify-center rounded-md py-2 px-4 text-white transition-colors flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span>Enviando...</span>
            </>
          ) : (
            <span>Entrar</span>
          )}
        </button>
      </div>
    </form>
  );

  const renderOtpForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
      <div className="-space-y-px rounded-md shadow-sm">
        <div>
          <p className="mb-4 text-center text-sm text-gray-600">
            Se ha enviado un código de verificación a <strong>{email}</strong>
          </p>
          <label htmlFor="otp" className="sr-only">
            Código de verificación
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="Código de verificación"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-gradient font-semibold w-full justify-center rounded-md py-2 px-4 text-white transition-colors flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span>Verificando...</span>
            </>
          ) : (
            <span>Verificar código</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setState('EMAIL_INPUT')}
          className="text-sm text-indigo-600 hover:text-indigo-800"
          disabled={isSubmitting}
        >
          Volver a introducir el correo
        </button>
      </div>
    </form>
  );

  // Show loading indicator while checking authentication
  if (checkingAuth) {
    return (
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-white/90 backdrop-blur-sm mx-4 flex flex-col justify-center items-center py-10">
        <LoadingSpinner />
        <p className="text-gray-700 mt-3">Comprobando autenticación...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-white/90 backdrop-blur-sm mx-4">
      <div>
        <h2 className="text-center text-2xl font-bold">Inicia sesión en tu cuenta</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {state === 'EMAIL_INPUT'
            ? 'Introduce tu correo electrónico para recibir un código de verificación'
            : 'Introduce el código de verificación enviado a tu correo'}
        </p>
        {/* <p className="mt-2 text-center text-sm font-medium text-amber-600">
          ⚠️ Solo los miembros del club pueden acceder a esta área
        </p> */}
        {errorMessage && <p className="mt-2 text-center text-sm font-medium text-red-600">{errorMessage}</p>}
      </div>

      {state === 'EMAIL_INPUT' ? renderEmailForm() : state === 'OTP_INPUT' ? renderOtpForm() : null}
    </div>
  );
}
