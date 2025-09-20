import React, { useState, useEffect } from 'react';
import { Plus, Upload, Tag, FileText, Code, Users, Target, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface PortfolioEvidence {
  id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  evidence_type: string;
  skills: Array<{
    name: string;
    confidence: number;
  }>;
  created_at: string;
}

const PortfolioEvidence: React.FC = () => {
  const [evidence, setEvidence] = useState<PortfolioEvidence[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_path: '',
    file_type: '',
    evidence_type: 'project',
    skills: [] as Array<{ skill_id: number; confidence_level: number }>
  });

  const evidenceTypes = [
    { value: 'before', label: 'Before Work', icon: '📝' },
    { value: 'after', label: 'After Work', icon: '✨' },
    { value: 'project', label: 'Project', icon: '🚀' },
    { value: 'code', label: 'Code Sample', icon: '💻' },
    { value: 'teamwork', label: 'Teamwork', icon: '👥' },
    { value: 'presentation', label: 'Presentation', icon: '📊' }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data for portfolio evidence
      const mockEvidence = [
        {
          id: 1,
          title: "React Todo App",
          description: "A fully functional todo application built with React and TypeScript",
          file_path: "/uploads/portfolio/todo-app.zip",
          file_type: "application/zip",
          evidence_type: "project",
          skills: [
            { name: "React", confidence: 85 },
            { name: "TypeScript", confidence: 75 },
            { name: "CSS", confidence: 80 }
          ],
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          title: "Database Design Project",
          description: "ERD and database schema for a student management system",
          file_path: "/uploads/portfolio/database-design.pdf",
          file_type: "application/pdf",
          evidence_type: "project",
          skills: [
            { name: "Database Design", confidence: 90 },
            { name: "SQL", confidence: 85 },
            { name: "ERD", confidence: 88 }
          ],
          created_at: "2024-01-10T14:20:00Z"
        }
      ];

      const mockSkills = [
        { id: 1, name: "React", category: "Frontend", description: "JavaScript library for building user interfaces" },
        { id: 2, name: "TypeScript", category: "Programming", description: "Typed superset of JavaScript" },
        { id: 3, name: "CSS", category: "Frontend", description: "Styling language for web pages" },
        { id: 4, name: "Database Design", category: "Backend", description: "Designing and structuring databases" },
        { id: 5, name: "SQL", category: "Backend", description: "Structured Query Language for databases" },
        { id: 6, name: "ERD", category: "Design", description: "Entity Relationship Diagrams" }
      ];

      setEvidence(mockEvidence);
      setSkills(mockSkills);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          student_id: user?.id
        }),
      });

      if (response.ok) {
        await fetchData();
        resetForm();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving portfolio evidence:', error);
      alert('Error saving portfolio evidence');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file_path: '',
      file_type: '',
      evidence_type: 'project',
      skills: []
    });
  };

  const addSkill = (skillId: number) => {
    if (!formData.skills.find(s => s.skill_id === skillId)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, { skill_id: skillId, confidence_level: 3 }]
      });
    }
  };

  const removeSkill = (skillId: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s.skill_id !== skillId)
    });
  };

  const updateSkillConfidence = (skillId: number, confidence: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.map(s => 
        s.skill_id === skillId ? { ...s, confidence_level: confidence } : s
      )
    });
  };

  const getEvidenceIcon = (type: string) => {
    const evidenceType = evidenceTypes.find(et => et.value === type);
    return evidenceType ? evidenceType.icon : '📄';
  };

  const getEvidenceLabel = (type: string) => {
    const evidenceType = evidenceTypes.find(et => et.value === type);
    return evidenceType ? evidenceType.label : type;
  };

  const filteredEvidence = evidence.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === 'all' || 
                        item.skills.some(skill => skill.name.toLowerCase().includes(selectedSkill.toLowerCase()));
    const matchesType = selectedType === 'all' || item.evidence_type === selectedType;
    
    return matchesSearch && matchesSkill && matchesType;
  });

  const getSkillCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'cognitive': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'communication': return 'bg-yellow-100 text-yellow-800';
      case 'meta': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 4) return 'text-green-600';
    if (confidence >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Portfolio Evidence
          </h2>
          <p className="text-gray-600 mt-1">
            Showcase your work and track your skill development
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Evidence
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Skills</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.name}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {evidenceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evidence Grid */}
      {filteredEvidence.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No evidence yet</h3>
          <p className="text-gray-600 mb-4">
            Start building your portfolio by adding evidence of your learning and growth
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Evidence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvidence.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getEvidenceIcon(item.evidence_type)}</span>
                  <span className="text-sm text-gray-500">{getEvidenceLabel(item.evidence_type)}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {item.description}
                </p>
              )}

              {item.file_path && (
                <div className="mb-4">
                  <a
                    href={item.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View File
                  </a>
                </div>
              )}

              {item.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Skills Demonstrated
                  </h4>
                  <div className="space-y-2">
                    {item.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{skill.name}</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(skill.confidence)}`}>
                          {skill.confidence}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Portfolio Evidence</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React Todo App Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence Type *
                  </label>
                  <select
                    required
                    value={formData.evidence_type}
                    onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {evidenceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your work and what you learned..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File URL
                  </label>
                  <input
                    type="url"
                    value={formData.file_path}
                    onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username/repo or file URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Demonstrated
                  </label>
                  
                  {/* Selected Skills */}
                  {formData.skills.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {formData.skills.map((skillData) => {
                        const skill = skills.find(s => s.id === skillData.skill_id);
                        return skill ? (
                          <div key={skill.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded text-xs ${getSkillCategoryColor(skill.category)}`}>
                                {skill.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Confidence:</span>
                              <select
                                value={skillData.confidence_level}
                                onChange={(e) => updateSkillConfidence(skill.id, parseInt(e.target.value))}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Add Skills */}
                  <select
                    onChange={(e) => {
                      const skillId = parseInt(e.target.value);
                      if (skillId) {
                        addSkill(skillId);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a skill to add...</option>
                    {skills
                      .filter(skill => !formData.skills.find(s => s.skill_id === skill.id))
                      .map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name} ({skill.category})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Evidence
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioEvidence;
