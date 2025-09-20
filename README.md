# 🎓 Academic Portal - Complete Learning Management System

A modern, responsive learning management system built with React frontend and Flask backend, featuring real-time communication, comprehensive analytics, and a beautiful user interface.

## ✨ Features

### 🎨 **User Interface & Experience**
- **Modern Design**: Beautiful, responsive design with light theme and gradient effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations, hover effects, and transitions
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation
- **Multi-language Support**: English, Hindi, and Tamil localization

### 🔐 **Authentication & Security**
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access**: Student, Teacher, and Admin role management
- **Protected Routes**: Secure navigation with authentication guards
- **Password Security**: Bcrypt hashing for secure password storage

### 📚 **Learning Management**
- **Assignment Management**: Create, submit, and grade assignments
- **Quiz System**: Interactive quizzes with real-time results and feedback
- **Resource Library**: Document, video, and presentation management
- **Portfolio System**: Evidence of growth and reflection journals
- **Calendar Integration**: Event scheduling and deadline management

### 📊 **Analytics & Reporting**
- **Student Analytics**: Performance tracking and progress visualization
- **Teacher Dashboard**: Class overview and student performance insights
- **Real-time Charts**: Interactive data visualization with Recharts
- **Progress Tracking**: Learning outcomes and skill development monitoring
- **Export Features**: Download analytics and reports

### 💬 **Communication**
- **Real-time Chat**: WebSocket-based messaging between teachers and students
- **Notification System**: Real-time alerts and updates
- **Feedback System**: Assignment and quiz feedback with teacher comments
- **Discussion Forums**: Course-related discussions and Q&A

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** (for cloning)

### 🪟 Windows Users

1. **Double-click** `setup_and_run.bat`
2. Wait for setup to complete
3. Open your browser to `http://localhost:3001`

### 🐧 Linux/Mac Users

1. **Open terminal** in the project directory
2. **Run**: `./setup_and_run.sh`
3. Open your browser to `http://localhost:3001`

