import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Target,
  Code,
  FileText,
  Image,
  Link,
  Video,
  Download,
  Eye,
  Search,
  Filter,
  Award,
  Star,
  BookOpen,
  Users,
  Lightbulb,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notificationService';

// Helper function to safely convert string or array to array
const safeStringToArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').filter(s => s.trim());
  return [];
};

interface Artifact {
  id: number;
  title: string;
  description: string;
  type: 'code' | 'document' | 'image' | 'link' | 'video';
  file_path?: string;
  url?: string;
  skills_tagged: string[];
  created_at: string;
  updated_at: string;
  student_id: number;
}

interface GrowthPortfolio {
  id: number;
  title: string;
  description: string;
  artifacts: number[];
  created_at: string;
  updated_at: string;
  student_id: number;
}

const EnhancedEvidenceOfGrowth: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [portfolios, setPortfolios] = useState<GrowthPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArtifactForm, setShowArtifactForm] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<GrowthPortfolio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const [artifactForm, setArtifactForm] = useState({
    title: '',
    description: '',
    type: 'code' as 'code' | 'document' | 'image' | 'link' | 'video',
    file_path: '',
    url: '',
    skills_tagged: [] as string[]
  });

  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    artifacts: [] as number[]
  });

  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML/CSS', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'Problem Solving',
    'Algorithm Design', 'Data Structures', 'Machine Learning', 'Web Development',
    'Mobile Development', 'UI/UX Design', 'Testing', 'Debugging', 'Code Review'
  ];

  const artifactTypes = [
    { value: 'code', label: 'Code Project', icon: Code, color: 'blue' },
    { value: 'document', label: 'Document', icon: FileText, color: 'green' },
    { value: 'image', label: 'Image/Design', icon: Image, color: 'purple' },
    { value: 'link', label: 'External Link', icon: Link, color: 'orange' },
    { value: 'video', label: 'Video', icon: Video, color: 'red' }
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artifactsResponse, portfoliosResponse] = await Promise.all([
        apiService.get('/artifacts'),
        apiService.get('/growth-portfolios')
      ]);
      setArtifacts(artifactsResponse.data);
      setPortfolios(portfoliosResponse.data);
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
        await apiService.put(`/artifacts/${editingArtifact.id}`, artifactForm);
      } else {
        await apiService.post('/artifacts', artifactForm);
      }
      await fetchData();
      setShowArtifactForm(false);
      setEditingArtifact(null);
      setArtifactForm({
        title: '',
        description: '',
        type: 'code',
        file_path: '',
        url: '',
        skills_tagged: []
      });
    } catch (error) {
      console.error('Error saving artifact:', error);
    }
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPortfolio) {
        await apiService.put(`/growth-portfolios/${editingPortfolio.id}`, portfolioForm);
      } else {
        await apiService.post('/growth-portfolios', portfolioForm);
      }
      await fetchData();
      setShowPortfolioForm(false);
      setEditingPortfolio(null);
      setPortfolioForm({
        title: '',
        description: '',
        artifacts: []
      });
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const handleEditArtifact = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setArtifactForm({
      title: artifact.title,
      description: artifact.description,
      type: artifact.type,
      file_path: artifact.file_path || '',
      url: artifact.url || '',
      skills_tagged: artifact.skills_tagged
    });
    setShowArtifactForm(true);
  };

  const handleEditPortfolio = (portfolio: GrowthPortfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      title: portfolio.title,
      description: portfolio.description,
      artifacts: portfolio.artifacts
    });
    setShowPortfolioForm(true);
  };

  const handleDeleteArtifact = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this artifact?')) {
      try {
        await apiService.delete(`/artifacts/${id}`);
        await fetchData();
      } catch (error) {
        console.error('Error deleting artifact:', error);
      }
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await apiService.delete(`/growth-portfolios/${id}`);
        await fetchData();
      } catch (error) {
        console.error('Error deleting portfolio:', error);
      }
    }
  };

  const addToArray = (field: string, value: string) => {
    if (value.trim()) {
      setArtifactForm(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()]
      }));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchData();
    
    // Real-time updates
    if (socket) {
      socket.on('artifact_created', () => {
        fetchData();
        notificationService.emitRealtimeNotification(
          'artifact_created',
          'New Artifact Added',
          'A new artifact has been added to your portfolio'
        );
      });

      socket.on('artifact_updated', () => {
        fetchData();
      });

      socket.on('artifact_deleted', () => {
        fetchData();
      });

      socket.on('portfolio_created', () => {
        fetchData();
        notificationService.emitRealtimeNotification(
          'portfolio_created',
          'New Portfolio Created',
          'A new growth portfolio has been created'
        );
      });

      return () => {
        socket.off('artifact_created');
        socket.off('artifact_updated');
        socket.off('artifact_deleted');
        socket.off('portfolio_created');
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-16 h-16 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Evidence of Growth</h3>
          <p className="text-gray-600">Please wait while we fetch your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Engaging Design */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute bottom-4 left-1/4 w-12 h-12 bg-green-400/20 rounded-full blur-md animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              {/* Enhanced Icon with Animation */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-white/90 to-white/70 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-10 h-10 text-purple-700 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="text-white">
                <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                  Evidence of Growth
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 font-medium drop-shadow-md">
                  🚀 Document Your Learning Journey & Showcase Achievements
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Target className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-semibold">Track Progress</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Award className="w-5 h-5 text-green-300" />
                    <span className="text-white font-semibold">Showcase Skills</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowArtifactForm(true)}
                className="group relative px-8 py-4 bg-white/90 hover:bg-white text-purple-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span>Add Artifact</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={() => setShowPortfolioForm(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span>Create Portfolio</span>
                </div>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{artifacts.length}</h3>
              <p className="text-gray-600 font-medium">Total Artifacts</p>
            </div>
          </div>
          
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{portfolios.length}</h3>
              <p className="text-gray-600 font-medium">Growth Portfolios</p>
            </div>
          </div>
          
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {artifacts.reduce((acc, a) => {
                  return acc + safeStringToArray(a.skills_tagged).length;
                }, 0)}
              </h3>
              <p className="text-gray-600 font-medium">Skills Developed</p>
            </div>
          </div>
          
          <div className="card text-center">
            <div className="card-body">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {Array.from(new Set(artifacts.flatMap(a => safeStringToArray(a.skills_tagged)))).length}
              </h3>
              <p className="text-gray-600 font-medium">Unique Skills</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Search & Filter</h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search artifacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input w-full sm:w-48"
                >
                  <option value="all">All Types</option>
                  {artifactTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-full sm:w-32"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <span className="badge badge-primary">
                {sortedArtifacts.length} artifacts
              </span>
              {searchTerm && (
                <span className="badge badge-gray">
                  Search: "{searchTerm}"
                </span>
              )}
              {filterType !== 'all' && (
                <span className="badge badge-gray">
                  Type: {artifactTypes.find(t => t.value === filterType)?.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {artifactTypes.map((type, index) => {
            const IconComponent = type.icon;
            const isActive = filterType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`card text-center transition-all duration-300 ${
                  isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
              >
                <div className="card-body p-4">
                  <div className={`w-12 h-12 bg-${type.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`w-6 h-6 text-${type.color}-600`} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{type.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Artifacts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {sortedArtifacts.map((artifact, index) => {
            const IconComponent = getArtifactIcon(artifact.type);
            const typeColor = getArtifactColor(artifact.type);
            
            return (
              <div key={artifact.id} className="card group">
                <div className="card-header">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-${typeColor}-100 rounded-xl flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 text-${typeColor}-600`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{artifact.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(artifact.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditArtifact(artifact)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArtifact(artifact.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {artifact.description}
                  </p>
                  
                  {artifact.skills_tagged && artifact.skills_tagged.length > 0 && (
                    <div className="mb-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Skills Tagged
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {safeStringToArray(artifact.skills_tagged).map((skill, idx) => (
                          <span key={idx} className="badge badge-primary text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {artifact.file_path && (
                      <button className="btn btn-outline flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                    {artifact.url && (
                      <button className="btn btn-outline flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Growth Portfolios Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Growth Portfolios</h2>
            <button
              onClick={() => setShowPortfolioForm(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Portfolio
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="card">
                <div className="card-header">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{portfolio.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(portfolio.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPortfolio(portfolio)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {portfolio.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {safeStringToArray(portfolio.artifacts).length} artifacts
                    </span>
                    <button className="btn btn-primary flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Portfolio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artifact Form Modal */}
      {showArtifactForm && (
        <div className="modal-overlay">
          <div className="modal max-w-4xl">
            <div className="modal-header">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingArtifact ? 'Edit Artifact' : 'Add New Artifact'}
              </h2>
              <button
                onClick={() => {
                  setShowArtifactForm(false);
                  setEditingArtifact(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleArtifactSubmit} className="modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={artifactForm.title}
                      onChange={(e) => setArtifactForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="Enter artifact title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={artifactForm.type}
                      onChange={(e) => setArtifactForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="input"
                    >
                      {artifactTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={artifactForm.description}
                      onChange={(e) => setArtifactForm(prev => ({ ...prev, description: e.target.value }))}
                      className="textarea"
                      placeholder="Describe your artifact..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {artifactForm.type === 'link' ? 'URL' : 'File Path'}
                    </label>
                    <input
                      type={artifactForm.type === 'link' ? 'url' : 'text'}
                      value={artifactForm.type === 'link' ? artifactForm.url : artifactForm.file_path}
                      onChange={(e) => setArtifactForm(prev => ({ 
                        ...prev, 
                        [artifactForm.type === 'link' ? 'url' : 'file_path']: e.target.value 
                      }))}
                      className="input"
                      placeholder={artifactForm.type === 'link' ? 'https://...' : '/path/to/file'}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills Tagged
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {artifactForm.skills_tagged.map((skill, idx) => (
                        <span key={idx} className="badge badge-primary">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeFromArray('skills_tagged', skill)}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value && !artifactForm.skills_tagged.includes(e.target.value)) {
                          addToArray('skills_tagged', e.target.value);
                        }
                        e.target.value = '';
                      }}
                      className="input"
                    >
                      <option value="">Add skill...</option>
                      {availableSkills.filter(skill => !artifactForm.skills_tagged.includes(skill)).map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </form>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowArtifactForm(false);
                  setEditingArtifact(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleArtifactSubmit}
                className="btn btn-primary"
              >
                {editingArtifact ? 'Update Artifact' : 'Create Artifact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Form Modal */}
      {showPortfolioForm && (
        <div className="modal-overlay">
          <div className="modal max-w-2xl">
            <div className="modal-header">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPortfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
              </h2>
              <button
                onClick={() => {
                  setShowPortfolioForm(false);
                  setEditingPortfolio(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePortfolioSubmit} className="modal-body">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="Enter portfolio title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                    className="textarea"
                    placeholder="Describe your portfolio..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Artifacts
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {artifacts.map(artifact => (
                      <label key={artifact.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={portfolioForm.artifacts.includes(artifact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPortfolioForm(prev => ({
                                ...prev,
                                artifacts: [...prev.artifacts, artifact.id]
                              }));
                            } else {
                              setPortfolioForm(prev => ({
                                ...prev,
                                artifacts: prev.artifacts.filter(id => id !== artifact.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{artifact.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </form>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowPortfolioForm(false);
                  setEditingPortfolio(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handlePortfolioSubmit}
                className="btn btn-primary"
              >
                {editingPortfolio ? 'Update Portfolio' : 'Create Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEvidenceOfGrowth;
