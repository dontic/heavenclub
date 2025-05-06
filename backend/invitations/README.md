# Invitations App

This Django app manages user invitations, allowing owner and admin users to invite new users to the platform.

## Features

- Create invitations for new users with optional email notifications
- List all existing invitations
- Delete invitations (which also deletes the associated user)
- Permission-based access control (only owners and admins)

## API Endpoints

### POST /api/invitations/

Create a new invitation.

**Request Body:**
```json
{
  "email": "user@example.com",
  "send_email": true
}
```

- `email`: Email address of the user to invite (required)
- `send_email`: Whether to send an invitation email (default: true)

**Response:**
```json
{
  "email": "user@example.com",
  "invitation_accepted": false,
  "invitation_accepted_at": null,
  "created_at": "2023-01-01T12:00:00Z"
}
```

### GET /api/invitations/

List all invitations.

**Response:**
```json
[
  {
    "email": "user1@example.com",
    "invitation_accepted": false,
    "invitation_accepted_at": null,
    "created_at": "2023-01-01T12:00:00Z"
  },
  {
    "email": "user2@example.com",
    "invitation_accepted": true,
    "invitation_accepted_at": "2023-01-02T12:00:00Z",
    "created_at": "2023-01-01T12:00:00Z"
  }
]
```

### DELETE /api/invitations/{id}/

Delete an invitation and its associated user.

**Response:**
- Status 204 No Content

## Permissions

All endpoints are restricted to users with roles `OWNER` or `ADMIN`. 