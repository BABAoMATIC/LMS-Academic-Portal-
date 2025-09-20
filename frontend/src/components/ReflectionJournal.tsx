import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Target, 
  TrendingUp,
  Lightbulb,
  Users,
  Code,
  Bug,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Trophy,
  Zap,
  Filter,
  Search,
  Eye,
  Download,
  Star,
  Award
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notificationService';
import '../styles/enhanced-styles.css';
import '../styles/advanced-design-system.css';

interface ReflectionEntry {
  id: number;
  title: string;
  content: string;
  reflection_type: 'learning' | 'challenge' | 'achievement' | 'goal' | 'collaboration' | 'coding' | 'debugging';
  skills_developed: string[];
  challenges_faced: string[];
  future_goals: string[];
  artifacts: string[];
  created_at: string;
  updated_at: string;
  student_id: number;
}

interface ReflectionJournalProps {}

interface ReflectionTemplate {
  id: number;
  title: string;
  description: string;
  questions: string[];
  category: 'academic' | 'personal' | 'career' | 'general';
  is_default: boolean;
}

const ReflectionJournal: React.FC<ReflectionJournalProps> = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [templates, setTemplates] = useState<ReflectionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReflectionTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReflection, setEditingReflection] = useState<ReflectionEntry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reflection_type: 'learning' as 'learning' | 'challenge' | 'achievement' | 'goal' | 'collaboration' | 'coding' | 'debugging',
    skills_developed: [] as string[],
    challenges_faced: [] as string[],
    future_goals: [] as string[],
    artifacts: [] as string[]
  });

  const reflectionTypes = [
    { value: 'learning', label: 'Learning Experience', icon: BookOpen, color: 'blue' },
    { value: 'challenge', label: 'Challenge Overcome', icon: AlertCircle, color: 'orange' },
    { value: 'achievement', label: 'Achievement', icon: CheckCircle, color: 'green' },
    { value: 'goal', label: 'Future Goal', icon: Target, color: 'purple' },
    { value: 'collaboration', label: 'Collaboration', icon: Users, color: 'indigo' },
    { value: 'coding', label: 'Coding Experience', icon: Code, color: 'teal' },
    { value: 'debugging', label: 'Debugging Process', icon: Bug, color: 'red' }
  ];

  const csSkills = [
    'Problem Solving', 'Algorithm Design', 'Data Structures', 'Software Engineering',
    'Database Design', 'Web Development', 'Mobile Development', 'Machine Learning',
    'Cybersecurity', 'Network Programming', 'System Design', 'Testing & QA',
    'Version Control', 'DevOps', 'UI/UX Design', 'API Development'
  ];

  const commonChallenges = [
    'Complex Algorithm Implementation', 'Performance Optimization', 'Memory Management',
    'Concurrency Issues', 'Integration Problems', 'Security Vulnerabilities',
    'Code Maintainability', 'Testing Edge Cases', 'Documentation', 'Time Management'
  ];

  // Default reflection templates
  const defaultTemplates: ReflectionTemplate[] = [
    {
      id: 1,
      title: "Learning Reflection",
      description: "Reflect on what you learned today",
      questions: [
        "What new concepts or skills did I learn today?",
        "How does this connect to what I already know?",
        "What questions do I still have?",
        "How can I apply this learning in the future?"
      ],
      category: "academic",
      is_default: true
    },
    {
      id: 2,
      title: "Challenge Reflection",
      description: "Reflect on challenges you faced",
      questions: [
        "What was the most challenging part of today's work?",
        "How did I approach this challenge?",
        "What strategies worked or didn't work?",
        "What would I do differently next time?"
      ],
      category: "academic",
      is_default: true
    },
    {
      id: 3,
      title: "Project Reflection",
      description: "Reflect on a project or assignment",
      questions: [
        "What was the goal of this project?",
        "What did I accomplish?",
        "What skills did I develop?",
        "What would I improve if I did this again?"
      ],
      category: "academic",
      is_default: true
    },
    {
      id: 4,
      title: "Collaboration Reflection",
      description: "Reflect on teamwork and collaboration",
      questions: [
        "How did I contribute to the team today?",
        "What did I learn from my teammates?",
        "How did we work together effectively?",
        "What could improve our collaboration?"
      ],
      category: "personal",
      is_default: true
    },
    {
      id: 5,
      title: "Goal Setting Reflection",
      description: "Reflect on your goals and progress",
      questions: [
        "What are my current learning goals?",
        "What progress have I made toward these goals?",
        "What obstacles am I facing?",
        "What steps will I take next?"
      ],
      category: "career",
      is_default: true
    }
  ];

  useEffect(() => {
    fetchReflections();
    setTemplates(defaultTemplates);
    
    // Set up real-time event listeners
    if (socket) {
      // Listen for new reflections
      socket.on('reflection_created', (newReflection: ReflectionEntry) => {
        setReflections(prev => [...prev, newReflection]);
        setLastUpdate(new Date());
        notificationService.emitRealtimeNotification(
          'reflection_created',
          'New Reflection Added',
          `You've successfully documented "${newReflection.title}" in your journal`,
          { reflection_id: newReflection.id },
          'medium'
        );
      });

      // Listen for updated reflections
      socket.on('reflection_updated', (updatedReflection: ReflectionEntry) => {
        setReflections(prev => prev.map(reflection => 
          reflection.id === updatedReflection.id ? updatedReflection : reflection
        ));
        setLastUpdate(new Date());
      });

      // Listen for deleted reflections
      socket.on('reflection_deleted', (reflectionId: number) => {
        setReflections(prev => prev.filter(reflection => reflection.id !== reflectionId));
        setLastUpdate(new Date());
      });

      // Listen for real-time notifications
      socket.on('realtime_notification', (data: any) => {
        if (data.type === 'reflection_reminder' || data.type === 'learning_milestone') {
          notificationService.emitRealtimeNotification(
            data.type,
            data.title,
            data.message,
            data.data,
            data.priority || 'medium'
          );
        }
      });

      // Listen for teacher feedback on reflections
      socket.on('reflection_feedback', (data: any) => {
        notificationService.emitRealtimeNotification(
          'reflection_feedback',
          'Teacher Feedback Received',
          `Your teacher has provided feedback on your reflection: "${data.reflection_title}"`,
          { reflection_id: data.reflection_id, feedback: data.feedback },
          'high'
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('reflection_created');
        socket.off('reflection_updated');
        socket.off('reflection_deleted');
        socket.off('realtime_notification');
        socket.off('reflection_feedback');
      }
    };
  }, [socket]);

  // Auto-refresh functionality
  useEffect(() => {
    const handleRefresh = () => {
      setLastUpdate(new Date());
      fetchReflections();
    };

    // Listen for dashboard refresh events
    window.addEventListener('dashboard-refresh', handleRefresh);
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(handleRefresh, 120000);

    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh);
      clearInterval(interval);
    };
  }, []);

  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      const templateContent = selectedTemplate.questions.map((question, index) => 
        `**${index + 1}. ${question}**\n\nYour answer here...\n\n`
      ).join('\n');
      
      setFormData(prev => ({
        ...prev,
        title: selectedTemplate.title,
        content: templateContent,
        reflection_type: selectedTemplate.category === 'academic' ? 'learning' : 
                        selectedTemplate.category === 'personal' ? 'collaboration' : 'goal'
      }));
    }
  }, [selectedTemplate]);

  const fetchReflections = async () => {
    try {
      setLoading(true);
      // This would be an actual API call
      // const response = await apiService.get(`/students/${user?.id}/reflections`);
      // setReflections(response.data);
      
      // Mock data for demonstration
      setReflections([
        {
          id: 1,
          title: 'Learning React Hooks',
          content: 'Today I learned about React hooks, specifically useState and useEffect. I was able to convert a class component to a functional component and understand the benefits of hooks.',
          reflection_type: 'learning',
          skills_developed: ['React', 'JavaScript', 'Frontend Development'],
          challenges_faced: ['State Management', 'Lifecycle Methods'],
          future_goals: ['Learn Redux', 'Master Custom Hooks'],
          artifacts: ['react-hooks-project'],
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          student_id: user?.id || 1
        },
        {
          id: 2,
          title: 'Debugging Memory Leak',
          content: 'Spent 3 hours debugging a memory leak in my Node.js application. The issue was with event listeners not being properly removed. This taught me the importance of cleanup in event-driven programming.',
          reflection_type: 'debugging',
          skills_developed: ['Node.js', 'Memory Management', 'Debugging'],
          challenges_faced: ['Memory Leak Detection', 'Event Listener Cleanup'],
          future_goals: ['Learn Memory Profiling Tools', 'Improve Code Quality'],
          artifacts: ['nodejs-memory-fix'],
          created_at: '2024-01-14T15:45:00Z',
          updated_at: '2024-01-14T15:45:00Z',
          student_id: user?.id || 1
        }
      ]);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReflection) {
        // Update existing reflection
        // await apiService.put(`/reflections/${editingReflection.id}`, formData);
        setReflections(prev => prev.map(r => 
          r.id === editingReflection.id 
            ? { ...r, ...formData, updated_at: new Date().toISOString() }
            : r
        ));
      } else {
        // Create new reflection
        // await apiService.post('/reflections', formData);
        const newReflection: ReflectionEntry = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          student_id: user?.id || 1
        };
        setReflections(prev => [newReflection, ...prev]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving reflection:', error);
    }
  };

  const handleEdit = (reflection: ReflectionEntry) => {
    setEditingReflection(reflection);
    setFormData({
      title: reflection.title,
      content: reflection.content,
      reflection_type: reflection.reflection_type,
      skills_developed: reflection.skills_developed,
      challenges_faced: reflection.challenges_faced,
      future_goals: reflection.future_goals,
      artifacts: reflection.artifacts
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      try {
        // await apiService.delete(`/reflections/${id}`);
        setReflections(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting reflection:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      reflection_type: 'learning',
      skills_developed: [],
      challenges_faced: [],
      future_goals: [],
      artifacts: []
    });
    setEditingReflection(null);
    setShowForm(false);
  };

  const addToArray = (field: keyof typeof formData, value: string) => {
    if (value.trim() && !(formData[field] as string[]).includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const filteredReflections = filter === 'all' 
    ? reflections 
    : reflections.filter(r => r.reflection_type === filter);

  const getTypeIcon = (type: string) => {
    const typeConfig = reflectionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : BookOpen;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = reflectionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'blue';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reflection journal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(147, 51, 234, 0.4); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-shimmer { 
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
        
        @keyframes card-float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-8px) rotateX(2deg); }
        }
        
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 30px rgba(59, 130, 246, 0.3); }
        }
        
        @keyframes skill-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        
        .animate-card-float { animation: card-float 8s ease-in-out infinite; }
        .animate-card-glow { animation: card-glow 4s ease-in-out infinite; }
        .animate-skill-bounce { animation: skill-bounce 2s ease-in-out infinite; }
        
        .card-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .card-3d:hover {
          transform: rotateY(5deg) rotateX(5deg) translateZ(20px);
        }
        
        .rich-text-editor {
          min-height: 200px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          transition: all 0.3s ease;
        }
        
        .rich-text-editor:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        
        .rich-text-editor h1, .rich-text-editor h2, .rich-text-editor h3 {
          font-weight: 700;
          margin: 16px 0 8px 0;
          color: #1f2937;
        }
        
        .rich-text-editor p {
          margin: 8px 0;
          color: #374151;
        }
        
        .rich-text-editor ul, .rich-text-editor ol {
          margin: 8px 0;
          padding-left: 24px;
        }
        
        .rich-text-editor li {
          margin: 4px 0;
          color: #374151;
        }
        
        .rich-text-editor strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .rich-text-editor em {
          font-style: italic;
          color: #6b7280;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Advanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/40 to-purple-600/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/40 to-cyan-600/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 left-20 w-60 h-60 bg-gradient-to-br from-yellow-400/30 to-orange-600/30 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-full blur-2xl animate-pulse delay-300"></div>
        
        {/* Additional Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-rose-400/20 to-pink-600/20 rounded-full blur-2xl animate-bounce delay-2000"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/25 to-blue-600/25 rounded-full blur-xl animate-bounce delay-1500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-2xl animate-bounce delay-3000"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>
      </div>

      {/* Advanced Header with Enhanced Styling */}
      <div className="relative bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 backdrop-blur-xl shadow-2xl border-b-2 border-blue-200/40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 via-purple-600/8 to-pink-600/8"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-500"></div>
                <div className="relative w-20 h-20 text-white bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 p-5 rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <BookOpen className="w-10 h-10" />
                </div>
              </div>
              <div className="ml-8">
                <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-pulse">
                  📖 Reflection Journal
                </h1>
                <p className="text-xl text-gray-700 font-bold flex items-center">
                  <span className="w-4 h-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full mr-4 animate-pulse"></span>
                  Track your learning journey and growth
                  <span className="ml-6 text-sm bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full font-bold border-2 border-green-200 shadow-lg animate-bounce">
                    ✨ Live Updates
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-5 rounded-3xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 flex items-center shadow-2xl hover:shadow-4xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 border-2 border-white/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <Plus className="w-7 h-7 mr-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-black text-xl">✨ New Reflection</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              🎯 Your Learning Journey
            </h2>
            <p className="text-xl text-gray-700 font-bold">Track your progress and achievements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-100 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-blue-300/50 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 to-cyan-200/80 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-cyan-600/30 rounded-full blur-xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-20 h-20 text-white bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-5 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110">
                    <BookOpen className="w-10 h-10" />
                  </div>
                </div>
                <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent mb-2">
                  {reflections.length}
                </p>
                <p className="text-sm font-bold text-blue-800 uppercase tracking-wider">📖 Total Reflections</p>
                <div className="mt-3 w-16 h-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full shadow-lg"></div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-green-300/50 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/80 to-emerald-200/80 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-full blur-xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-20 h-20 text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-5 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110">
                    <Target className="w-10 h-10" />
                  </div>
                </div>
                <p className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
                  {reflections.reduce((acc, r) => acc + r.skills_developed.length, 0)}
                </p>
                <p className="text-sm font-bold text-green-800 uppercase tracking-wider">🎯 Skills Developed</p>
                <div className="mt-3 w-16 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg"></div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-orange-50 to-amber-100 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-orange-300/50 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 to-amber-200/80 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/30 to-amber-600/30 rounded-full blur-xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-20 h-20 text-white bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-5 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                </div>
                <p className="text-5xl font-black bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                  {reflections.reduce((acc, r) => acc + r.challenges_faced.length, 0)}
                </p>
                <p className="text-sm font-bold text-orange-800 uppercase tracking-wider">💪 Challenges Overcome</p>
                <div className="mt-3 w-16 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-lg"></div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-300/50 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 to-pink-200/80 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative w-20 h-20 text-white bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-5 rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                </div>
                <p className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent mb-2">
                  {reflections.reduce((acc, r) => acc + r.future_goals.length, 0)}
                </p>
                <p className="text-sm font-bold text-purple-800 uppercase tracking-wider">🚀 Future Goals</p>
                <div className="mt-3 w-16 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-10 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-indigo-50/30 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-2xl"></div>
          
          <div className="relative text-center mb-8">
            <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
              Filter by Type
            </h3>
            <p className="text-gray-600 font-semibold">Choose a reflection category to explore</p>
          </div>
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`group relative px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl' 
                  : 'bg-white/90 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl'
              }`}
            >
              {filter === 'all' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30"></div>
              )}
              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-xl mb-2 flex items-center justify-center ${
                  filter === 'all' ? 'bg-white/20' : 'bg-gradient-to-r from-blue-100 to-purple-100'
                }`}>
                  <BookOpen className={`w-4 h-4 ${filter === 'all' ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <span className="relative text-xs">All Types</span>
              </div>
            </button>
            
            {reflectionTypes.map(type => {
              const Icon = type.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                orange: 'from-orange-500 to-orange-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                indigo: 'from-indigo-500 to-indigo-600',
                teal: 'from-teal-500 to-teal-600',
                red: 'from-red-500 to-red-600'
              };
              const bgClasses = {
                blue: 'from-blue-50 to-blue-100',
                orange: 'from-orange-50 to-orange-100',
                green: 'from-green-50 to-green-100',
                purple: 'from-purple-50 to-purple-100',
                indigo: 'from-indigo-50 to-indigo-100',
                teal: 'from-teal-50 to-teal-100',
                red: 'from-red-50 to-red-100'
              };
              return (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`group relative px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 ${
                    filter === type.value 
                      ? `bg-gradient-to-r ${colorClasses[type.color as keyof typeof colorClasses]} text-white shadow-2xl` 
                      : `bg-white/90 text-gray-700 hover:bg-gradient-to-r hover:${bgClasses[type.color as keyof typeof bgClasses]} border-2 border-gray-200 hover:shadow-xl`
                  }`}
                >
                  {filter === type.value && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[type.color as keyof typeof colorClasses]} rounded-2xl blur opacity-30`}></div>
                  )}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl mb-2 flex items-center justify-center ${
                      filter === type.value ? 'bg-white/20' : `bg-gradient-to-r ${bgClasses[type.color as keyof typeof bgClasses]}`
                    }`}>
                      <Icon className={`w-4 h-4 ${filter === type.value ? 'text-white' : `text-${type.color}-600`}`} />
                    </div>
                    <span className="relative text-xs text-center leading-tight">{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reflection Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
              <div className="relative p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                      {editingReflection ? 'Edit Reflection' : 'New Reflection'}
                    </h2>
                    <p className="text-lg text-gray-600 font-semibold flex items-center">
                      <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2 animate-pulse"></span>
                      {editingReflection ? 'Update your learning reflection' : 'Document your learning journey'}
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="group p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <X className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Title */}
                  <div className="relative">
                    <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
                      Reflection Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl"
                      placeholder="What did you learn or experience?"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div className="relative">
                    <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-3"></div>
                      Reflection Type
                    </label>
                    <select
                      value={formData.reflection_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, reflection_type: e.target.value as any }))}
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl"
                    >
                      {reflectionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Template Selection */}
                  <div className="relative">
                    <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mr-3"></div>
                      Use Template (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplate(null)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          !selectedTemplate 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">📝</div>
                          <div className="font-semibold">Custom</div>
                          <div className="text-sm text-gray-600">Write your own</div>
                        </div>
                      </button>
                      {templates.map(template => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            selectedTemplate?.id === template.id 
                              ? 'border-purple-500 bg-purple-50 text-purple-700' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">
                              {template.category === 'academic' ? '🎓' : 
                               template.category === 'personal' ? '👤' : 
                               template.category === 'career' ? '🚀' : '📋'}
                            </div>
                            <div className="font-semibold text-sm">{template.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Content with Rich Text Support */}
                  <div className="relative">
                    <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mr-3"></div>
                      Reflection Content
                      <span className="ml-3 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-bold border border-blue-200">
                        ✨ Rich Text Support
                      </span>
                    </label>
                    
                    {/* Rich Text Formatting Help */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <p className="text-sm text-gray-700 font-semibold mb-2">💡 Formatting Tips:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Bold text:</strong> **your text**</p>
                        <p><em>Italic text:</em> *your text*</p>
                        <p>Line breaks: Press Enter for new paragraphs</p>
                      </div>
                    </div>
                    
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={10}
                      className="rich-text-editor w-full text-lg focus:outline-none resize-none"
                      placeholder="Describe your experience, what you learned, challenges faced, and insights gained...

**Example:**
*What I learned:* I discovered that React hooks can be tricky at first, but with practice, they become intuitive.

**Challenges faced:** Understanding the useEffect dependency array was confusing initially.

**Key insights:** Breaking down complex problems into smaller components makes development much easier."
                      required
                    />
                  </div>

                  {/* Skills Developed */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Skills Developed
                    </label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.skills_developed.map(skill => (
                          <span
                            key={skill}
                            className="group inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeFromArray('skills_developed', skill)}
                              className="ml-2 text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {csSkills.filter(skill => !formData.skills_developed.includes(skill)).map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addToArray('skills_developed', skill)}
                            className="text-left px-4 py-3 text-sm bg-white/80 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Challenges Faced */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Challenges Faced
                    </label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.challenges_faced.map(challenge => (
                          <span
                            key={challenge}
                            className="group inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 hover:shadow-md transition-all duration-200"
                          >
                            {challenge}
                            <button
                              type="button"
                              onClick={() => removeFromArray('challenges_faced', challenge)}
                              className="ml-2 text-orange-600 hover:text-orange-800 p-0.5 rounded-full hover:bg-orange-200 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {commonChallenges.filter(challenge => !formData.challenges_faced.includes(challenge)).map(challenge => (
                          <button
                            key={challenge}
                            type="button"
                            onClick={() => addToArray('challenges_faced', challenge)}
                            className="text-left px-4 py-3 text-sm bg-white/80 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 rounded-xl transition-all duration-200 hover:shadow-sm"
                          >
                            {challenge}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Future Goals */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Future Goals
                    </label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.future_goals.map(goal => (
                          <span
                            key={goal}
                            className="group inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 hover:shadow-md transition-all duration-200"
                          >
                            {goal}
                            <button
                              type="button"
                              onClick={() => removeFromArray('future_goals', goal)}
                              className="ml-2 text-green-600 hover:text-green-800 p-0.5 rounded-full hover:bg-green-200 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add a future goal..."
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addToArray('future_goals', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-6 pt-12 border-t-2 border-gradient-to-r from-gray-200 to-gray-300">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-4 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 border border-white/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative text-lg">{editingReflection ? 'Update Reflection' : 'Save Reflection'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reflections List */}
        <div className="space-y-10">
          {filteredReflections.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mx-auto w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-32 h-32 text-white bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 p-8 rounded-full shadow-2xl">
                  <BookOpen className="w-16 h-16" />
                </div>
              </div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                No reflections yet
              </h3>
              <p className="text-gray-600 mb-10 text-xl font-semibold">Start documenting your learning journey</p>
              <button
                onClick={() => setShowForm(true)}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-12 py-5 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 flex items-center mx-auto shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative font-bold text-lg">Write Your First Reflection</span>
              </button>
            </div>
          ) : (
            filteredReflections.map(reflection => {
              const TypeIcon = getTypeIcon(reflection.reflection_type);
              const typeColor = getTypeColor(reflection.reflection_type);
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                orange: 'from-orange-500 to-orange-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                indigo: 'from-indigo-500 to-indigo-600',
                teal: 'from-teal-500 to-teal-600',
                red: 'from-red-500 to-red-600'
              };
              
              const bgClasses = {
                blue: 'from-blue-50/80 to-indigo-100/80',
                orange: 'from-orange-50/80 to-amber-100/80',
                green: 'from-green-50/80 to-emerald-100/80',
                purple: 'from-purple-50/80 to-pink-100/80',
                indigo: 'from-indigo-50/80 to-blue-100/80',
                teal: 'from-teal-50/80 to-cyan-100/80',
                red: 'from-red-50/80 to-rose-100/80'
              };
              
              return (
                <div key={reflection.id} className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200/50 p-10 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.03] overflow-hidden card-3d animate-card-float">
                  {/* Animated Background Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgClasses[typeColor as keyof typeof bgClasses]} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
                  
                  {/* Header Section */}
                  <div className="relative flex items-start justify-between mb-8">
                    <div className="flex items-start space-x-6">
                      <div className="relative group/icon">
                        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[typeColor as keyof typeof colorClasses]} rounded-2xl blur-lg opacity-40 group-hover/icon:opacity-70 transition-all duration-500`}></div>
                        <div className={`relative w-20 h-20 text-white bg-gradient-to-br ${colorClasses[typeColor as keyof typeof colorClasses]} p-5 rounded-2xl shadow-2xl group-hover/icon:shadow-3xl transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-6`}>
                          <TypeIcon className="w-10 h-10" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 group-hover:scale-105 transition-transform duration-300">
                          {reflection.title}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 px-4 py-2 rounded-xl shadow-lg border border-gray-200 font-bold text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(reflection.created_at).toLocaleDateString()}
                          </div>
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-xl shadow-lg border border-purple-200 font-bold text-sm">
                            {reflectionTypes.find(t => t.value === reflection.reflection_type)?.label}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(reflection)}
                        className="group/btn relative p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-110 border border-blue-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                        <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      </button>
                      <button
                        onClick={() => handleDelete(reflection.id)}
                        className="group/btn relative p-3 rounded-2xl bg-gradient-to-r from-red-100 to-rose-100 text-red-600 hover:from-red-200 hover:to-rose-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-110 border border-red-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Content Box with Rich Text */}
                  <div className="relative mb-8">
                    <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/50 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="rich-text-editor" 
                             dangerouslySetInnerHTML={{ 
                               __html: reflection.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                             }}
                             style={{ 
                               minHeight: 'auto',
                               border: 'none',
                               background: 'transparent',
                               padding: 0,
                               boxShadow: 'none'
                             }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills, Challenges, Goals */}
                  <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {reflection.skills_developed.length > 0 && (
                      <div className="group/skill relative bg-gradient-to-br from-green-50 to-emerald-100 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-full blur-xl group-hover/skill:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                          <h4 className="text-xl font-black text-green-800 flex items-center">
                            <div className="relative mr-3">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-30"></div>
                              <TrendingUp className="relative w-6 h-6 text-white bg-gradient-to-r from-green-500 to-emerald-600 p-1 rounded-xl" />
                            </div>
                            🎯 Skills Developed
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {reflection.skills_developed.map((skill, index) => (
                            <span
                              key={skill}
                              className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-bold px-5 py-3 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-skill-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                {skill}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {reflection.challenges_faced.length > 0 && (
                      <div className="group/challenge relative bg-gradient-to-br from-orange-50 to-amber-100 backdrop-blur-sm rounded-2xl p-8 border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/30 to-amber-600/30 rounded-full blur-xl group-hover/challenge:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full animate-pulse"></div>
                          <h4 className="text-xl font-black text-orange-800 flex items-center">
                            <div className="relative mr-3">
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl blur opacity-30"></div>
                              <AlertCircle className="relative w-6 h-6 text-white bg-gradient-to-r from-orange-500 to-amber-600 p-1 rounded-xl" />
                            </div>
                            💪 Challenges Faced
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {reflection.challenges_faced.map((challenge, index) => (
                            <span
                              key={challenge}
                              className="inline-block bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-sm font-bold px-5 py-3 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-skill-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                                {challenge}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {reflection.future_goals.length > 0 && (
                      <div className="group/goal relative bg-gradient-to-br from-purple-50 to-pink-100 backdrop-blur-sm rounded-2xl p-8 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-xl group-hover/goal:scale-125 transition-transform duration-500"></div>
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse"></div>
                          <h4 className="text-xl font-black text-purple-800 flex items-center">
                            <div className="relative mr-3">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur opacity-30"></div>
                              <Target className="relative w-6 h-6 text-white bg-gradient-to-r from-purple-500 to-pink-600 p-1 rounded-xl" />
                            </div>
                            🚀 Future Goals
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {reflection.future_goals.map((goal, index) => (
                            <span
                              key={goal}
                              className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-bold px-5 py-3 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-skill-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                                {goal}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ReflectionJournal;