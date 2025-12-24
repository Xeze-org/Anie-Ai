import { Link } from 'react-router-dom'
import { Mail, Github, Sparkles, ArrowRight, Brain, Zap } from 'lucide-react'
import './Home.css'

export function Home() {
  return (
    <div className="home-container">
      {/* Animated background */}
      <div className="home-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>AstralElite</span>
        </div>
        
        <h1 className="hero-title">
          <span className="gradient-text">Computer Science</span>
          <br />
          Open Source Innovative Project
        </h1>
        
        <p className="hero-subtitle">
          Building innovative open source projects. Collaborate, contribute, and create together.
        </p>

        <div className="hero-cta">
          <Link to="/chat" className="btn btn-primary">
            <Zap size={20} />
            Calculate Grades
          </Link>
        </div>

      </header>


      {/* Projects Section */}
      <section className="projects-section">
        <div className="section-header">
          <h2 className="section-title">Our Projects</h2>
          <p className="section-subtitle">Powerful tools built for academic excellence</p>
        </div>

        <div className="projects-grid">
          <div className="project-card project-anie">
            <div className="project-glow" />
            <div className="project-content">
              <div className="project-icon-wrapper">
                <Brain size={32} />
              </div>
              <div className="project-info">
                <h3>Meet Anie</h3>
                <p>Your AI-powered academic advisor. Get personalized guidance on courses, grades, and career paths.</p>
                <div className="project-tags">
                  <span className="tag">AI Assistant</span>
                  <span className="tag">BITS Curriculum</span>
                  <span className="tag">24/7 Available</span>
                </div>
              </div>
              <Link to="/chat" className="project-cta">
                <span>Talk to Anie</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          <div className="project-card project-calculator">
            <div className="project-glow" />
            <div className="project-content">
              <div className="project-icon-wrapper">
                <Zap size={32} />
              </div>
              <div className="project-info">
                <h3>Grade Calculator</h3>
                <p>Instantly calculate your grades with precision. Supports all BITS evaluation components.</p>
                <div className="project-tags">
                  <span className="tag">Instant Results</span>
                  <span className="tag">SGPA/CGPA</span>
                  <span className="tag">All Components</span>
                </div>
              </div>
              <Link to="/chat" className="project-cta">
                <span>Calculate Now</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collaborate Section */}
      <section className="collaborate-section">
        <h2 className="collaborate-title">Collaborate With Us</h2>
        <p className="collaborate-subtitle">Join our innovation ecosystem</p>

        <div className="collaborate-cards">
          <a href="https://git.astralelite.org" target="_blank" rel="noopener noreferrer" className="collaborate-card">
            <div className="collaborate-icon github">
              <Github size={32} />
            </div>
            <div className="collaborate-info">
              <h3>Git.AstralElite.org</h3>
              <p>Self-hosted GitHub • Open Source</p>
            </div>
            <ArrowRight size={20} className="collaborate-arrow" />
          </a>

          <a href="mailto:hi@astralelite.org" className="collaborate-card">
            <div className="collaborate-icon email">
              <Mail size={32} />
            </div>
            <div className="collaborate-info">
              <h3>Direct Contact</h3>
              <p>hi@astralelite.org</p>
            </div>
            <ArrowRight size={20} className="collaborate-arrow" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p className="footer-copy">
          © 2025 AstralElite
        </p>
      </footer>
    </div>
  )
}

