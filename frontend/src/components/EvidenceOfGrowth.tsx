import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar, 
  Code,
  FileText,
  Image,
  Video,
  Link,
  Star,
  Award,
  Target,
  Users,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Download,
  Eye,
  X,
  Trophy,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notificationService';
import '../styles/enhanced-styles.css';
import '../styles/advanced-design-system.css';

interface Artifact {
  id: number;
  title: string;
  description: string;
  type: 'code' | 'document' | 'image' | 'video' | 'link' | 'presentation';
  file_path?: string;
  url?: string;
  skills_tagged: string[];
  competencies: string[];
  before_after: 'before' | 'after' | 'standalone';
  related_artifact_id?: number;
  created_at: string;
  updated_at: string;
  student_id: number;
}

interface GrowthPortfolio {
  id: number;
  title: string;
  description: string;
  artifacts: number[]; // Array of artifact IDs
  skills_showcase: string[];
  growth_metrics: {
    skill_improvement: number;
    project_complexity: number;
    collaboration_score: number;
    problem_solving: number;
  };
  created_at: string;
  updated_at: string;
}

interface EvidenceOfGrowthProps {}

const EvidenceOfGrowth: React.FC<EvidenceOfGrowthProps> = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [portfolios, setPortfolios] = useState<GrowthPortfolio[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArtifactForm, setShowArtifactForm] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<GrowthPortfolio | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<GrowthPortfolio | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const [artifactForm, setArtifactForm] = useState({
    title: '',
    description: '',
    type: 'code' as 'code' | 'document' | 'image' | 'video' | 'link' | 'presentation',
    file_path: '',
    url: '',
    skills_tagged: [] as string[],
    competencies: [] as string[],
    before_after: 'standalone' as 'before' | 'after' | 'standalone',
    related_artifact_id: undefined as number | undefined
  });

  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    artifact_ids: [] as number[],
    skills_showcase: [] as string[],
    growth_metrics: {
      skill_improvement: 0,
      project_complexity: 0,
      collaboration_score: 0,
      problem_solving: 0
    }
  });

  const artifactTypes = [
    { value: 'code', label: 'Code Project', icon: Code, color: 'blue' },
    { value: 'document', label: 'Document', icon: FileText, color: 'green' },
    { value: 'image', label: 'Image/Screenshot', icon: Image, color: 'purple' },
    { value: 'video', label: 'Video/Demo', icon: Video, color: 'red' },
    { value: 'link', label: 'External Link', icon: Link, color: 'orange' },
    { value: 'presentation', label: 'Presentation', icon: Star, color: 'indigo' }
  ];

  const csCompetencies = [
    'Problem Solving', 'Algorithm Design', 'Data Structures', 'Software Engineering',
    'Database Design', 'Web Development', 'Mobile Development', 'Machine Learning',
    'Cybersecurity', 'Network Programming', 'System Design', 'Testing & QA',
    'Version Control', 'DevOps', 'UI/UX Design', 'API Development', 'Code Review',
    'Documentation', 'Project Management', 'Team Collaboration', 'Debugging',
    'Performance Optimization', 'Security Implementation', 'Agile Development'
  ];

  const skillLevels = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ];

  // Filter and search functionality
  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.skills_tagged.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || artifact.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedArtifacts = [...filteredArtifacts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  useEffect(() => {
    fetchData();
    
    // Set up real-time event listeners
    if (socket) {
      // Listen for new artifacts
      socket.on('artifact_created', (newArtifact: Artifact) => {
        setArtifacts(prev => [...prev, newArtifact]);
        setLastUpdate(new Date());
        notificationService.emitRealtimeNotification(
          'artifact_created',
          'New Artifact Added',
          `You've successfully added "${newArtifact.title}" to your portfolio`,
          { artifact_id: newArtifact.id },
          'medium'
        );
      });

      // Listen for updated artifacts
      socket.on('artifact_updated', (updatedArtifact: Artifact) => {
        setArtifacts(prev => prev.map(artifact => 
          artifact.id === updatedArtifact.id ? updatedArtifact : artifact
        ));
        setLastUpdate(new Date());
      });

      // Listen for deleted artifacts
      socket.on('artifact_deleted', (artifactId: number) => {
        setArtifacts(prev => prev.filter(artifact => artifact.id !== artifactId));
        setLastUpdate(new Date());
      });

      // Listen for new portfolios
      socket.on('portfolio_created', (newPortfolio: GrowthPortfolio) => {
        setPortfolios(prev => [...prev, newPortfolio]);
        setLastUpdate(new Date());
        notificationService.emitRealtimeNotification(
          'portfolio_created',
          'New Portfolio Created',
          `You've successfully created "${newPortfolio.title}" portfolio`,
          { portfolio_id: newPortfolio.id },
          'medium'
        );
      });

      // Listen for updated portfolios
      socket.on('portfolio_updated', (updatedPortfolio: GrowthPortfolio) => {
        setPortfolios(prev => prev.map(portfolio => 
          portfolio.id === updatedPortfolio.id ? updatedPortfolio : portfolio
        ));
        setLastUpdate(new Date());
      });

      // Listen for deleted portfolios
      socket.on('portfolio_deleted', (portfolioId: number) => {
        setPortfolios(prev => prev.filter(portfolio => portfolio.id !== portfolioId));
        setLastUpdate(new Date());
      });

      // Listen for real-time notifications
      socket.on('realtime_notification', (data: any) => {
        if (data.type === 'growth_milestone' || data.type === 'skill_achievement') {
          notificationService.emitRealtimeNotification(
            data.type,
            data.title,
            data.message,
            data.data,
            data.priority || 'medium'
          );
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('artifact_created');
        socket.off('artifact_updated');
        socket.off('artifact_deleted');
        socket.off('portfolio_created');
        socket.off('portfolio_updated');
        socket.off('portfolio_deleted');
        socket.off('realtime_notification');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setArtifacts([
        {
          id: 1,
          title: 'First React Todo App',
          description: 'My first attempt at building a React application. Simple todo list with basic functionality.',
          type: 'code',
          file_path: 'todo-app-v1.zip',
          skills_tagged: ['React', 'JavaScript', 'HTML', 'CSS'],
          competencies: ['Web Development', 'Problem Solving'],
          before_after: 'before',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          student_id: user?.id || 1
        },
        {
          id: 2,
          title: 'Advanced React E-commerce App',
          description: 'Full-featured e-commerce application with Redux, authentication, payment integration, and responsive design.',
          type: 'code',
          file_path: 'ecommerce-app-v2.zip',
          skills_tagged: ['React', 'Redux', 'Node.js', 'MongoDB', 'Stripe API', 'JWT'],
          competencies: ['Web Development', 'Problem Solving', 'System Design', 'API Development'],
          before_after: 'after',
          related_artifact_id: 1,
          created_at: '2024-01-15T14:30:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          student_id: user?.id || 1
        },
        {
          id: 3,
          title: 'Algorithm Analysis Report',
          description: 'Detailed analysis of sorting algorithms with time complexity comparisons and performance benchmarks.',
          type: 'document',
          file_path: 'algorithm-analysis.pdf',
          skills_tagged: ['Algorithm Design', 'Data Structures', 'Analysis'],
          competencies: ['Problem Solving', 'Algorithm Design'],
          before_after: 'standalone',
          created_at: '2024-01-10T09:15:00Z',
          updated_at: '2024-01-10T09:15:00Z',
          student_id: user?.id || 1
        }
      ]);

      setPortfolios([
        {
          id: 1,
          title: 'Web Development Growth Journey',
          description: 'Showcasing my progression from basic HTML/CSS to full-stack React applications',
          artifacts: [1, 2],
          skills_showcase: ['React', 'JavaScript', 'Node.js', 'Database Design'],
          growth_metrics: {
            skill_improvement: 85,
            project_complexity: 90,
            collaboration_score: 75,
            problem_solving: 80
          },
          created_at: '2024-01-15T16:00:00Z',
          updated_at: '2024-01-15T16:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtifactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArtifact) {
        // Update existing artifact
        setArtifacts(prev => prev.map(a => 
          a.id === editingArtifact.id 
            ? { ...a, ...artifactForm, updated_at: new Date().toISOString() }
            : a
        ));
      } else {
        // Create new artifact
        const newArtifact: Artifact = {
          id: Date.now(),
          ...artifactForm,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          student_id: user?.id || 1
        };
        setArtifacts(prev => [newArtifact, ...prev]);
      }
      
      resetArtifactForm();
    } catch (error) {
      console.error('Error saving artifact:', error);
    }
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPortfolio) {
        // Update existing portfolio
        setPortfolios(prev => prev.map(p => 
          p.id === editingPortfolio.id 
            ? { ...p, ...portfolioForm, updated_at: new Date().toISOString() }
            : p
        ));
      } else {
        // Create new portfolio
        const newPortfolio: GrowthPortfolio = {
          id: Date.now(),
          title: portfolioForm.title,
          description: portfolioForm.description,
          artifacts: portfolioForm.artifact_ids,
          skills_showcase: portfolioForm.skills_showcase,
          growth_metrics: portfolioForm.growth_metrics,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPortfolios(prev => [newPortfolio, ...prev]);
      }
      
      resetPortfolioForm();
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const resetArtifactForm = () => {
    setArtifactForm({
      title: '',
      description: '',
      type: 'code',
      file_path: '',
      url: '',
      skills_tagged: [],
      competencies: [],
      before_after: 'standalone',
      related_artifact_id: undefined
    });
    setEditingArtifact(null);
    setShowArtifactForm(false);
  };

  const resetPortfolioForm = () => {
    setPortfolioForm({
      title: '',
      description: '',
      artifact_ids: [],
      skills_showcase: [],
      growth_metrics: {
        skill_improvement: 0,
        project_complexity: 0,
        collaboration_score: 0,
        problem_solving: 0
      }
    });
    setEditingPortfolio(null);
    setShowPortfolioForm(false);
  };

  const addToArray = (field: string, value: string) => {
    if (value.trim()) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setPortfolioForm(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as any),
            [child]: value.trim()
          }
        }));
      } else {
        setArtifactForm(prev => ({
          ...prev,
          [field]: [...prev[field as keyof typeof prev] as string[], value.trim()]
        }));
      }
    }
  };

  const removeFromArray = (field: string, value: string) => {
    setArtifactForm(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const getArtifactIcon = (type: string) => {
    const typeConfig = artifactTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Code;
  };

  const getArtifactColor = (type: string) => {
    const typeConfig = artifactTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'blue';
  };

  const getBeforeAfterColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'after': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getBeforeAfterIcon = (type: string) => {
    switch (type) {
      case 'before': return <Calendar className="w-4 h-4" />;
      case 'after': return <Award className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evidence of growth...</p>
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
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.4); }
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
          0%, 100% { box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 30px rgba(139, 92, 246, 0.3); }
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
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Advanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/40 to-pink-600/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/40 to-cyan-600/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 left-20 w-60 h-60 bg-gradient-to-br from-yellow-400/30 to-orange-600/30 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-full blur-2xl animate-pulse delay-300"></div>
        
        {/* Additional Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-rose-400/20 to-pink-600/20 rounded-full blur-2xl animate-bounce delay-2000"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/25 to-blue-600/25 rounded-full blur-xl animate-bounce delay-1500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-2xl animate-bounce delay-3000"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>
      </div>

      {/* Advanced Header with Enhanced Styling */}
      <div className="relative bg-gradient-to-r from-purple-600/15 via-pink-600/15 to-blue-600/15 backdrop-blur-xl shadow-2xl border-b-2 border-purple-200/40">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/8 via-pink-600/8 to-blue-600/8"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-500"></div>
                <div className="relative w-20 h-20 text-white bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 p-5 rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
              <div className="ml-8">
                <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3 animate-pulse">
                  🚀 Evidence of Growth
                </h1>
                <p className="text-xl text-gray-700 font-bold flex items-center">
                  <span className="w-4 h-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full mr-4 animate-pulse"></span>
                  Showcase your learning journey and skill development
                  <span className="ml-6 text-sm bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full font-bold border-2 border-green-200 shadow-lg animate-bounce">
                    ✨ Live Updates
                  </span>
                </p>
              </div>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => setShowArtifactForm(true)}
                className="group relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-10 py-5 rounded-3xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 flex items-center shadow-2xl hover:shadow-4xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 border-2 border-white/40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <Plus className="w-7 h-7 mr-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-black text-xl">✨ Add Artifact</span>
              </button>
              <button
                onClick={() => setShowPortfolioForm(true)}
                className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-10 py-5 rounded-3xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 flex items-center shadow-2xl hover:shadow-4xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 border-2 border-white/40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <Plus className="w-7 h-7 mr-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-black text-xl">🚀 Create Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Stats Overview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl shadow-2xl mb-8 animate-pulse">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-pulse">
              🎯 Your Growth Portfolio
            </h2>
            <p className="text-2xl text-gray-700 font-bold max-w-3xl mx-auto leading-relaxed">Track your progress and achievements with beautiful visualizations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-100 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-300/60 p-10 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-110 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/90 to-cyan-200/90 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/40 to-cyan-600/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative w-24 h-24 text-white bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 p-6 rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <FileText className="w-12 h-12" />
                  </div>
                </div>
                <p className="text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {artifacts.length}
                </p>
                <p className="text-lg font-black text-blue-800 uppercase tracking-wider mb-4">📄 Total Artifacts</p>
                <div className="w-20 h-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-green-300/60 p-10 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-110 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/90 to-emerald-200/90 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/40 to-emerald-600/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-green-600/30 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative w-24 h-24 text-white bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-6 rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Award className="w-12 h-12" />
                  </div>
                </div>
                <p className="text-6xl font-black bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {artifacts.filter(a => a.before_after === 'after').length}
                </p>
                <p className="text-lg font-black text-green-800 uppercase tracking-wider mb-4">🏆 Growth Showcases</p>
                <div className="w-20 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-300/60 p-10 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-110 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/90 to-pink-200/90 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/40 to-pink-600/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-pink-400/30 to-purple-600/30 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative w-24 h-24 text-white bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-6 rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Tag className="w-12 h-12" />
                  </div>
                </div>
                <p className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {new Set(artifacts.flatMap(a => a.skills_tagged)).size}
                </p>
                <p className="text-lg font-black text-purple-800 uppercase tracking-wider mb-4">🏷️ Skills Demonstrated</p>
                <div className="w-20 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-orange-50 to-amber-100 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-300/60 p-10 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-110 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/90 to-amber-200/90 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/40 to-amber-600/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-amber-400/30 to-orange-600/30 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative w-24 h-24 text-white bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-6 rounded-3xl shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Star className="w-12 h-12" />
                  </div>
                </div>
                <p className="text-6xl font-black bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {portfolios.length}
                </p>
                <p className="text-lg font-black text-orange-800 uppercase tracking-wider mb-4">⭐ Growth Portfolios</p>
                <div className="w-20 h-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-16">
          <div className="enhanced-card animate-fade-in-down">
            <div className="enhanced-flex enhanced-flex--between mb-6">
              <h2 className="enhanced-heading enhanced-heading--h3">Search & Filter</h2>
              <div className="enhanced-flex gap-4">
                <div className="relative">
                  <Search className="enhanced-icon enhanced-icon--primary absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search artifacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="enhanced-input pl-10 w-64"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="enhanced-input w-40"
                >
                  <option value="all">All Types</option>
                  <option value="code">Code</option>
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                  <option value="presentation">Presentation</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="enhanced-input w-32"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
            <div className="enhanced-flex gap-2 flex-wrap">
              <span className="enhanced-badge enhanced-badge--info">
                {sortedArtifacts.length} artifacts
              </span>
              {searchTerm && (
                <span className="enhanced-badge enhanced-badge--neutral">
                  Search: "{searchTerm}"
                </span>
              )}
              {filterType !== 'all' && (
                <span className="enhanced-badge enhanced-badge--neutral">
                  Type: {filterType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Growth Portfolios */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl shadow-2xl mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🚀 Growth Portfolios
            </h2>
            <p className="text-xl text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed">
              Curated collections showcasing your development journey and achievements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolios.map(portfolio => (
              <div
                key={portfolio.id}
                className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-200/50 p-8 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.03] cursor-pointer overflow-hidden card-3d animate-card-float"
                onClick={() => setSelectedPortfolio(portfolio)}
              >
                {/* Animated Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/90 via-pink-100/90 to-blue-100/90 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-blue-600/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
                
                {/* Header Section */}
                <div className="relative flex items-start justify-between mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="relative group/icon">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 rounded-2xl blur-lg opacity-40 group-hover/icon:opacity-70 transition-all duration-500"></div>
                      <div className="relative w-16 h-16 text-white bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 p-4 rounded-2xl shadow-2xl group-hover/icon:shadow-3xl transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-6">
                        <Award className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                        {portfolio.title}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-xl shadow-lg border border-purple-200 font-bold text-sm">
                          📁 {portfolio.artifacts.length} artifacts
                        </div>
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-4 py-2 rounded-xl shadow-lg border border-blue-200 font-bold text-sm">
                          ⭐ {portfolio.skills_showcase.length} skills
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPortfolio(portfolio);
                        setPortfolioForm({
                          title: portfolio.title,
                          description: portfolio.description,
                          artifact_ids: portfolio.artifacts,
                          skills_showcase: portfolio.skills_showcase,
                          growth_metrics: portfolio.growth_metrics
                        });
                        setShowPortfolioForm(true);
                      }}
                      className="group/btn relative p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-110 border border-blue-200"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                      <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
                
                {/* Description Box */}
                <div className="relative bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-white/50 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <p className="relative text-gray-800 font-semibold leading-relaxed text-lg">{portfolio.description}</p>
                </div>
                
                {/* Growth Metrics Section */}
                <div className="relative space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                    <h4 className="text-xl font-black text-gray-900">📈 Growth Metrics</h4>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg group-hover:shadow-xl transition-all duration-500">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-800">Skill Improvement</span>
                      <span className="text-2xl font-black text-green-600">{portfolio.growth_metrics.skill_improvement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out group-hover:shadow-xl" 
                        style={{ width: `${portfolio.growth_metrics.skill_improvement}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Skills Showcase Box */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg group-hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Star className="w-6 h-6 text-yellow-600" />
                        <span className="text-lg font-bold text-gray-800">Skills Showcased</span>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-4 py-2 rounded-xl shadow-lg border border-yellow-200 font-bold">
                        {portfolio.skills_showcase.length} skills
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Artifacts Grid */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              📚 Learning Artifacts
            </h2>
            <p className="text-xl text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed">
              Evidence of your skills and competencies across different domains
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedArtifacts.map(artifact => {
              const ArtifactIcon = getArtifactIcon(artifact.type);
              const artifactColor = getArtifactColor(artifact.type);
              
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
                red: 'from-red-500 to-red-600',
                indigo: 'from-indigo-500 to-indigo-600'
              };
              const bgClasses = {
                blue: 'from-blue-50/80 to-indigo-100/80',
                green: 'from-green-50/80 to-emerald-100/80',
                purple: 'from-purple-50/80 to-pink-100/80',
                orange: 'from-orange-50/80 to-amber-100/80',
                red: 'from-red-50/80 to-rose-100/80',
                indigo: 'from-indigo-50/80 to-blue-100/80'
              };
              
              return (
                <div key={artifact.id} className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200/50 p-8 hover:shadow-4xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.03] overflow-hidden card-3d animate-card-float">
                  {/* Animated Background Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${bgClasses[artifactColor as keyof typeof bgClasses]} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
                  
                  {/* Header Section */}
                  <div className="relative flex items-start justify-between mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="relative group/icon">
                        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[artifactColor as keyof typeof colorClasses]} rounded-2xl blur-lg opacity-40 group-hover/icon:opacity-70 transition-all duration-500`}></div>
                        <div className={`relative w-16 h-16 text-white bg-gradient-to-br ${colorClasses[artifactColor as keyof typeof colorClasses]} p-4 rounded-2xl shadow-2xl group-hover/icon:shadow-3xl transition-all duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-6`}>
                          <ArtifactIcon className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                          {artifact.title}
                        </h3>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 px-4 py-2 rounded-xl shadow-lg border border-gray-200 font-bold text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(artifact.created_at).toLocaleDateString()}
                          </div>
                          <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-lg ${getBeforeAfterColor(artifact.before_after)}`}>
                            {getBeforeAfterIcon(artifact.before_after)}
                            <span className="ml-2 capitalize">{artifact.before_after}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingArtifact(artifact);
                          setArtifactForm({
                            title: artifact.title,
                            description: artifact.description,
                            type: artifact.type as any,
                            file_path: artifact.file_path || '',
                            url: artifact.url || '',
                            skills_tagged: artifact.skills_tagged,
                            competencies: artifact.competencies,
                            before_after: artifact.before_after as any,
                            related_artifact_id: artifact.related_artifact_id
                          });
                          setShowArtifactForm(true);
                        }}
                        className="group/btn relative p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-110 border border-blue-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                        <Edit className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this artifact?')) {
                            setArtifacts(prev => prev.filter(a => a.id !== artifact.id));
                          }
                        }}
                        className="group/btn relative p-3 rounded-2xl bg-gradient-to-r from-red-100 to-rose-100 text-red-600 hover:from-red-200 hover:to-rose-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-110 border border-red-200"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl blur opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="relative bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-white/50 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <p className="relative text-gray-800 font-semibold leading-relaxed text-lg">{artifact.description}</p>
                  </div>

                  {/* Skills and Competencies Section */}
                  <div className="relative space-y-6">
                    {artifact.skills_tagged.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg group-hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                          <h4 className="text-lg font-black text-gray-900">🏷️ Skills Tagged</h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {artifact.skills_tagged.map((skill, index) => (
                            <span
                              key={skill}
                              className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-5 py-3 text-sm font-bold rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-skill-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                                {skill}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {artifact.competencies.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg group-hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                          <h4 className="text-lg font-black text-gray-900">🎯 Competencies</h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {artifact.competencies.map((competency, index) => (
                            <span
                              key={competency}
                              className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-5 py-3 text-sm font-bold rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-skill-bounce"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <span className="flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                {competency}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      {artifact.file_path && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      )}
                      {artifact.url && (
                        <button className="text-green-600 hover:text-green-800 text-sm flex items-center">
                          <Link className="w-4 h-4 mr-1" />
                          View
                        </button>
                      )}
                    </div>
                    <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Artifact Form Modal */}
        {showArtifactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingArtifact ? 'Edit Artifact' : 'Add New Artifact'}
                  </h2>
                  <button
                    onClick={resetArtifactForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleArtifactSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artifact Title
                    </label>
                    <input
                      type="text"
                      value={artifactForm.title}
                      onChange={(e) => setArtifactForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., React Todo App, Algorithm Analysis Report"
                      required
                    />
                  </div>

                  {/* Type and Before/After */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Artifact Type
                      </label>
                      <select
                        value={artifactForm.type}
                        onChange={(e) => setArtifactForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {artifactTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Growth Stage
                      </label>
                      <select
                        value={artifactForm.before_after}
                        onChange={(e) => setArtifactForm(prev => ({ ...prev, before_after: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standalone">Standalone</option>
                        <option value="before">Before (Early Work)</option>
                        <option value="after">After (Improved Work)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={artifactForm.description}
                      onChange={(e) => setArtifactForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this artifact demonstrates, what you learned, and how it shows your growth..."
                      required
                    />
                  </div>

                  {/* File Upload or URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {artifactForm.type === 'link' ? 'URL' : 'File Upload'}
                    </label>
                    {artifactForm.type === 'link' ? (
                      <input
                        type="url"
                        value={artifactForm.url}
                        onChange={(e) => setArtifactForm(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setArtifactForm(prev => ({ ...prev, file_path: file.name }));
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  {/* Skills Tagged */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills Demonstrated
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {artifactForm.skills_tagged.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeFromArray('skills_tagged', skill)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add a skill (press Enter)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addToArray('skills_tagged', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Competencies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CS Competencies
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {artifactForm.competencies.map(competency => (
                          <span
                            key={competency}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {competency}
                            <button
                              type="button"
                              onClick={() => removeFromArray('competencies', competency)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {csCompetencies.filter(comp => !artifactForm.competencies.includes(comp)).map(competency => (
                          <button
                            key={competency}
                            type="button"
                            onClick={() => addToArray('competencies', competency)}
                            className="text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {competency}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={resetArtifactForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingArtifact ? 'Update Artifact' : 'Save Artifact'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default EvidenceOfGrowth;
