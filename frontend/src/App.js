import React, { useState } from 'react';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">
            <h2>🚀 Hackaton Conflux</h2>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              <li><a href="#home" className="nav-link">Home</a></li>
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#about" className="nav-link">About</a></li>
              <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>
          </nav>

          <div className="nav-actions">
            <button className="btn btn-primary">Get Started</button>
            <button className="menu-toggle" onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Build the Future with 
                <span className="gradient-text"> Conflux Blockchain</span>
              </h1>
              <p className="hero-description">
                Join us for the Code Without Borders - Virtual SummerHackfest 2025. 
                Create innovative Web3 solutions using Conflux's powerful blockchain technology.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-large">Start Building</button>
                <button className="btn btn-secondary btn-large">Learn More</button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <h3>$10,000+</h3>
                  <p>Prize Pool</p>
                </div>
                <div className="stat">
                  <h3>4 Weeks</h3>
                  <p>Duration</p>
                </div>
                <div className="stat">
                  <h3>100%</h3>
                  <p>Virtual</p>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="blockchain-animation">
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
                <div className="block"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Conflux Blockchain Features</h2>
            <p>Leverage the power of Conflux's cutting-edge technology</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Tree-Graph Consensus</h3>
              <p className="feature-description">High throughput meets security with our innovative consensus mechanism</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💸</div>
              <h3 className="feature-title">Gas Sponsorship</h3>
              <p className="feature-description">Seamless user onboarding with gasless transactions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">Dual-Space Architecture</h3>
              <p className="feature-description">Native EVM compatibility for developers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">Cross-Chain Interoperability</h3>
              <p className="feature-description">Connect and build across ecosystems</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About the Hackathon</h2>
              <p>
                Code Without Borders - Virtual SummerHackfest 2025 is a 4-week journey of building, 
                learning, and global collaboration. Join developers and entrepreneurs from around the 
                globe to push the boundaries of blockchain innovation with the Conflux Network.
              </p>
              <div className="hackathon-details">
                <div className="detail-item">
                  <strong>Event:</strong> Code Without Borders - Virtual SummerHackfest 2025
                </div>
                <div className="detail-item">
                  <strong>Duration:</strong> August 18 - September 22, 2025
                </div>
                <div className="detail-item">
                  <strong>Prize Pool:</strong> $10,000+ (5 winning projects × $2,000 each)
                </div>
                <div className="detail-item">
                  <strong>Location:</strong> 100% Virtual
                </div>
              </div>
            </div>
            <div className="sponsors">
              <h3>Co-Sponsors</h3>
              <div className="sponsors-grid">
                <div className="sponsor">dForce</div>
                <div className="sponsor">SHUI Finance</div>
                <div className="sponsor">GinsengSwap</div>
                <div className="sponsor">Meson.fi</div>
                <div className="sponsor">KALP Studio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🚀 Hackaton Conflux</h3>
              <p>Building the future of Web3 with Conflux Blockchain technology.</p>
              <div className="social-links">
                <a href="https://discord.gg/4A2q3xJKjC" target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
                <a href="https://t.me/ConfluxDevs" target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="https://confluxnetwork.org" target="_blank" rel="noopener noreferrer">Conflux Network</a></li>
                <li><a href="https://docs.confluxnetwork.org" target="_blank" rel="noopener noreferrer">Documentation</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Ready to build the future?</p>
              <p>Join our community and start coding!</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 Hackaton Conflux. Built for SummerHackfest 2025.</p>
            <p>Licensed under MIT License</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;