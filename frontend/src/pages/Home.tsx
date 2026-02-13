import { Link } from 'react-router-dom'
import { Mail, Github, Sparkles, ArrowRight, Zap, FileText } from 'lucide-react'
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
          <span>Xeze</span>
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
          <Link to="/job-analyzer" className="btn btn-secondary">
            <FileText size={20} />
            Analyze Job Document
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

          <div className="project-card project-analyzer">
            <div className="project-glow" />
            <div className="project-content">
              <div className="project-icon-wrapper">
                <FileText size={32} />
              </div>
              <div className="project-info">
                <h3>Job Document Analyzer</h3>
                <p>Analyze job descriptions and contracts. Detect scams, risky clauses, and optimize resumes.</p>
                <div className="project-tags">
                  <span className="tag">Scam Detection</span>
                  <span className="tag">Contract Analysis</span>
                  <span className="tag">Resume Check</span>
                </div>
              </div>
              <Link to="/job-analyzer" className="project-cta">
                <span>Analyze Docs</span>
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
          <a href="https://github.com/Xeze-org" target="_blank" rel="noopener noreferrer" className="collaborate-card">
            <div className="collaborate-icon github">
              <Github size={32} />
            </div>
            <div className="collaborate-info">
              <h3>Github - Xeze-org</h3>
              <p>Open Source</p>
            </div>
            <ArrowRight size={20} className="collaborate-arrow" />
          </a>

          <a href="mailto:admin@xeze.org" className="collaborate-card">
            <div className="collaborate-icon email">
              <Mail size={32} />
            </div>
            <div className="collaborate-info">
              <h3>Direct Contact</h3>
              <p>admin@xeze.org</p>
            </div>
            <ArrowRight size={20} className="collaborate-arrow" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p className="footer-copy">
          © 2025 Xeze • Owner: <a href="https://github.com/root404onion" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>root404onion</a>
        </p>
      </footer>
    </div>
  )
}

