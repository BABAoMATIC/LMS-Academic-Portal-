import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student' as 'student' | 'teacher',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth.weakPassword'));
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (error: any) {
      console.log('Registration error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(t('auth.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div
        className="floating-bg-1"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }}
      />
      <div
        className="floating-bg-2"
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
              borderRadius: '20px',
              marginBottom: '20px',
              boxShadow: '0 10px 30px rgba(107, 70, 193, 0.3)',
              position: 'relative',
            }}
          >
            <GraduationCap size={36} color="white" />
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                background: 'linear-gradient(135deg, #00FF88 0%, #00D4AA 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={12} color="white" />
            </div>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('auth.signUp')}
          </h1>
          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: '16px',
              lineHeight: 1.5,
            }}
          >
            {t('auth.createAccount')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: 'white',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: 'white',
                borderRadius: '50%',
              }}
            />
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('common.name')}
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  zIndex: 2,
                }}
              />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('auth.namePlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6B46C1';
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('common.email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  zIndex: 2,
                }}
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('auth.emailPlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6B46C1';
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="phone"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('common.phone')}
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  zIndex: 2,
                }}
              />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('auth.phonePlaceholder')}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6B46C1';
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="role"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('common.role')}
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6B46C1';
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="student">{t('common.student')}</option>
                <option value="teacher">{t('common.teacher')}</option>
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#999',
                }}
              >
                ▼
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('common.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  zIndex: 2,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('auth.passwordPlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 48px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6B46C1';
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6B46C1';
                  e.currentTarget.style.background = 'rgba(107, 70, 193, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '32px' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1a1a1a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('auth.confirmPassword')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  zIndex: 2,
                }}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                required
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 48px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  color: '#1a1a1a',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6B46C1';
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6B46C1';
                  e.currentTarget.style.background = 'rgba(107, 70, 193, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(107, 70, 193, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(107, 70, 193, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 70, 193, 0.3)';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <LoadingSpinner size="sm" color="white" />
                {t('common.loading')}
              </div>
            ) : (
              t('auth.signUp')
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: '15px',
            }}
          >
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              style={{
                color: '#6B46C1',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#9F7AEA';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6B46C1';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
