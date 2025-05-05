import { useState, useEffect } from 'react';
import {
  postAllauthClientV1AuthCodeRequest,
  postAllauthClientV1AuthCodeConfirm,
} from '~/api/allauth/authentication-login-by-code/authentication-login-by-code';
import { getAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';

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
        const response = await getAllauthClientV1AuthSession('browser');

        if (response.data?.user) {
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
      await postAllauthClientV1AuthCodeRequest('browser', { email });
      setState('OTP_INPUT');
    } catch (error: any) {
      console.error('Error sending OTP:', error);

      // Handle error response
      if (error.response?.status === 401) {
        // 401 means the code was sent successfully but user is not authenticated yet
        setState('OTP_INPUT');
      } else if (error.response?.status === 404) {
        setErrorMessage('Este correo electrónico no está registrado como socio.');
        setState('EMAIL_INPUT');
      } else if (error.response?.data?.errors) {
        const errorData = error.response.data.errors;
        setErrorMessage(errorData[0]?.message || 'Error al enviar el código de verificación');
        setState('EMAIL_INPUT');
      } else {
        setErrorMessage('Error al enviar el código de verificación');
        setState('EMAIL_INPUT');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await postAllauthClientV1AuthCodeConfirm('browser', { code: otp });

      if (response.data?.user) {
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
    } catch (error: any) {
      console.error('Error verifying OTP:', error);

      // Handle error response
      if (error.response?.data?.errors) {
        const errorData = error.response.data.errors;
        setErrorMessage(errorData[0]?.message || 'Error al verificar el código');
      } else {
        setErrorMessage('Error al verificar el código');
      }

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
        <p className="mt-3 text-center text-sm text-gray-600">
          ¿Quieres unirte al club?{' '}
          <a href="/contact/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Haz clic aquí
          </a>
        </p>
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
        {errorMessage === 'Este correo electrónico no está registrado como socio.' ? (
          <p className="mt-2 text-center text-sm font-medium text-red-600">
            Este correo electrónico no está registrado como socio. Por favor,{' '}
            <a href="/contact/" className="underline hover:text-red-800">
              contacta con el club
            </a>{' '}
            para más información.
          </p>
        ) : errorMessage ? (
          <p className="mt-2 text-center text-sm font-medium text-red-600">{errorMessage}</p>
        ) : null}
      </div>

      {state === 'EMAIL_INPUT' ? renderEmailForm() : state === 'OTP_INPUT' ? renderOtpForm() : null}
    </div>
  );
}
