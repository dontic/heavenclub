import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY);

type SignInState = 'EMAIL_INPUT' | 'OTP_INPUT' | 'SUBMITTING' | 'ERROR';

interface SignInProps {
  onSuccess?: () => void;
}

export default function SignIn({ onSuccess }: SignInProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [state, setState] = useState<SignInState>('EMAIL_INPUT');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('SUBMITTING');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setState('EMAIL_INPUT');
        return;
      }

      setState('OTP_INPUT');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage('Error al enviar el código de verificación');
      setState('EMAIL_INPUT');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('SUBMITTING');
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

      if (data.session) {
        // Redirect to dashboard or call a success callback
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setErrorMessage('No se pudo crear la sesión');
        setState('EMAIL_INPUT');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage('Error al verificar el código');
      setState('OTP_INPUT');
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
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={state === 'SUBMITTING'}
          className="cta-gradient font-semibold w-full justify-center rounded-md py-2 px-4 text-white transition-colors"
        >
          {state === 'SUBMITTING' ? 'Enviando...' : 'Entrar'}
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
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            placeholder="Código de verificación"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <button
          type="submit"
          disabled={state === 'SUBMITTING'}
          className="cta-gradient font-semibold w-full justify-center rounded-md py-2 px-4 text-white transition-colors"
        >
          {state === 'SUBMITTING' ? 'Verificando...' : 'Verificar código'}
        </button>
        <button
          type="button"
          onClick={() => setState('EMAIL_INPUT')}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Volver a introducir el correo
        </button>
      </div>
    </form>
  );

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-white/90 backdrop-blur-sm mx-4">
      <div>
        <h2 className="text-center text-2xl font-bold">Inicia sesión en tu cuenta</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {state === 'EMAIL_INPUT'
            ? 'Introduce tu correo electrónico para recibir un enlace mágico'
            : 'Introduce el código de verificación enviado a tu correo'}
        </p>
        <p className="mt-2 text-center text-sm font-medium text-amber-600">
          ⚠️ Solo los miembros del club pueden acceder a esta área
        </p>
        {errorMessage && <p className="mt-2 text-center text-sm font-medium text-red-600">{errorMessage}</p>}
      </div>

      {state === 'EMAIL_INPUT' ? renderEmailForm() : state === 'OTP_INPUT' ? renderOtpForm() : null}
    </div>
  );
}
