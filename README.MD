# Project Gallery

A full-stack web application for managing and displaying image galleries with user authentication and cloud storage.

## Features

- 🔐 User authentication (local & Google OAuth)
- 📸 Image upload and management
- ☁️ Cloud storage integration (Cloudinary)
- 🎨 Modern responsive UI with React & Tailwind CSS
- 📱 Mobile-friendly design
- 🔒 Secure session management

## Tech Stack

**Frontend:**
- React 19 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Lucide React icons

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT & Passport.js authentication
- Cloudinary for image storage
- Nodemailer for email services

## Project Structure

```
Project Gallery Final/
├── frontend/          # React application
├── backend/           # Express server
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB
- Cloudinary account
- Google OAuth credentials (optional)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Start backend server:
```bash
npm run dev    # Development
npm start      # Production
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Register/Login to your account
2. Upload images to create galleries
3. View and manage your image collections
4. Share galleries with others

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `POST /api/gallery/upload` - Upload images
- `GET /api/gallery/user/:id` - Get user galleries

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

ISC License

## Author

Nishank Kushwaha