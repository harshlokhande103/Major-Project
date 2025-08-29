import { useState } from 'react'
import Navbar from './components/Navbar'
import MentorCard from './components/MentorCard'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const mentors = [
    {
      name: "Rahul Kumar",
      role: "Career Coach",
      company: "Google",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/male/1.jpg"
    },
    {
      name: "Priya Sharma",
      role: "Leadership Mentor",
      company: "Microsoft",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/female/1.jpg"
    },
    {
      name: "Amit Patel",
      role: "Tech Advisor",
      company: "Amazon",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/male/2.jpg"
    },
    {
      name: "Neha Verma",
      role: "Product Strategist",
      company: "Meta",
      imageUrl: "https://xsgames.co/randomusers/assets/avatars/female/2.jpg"
    }
  ];

  const openLogin = () => setView('login');
  const openRegister = () => setView('register');
  const openDashboard = () => {
    console.log('Opening dashboard');
    setView('dashboard');
  };
  const backHome = () => setView('home');
  
  // Track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Update login handler to set logged in state
  const handleLogin = (loggedInUser) => {
    setIsLoggedIn(true);
    setUser(loggedInUser || null);
    setView('dashboard');
  };
  
  // Update register handler to set logged in state
  const handleRegister = (registeredUser) => {
    setIsLoggedIn(true);
    setUser(registeredUser || null);
    setView('dashboard');
  };
  
  return (
    <div className="app-container">
      <Navbar 
        onSignIn={openLogin} 
        onRegister={openRegister} 
        onDashboard={openDashboard}
        isLoggedIn={isLoggedIn} 
      />
      {view === 'login' && <Login onClose={backHome} onLogin={handleLogin} />}
      {view === 'register' && <Register onClose={backHome} onRegister={handleRegister} />}
      {view === 'dashboard' && <Dashboard onClose={backHome} user={user} />}
      {view === 'home' && (
      <main className="hero">
        <section className="hero-left">
          <h1>
            <span className="muted">Your Gateway to</span><br />
            <span className="emph">Expert Mentorship</span>
          </h1>
          <p>
            & Professional Mentorship for your career and business.
          </p>
          <div className="cta-row">
            <button className="cta-primary" onClick={openLogin}>Get Started →</button>
            <div className="badge">100k+ <span className="stars">★★★★★</span> reviews</div>
            
          </div>
        </section>
        <aside className="hero-right">
          <div className="mentor-scroller">
            <div className="mentor-track">
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`a-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`b-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
            </div>
          </div>
          <div className="mentor-scroller">
            <div className="mentor-track reverse">
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`c-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
              {mentors.map((mentor, index) => (
                <MentorCard
                  key={`d-${index}`}
                  name={mentor.name}
                  role={mentor.role}
                  company={mentor.company}
                  imageUrl={mentor.imageUrl}
                />
              ))}
            </div>
          </div>
        </aside>
      </main>
      )}
    </div>
  )
}

export default App
