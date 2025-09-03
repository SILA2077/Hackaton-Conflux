class WalletService {
  constructor() {
    this.provider = null;
    this.account = null;
    this.isConnected = false;
    this.walletType = null;
    this.networkId = 'testnet'; // Using Conflux testnet
    this.availableWallets = [];
  }

  // Detect available wallets
  detectAvailableWallets() {
    const wallets = [];
    
    // Check for MetaMask
    if (typeof window.ethereum !== 'undefined') {
      wallets.push({
        name: 'MetaMask',
        id: 'metamask',
        icon: '🦊',
        provider: window.ethereum,
        isInstalled: true
      });
    }
    
    // Check for Fluent Wallet
    if (typeof window.conflux !== 'undefined') {
      wallets.push({
        name: 'Fluent Wallet',
        id: 'fluent',
        icon: '🌊',
        provider: window.conflux,
        isInstalled: true
      });
    }
    
    // Check for Coinbase Wallet
    if (window.coinbaseWalletExtension) {
      wallets.push({
        name: 'Coinbase Wallet',
        id: 'coinbase',
        icon: '🔷',
        provider: window.coinbaseWalletExtension,
        isInstalled: true
      });
    }
    
    // Check for Trust Wallet
    if (window.trustwallet) {
      wallets.push({
        name: 'Trust Wallet',
        id: 'trust',
        icon: '🛡️',
        provider: window.trustwallet,
        isInstalled: true
      });
    }
    
    // Check for Binance Chain Wallet
    if (window.BinanceChain) {
      wallets.push({
        name: 'Binance Chain Wallet',
        id: 'binance',
        icon: '🟡',
        provider: window.BinanceChain,
        isInstalled: true
      });
    }
    
    this.availableWallets = wallets;
    return wallets;
  }

  // Initialize wallet connection
  async initialize() {
    try {
      this.detectAvailableWallets();
      
      // Check if any wallet is already connected
      for (const wallet of this.availableWallets) {
        try {
          let accounts = [];
          
          if (wallet.id === 'fluent') {
            accounts = await wallet.provider.request({
              method: 'cfx_accounts'
            });
          } else {
            accounts = await wallet.provider.request({
              method: 'eth_accounts'
            });
          }
          
          if (accounts && accounts.length > 0) {
            this.account = accounts[0];
            this.provider = wallet.provider;
            this.walletType = wallet.id;
            this.isConnected = true;
            break;
          }
        } catch (error) {
          // Continue checking other wallets
          continue;
        }
      }
      
      return this.availableWallets.length > 0;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      return false;
    }
  }

  // Connect to specific wallet
  async connectToWallet(walletId) {
    try {
      const wallet = this.availableWallets.find(w => w.id === walletId);
      
      if (!wallet) {
        throw new Error(`Wallet ${walletId} not found or not installed`);
      }

      let accounts = [];
      
      // Request account access based on wallet type
      if (wallet.id === 'fluent') {
        accounts = await wallet.provider.request({
          method: 'cfx_requestAccounts'
        });
      } else {
        accounts = await wallet.provider.request({
          method: 'eth_requestAccounts'
        });
      }

      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        this.provider = wallet.provider;
        this.walletType = wallet.id;
        this.isConnected = true;
        
        // Get network info
        let networkId;
        if (wallet.id === 'fluent') {
          networkId = await wallet.provider.request({
            method: 'cfx_chainId'
          });
        } else {
          networkId = await wallet.provider.request({
            method: 'eth_chainId'
          });
        }
        
        return {
          success: true,
          account: this.account,
          walletType: this.walletType,
          networkId: networkId
        };
      } else {
        throw new Error('No accounts found');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Connect to wallet (auto-detect or show selection)
  async connect() {
    try {
      // If only one wallet is available, connect to it automatically
      if (this.availableWallets.length === 1) {
        return await this.connectToWallet(this.availableWallets[0].id);
      }
      
      // If multiple wallets are available, return them for user selection
      if (this.availableWallets.length > 1) {
        return {
          success: false,
          needsSelection: true,
          availableWallets: this.availableWallets,
          error: 'Multiple wallets detected. Please select one.'
        };
      }
      
      // No wallets detected
      throw new Error('No wallet extensions detected. Please install MetaMask, Fluent Wallet, or another supported wallet.');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  async disconnect() {
    try {
      this.account = null;
      this.provider = null;
      this.walletType = null;
      this.isConnected = false;
      return { success: true };
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current account
  getAccount() {
    return this.account;
  }

  // Get current wallet type
  getWalletType() {
    return this.walletType;
  }

  // Get available wallets
  getAvailableWallets() {
    return this.availableWallets;
  }

  // Check if wallet is connected
  isWalletConnected() {
    return this.isConnected && this.account !== null;
  }

  // Get account balance
  async getBalance() {
    try {
      if (!this.isConnected || !this.account) {
        throw new Error('Wallet not connected');
      }

      let balance;
      if (this.walletType === 'fluent') {
        balance = await this.provider.request({
          method: 'cfx_getBalance',
          params: [this.account]
        });
      } else {
        balance = await this.provider.request({
          method: 'eth_getBalance',
          params: [this.account, 'latest']
        });
      }

      return {
        success: true,
        balance: balance
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Switch to Conflux testnet
  async switchToTestnet() {
    try {
      if (!this.provider) {
        throw new Error('No wallet connected');
      }

      if (this.walletType === 'fluent') {
        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }] // Conflux testnet chain ID
        });
      } else {
        // For other wallets, try to switch to Conflux testnet
        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }] // Conflux testnet chain ID
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to switch network:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const walletService = new WalletService();

export default walletService;
