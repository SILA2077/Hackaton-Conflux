import React from 'react';
import './HomePage.css';

function HomePage({ isConnected, handleConnect, navigateToForum }) {
  return (
    <main className="homepage-main">
      {/* Background Elements */}
      <div className="background-gradient"></div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            {/* Main Title */}
            <h1 className="hero-title">
               Forlux
            </h1>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;