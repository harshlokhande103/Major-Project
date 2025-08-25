import { useState } from 'react'
import Navbar from './components/Navbar'
import MentorCard from './components/MentorCard'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const [view, setView] = useState('home');
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
    }
  ];

  const openLogin = () => setView('login');
  const openRegister = () => setView('register');
  const backHome = () => setView('home');

  return (
    <div className="app-container">
      <Navbar onSignIn={openLogin} onRegister={openRegister} />
      {view === 'login' && <Login onClose={backHome} />}
      {view === 'register' && <Register onClose={backHome} />}
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
            <button className="cta-primary">Start My Page →</button>
            <div className="badge">100k+ <span className="stars">★★★★★</span> reviews</div>
            <div className="badge">1mn+ professionals</div>
          </div>
        </section>
        <aside className="hero-right">
          <div className="mentor-grid">
            {mentors.map((mentor, index) => (
              <MentorCard
                key={index}
                name={mentor.name}
                role={mentor.role}
                company={mentor.company}
                imageUrl={mentor.imageUrl}
              />
            ))}
          </div>
        </aside>
      </main>
      )}
    </div>
  )
}

export default App
