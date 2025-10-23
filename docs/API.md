# SolveGuild API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.solveguild.com/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/upload-avatar` - Upload avatar
- `POST /api/users/portfolio` - Add portfolio item
- `DELETE /api/users/portfolio/:index` - Remove portfolio item
- `POST /api/users/rate` - Rate a user

### Issues
- `GET /api/issues` - Get all issues with filtering
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get single issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/proposals` - Submit proposal
- `POST /api/issues/:id/select-proposal` - Select proposal

### Doubts
- `GET /api/doubts` - Get all doubts with filtering
- `POST /api/doubts` - Create new doubt
- `GET /api/doubts/:id` - Get single doubt
- `PUT /api/doubts/:id` - Update doubt
- `DELETE /api/doubts/:id` - Delete doubt
- `POST /api/doubts/:id/answers` - Add answer
- `POST /api/doubts/:id/vote` - Vote on doubt
- `POST /api/doubts/:id/accept-answer` - Accept answer

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id` - Get conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `PUT /api/chat/conversations/:id/messages/:messageId` - Edit message
- `DELETE /api/chat/conversations/:id/messages/:messageId` - Delete message
- `POST /api/chat/conversations/:id/read` - Mark as read

### Premium
- `GET /api/premium/plans` - Get subscription plans
- `GET /api/premium/plans/:id` - Get specific plan
- `POST /api/premium/subscribe` - Subscribe to plan
- `POST /api/premium/cancel` - Cancel subscription
- `GET /api/premium/status` - Get subscription status
- `POST /api/premium/upgrade` - Upgrade subscription
- `GET /api/premium/benefits` - Get premium benefits

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-all` - Clear all notifications

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per 15 minutes per IP
- Additional limits for specific endpoints

## WebSocket Events
- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message
- `receive-message` - Receive a message
