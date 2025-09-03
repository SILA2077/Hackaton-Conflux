import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import FeaturesPage from './pages/FeaturesPage';
import walletService from './services/walletService';
import contractService from './services/contractService';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [connectionError, setConnectionError] = useState('');
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [contractInfo, setContractInfo] = useState(null);
  const [postStatistics, setPostStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Initialize wallet service and contract on component mount
  useEffect(() => {
    const initializeServices = async () => {
      const isWalletAvailable = await walletService.initialize();
      if (isWalletAvailable && walletService.isWalletConnected()) {
        const account = walletService.getAccount();
        const walletType = walletService.getWalletType();
        if (account) {
          setIsConnected(true);
          setUserAddress(account);
          setWalletType(walletType);
          
          // Initialize contract service
          await initializeContract();
        }
      }
      // Set available wallets for selection
      setAvailableWallets(walletService.getAvailableWallets());
    };

    initializeServices();
  }, []);

  // Initialize contract service when wallet connects
  const initializeContract = async () => {
    try {
      if (walletService.isWalletConnected()) {
        const provider = new ethers.BrowserProvider(walletService.provider);
        const signer = await provider.getSigner();
        
        const result = await contractService.initialize(provider, signer);
        if (result.success) {
          // Load contract info and posts
          await loadContractData();
        } else {
          setError('Failed to initialize contract: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Contract initialization error:', error);
      setError('Failed to initialize contract');
    }
  };

  // Load contract data
  const loadContractData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load contract info, statistics, and posts in parallel
      const [contractInfoResult, statsResult, postsResult] = await Promise.all([
        contractService.getContractInfo(),
        contractService.getPostStatistics(),
        contractService.getTopLevelPosts(0, 10)
      ]);

      if (contractInfoResult.success) {
        setContractInfo(contractInfoResult.data);
      }

      if (statsResult.success) {
        setPostStatistics(statsResult.data);
      }

      if (postsResult.success) {
        setPosts(postsResult.data);
      }

      // Check if user is moderator
      if (userAddress) {
        const moderatorResult = await contractService.isModerator(userAddress);
        if (moderatorResult.success) {
          setIsModerator(moderatorResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
      setError('Failed to load forum data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionError('');
      setShowWalletSelection(false);
      
      if (isConnected) {
        // Disconnect wallet
        const result = await walletService.disconnect();
        if (result.success) {
          setIsConnected(false);
          setUserAddress('');
          setWalletType('');
        } else {
          setConnectionError(result.error || 'Failed to disconnect wallet');
        }
      } else {
        // Connect wallet
        const result = await walletService.connect();
        if (result.success) {
          setIsConnected(true);
          setUserAddress(result.account);
          setWalletType(result.walletType);
          
          // Initialize contract service after wallet connection
          await initializeContract();
        } else if (result.needsSelection) {
          // Show wallet selection modal
          setShowWalletSelection(true);
          setAvailableWallets(result.availableWallets);
        } else {
          setConnectionError(result.error || 'Failed to connect wallet');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError('An unexpected error occurred');
    }
  };

  const handleWalletSelect = async (walletId) => {
    try {
      setConnectionError('');
      const result = await walletService.connectToWallet(walletId);
      if (result.success) {
        setIsConnected(true);
        setUserAddress(result.account);
        setWalletType(result.walletType);
        setShowWalletSelection(false);
        
        // Initialize contract service after wallet selection
        await initializeContract();
      } else {
        setConnectionError(result.error || 'Failed to connect to selected wallet');
      }
    } catch (error) {
      console.error('Wallet selection error:', error);
      setConnectionError('An unexpected error occurred');
    }
  };

  const handleCreatePost = async () => {
    if (newPostContent.trim() && isConnected) {
      try {
        setLoading(true);
        setError('');
        
        const result = await contractService.createPost(newPostContent, 0);
        if (result.success) {
          setNewPostContent('');
          setShowCreatePost(false);
          // Reload posts to show the new one
          await loadContractData();
        } else {
          setError('Failed to create post: ' + result.error);
        }
      } catch (error) {
        console.error('Error creating post:', error);
        setError('Failed to create post');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLike = async (postId) => {
    if (isConnected) {
      try {
        setLoading(true);
        setError('');
        
        // Check if user has already liked the post
        const hasLikedResult = await contractService.hasUserLiked(postId, userAddress);
        if (hasLikedResult.success) {
          const liked = !hasLikedResult.data; // Toggle like status
          const result = await contractService.likePost(postId, liked);
          if (result.success) {
            // Reload posts to update like counts
            await loadContractData();
          } else {
            setError('Failed to like post: ' + result.error);
          }
        }
      } catch (error) {
        console.error('Error liking post:', error);
        setError('Failed to like post');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReply = (postId) => {
    // Here you would open reply modal
    console.log('Replying to post:', postId);
  };

  const handleModerate = async (postId) => {
    if (isConnected && isModerator) {
      try {
        setLoading(true);
        setError('');
        
        const result = await contractService.moderatePost(postId);
        if (result.success) {
          // Reload posts to reflect moderation
          await loadContractData();
        } else {
          setError('Failed to moderate post: ' + result.error);
        }
      } catch (error) {
        console.error('Error moderating post:', error);
        setError('Failed to moderate post');
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToForum = () => {
    setCurrentPage('forum');
  };



  const navigateToFeatures = () => {
    setCurrentPage('features');
  };

  return (
    <div className="app">
      <Header 
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        isConnected={isConnected}
        userAddress={userAddress}
        walletType={walletType}
        handleConnect={handleConnect}
        currentPage={currentPage}
        navigateToHome={navigateToHome}
        navigateToForum={navigateToForum}
        navigateToFeatures={navigateToFeatures}
        connectionError={connectionError}
        showWalletSelection={showWalletSelection}
        availableWallets={availableWallets}
        handleWalletSelect={handleWalletSelect}
        setShowWalletSelection={setShowWalletSelection}
      />



      {currentPage === 'home' && (
        <HomePage 
          isConnected={isConnected}
          handleConnect={handleConnect}
          navigateToForum={navigateToForum}
        />
      )}

      {currentPage === 'forum' && (
        <ForumPage 
          isConnected={isConnected}
          isModerator={isModerator}
          showCreatePost={showCreatePost}
          setShowCreatePost={setShowCreatePost}
          newPostContent={newPostContent}
          setNewPostContent={setNewPostContent}
          handleCreatePost={handleCreatePost}
          handleLike={handleLike}
          handleReply={handleReply}
          handleModerate={handleModerate}
          posts={posts}
          contractInfo={contractInfo}
          postStatistics={postStatistics}
          loading={loading}
          error={error}
          userAddress={userAddress}
        />
      )}



      {currentPage === 'features' && (
        <FeaturesPage 
          isConnected={isConnected}
          userAddress={userAddress}
          walletType={walletType}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;