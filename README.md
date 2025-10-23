# 🚀 SolveGuild - Revolutionary Freelancing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

A next-generation freelancing platform where clients post issues and freelancers approach them, combined with a technical doubt-solving community.

## 🌟 Features

### 🔄 Reverse Freelancing Model
- **Clients post issues** in specific categories
- **Freelancers approach clients** with proposals
- **No more endless browsing** through profiles

### 📂 Category-Based Organization
- Logo Design, Video Editing, App Development
- Web Development, AI/ML, Data Science, Cybersecurity
- Blockchain, Game Development, UI/UX Design, and more

### 💬 Technical Doubt Community
- **Like Quora but for technical fields**
- Post doubts with categories and difficulty levels
- Community answers with voting system
- Bounty system for urgent questions

### 💎 Premium Subscription Model
- **No commission fees** - only nominal subscription charges
- Enhanced visibility for client issues
- Early notifications for premium freelancers (1 day ahead)
- Priority support and advanced features

### 💬 Real-time Communication
- **Socket.io powered** in-app chat system
- File sharing and message history
- Real-time notifications

### ⭐ Quality Assurance
- **Rating and badge system** for quality assurance
- Performance-based recommendation badges
- Verified freelancer status

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Stripe** for payments
- **Cloudinary** for file storage

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Dark theme** with modern UI

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/solveguild/platform.git
cd platform

# Run setup script (installs all dependencies)
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

## 📁 Project Structure

```
solveguild-6/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
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
└── package.json            # Root package.json
```

## 🎯 Available Scripts

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

## 🔧 Environment Variables

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

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Database Configuration](./database/README.md)

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS configuration
- Helmet security headers
- XSS protection
- NoSQL injection protection

## 🎨 UI/UX Features

- **Modern dark theme** - Tech-focused aesthetic
- **Responsive design** - Works on all devices
- **Real-time updates** - Socket.io powered
- **Advanced search** - Find exactly what you need
- **File upload support** - Cloudinary integration
- **Mobile friendly** - Optimized for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@solveguild.com or create an issue on GitHub.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic platform structure
- ✅ User authentication
- ✅ Issue posting and browsing
- ✅ Doubt community
- ✅ Premium subscriptions

### Phase 2 (Next)
- 🔄 Advanced search and filtering
- 🔄 Mobile app (React Native)
- 🔄 AI-powered matching
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 Video calling integration
- 📋 Blockchain-based contracts
- 📋 Multi-language support
- 📋 Enterprise features

---

**Built with ❤️ by the SolveGuild Team**

[Website](https://solveguild.com) • [Documentation](./docs/README.md) • [API Docs](./docs/API.md) • [Deployment](./docs/DEPLOYMENT.md)