## 📋 Manual Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd academic-portal
```

### 2. Backend Setup
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate.bat  # Windows

# Install requirements
pip install -r requirements.txt

# Create database
cd backend
python create_db.py
cd ..
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
python simple_server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:5005
- **API Documentation**: http://localhost:5005/

## 🛠️ Technology Stack

### Backend Technologies
- **Flask 2.3+** - Lightweight web framework
- **Flask-SocketIO 5.3+** - Real-time WebSocket communication
- **SQLite** - Lightweight database (production: PostgreSQL/MySQL)
- **SQLAlchemy 3.0+** - Python ORM for database operations
- **JWT Extended 4.5+** - JSON Web Token authentication
- **Flask-CORS 4.0+** - Cross-origin resource sharing
- **Flask-Bcrypt 1.0+** - Password hashing
- **Marshmallow 3.20+** - Object serialization/deserialization
- **Pillow 9.0+** - Image processing
- **Gunicorn 21.0+** - WSGI HTTP server for production

### Frontend Technologies
- **React 19.1** - Modern UI library with hooks
- **TypeScript 4.9** - Type-safe JavaScript development
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Router 7.8** - Client-side routing
- **Axios 1.11** - HTTP client for API requests
- **Recharts 3.1** - Composable charting library
- **Lucide React 0.542** - Beautiful icon library
- **Framer Motion 12.23** - Animation library
- **Socket.io Client 4.8** - Real-time communication
- **React Hook Form 7.62** - Form handling
- **React Dropzone 14.3** - File upload handling
- **React Confetti 6.4** - Celebration animations
- **Chart.js 4.5** - Additional charting capabilities
- **i18next 25.4** - Internationalization framework

### Development Tools
- **CRACO 7.1** - Create React App Configuration Override
- **ESLint** - Code linting and formatting
- **PostCSS 8.5** - CSS processing
- **Autoprefixer 10.4** - CSS vendor prefixing

## 📁 Project Structure

```
academic-portal/
├── backend/                          # Flask backend
│   ├── simple_server.py             # Main server file
│   ├── create_db.py                 # Database initialization
│   ├── requirements.txt             # Python dependencies
│   └── education.db                 # SQLite database
├── frontend/                         # React frontend
│   ├── src/                         # Source code
│   │   ├── components/              # Reusable components
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── teacher/             # Teacher-specific components
│   │   │   └── ...                  # Other components
│   │   ├── pages/                   # Page components
│   │   ├── contexts/                # React contexts
│   │   ├── hooks/                   # Custom hooks
│   │   ├── services/                # API and utility services
│   │   ├── styles/                  # CSS stylesheets
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── utils/                   # Utility functions
│   │   └── locales/                 # Internationalization files
│   ├── package.json                 # Node.js dependencies
│   └── public/                      # Public assets
├── requirements.txt                  # Main requirements file
├── setup_and_run.sh                 # Linux/Mac setup script
├── setup_and_run.bat                # Windows setup script
└── README.md                        # This file
```

## 🧩 Component Architecture

### Core Components

#### **Dashboard Components**
- `EnhancedStudentDashboard.tsx` - Main student dashboard with analytics
- `EnhancedTeacherDashboard.tsx` - Teacher dashboard with class management
- `DashboardNavbar.tsx` - Navigation component with role-based menus
- `DataAnalyticsDashboard.tsx` - Comprehensive analytics visualization

#### **Assignment Components**
- `Assignments.tsx` - Assignment listing and management
- `AssignmentSubmission.tsx` - Assignment submission interface
- `AssignmentCreator.tsx` - Teacher assignment creation tool
- `AssignmentForm.tsx` - Assignment form with validation
- `AssignmentPreviewModal.tsx` - Assignment preview functionality

#### **Quiz Components**
- `Quizzes.tsx` - Quiz listing and management
- `TakeQuiz.tsx` - Interactive quiz taking interface
- `QuizResults.tsx` - Detailed quiz results display
- `QuizCreator.tsx` - Teacher quiz creation tool
- `QuizDetails.tsx` - Quiz information and statistics
- `LiveQuizTaker.tsx` - Real-time quiz functionality

#### **Communication Components**
- `TeacherStudentChat.tsx` - Teacher-student messaging interface
- `FeedbackChat.tsx` - Real-time feedback communication
- `Messages.tsx` - General messaging system
- `NotificationBell.tsx` - Notification management
- `RealTimeNotificationCenter.tsx` - Centralized notification hub

#### **Analytics Components**
- `StudentPersonalAnalytics.tsx` - Individual student analytics
- `TeacherStudentAnalytics.tsx` - Teacher view of student analytics
- `StudentAnalyticsPage.tsx` - Dedicated analytics page
- `QuizAnalytics.tsx` - Quiz performance analytics
- `LearningOutcomesAnalytics.tsx` - Learning outcomes tracking

#### **Resource Components**
- `Resources.tsx` - Resource library interface
- `ResourcePreviewModal.tsx` - Resource preview functionality
- `PortfolioEvidence.tsx` - Portfolio and evidence management
- `ReflectionJournal.tsx` - Student reflection journal

#### **Utility Components**
- `LoadingSpinner.tsx` - Loading state indicator
- `ErrorBoundary.tsx` - Error handling component
- `ProtectedRoute.tsx` - Authentication guard
- `Layout.tsx` - Main application layout
- `Sidebar.tsx` - Navigation sidebar
- `Navbar.tsx` - Top navigation bar

### Page Components

#### **Student Pages**
- `StudentHome.tsx` - Student home page
- `StudentDashboard.tsx` - Student dashboard
- `StudentAnalyticsPage.tsx` - Student analytics
- `StudentList.tsx` - Student directory

#### **Teacher Pages**
- `TeacherHome.tsx` - Teacher home page
- `TeacherDashboard.tsx` - Teacher dashboard
- `TeacherProfile.tsx` - Teacher profile management
- `TeacherStudentChat.tsx` - Teacher communication
- `AdminDashboard.tsx` - Administrative functions

#### **Shared Pages**
- `Login.tsx` - Authentication page
- `Register.tsx` - User registration
- `Profile.tsx` - User profile management
- `Calendar.tsx` - Event calendar
- `Notifications.tsx` - Notification center
- `Messages.tsx` - Messaging interface

## 🔧 Services & Utilities

### API Services (`services/`)
- `api.ts` - Centralized API client with Axios
- `socket.ts` - WebSocket connection management
- `notificationService.ts` - Notification handling
- `realTimeSyncService.ts` - Real-time data synchronization
- `reminderService.ts` - Reminder and alert management
- `statusService.ts` - Application status monitoring

### Custom Hooks (`hooks/`)
- `useRealTimeSync.ts` - Real-time data synchronization hook
- `useUserIdValidation.ts` - User ID validation hook

### Context Providers (`contexts/`)
- `AuthContext.tsx` - Authentication state management
- `SocketContext.tsx` - WebSocket connection context

### Type Definitions (`types/`)
- `index.ts` - TypeScript interfaces and types for:
  - User management
  - Assignment and quiz structures
  - Analytics data
  - Communication messages
  - API responses

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### Student Management
- `GET /api/student/{id}/dashboard` - Student dashboard data
- `GET /api/student/{id}/submissions` - Student submissions
- `GET /api/student/{id}/profile` - Student profile
- `GET /api/student/{id}/analytics` - Student analytics
- `PUT /api/student/{id}/profile` - Update student profile

### Teacher Management
- `GET /api/teacher/{id}/dashboard` - Teacher dashboard
- `GET /api/teacher/{id}/students` - Teacher's students
- `GET /api/teacher/{id}/classes` - Teacher's classes
- `POST /api/teacher/{id}/feedback` - Send feedback to student

### Content Management
- `GET /api/assignments` - List all assignments
- `POST /api/assignments` - Create new assignment
- `GET /api/assignments/{id}` - Get assignment details
- `PUT /api/assignments/{id}` - Update assignment
- `DELETE /api/assignments/{id}` - Delete assignment

- `GET /api/quizzes` - List all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/{id}` - Get quiz details
- `POST /api/quizzes/{id}/submit` - Submit quiz answers
- `GET /api/quizzes/{id}/results` - Get quiz results

