import { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAllauthClientV1AuthSession } from '~/api/allauth/authentication-current-session/authentication-current-session';
import { invitationsList, invitationsCreate, invitationsDestroy } from '~/api/django/invitations/invitations';
import type { UserList, UserCreateRequest } from '~/api/django/api.schemas';

// Extended User type to include a user_id property
interface UserWithId extends UserList {
  user_id?: number;
  user_accepted?: boolean;
  user_accepted_at?: string | null;
}

// Sort types
type SortField = 'email' | 'created_at' | 'last_accessed';
type SortDirection = 'asc' | 'desc';

const AdminDashboard = () => {
  /* --------------------------------- STATES --------------------------------- */
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
            // Fetch users after confirming authorization
            fetchUsers();
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
  // Fetch all users
  const fetchUsers = async () => {
    try {
      const usersData = await invitationsList();

      // Transform API data to match our interface
      // Since the new API endpoint may not provide user status directly
      const usersWithIds = usersData.map((user, index) => ({
        ...user,
        user_id: index + 1, // Mock ID based on position
        // Note: In a real implementation, you might want to determine user status
        // based on last_login or other user properties from the API
        user_accepted: user.last_accessed !== null, // Consider it accepted if they've logged in
        user_accepted_at: user.last_accessed, // Use last_login as acceptance date
      }));

      setUsers(usersWithIds);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Sort users based on current sort field and direction
  const sortedUsers = [...users].sort((a, b) => {
    if (sortField === 'email') {
      return sortDirection === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
    } else if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'last_accessed') {
      const dateA = a.last_accessed ? new Date(a.last_accessed).getTime() : 0;
      const dateB = b.last_accessed ? new Date(b.last_accessed).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  // Handle sorting when a column header is clicked
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort indicator for column headers
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Handle user form submission
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userData: UserCreateRequest = {
        email,
        send_email: sendEmail,
      };

      await invitationsCreate(userData);

      // Reset form and show success message
      setEmail('');
      setSendEmail(true);
      setSuccessMessage('User added successfully');

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.email) {
          setErrorMessage(errorData.email[0]);
        } else if (error.response?.data?.errors) {
          const errorData = error.response.data.errors;
          setErrorMessage(errorData[0]?.message || 'Error adding user');
        } else {
          setErrorMessage('Error adding user');
        }
      } else {
        setErrorMessage('Error adding user');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (email: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await invitationsDestroy(email);
        // Refresh users list after successful deletion
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
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

      {/* User Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

        {errorMessage && <p className="mb-4 text-sm font-medium text-red-600">{errorMessage}</p>}
        {successMessage && <p className="mb-4 text-sm font-medium text-green-600">{successMessage}</p>}

        <form onSubmit={handleUserSubmit}>
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
                <span className="ml-2">Adding...</span>
              </>
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Users</h2>

        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    Email {getSortIndicator('email')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('created_at')}
                  >
                    Date Created {getSortIndicator('created_at')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('last_accessed')}
                  >
                    Last Access {getSortIndicator('last_accessed')}
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
                {sortedUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_accessed
                        ? new Date(user.last_accessed).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleDeleteUser(user.email)} className="text-red-600 hover:text-red-900">
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
