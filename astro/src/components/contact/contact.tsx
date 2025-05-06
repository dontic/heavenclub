import { useState } from 'react';
import { contactsCreate } from '~/api/django/contacts/contacts';
import type { ContactRequest } from '~/api/django/api.schemas';

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

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const contactData: ContactRequest = {
        name,
        email,
        message,
        ...(phone && { phone }),
      };

      await contactsCreate(contactData);

      // Reset form on success
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSuccessMessage('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-white/90 backdrop-blur-sm mx-auto">
      <div>
        <h2 className="text-center text-2xl font-bold">Contacto</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {formSubmitted
            ? 'Gracias por contactar con nosotros'
            : 'Envíanos un mensaje y nos pondremos en contacto contigo lo antes posible'}
        </p>
        {errorMessage && <p className="mt-2 text-center text-sm font-medium text-red-600">{errorMessage}</p>}
        {successMessage && <p className="mt-2 text-center text-sm font-medium text-green-600">{successMessage}</p>}
      </div>

      {formSubmitted ? (
        <div className="text-center mt-8">
          <button
            onClick={() => (window.location.href = '/')}
            className="cta-gradient font-semibold inline-flex justify-center rounded-md py-2 px-4 text-white transition-colors items-center"
          >
            Volver a inicio
          </button>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="Nombre"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="Correo electrónico"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="Teléfono (opcional)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="message" className="sr-only">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="Tu mensaje"
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
                <span>Enviar mensaje</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Contact;
