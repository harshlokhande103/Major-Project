import React, { useState, useEffect } from 'react';

const Dashboard = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('upcoming');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([
     {
       id: 1,
       message: 'New session request from Neha Verma',
       time: '2 hours ago',
       read: false
     },
     {
       id: 2,
       message: 'Payment received for Resume Review session',
       time: '1 day ago',
       read: true
     },
     {
       id: 3,
       message: 'Your profile has 50 new views this week',
       time: '2 days ago',
       read: true
     }
   ]);
  
  const displayName = user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : (user?.email || 'User');
  const initials = (user?.firstName || user?.email || 'U').slice(0,1).toUpperCase() + (user?.lastName ? user.lastName.slice(0,1).toUpperCase() : '');

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || 'Upload failed');
        return;
      }
      setProfileImage(data.profileImage || '');
    } catch (err) {
      alert('Network error');
    } finally {
      setUploading(false);
    }
  };
 
  // Mock data
  const stats = {
    totalSessions: 24,
    upcomingSessions: 3,
    totalEarnings: '₹12,500',
    profileViews: 152,
    conversionRate: '68%'
  };
  
  const upcomingSessions = [
    {
      id: 1,
      title: 'Career Guidance Session',
      client: 'Amit Patel',
      time: 'Today, 3:00 PM',
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Resume Review',
      client: 'Priya Sharma',
      time: 'Tomorrow, 11:00 AM',
      status: 'confirmed'
    },
    {
      id: 3,
      title: 'Interview Preparation',
      client: 'Rahul Kumar',
      time: '23 Oct, 2:00 PM',
      status: 'pending'
    }
  ];
  
  const pastSessions = [
    {
      id: 4,
      title: 'Resume Review Session',
      client: 'Vikram Singh',
      time: '15 Oct, 2:00 PM',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Career Transition Guidance',
      client: 'Ananya Desai',
      time: '10 Oct, 4:30 PM',
      status: 'completed'
    },
    {
      id: 6,
      title: 'Mock Interview',
      client: 'Rajesh Khanna',
      time: '5 Oct, 11:00 AM',
      status: 'completed'
    },
    {
      id: 101,
      title: 'Career Path Planning',
      client: 'Robert Chen',
      time: '2 Oct, 3:30 PM',
      status: 'completed'
    },
    {
      id: 102,
      title: 'Salary Negotiation',
      client: 'Lisa Wong',
      time: '28 Sep, 11:00 AM',
      status: 'completed'
    }
  ];
  
  const cancelledSessions = [
    {
      id: 7,
      title: 'LinkedIn Profile Review',
      client: 'Meera Joshi',
      time: '18 Oct, 5:00 PM',
      status: 'cancelled',
      reason: 'Scheduling conflict'
    },
    {
      id: 8,
      title: 'Job Search Strategy',
      client: 'Karan Malhotra',
      time: '12 Oct, 1:00 PM',
      status: 'cancelled',
      reason: 'Client requested reschedule'
    },
    {
      id: 201,
      title: 'Resume Workshop',
      client: 'Thomas Wilson',
      time: '8 Oct, 9:00 AM',
      status: 'cancelled',
      reason: 'Scheduling conflict'
    },
    {
      id: 202,
      title: 'Career Change Consultation',
      client: 'Amanda Garcia',
      time: '5 Oct, 4:30 PM',
      status: 'cancelled',
      reason: 'Personal emergency'
    }
  ];
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };
  
  useEffect(() => {
    // Trigger stats animation after component mounts
    setTimeout(() => setAnimateStats(true), 300);
  }, []);
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <>
            <div className="welcome-banner">
              <div className="welcome-text">
                <h2>Welcome back, {displayName}!</h2>
                <p>Signed in as {user?.email || '—'}</p>
                <p>Here's what's happening with your mentoring business today.</p>
              </div>
              <div className="quick-actions">
                <button className="action-btn primary">Create Service</button>
                <button className="action-btn secondary">Share Profile</button>
              </div>
            </div>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total Sessions</h3>
                <p className="stat-value">{stats.totalSessions}</p>
                <span className="stat-trend positive">↑ 12% from last month</span>
              </div>
              <div className="stat-card">
                <h3>Upcoming Sessions</h3>
                <p className="stat-value">{stats.upcomingSessions}</p>
                <span className="stat-trend">Next: Today at 3:00 PM</span>
              </div>
              <div className="stat-card">
                <h3>Total Earnings</h3>
                <p className="stat-value">{stats.totalEarnings}</p>
                <span className="stat-trend positive">↑ 8% from last month</span>
              </div>
              <div className="stat-card">
                <h3>Profile Views</h3>
                <p className="stat-value">{stats.profileViews}</p>
                <span className="stat-trend positive">↑ 24% from last month</span>
              </div>
            </div>
            
            <div className="dashboard-sections">
              <div className="section upcoming-sessions">
                <div className="section-header">
                  <h2>Upcoming Sessions</h2>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="session-list">
                  {upcomingSessions.map(session => (
                    <div className="session-card" key={session.id}>
                      <div className="session-info">
                        <div className="session-status-indicator" data-status={session.status}></div>
                        <h3>{session.title}</h3>
                        <p>With {session.client}</p>
                        <p className="session-time">{session.time}</p>
                      </div>
                      <div className="session-actions">
                        <button className="join-btn">Join</button>
                        <button className="reschedule-btn">Reschedule</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="section performance">
                <div className="section-header">
                  <h2>Performance</h2>
                </div>
                <div className="performance-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">👁️</div>
                    <div className="metric-details">
                      <h3>Profile Views</h3>
                      <p>{stats.profileViews} views this month</p>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">💹</div>
                    <div className="metric-details">
                      <h3>Conversion Rate</h3>
                      <p>{stats.conversionRate} booking rate</p>
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon">⭐</div>
                    <div className="metric-details">
                      <h3>Rating</h3>
                      <p>4.9/5 from 18 reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'sessions':
        const getSessionsToDisplay = () => {
          switch(sessionFilter) {
            case 'past':
              return pastSessions;
            case 'cancelled':
              return cancelledSessions;
            case 'upcoming':
            default:
              return upcomingSessions;
          }
        };
        
        return (
          <div className="sessions-tab">
            <h2>Manage Your Sessions</h2>
            <div className="sessions-filter">
              <button 
                className={`filter-btn ${sessionFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setSessionFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-btn ${sessionFilter === 'past' ? 'active' : ''}`}
                onClick={() => setSessionFilter('past')}
              >
                Past
              </button>
              <button 
                className={`filter-btn ${sessionFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setSessionFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
            <div className="session-list detailed">
              {getSessionsToDisplay().map(session => (
                <div 
                  className="session-card detailed" 
                  key={session.id}
                  onClick={() => console.log(`Session ${session.id} clicked:`, session)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="session-date-badge">
                    <div className="date-month">{session.time.split(' ')[1].replace(',', '')}</div>
                    <div className="date-day">{session.time.split(' ')[0]}</div>
                  </div>
                  <div className="session-info">
                    <h3>{session.title}</h3>
                    <p>Client: {session.client}</p>
                    <p className="session-time">{session.time}</p>
                    <div className="session-tags">
                      <span className={`tag ${session.status}`}>{session.status}</span>
                      <span className="tag">45 min</span>
                      {session.reason && <span className="tag reason">{session.reason}</span>}
                    </div>
                  </div>
                  <div className="session-actions vertical">
                    {sessionFilter === 'upcoming' && (
                      <>
                        <button className="join-btn">Join Session</button>
                        <button className="reschedule-btn">Reschedule</button>
                        <button className="cancel-btn">Cancel</button>
                      </>
                    )}
                    {sessionFilter === 'past' && (
                      <>
                        <button className="view-notes-btn">View Notes</button>
                        <button className="feedback-btn">Feedback</button>
                      </>
                    )}
                    {sessionFilter === 'cancelled' && (
                      <button className="reschedule-btn">Reschedule</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'earnings':
        return (
          <div className="earnings-tab">
            <h2>Your Earnings</h2>
            <div className="earnings-summary">
              <div className="summary-card">
                <h3>Total Earnings</h3>
                <p className="amount">₹12,500</p>
              </div>
              <div className="summary-card">
                <h3>This Month</h3>
                <p className="amount">₹4,200</p>
              </div>
            </div>
            
            <div className="earnings-chart">
              <h3>Monthly Earnings</h3>
              <div className="chart-placeholder">
                {/* In a real app, you would use a chart library like Chart.js or Recharts */}
                <div className="mock-chart">
                  <div className="chart-bar" style={{height: '60%'}}><span>Jun</span></div>
                  <div className="chart-bar" style={{height: '75%'}}><span>Jul</span></div>
                  <div className="chart-bar" style={{height: '45%'}}><span>Aug</span></div>
                  <div className="chart-bar" style={{height: '90%'}}><span>Sep</span></div>
                  <div className="chart-bar" style={{height: '65%'}}><span>Oct</span></div>
                </div>
              </div>
            </div>
            
            <div className="transactions">
              <h3>Recent Transactions</h3>
              <div className="transaction-list">
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Resume Review Session</h4>
                    <p>Oct 15, 2023</p>
                  </div>
                  <div className="transaction-amount positive">+₹1,500</div>
                </div>
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Career Guidance Session</h4>
                    <p>Oct 12, 2023</p>
                  </div>
                  <div className="transaction-amount positive">+₹2,000</div>
                </div>
                <div className="transaction-item">
                  <div className="transaction-info">
                    <h4>Platform Fee</h4>
                    <p>Oct 12, 2023</p>
                  </div>
                  <div className="transaction-amount negative">-₹200</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-tab">
            <h2>Account Settings</h2>
            
            <div className="settings-section">
              <h3>Profile Information</h3>
              <div className="profile-edit">
                <div className="profile-image">
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="avatar-large" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div className="avatar-large">{initials || 'U'}</div>
                  )}
                  <label className="change-avatar-btn" htmlFor="avatar-input">{uploading ? 'Uploading...' : 'Change Photo'}</label>
                  <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={displayName} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" defaultValue={user?.email || ''} />
                  </div>
                  <div className="form-group">
                    <label>Professional Title</label>
                    <input type="text" defaultValue="Career Coach & Mentor" />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea defaultValue="Experienced career coach with 10+ years helping professionals achieve their career goals."></textarea>
                  </div>
                  <div className="form-group">
                    <label>Expertise</label>
                    <div className="tags-input">
                      <span className="tag">Career Guidance</span>
                      <span className="tag">Resume Review</span>
                      <span className="tag">Interview Prep</span>
                      <input type="text" placeholder="Add expertise..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Services & Pricing</h3>
              <div className="services-list">
                <div className="service-item">
                  <div className="service-info">
                    <h4>1:1 Career Consultation</h4>
                    <p>45 minutes • ₹2,000</p>
                  </div>
                  <div className="service-actions">
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </div>
                </div>
                <div className="service-item">
                  <div className="service-info">
                    <h4>Resume Review & Feedback</h4>
                    <p>30 minutes • ₹1,500</p>
                  </div>
                  <div className="service-actions">
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </div>
                </div>
                <button className="add-service-btn">+ Add New Service</button>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Availability</h3>
              <div className="availability-settings">
                <div className="weekday-selector">
                  <button className="day-btn active">Mon</button>
                  <button className="day-btn active">Tue</button>
                  <button className="day-btn active">Wed</button>
                  <button className="day-btn active">Thu</button>
                  <button className="day-btn active">Fri</button>
                  <button className="day-btn">Sat</button>
                  <button className="day-btn">Sun</button>
                </div>
                <div className="time-slots">
                  <div className="time-slot">
                    <span>10:00 AM - 12:00 PM</span>
                    <button className="remove-slot">×</button>
                  </div>
                  <div className="time-slot">
                    <span>2:00 PM - 5:00 PM</span>
                    <button className="remove-slot">×</button>
                  </div>
                  <button className="add-slot-btn">+ Add Time Slot</button>
                </div>
              </div>
            </div>
            
            <button className="save-settings-btn">Save Changes</button>
          </div>
        );
      case 'profile':
        return (
          <div className="profile-tab">
            <h2>My Profile</h2>
            <div className="profile-preview">
              <div className="profile-header">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="profile-avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="profile-avatar">{initials || 'U'}</div>
                )}
                <div className="profile-title">
                  <h3>{displayName}</h3>
                  <p>{user?.email || '—'}</p>
                </div>
              </div>
              <div className="profile-bio">
                <h3>About Me</h3>
                <p>Experienced career coach with 10+ years helping professionals achieve their career goals.</p>
              </div>
              <div className="profile-expertise">
                <h3>Areas of Expertise</h3>
                <div className="expertise-tags">
                  <span className="tag">Career Guidance</span>
                  <span className="tag">Resume Review</span>
                  <span className="tag">Interview Prep</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={() => setActiveTab('settings')}>Edit Profile</button>
                <button className="view-public-btn">View Public Profile</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Clarity Call</h2>
        </div>
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="menu-icon">🏠</span>
            <span>Home</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            <span className="menu-icon">📅</span>
            <span>Sessions</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <span className="menu-icon">💰</span>
            <span>Earnings</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="menu-icon">⚙️</span>
            <span>Settings</span>
          </div>
          {/* Analytics module removed as requested */}
          <div 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="menu-icon">👤</span>
            <span>My Profile</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="header-actions">
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              <span className="notification-badge">2</span>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <h3>Notifications</h3>
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                      >
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
              )}
            </div>
            <div className="user-profile">
              <span className="user-name">{displayName}</span>
              {profileImage ? (
                <img src={profileImage} alt="Avatar" className="user-avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="user-avatar">{initials || 'U'}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </div>
      
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default Dashboard;