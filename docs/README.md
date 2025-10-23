# SolveGuild Platform Documentation

## Overview
SolveGuild is a revolutionary freelancing platform where clients post issues and freelancers approach them, combined with a technical doubt-solving community.

## Table of Contents
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Database Configuration](../database/README.md)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)

## Development Setup

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB (local or Atlas)
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/solveguild/platform.git
cd platform

# Run setup script
npm run setup

# Start development servers
npm run dev
```

### Manual Setup
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install

# Copy environment file
cp backend/env.example backend/.env

# Update backend/.env with your configuration
# Start MongoDB
mongod

# Start development servers
npm run dev
```

## Project Structure

```
solveguild-6/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json        # Frontend dependencies
├── database/               # Database configuration
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── package.json            # Root package.json
└── README.md              # This file
```

## Features

### Core Features
- **Reverse Freelancing Model**: Clients post issues, freelancers approach them
- **Category-Based Organization**: Multiple categories for different skills
- **Technical Doubt Community**: Q&A platform for technical questions
- **Premium Subscription**: Enhanced features for subscribers
- **Real-time Chat**: Socket.io powered messaging
- **Rating System**: Quality assurance through ratings

### Premium Features
- Enhanced visibility for client issues
- Early notifications for freelancers
- Priority support
- Advanced analytics
- Custom branding

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Stripe** for payments
- **Cloudinary** for file storage

### Frontend
- **React 18** with hooks
- **React Router** for navigation
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Framer Motion** for animations

## Scripts

### Development
```bash
npm run dev              # Start both frontend and backend
npm run backend:dev      # Start only backend
npm run frontend:dev      # Start only frontend
```

### Production
```bash
npm start                # Start production server
npm run build           # Build frontend for production
```

### Utilities
```bash
npm run setup           # Initial setup
npm run install:all     # Install all dependencies
npm run test            # Run all tests
npm run lint            # Lint all code
npm run clean           # Clean node_modules
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/solveguild
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get single issue

### Doubts
- `GET /api/doubts` - Get all doubts
- `POST /api/doubts` - Create new doubt
- `GET /api/doubts/:id` - Get single doubt

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/conversations` - Create conversation
- `POST /api/chat/conversations/:id/messages` - Send message

## Database Schema

### Collections
- `users` - User accounts and profiles
- `issues` - Client posted issues
- `doubts` - Technical doubt posts
- `chats` - Chat conversations
- `messages` - Chat messages
- `notifications` - User notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@solveguild.com or create an issue on GitHub.