import React from 'react';
import './Header.css';
import walletService from '../services/walletService';

function Header({ 
  isMenuOpen, 
  toggleMenu, 
  isConnected, 
  userAddress, 
  walletType,
  handleConnect, 
  currentPage, 
  navigateToHome, 
  navigateToForum, 
  navigateToFeatures, 
  connectionError,
  showWalletSelection,
  availableWallets,
  handleWalletSelect,
  setShowWalletSelection
}) {
  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <h2>🚀 Forlux</h2>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li><a href="#" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={navigateToHome}>Home</a></li>
            <li><a href="#" className={`nav-link ${currentPage === 'forum' ? 'active' : ''}`} onClick={navigateToForum}>Forum</a></li>
            <li><a href="#" className={`nav-link ${currentPage === 'features' ? 'active' : ''}`} onClick={navigateToFeatures}>Features</a></li>
          </ul>
        </nav>

        <div className="nav-actions">
          {connectionError && (
            <div className="error-message">
              <span className="error-text">{connectionError}</span>
            </div>
          )}
          {isConnected ? (
            <div className="user-info">
              <span className="user-address" title={`${walletType}: ${userAddress}`}>
                {walletService.formatAddress(userAddress)}
              </span>
              <button className="btn btn-secondary" onClick={handleConnect}>Disconnect</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect}>Connect Wallet</button>
          )}
          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      
      {/* Wallet Selection Modal */}
      {showWalletSelection && (
        <div className="wallet-selection-modal">
          <div className="modal-overlay" onClick={() => setShowWalletSelection(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select a Wallet</h3>
              <button className="modal-close" onClick={() => setShowWalletSelection(false)}>×</button>
            </div>
            <div className="wallet-list">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  className="wallet-option"
                  onClick={() => handleWalletSelect(wallet.id)}
                >
                  <span className="wallet-icon">{wallet.icon}</span>
                  <span className="wallet-name">{wallet.name}</span>
                </button>
              ))}
            </div>
            {availableWallets.length === 0 && (
              <div className="no-wallets">
                <p>No wallet extensions detected.</p>
                <p>Please install MetaMask, Fluent Wallet, or another supported wallet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
