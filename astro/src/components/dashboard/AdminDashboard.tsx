import { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';
import { invitationsList, invitationsCreate, invitationsDestroy } from '~/api/django/invitations/invitations';
import type { UserList, UserCreateRequest } from '~/api/django/api.schemas';

// Extended Invitation type to include a user_id property
interface InvitationWithId extends UserList {
  user_id?: number;
  invitation_accepted?: boolean;
  invitation_accepted_at?: string | null;
}

const AdminDashboard = () => {
  /* --------------------------------- STATES --------------------------------- */
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitations, setInvitations] = useState<InvitationWithId[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /* --------------------------------- EFFECTS -------------------------------- */
  // Check authentication and authorization on component mount
  useEffect(() => {
    setIsLoading(true);

    const checkAuthenticationAndRole = async () => {
      try {
        const response = await getAllauthClientV1AuthSession('browser');

        if (!response.data?.user) {
          // Redirect to signin page if user is not authenticated
          window.location.href = '/signin/';
        } else {
          // Check if user has the required role (OWNER or ADMIN)
          const userRole = response.data.user?.role;
          if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
            // Redirect to regular dashboard if not authorized
            window.location.href = '/dashboard/';
          } else {
            setIsLoading(false);
            // Fetch invitations after confirming authorization
            fetchInvitations();
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Redirect to signin page if there's an authentication error
        window.location.href = '/signin/';
      }
    };

    checkAuthenticationAndRole();
  }, []);

  /* --------------------------------- METHODS -------------------------------- */
  // Fetch all invitations
  const fetchInvitations = async () => {
    try {
      const invitationsData = await invitationsList();

      // Transform API data to match our interface
      // Since the new API endpoint may not provide invitation status directly
      const invitationsWithIds = invitationsData.map((invitation, index) => ({
        ...invitation,
        user_id: index + 1, // Mock ID based on position
        // Note: In a real implementation, you might want to determine invitation status
        // based on last_login or other user properties from the API
        invitation_accepted: invitation.last_login !== null, // Consider it accepted if they've logged in
        invitation_accepted_at: invitation.last_login, // Use last_login as acceptance date
      }));

      setInvitations(invitationsWithIds);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  // Handle invitation form submission
  const handleInvitationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const invitationData: UserCreateRequest = {
        email,
        send_email: sendEmail,
      };

      await invitationsCreate(invitationData);

      // Reset form and show success message
      setEmail('');
      setSendEmail(true);
      setSuccessMessage('Invitation sent successfully');

      // Refresh invitations list
      fetchInvitations();
    } catch (error: any) {
      console.error('Error creating invitation:', error);

      if (error.response?.data?.errors) {
        const errorData = error.response.data.errors;
        setErrorMessage(errorData[0]?.message || 'Error creating invitation');
      } else {
        setErrorMessage('Error creating invitation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle invitation deletion
  const handleDeleteInvitation = async (email: string) => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      try {
        await invitationsDestroy(email);
        // Refresh invitations list after successful deletion
        fetchInvitations();
      } catch (error) {
        console.error('Error deleting invitation:', error);
      }
    }
  };

  /* --------------------------------- RENDER --------------------------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Invitation Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Invite New User</h2>

        {errorMessage && <p className="mb-4 text-sm font-medium text-red-600">{errorMessage}</p>}
        {successMessage && <p className="mb-4 text-sm font-medium text-green-600">{successMessage}</p>}

        <form onSubmit={handleInvitationSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="user@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700">Send email invitation to user</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="ml-2">Inviting...</span>
              </>
            ) : (
              'Send Invitation'
            )}
          </button>
        </form>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Invited Users</h2>

        {invitations.length === 0 ? (
          <p className="text-gray-500">No invitations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <tr key={invitation.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invitation.invitation_accepted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invitation.invitation_accepted ? 'Accepted' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.last_login ? new Date(invitation.last_login).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteInvitation(invitation.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