- `GET /api/resources` - List all resources
- `POST /api/resources` - Upload new resource
- `GET /api/resources/{id}` - Get resource details
- `DELETE /api/resources/{id}` - Delete resource

### Analytics & Reporting
- `GET /api/analytics/overview` - Overall analytics
- `GET /api/analytics/students` - Student performance analytics
- `GET /api/analytics/assignments` - Assignment analytics
- `GET /api/analytics/quizzes` - Quiz analytics
- `GET /api/analytics/modules` - Module performance
- `GET /api/analytics/trends` - Performance trends

### Communication
- `GET /api/chat/messages` - Get chat messages
- `POST /api/chat/send` - Send message
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/mark-read` - Mark notification as read

### File Management
- `POST /api/upload` - File upload endpoint
- `GET /api/download/{id}` - File download endpoint
- `DELETE /api/files/{id}` - Delete file

## 🎨 Styling & Design System

### CSS Architecture
- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Enhanced styles in `styles/` directory
- **Component Styles**: Scoped styles for specific components
- **Responsive Design**: Mobile-first approach with breakpoints

### Design System
- **Color Palette**: 
  - Primary: Blue gradients (#3b82f6 to #1d4ed8)
  - Secondary: Purple gradients (#8b5cf6 to #7c3aed)
  - Success: Green gradients (#10b981 to #059669)
  - Warning: Orange gradients (#f59e0b to #d97706)
  - Error: Red gradients (#ef4444 to #dc2626)

- **Typography**: 
  - Headings: Inter font family
  - Body: System font stack
  - Code: Monaco, Consolas monospace

- **Spacing**: 4px base unit with consistent spacing scale
- **Border Radius**: 8px, 12px, 16px for different element sizes
- **Shadows**: Layered shadow system for depth
- **Animations**: Smooth transitions with cubic-bezier easing

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///education.db
# For production: postgresql://user:password@localhost/dbname

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600

# Socket.IO Configuration
SOCKETIO_CORS_ALLOWED_ORIGINS=http://localhost:3001

# File Upload Configuration
MAX_CONTENT_LENGTH=16777216  # 16MB
UPLOAD_FOLDER=uploads

# Email Configuration (Optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Frontend Configuration
The frontend uses CRACO for configuration override:

```javascript
// craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
    },
  },
};
```

## 🚀 Deployment

### Production Setup

#### Backend Deployment
1. **Environment Setup**:
   ```bash
   export FLASK_ENV=production
   export DATABASE_URL=postgresql://user:password@localhost/dbname
   ```

2. **Database Migration**:
   ```bash
   cd backend
   flask db upgrade
   ```

3. **WSGI Server**:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5005 simple_server:app
   ```

#### Frontend Deployment
1. **Build Production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve Static Files**:
```bash
   npx serve -s build -l 3001
   ```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:16-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./static
EXPOSE 5005
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5005", "simple_server:app"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5005:5005"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/academic_portal
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=academic_portal
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine

