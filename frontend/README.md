# EduPlatform Frontend

A modern React.js frontend for the EduPlatform education management system, featuring a dark theme with orange, purple, and neon green accents.

## Features

### 🎨 **Modern Dark Theme UI**
- Dark theme with orange (#FF6B35), purple (#6B46C1), and neon green (#00FF88) accent colors
- Responsive design with beautiful gradients and shadows
- Smooth animations and transitions

### 🔐 **Authentication System**
- JWT-based authentication
- Role-based access control (Student/Teacher)
- Secure login and registration forms
- Protected routes

### 🌐 **Multilingual Support**
- Internationalization (i18n) with react-i18next
- Support for English, Hindi, and Tamil
- Easy language switching

### 📱 **Real-time Features**
- WebSocket integration with Socket.IO
- Real-time notifications
- Live chat functionality
- Online/offline status indicators

### 🧭 **Role-based Navigation**
- **Student Navigation**: Home, Dashboard, Profile, Resources, Logout
- **Teacher Navigation**: Home, Dashboard, Upload Assignment, Create Quiz, Profile, Logout

### 📊 **Dashboard Features**
- **Student Dashboard**: KPI cards (CGPA, Submissions, Quiz Performance), Charts
- **Teacher Dashboard**: Overview KPIs, Student management, Quick actions

### 📚 **Core Functionality**
- Assignment management with file uploads
- Quiz creation and taking
- Resource library
- Submission tracking with version control
- Feedback system
- Academic calendar
- Profile management

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: CSS-in-JS with custom theme system
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Internationalization**: react-i18next
- **Icons**: Lucide React
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form
- **File Upload**: React Dropzone
- **Animations**: Framer Motion
- **Confetti**: React Confetti

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navbar and sidebar
│   ├── Navbar.tsx      # Top navigation bar
│   ├── Sidebar.tsx     # Side navigation menu
│   ├── LoadingSpinner.tsx
│   ├── NotificationDropdown.tsx
│   └── LanguageSelector.tsx
├── pages/              # Page components
│   ├── Login.tsx       # Authentication pages
│   ├── Register.tsx
│   ├── StudentHome.tsx # Role-specific home pages
│   ├── TeacherHome.tsx
│   ├── StudentDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── Profile.tsx
│   ├── Resources.tsx
│   ├── Assignments.tsx
│   ├── Quizzes.tsx
│   ├── CreateQuiz.tsx
│   ├── TakeQuiz.tsx
│   ├── Submissions.tsx
│   ├── Notifications.tsx
│   ├── Messages.tsx
│   └── Calendar.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── SocketContext.tsx # WebSocket connection
├── services/           # API and external services
│   ├── api.ts         # REST API client
│   └── socket.ts      # WebSocket service
├── utils/              # Utility functions
│   ├── theme.ts       # Theme configuration
│   └── i18n.ts        # Internationalization setup
├── types/              # TypeScript type definitions
│   └── index.ts
├── locales/            # Translation files
│   ├── en.json        # English
│   ├── hi.json        # Hindi
│   └── ta.json        # Tamil
└── assets/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd education-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend integrates with the Flask backend through the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/student/{id}` - Student dashboard data
- `GET /api/dashboard/teacher/{id}` - Teacher dashboard data

### Assignments
- `POST /api/assignment/upload` - Upload assignment
- `GET /api/assignment/{id}` - Get assignment details
- `PUT /api/assignment/{id}` - Update assignment
- `DELETE /api/assignment/{id}` - Delete assignment

### Quizzes
- `POST /api/quiz/create` - Create quiz
- `GET /api/quiz/{id}` - Get quiz details
- `PUT /api/quiz/{id}` - Update quiz
- `DELETE /api/quiz/{id}` - Delete quiz

### Submissions
- `POST /api/submission/submit` - Submit assignment
- `GET /api/submission/{student_id}` - Get student submissions
- `GET /api/submission/{id}/versions` - Get submission versions

### Resources
- `GET /api/resources` - Get resources list
- `POST /api/resources` - Upload resource
- `GET /api/resources/{id}/download` - Download resource

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `GET /api/notifications/unread-count` - Get unread count

### Chat
- `GET /api/chat/messages/{receiver_id}` - Get messages
- `POST /api/chat/send` - Send message
- `GET /api/chat/conversations` - Get conversations

## WebSocket Events

The frontend listens for real-time events:

- `new_submission` - New assignment submission
- `new_feedback` - New feedback received
- `new_message` - New chat message
- `new_notification` - New notification
- `new_quiz` - New quiz created
- `new_assignment` - New assignment uploaded
- `notification_count_update` - Unread notification count
- `user_typing` - User typing indicator
- `user_status_change` - User online/offline status

## Theme System

The application uses a comprehensive theme system with:

### Colors
- **Primary**: Orange (#FF6B35)
- **Secondary**: Purple (#6B46C1)
- **Accent**: Neon Green (#00FF88)
- **Background**: Dark grays (#0A0A0A, #1A1A1A, #2A2A2A)
- **Text**: White and gray shades

### Typography
- **Primary Font**: Inter
- **Secondary Font**: Poppins
- **Monospace Font**: JetBrains Mono

### Spacing & Layout
- Consistent spacing scale
- Responsive breakpoints
- Flexible grid system

## Internationalization

The app supports multiple languages:

- **English** (en) - Default
- **Hindi** (hi) - हिंदी
- **Tamil** (ta) - தமிழ்

Language switching is available in the navbar with flag indicators.

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Implement proper error handling

### Component Structure
- Keep components small and focused
- Use composition over inheritance
- Implement proper prop validation
- Use React.memo for performance optimization

### State Management
- Use React Context for global state
- Use local state for component-specific data
- Implement proper loading and error states

### Styling
- Use the theme system for consistent styling
- Implement responsive design
- Follow accessibility guidelines
- Use CSS-in-JS for dynamic styling

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set the following environment variables for production:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SOCKET_URL` - WebSocket server URL

### Deployment Platforms
- **Netlify**: Connect repository and set build command
- **Vercel**: Import repository and configure
- **AWS S3**: Upload build folder to S3 bucket
- **Docker**: Use multi-stage build for containerization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**EduPlatform Frontend** - Modern education management interface built with React and TypeScript.
