import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiCheck, FiX } from 'react-icons/fi';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import './MentorApplicationForm.css';

const expertiseOptions = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'UI/UX Design',
  'Product Management',
  'Digital Marketing',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Artificial Intelligence',
  'Machine Learning',
  'Blockchain',
  'Game Development',
  'Technical Writing'
];

const MentorApplicationForm = ({ userId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    bio: '',
    experience: '',
    expertise: [],
    linkedin: '',
    website: '',
    skills: '',
    status: 'pending'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.profession) errors.profession = 'Profession is required';
    if (!formData.experience) errors.experience = 'Experience is required';
    if (!formData.bio) errors.bio = 'Bio is required';
    if (formData.expertise.length === 0) errors.expertise = 'Please select at least one area of expertise';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleExpertiseChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      expertise: checked
        ? [...prevData.expertise, value]
        : prevData.expertise.filter(exp => exp !== value)
    }));
    // Clear expertise error when user selects at least one
    if (formErrors.expertise && (checked || formData.expertise.length > 1)) {
      setFormErrors({
        ...formErrors,
        expertise: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/mentor-applications', { 
        ...formData, 
        userId: userId || 'temp-user-id',
        appliedDate: new Date().toISOString()
      });
      
      setSubmitStatus({
        success: true,
        message: 'Application submitted successfully! Our team will review your application soon.'
      });
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        profession: '',
        bio: '',
        experience: '',
        expertise: [],
        linkedin: '',
        github: '',
        website: '',
        skills: '',
        status: 'pending'
      });
      
      // Call success callback if provided
      if (onSuccess) onSuccess(response.data);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to submit application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mentor-application">
      <div className="mentor-container">
        <div className="mentor-header">
          <h1>Become a Mentor</h1>
          <p>Share your knowledge and help others grow in their tech journey</p>
        </div>

        {submitStatus.message && (
          <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`}>
            {submitStatus.success ? (
              <FiCheck className="icon" />
            ) : (
              <FiX className="icon" />
            )}
            <p>{submitStatus.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mentor-form">
          <div className="form-progress">
            <div className="progress-header">
              <h2>Mentor Application</h2>
              <span>Step 1 of 2</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="form-content">
            <div className="form-section">
              <h3 className="section-title">
                <FiUser />
                Personal Information
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">
                    Full Name
                  </label>
                  <div className="form-control">
                    <FiUser className="form-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input ${formErrors.name ? 'error' : ''}`}
                      placeholder="John Doe"
                    />
                  </div>
                  {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label required">
                    Email
                  </label>
                  <div className="form-control">
                    <FiMail className="form-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label required">
                    Phone Number
                  </label>
                  <div className="form-control">
                    <FiPhone className="form-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`form-input ${formErrors.phone ? 'error' : ''}`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="profession" className="form-label required">
                    Current Profession
                  </label>
                  <div className="form-control">
                    <FiBriefcase className="form-icon" />
                    <input
                      type="text"
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className={`form-input ${formErrors.profession ? 'error' : ''}`}
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                  {formErrors.profession && <p className="error-message">{formErrors.profession}</p>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <FiBriefcase />
                Professional Background
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="experience" className="form-label required">
                    Years of Experience
                  </label>
                  <div className="form-control">
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`form-select ${formErrors.experience ? 'error' : ''}`}
                    >
                      <option value="">Select years of experience</option>
                      <option value="0-1">Less than 1 year</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-7">5-7 years</option>
                      <option value="7-10">7-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  {formErrors.experience && <p className="error-message">{formErrors.experience}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="skills" className="form-label required">
                    Technical Skills
                  </label>
                  <div className="form-control">
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g., React, Node.js, Python, UI/UX Design"
                    />
                  </div>
                  <p className="help-text">Separate skills with commas</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label required">
                  Professional Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className={`form-textarea ${formErrors.bio ? 'error' : ''}`}
                  placeholder="Tell us about your professional journey, expertise, and why you want to be a mentor..."
                ></textarea>
                {formErrors.bio && <p className="error-message">{formErrors.bio}</p>}
                <p className="help-text">Minimum 100 characters</p>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                Areas of Expertise <span className="required">*</span>
              </h3>
              <p className="help-text">
                Select all areas where you can provide mentorship (select at least one):
              </p>
              
              <div className="expertise-grid">
                {expertiseOptions.map((expertise) => (
                  <div key={expertise} className="expertise-item">
                    <input
                      type="checkbox"
                      id={`expertise-${expertise.toLowerCase().replace(/\s+/g, '-')}`}
                      name="expertise"
                      value={expertise}
                      onChange={handleExpertiseChange}
                      checked={formData.expertise.includes(expertise)}
                      className="expertise-checkbox"
                    />
                    <label 
                      htmlFor={`expertise-${expertise.toLowerCase().replace(/\s+/g, '-')}`}
                      className="expertise-label"
                    >
                      {expertise}
                    </label>
                  </div>
                ))}
              </div>
              {formErrors.expertise && <p className="error-message">{formErrors.expertise}</p>}
            </div>

            <div className="form-section">
              <h3 className="section-title">
                Online Presence (Optional but Recommended)
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="linkedin" className="form-label">
                    LinkedIn Profile
                  </label>
                  <div className="form-control">
                    <FaLinkedin className="form-icon" style={{ color: '#0077B5' }} />
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>



                <div className="form-group">
                  <label htmlFor="website" className="form-label">
                    Personal Website/Blog
                  </label>
                  <div className="form-control">
                    <FaGlobe className="form-icon" style={{ color: '#4f46e5' }} />
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary ${isSubmitting ? 'disabled' : ''}`}
              >
                {isSubmitting ? (
                  <span>
                    <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Application'}
              </button>
            </div>
          </div>
        </form>

        <div className="footer">
          <p>By submitting this application, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
          <p className="mt-2">We'll review your application and get back to you within 3-5 business days.</p>
        </div>
      </div>
    </div>
  );
};

// Add PropTypes for better development experience
MentorApplicationForm.propTypes = {
  userId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default MentorApplicationForm;