volumes:
  postgres_data:
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes using ports 3001 and 5005
lsof -ti:3001 | xargs kill -9
lsof -ti:5005 | xargs kill -9

# Or use different ports
cd frontend && PORT=3002 npm start
cd backend && python simple_server.py --port 5006
```

#### Python Dependencies
```bash
# Reinstall requirements
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# Clear pip cache
pip cache purge
```

#### Node Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Clear yarn cache (if using yarn)
yarn cache clean
```

#### Database Issues
```bash
# Recreate database
cd backend
rm education.db
python create_db.py

# Reset migrations
flask db stamp head
flask db migrate -m "Initial migration"
flask db upgrade
```

#### WebSocket Connection Issues
```bash
# Check if ports are accessible
telnet localhost 5005
telnet localhost 3001

# Check firewall settings
sudo ufw status
sudo ufw allow 5005
sudo ufw allow 3001
```

#### Build Issues
```bash
# Clear build cache
cd frontend
rm -rf build
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### Performance Optimization

#### Backend Optimization
```python
# Enable gzip compression
from flask_compress import Compress
Compress(app)

# Database connection pooling
from sqlalchemy.pool import QueuePool
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'poolclass': QueuePool,
    'pool_size': 10,
    'pool_recycle': 120,
    'pool_pre_ping': True
}
```

#### Frontend Optimization
```javascript
// Code splitting with React.lazy
const LazyComponent = React.lazy(() => import('./Component'));

// Service worker for caching
// Register in index.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 📝 Development Guidelines

### Code Style
- **Python**: Follow PEP 8 guidelines with Black formatter
- **TypeScript/JavaScript**: Use ESLint with Prettier
- **CSS**: Follow BEM methodology with Tailwind utilities
- **Git**: Use conventional commit messages

### Testing
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Adding New Features
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Implement changes** with proper TypeScript types
3. **Add tests** for new functionality
4. **Update documentation** in README.md
5. **Submit pull request** with detailed description

### API Development
```python
# Example API endpoint
@app.route('/api/example', methods=['GET'])
@jwt_required()
def get_example():
    try:
        data = get_example_data()
        return jsonify({
            'success': True,
            'data': data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

### Component Development
```typescript
// Example React component
interface ComponentProps {
  title: string;
  onAction: () => void;
}

const ExampleComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="example-component">
      <h2>{title}</h2>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
};
```

## 🤝 Contributing

### Getting Started
1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/academic-portal.git`
3. **Create feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** following the coding standards
5. **Add tests** for new functionality
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open Pull Request** with detailed description

### Pull Request Guidelines
- **Clear description** of changes made
- **Screenshots** for UI changes
- **Test coverage** for new features
- **Documentation updates** if needed
- **Breaking changes** clearly marked

### Issue Reporting
When reporting issues, please include:
- **OS and version** (Windows 10, macOS 12, Ubuntu 20.04)
- **Browser and version** (Chrome 95, Firefox 94)
- **Node.js version** (`node --version`)
- **Python version** (`python --version`)
- **Error logs** and stack traces
- **Steps to reproduce** the issue
- **Expected vs actual behavior**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
1. **Check the troubleshooting section** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** discussions

### Community
- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Wiki**: For detailed documentation and guides

## 🎯 Roadmap

### Short Term (Next 3 months)
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Video Integration**: Video conferencing and streaming
- [ ] **Offline Support**: Progressive Web App features
- [ ] **Advanced Quizzes**: Question banks and randomization

### Medium Term (3-6 months)
- [ ] **AI Features**: Content recommendations and auto-grading
- [ ] **Multi-tenancy**: Support for multiple institutions
- [ ] **Advanced Reporting**: Custom report builder
- [ ] **Integration APIs**: Third-party service integrations
- [ ] **Performance Optimization**: Caching and CDN support

### Long Term (6+ months)
- [ ] **Microservices**: Scalable architecture migration
- [ ] **Blockchain**: Certificate verification system
- [ ] **AR/VR**: Immersive learning experiences
- [ ] **Global Deployment**: Multi-region support
- [ ] **Enterprise Features**: SSO, LDAP, advanced security

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Flask Team** for the lightweight backend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Recharts** for the beautiful charting library
- **Lucide** for the comprehensive icon set
- **All Contributors** who have helped improve this project

---

**Made with ❤️ for better education**

*Empowering educators and students with modern technology*