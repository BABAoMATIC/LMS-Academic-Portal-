import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, BookOpen, Calendar, Award, Edit3 } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  join_date: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  education?: string;
  interests?: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockProfile: UserProfile = {
        id: user?.id || 1,
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        role: user?.role || 'student',
        join_date: '2023-09-01',
        bio: 'Passionate student with a love for learning and technology. Always eager to explore new concepts and challenge myself academically.',
        phone: '+1 (555) 123-4567',
        address: '123 Education Street, Learning City, LC 12345',
        education: 'Bachelor of Science in Computer Science',
        interests: ['Programming', 'Mathematics', 'Physics', 'Literature', 'Music'],
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        twitter: 'https://twitter.com/johndoe',
        website: 'https://johndoe.dev'
      };
      
      setProfile(mockProfile);
      setEditForm(mockProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, this would make an API call to update the profile
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditing(false);
      // Show success message
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm(profile || {});
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="text-center">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={fetchProfile}
            className="action-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="no-data-container">
        <div className="text-center">
          <div className="no-data-icon">👤</div>
          <h2 className="no-data-title">Profile Not Found</h2>
          <p className="no-data-message">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            getInitials(profile.name)
          )}
        </div>
        
        <h1 className="profile-name">{profile.name}</h1>
        <p className="profile-email">{profile.email}</p>
        <span className="profile-role">
          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
        </span>
        
        <div className="mt-6">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="profile-edit-button"
          >
            <Edit3 className="edit-icon" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="profile-sections">
        {/* Personal Information */}
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          
          {isEditing ? (
            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="form-input"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-4">
                <button onClick={handleSave} className="form-button">
                  Save Changes
                </button>
                <button onClick={handleCancel} className="quiz-button secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{profile.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Academic Information */}
        <div className="profile-section">
          <h2 className="section-title">Academic Information</h2>
          
          {isEditing ? (
            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <input
                  type="text"
                  value={editForm.education || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="form-input"
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="font-medium">{profile.education || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="font-medium">{profile.bio || 'No bio provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="profile-section">
          <h2 className="section-title">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{new Date(profile.join_date).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">Interests</h2>
            
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="profile-section">
          <h2 className="section-title">Social Links</h2>
          
          {isEditing ? (
            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={editForm.linkedin || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">GitHub</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={editForm.github || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Twitter</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={editForm.twitter || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Portfolio Website</label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.linkedin && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LinkedIn</p>
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              
              {profile.github && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">GH</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GitHub</p>
                    <a 
                      href={profile.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-gray-700"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              
              {profile.twitter && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Twitter</p>
                    <a 
                      href={profile.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-400 hover:text-blue-600"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-800"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              )}
              
              {!profile.linkedin && !profile.github && !profile.twitter && !profile.website && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No social links added yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Edit Profile" to add your social media links.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
