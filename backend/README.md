# MatchMint Backend

Backend server for MatchMint Dating App built with Node.js, Express, MongoDB, and Socket.IO.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your:
   - MongoDB URI
   - JWT secrets
   - Razorpay credentials (for test mode)
   - Frontend URL

3. **Create logs directory**
   ```bash
   mkdir logs
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, Razorpay, env)
│   ├── models/          # MongoDB models
│   ├── middleware/       # Express middleware (auth, validation, etc.)
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic services
│   ├── socket/          # Socket.IO handlers (Harsh's domain)
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── logs/                # Log files
├── uploads/             # File uploads
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 👥 Developer Ownership

### Sujal's Domain
- Authentication & Authorization
- User Management
- Wallet & Coin Economy
- Payment Processing (Razorpay)
- Earnings System
- Withdrawal Management
- Admin Panel
- Profile Management
- Discovery/Search

### Harsh's Domain
- Chat/Messaging Logic
- Real-time Messaging (Socket.IO)
- Video Call Signaling
- Gift System (chat-related)
- Chat-related coin management

### Shared (Both Review)
- Database Models (User, Chat, Message, Transaction)
- Authentication Middleware
- Error Handling
- Configuration Files

## 📡 API Endpoints

API endpoints will be organized as:
- `/api/auth` - Authentication
- `/api/male` - Male user endpoints
- `/api/female` - Female user endpoints
- `/api/admin` - Admin endpoints
- `/api/chat` - Chat endpoints (Harsh)

## 🔌 Socket.IO Events

Socket.IO events for real-time features (Harsh's domain):
- `chat:sendMessage` - Send message
- `chat:messageReceived` - Receive message
- `chat:typing` - Typing indicator
- `chat:read` - Mark as read
- `video:call` - Video call events

## 🧪 Testing

```bash
npm test
```

## 📝 Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention (MongoDB)

## 📦 Dependencies

See `package.json` for complete list of dependencies.

## 🚧 Development Status

Backend infrastructure is set up. Routes, controllers, and services need to be implemented according to the implementation checklist.

## 📚 Documentation

- See `FRONTEND_BACKEND_IMPLEMENTATION_CHECKLIST.md` for implementation roadmap
- See `SUJAL_CORE_DOMAIN_CHECKLIST.md` for Sujal's tasks
- See `HARSH_CHAT_DOMAIN_CHECKLIST.md` for Harsh's tasks

