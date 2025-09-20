import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Target,
  Users,
  Code,
  Bug,
  AlertCircle,
  X,
  Trophy,
  Search,
  Sparkles,
  Brain,
  Rocket
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notificationService';
import '../styles/enhanced-styles.css';
import '../styles/advanced-design-system.css';

// Helper function to safely convert string or array to array
const safeStringToArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').filter(s => s.trim());
  return [];
};

interface ReflectionEntry {
  id: number;
  title: string;
  content: string;
  reflection_type: 'learning' | 'challenge' | 'achievement' | 'future_goal' | 'collaboration' | 'coding_experience' | 'debugging_process';
  skills_developed: string[];
  challenges_faced: string[];
  future_goals: string[];
  created_at: string;
  updated_at: string;
  student_id: number;
}

const SuperEnhancedReflectionJournal: React.FC = () => {
  const { socket } = useSocket();
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReflection, setEditingReflection] = useState<ReflectionEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reflection_type: 'learning' as 'learning' | 'challenge' | 'achievement' | 'future_goal' | 'collaboration' | 'coding_experience' | 'debugging_process',
    skills_developed: [] as string[],
    challenges_faced: [] as string[],
    future_goals: [] as string[]
  });

  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML/CSS', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'Problem Solving',
    'Algorithm Design', 'Data Structures', 'Machine Learning', 'Web Development',
    'Mobile Development', 'UI/UX Design', 'Testing', 'Debugging', 'Code Review'
  ];

  const reflectionTypes = [
    { value: 'learning', label: 'Learning Experience', icon: BookOpen, color: 'blue' },
    { value: 'challenge', label: 'Challenge Overcome', icon: AlertCircle, color: 'orange' },
    { value: 'achievement', label: 'Achievement', icon: Trophy, color: 'green' },
    { value: 'future_goal', label: 'Future Goal', icon: Rocket, color: 'purple' },
    { value: 'collaboration', label: 'Collaboration', icon: Users, color: 'pink' },
    { value: 'coding_experience', label: 'Coding Experience', icon: Code, color: 'indigo' },
    { value: 'debugging_process', label: 'Debugging Process', icon: Bug, color: 'red' }
  ];

  // Filter and search functionality
  const filteredReflections = reflections.filter(reflection => {
    const matchesSearch = reflection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reflection.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reflection.skills_developed.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || reflection.reflection_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedReflections = [...filteredReflections].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.reflection_type.localeCompare(b.reflection_type);
      default:
        return 0;
    }
  });

  const fetchReflections = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/reflections');
      const reflectionsData = response.data || [];
      
      // Map backend data to frontend format
      const mappedReflections = reflectionsData.map((reflection: any) => ({
        ...reflection,
        content: reflection.what_learned || reflection.content || '',
        skills_developed: safeStringToArray(reflection.skills_developed),
        challenges_faced: safeStringToArray(reflection.challenges_faced),
        future_goals: safeStringToArray(reflection.future_goals),
        reflection_type: reflection.reflection_type || 'learning'
      }));
      
      setReflections(mappedReflections);
    } catch (error) {
      console.error('Error fetching reflections:', error);
      setReflections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReflection) {
        await apiService.put(`/reflections/${editingReflection.id}`, formData);
      } else {
        await apiService.post('/reflections', formData);
      }
      await fetchReflections();
      setShowForm(false);
      setEditingReflection(null);
      setFormData({
        title: '',
        content: '',
        reflection_type: 'learning',
        skills_developed: [],
        challenges_faced: [],
        future_goals: []
      });
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
      future_goals: reflection.future_goals
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      try {
        await apiService.delete(`/reflections/${id}`);
        await fetchReflections();
      } catch (error) {
        console.error('Error deleting reflection:', error);
      }
    }
  };

  const addToArray = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }));
  };

  const removeFromArray = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  useEffect(() => {
    fetchReflections();
    
    // Real-time updates
    if (socket) {
      socket.on('reflection_created', () => {
        fetchReflections();
        notificationService.emitRealtimeNotification(
          'reflection_created',
          'New Reflection Added',
          'A new reflection has been added to your journal'
        );
      });

      socket.on('reflection_updated', () => {
        fetchReflections();
      });

      socket.on('reflection_deleted', () => {
        fetchReflections();
      });


      socket.on('reflection_feedback', (data: any) => {
        notificationService.emitRealtimeNotification(
          'reflection_feedback',
          'New Reflection Feedback',
          data.message
        );
      });

      return () => {
        socket.off('reflection_created');
        socket.off('reflection_updated');
        socket.off('reflection_deleted');
        socket.off('reflection_feedback');
      };
    }
  }, [socket]);

  const getTypeIcon = (type: string) => {
    const typeConfig = reflectionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : BookOpen;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = reflectionTypes.find(t => t.value === type);
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

  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-16 h-16 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Reflections</h3>
          <p className="text-gray-600">Please wait while we fetch your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400/15 to-blue-600/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-pink-400/30 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-green-400/30 rounded-full animate-float" style={{animationDelay: '2.5s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        {/* Enhanced Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-8 animate-bounce-in">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            📖 Reflection Journal
          </h1>
          <p className="text-2xl text-gray-700 font-semibold mb-8">
            Track your learning journey and personal growth
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Updates Active
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              {reflections.length} Reflections
            </span>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Learning Journey at a Glance</h2>
            <p className="text-lg text-gray-600">Track your progress and celebrate your achievements</p>
          </div>
          <div className="reflection-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            <div className="card text-center group">
              <div className="card-body">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{reflections.length}</h3>
                <p className="text-gray-600 font-medium">Total Reflections</p>
              </div>
            </div>
            
            <div className="card text-center group">
              <div className="card-body">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {reflections.reduce((acc, r) => {
                    return acc + safeStringToArray(r.skills_developed).length;
                  }, 0)}
                </h3>
                <p className="text-gray-600 font-medium">Skills Developed</p>
              </div>
            </div>
            
            <div className="card text-center group">
              <div className="card-body">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {reflections.reduce((acc, r) => {
                    return acc + safeStringToArray(r.challenges_faced).length;
                  }, 0)}
                </h3>
                <p className="text-gray-600 font-medium">Challenges Overcome</p>
              </div>
            </div>
            
            <div className="card text-center group">
              <div className="card-body">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {reflections.reduce((acc, r) => {
                    return acc + safeStringToArray(r.future_goals).length;
                  }, 0)}
                </h3>
                <p className="text-gray-600 font-medium">Future Goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="card mb-12 animate-fade-in-up shadow-lg border border-gray-200">
          <div className="card-header bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-600" />
              Search & Filter Your Reflections
            </h2>
          </div>
          <div className="card-body p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Search reflections</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title, content, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-12 w-full h-12 text-base shadow-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Filter by type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input w-full h-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Types</option>
                    {reflectionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input w-full h-12 shadow-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="date">Latest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="type">By Type</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <span className="badge badge-primary text-sm px-4 py-2 font-medium">
                📊 {sortedReflections.length} reflections found
              </span>
              {searchTerm && (
                <span className="badge badge-gray text-sm px-4 py-2 font-medium flex items-center gap-2">
                  🔍 Search: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterType !== 'all' && (
                <span className="badge badge-gray text-sm px-4 py-2 font-medium flex items-center gap-2">
                  🏷️ Type: {reflectionTypes.find(t => t.value === filterType)?.label}
                  <button 
                    onClick={() => setFilterType('all')}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Filter Buttons */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Choose a reflection category to explore</h3>
          <div className="reflection-categories grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 px-4">
            {reflectionTypes.map((type, index) => {
              const IconComponent = type.icon;
              const isActive = filterType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`card text-center group transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isActive ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-body p-6">
                    <div className={`w-16 h-16 bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 leading-tight">{type.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Reflections Grid */}
        <div className="space-y-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Learning Reflections</h3>
            <p className="text-lg text-gray-600">Explore your personal growth and achievements</p>
          </div>
          
          <div className="reflection-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedReflections.map((reflection, index) => {
              const IconComponent = getTypeIcon(reflection.reflection_type);
              const typeColor = getTypeColor(reflection.reflection_type);
              
              return (
                <div
                  key={reflection.id}
                  className="reflection-card card group animate-fade-in-up hover:shadow-2xl transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 bg-gradient-to-br from-${typeColor}-500 to-${typeColor}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{reflection.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(reflection.created_at)}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeColor}-100 text-${typeColor}-800`}>
                              {reflectionTypes.find(t => t.value === reflection.reflection_type)?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(reflection)}
                          className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reflection.id)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                
                  <div className="card-body p-8">
                    <div className="prose max-w-none mb-8">
                      <div 
                        className="text-gray-700 leading-relaxed text-base bg-gray-50 p-6 rounded-xl border-l-4 border-blue-400"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(reflection.content) }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {reflection.skills_developed && reflection.skills_developed.length > 0 && (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                          <h4 className="flex items-center gap-3 text-lg font-semibold text-green-800 mb-4">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            Skills Developed
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {safeStringToArray(reflection.skills_developed).map((skill, idx) => (
                              <span key={idx} className="badge badge-success text-sm px-4 py-2 font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {reflection.challenges_faced && reflection.challenges_faced.length > 0 && (
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                          <h4 className="flex items-center gap-3 text-lg font-semibold text-orange-800 mb-4">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            Challenges Faced
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {safeStringToArray(reflection.challenges_faced).map((challenge, idx) => (
                              <span key={idx} className="badge badge-warning text-sm px-4 py-2 font-medium">
                                {challenge}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {reflection.future_goals && reflection.future_goals.length > 0 && (
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                          <h4 className="flex items-center gap-3 text-lg font-semibold text-purple-800 mb-4">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                              <Rocket className="w-5 h-5 text-white" />
                            </div>
                            Future Goals
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {safeStringToArray(reflection.future_goals).map((goal, idx) => (
                              <span key={idx} className="badge badge-secondary text-sm px-4 py-2 font-medium">
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced New Reflection Button */}
        <div className="text-center py-16 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Document Your Learning Journey?</h3>
            <p className="text-lg text-gray-600 mb-8">Capture your insights, challenges, and growth moments</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-xl group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              ✨ Create New Reflection
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="reflection-modal modal max-w-4xl">
            <div className="modal-header">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingReflection ? 'Edit Reflection' : 'Create New Reflection'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingReflection(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body p-8">
              <div className="reflection-form-grid grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="Enter reflection title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reflection Type *
                    </label>
                    <select
                      required
                      value={formData.reflection_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, reflection_type: e.target.value as any }))}
                      className="input"
                    >
                      {reflectionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="input resize-none"
                      placeholder="Describe your learning experience, challenges, insights..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can use **bold** and *italic* formatting
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills Developed
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills_developed.map((skill, idx) => (
                        <span key={idx} className="badge badge-success">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeFromArray('skills_developed', skill)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value && !formData.skills_developed.includes(e.target.value)) {
                          addToArray('skills_developed', e.target.value);
                        }
                        e.target.value = '';
                      }}
                      className="input"
                    >
                      <option value="">Add skill...</option>
                      {availableSkills.filter(skill => !formData.skills_developed.includes(skill)).map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Challenges Faced
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.challenges_faced.map((challenge, idx) => (
                        <span key={idx} className="badge badge-warning">
                          {challenge}
                          <button
                            type="button"
                            onClick={() => removeFromArray('challenges_faced', challenge)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.challenges_faced.includes(value)) {
                            addToArray('challenges_faced', value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="input"
                      placeholder="Type challenge and press Enter..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Future Goals
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.future_goals.map((goal, idx) => (
                        <span key={idx} className="badge badge-secondary">
                          {goal}
                          <button
                            type="button"
                            onClick={() => removeFromArray('future_goals', goal)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !formData.future_goals.includes(value)) {
                            addToArray('future_goals', value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="input"
                      placeholder="Type goal and press Enter..."
                    />
                  </div>
                </div>
              </div>
            </form>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReflection(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                {editingReflection ? 'Update Reflection' : 'Create Reflection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperEnhancedReflectionJournal;
