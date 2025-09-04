import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Conflux } from 'js-conflux-sdk';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ForumPage from './pages/ForumPage';
import FeaturesPage from './pages/FeaturesPage';
import UserProfilePage from './pages/UserProfilePage';
import walletService from './services/walletService';
import contractService from './services/contractService';
import usernameService from './services/usernameService';

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
  const [replies, setReplies] = useState({}); // Store replies by post ID
  const [contractInfo, setContractInfo] = useState(null);
  const [postStatistics, setPostStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyToPost, setReplyToPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [userReplies, setUserReplies] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

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
          
          // Load username
          loadUsername(account);
          
          // Initialize contract service
          await initializeContract();
        }
      }
      // Set available wallets for selection
      setAvailableWallets(walletService.getAvailableWallets());
    };

    initializeServices();
  }, []);

  // Load username when user address changes
  useEffect(() => {
    if (userAddress) {
      loadUsername(userAddress);
    }
  }, [userAddress]);

  // Initialize contract service when wallet connects
  const initializeContract = async () => {
    try {
      if (walletService.isWalletConnected()) {
        // Ensure we're on Conflux network before initializing contract
        const networkResult = await walletService.ensureConfluxNetwork(walletService.provider);
        if (!networkResult.success) {
          setError('Please switch to Conflux network: ' + networkResult.error);
          return;
        }
        
        // Use ethers with the wallet provider (works for both MetaMask and Fluent)
        // Configure for Conflux mainnet
        const provider = new ethers.BrowserProvider(walletService.provider);
        const signer = await provider.getSigner();
        
        // Verify we're on Conflux mainnet before proceeding
        const network = await provider.getNetwork();
        console.log('Current network:', {
          chainId: network.chainId.toString(),
          name: network.name
        });
        
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
        const postsData = postsResult.data;
        setPosts(postsData);
        
        // Load replies for each post
        const repliesData = {};
        for (const post of postsData) {
          const repliesResult = await contractService.getReplies(post.id);
          if (repliesResult.success) {
            repliesData[post.id] = repliesResult.data;
          }
        }
        setReplies(repliesData);
      }

      // Check if user is moderator and fetch user-specific data
      if (userAddress) {
        const moderatorResult = await contractService.isModerator(userAddress);
        if (moderatorResult.success) {
          setIsModerator(moderatorResult.data);
        }
        
        // Fetch user's replies and liked posts
        await Promise.all([
          fetchUserReplies(),
          fetchLikedPosts()
        ]);
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
        
        showTransaction('post', 'Creating your post...');
        
        const result = await contractService.createPost(newPostContent, 0);
        if (result.success) {
          updateTransactionStatus('success', 'Post created successfully!');
          
          setNewPostContent('');
          setShowCreatePost(false);
          // Reload posts to show the new one
          await loadContractData();
          
          // Hide transaction modal after success
          setTimeout(() => {
            hideTransaction();
          }, 2000);
        } else {
          updateTransactionStatus('error', 'Failed to create post: ' + result.error);
          setError('Failed to create post: ' + result.error);
          
          // Hide transaction modal after error
          setTimeout(() => {
            hideTransaction();
          }, 3000);
        }
      } catch (error) {
        console.error('Error creating post:', error);
        updateTransactionStatus('error', 'Failed to create post');
        setError('Failed to create post');
        
        // Hide transaction modal after error
        setTimeout(() => {
          hideTransaction();
        }, 3000);
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
        
        showTransaction('like', 'Processing like...');
        
        // Check if user has already liked the post
        const hasLikedResult = await contractService.hasUserLiked(postId, userAddress);
        if (hasLikedResult.success) {
          const liked = !hasLikedResult.data; // Toggle like status
          const result = await contractService.likePost(postId, liked);
          if (result.success) {
            updateTransactionStatus('success', liked ? 'Post liked!' : 'Post unliked!');
            
            // Reload posts to update like counts
            await loadContractData();
            
            // Hide transaction modal after success
            setTimeout(() => {
              hideTransaction();
            }, 1500);
          } else {
            updateTransactionStatus('error', 'Failed to like post: ' + result.error);
            setError('Failed to like post: ' + result.error);
            
            // Hide transaction modal after error
            setTimeout(() => {
              hideTransaction();
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Error liking post:', error);
        updateTransactionStatus('error', 'Failed to like post');
        setError('Failed to like post');
        
        // Hide transaction modal after error
        setTimeout(() => {
          hideTransaction();
        }, 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReply = (postId) => {
    if (isConnected) {
      setReplyToPost(postId);
      setReplyContent('');
      setShowReplyModal(true);
    }
  };

  const handleCreateReply = async () => {
    if (replyContent.trim() && isConnected && replyToPost) {
      try {
        setLoading(true);
        setError('');
        
        showTransaction('reply', 'Creating your reply...');
        
        const result = await contractService.createPost(replyContent, replyToPost);
        if (result.success) {
          updateTransactionStatus('success', 'Reply posted successfully!');
          
          setReplyContent('');
          setShowReplyModal(false);
          setReplyToPost(null);
          // Reload posts and replies to show the new reply
          await loadContractData();
          
          // Hide transaction modal after success
          setTimeout(() => {
            hideTransaction();
          }, 2000);
        } else {
          updateTransactionStatus('error', 'Failed to create reply: ' + result.error);
          setError('Failed to create reply: ' + result.error);
          
          // Hide transaction modal after error
          setTimeout(() => {
            hideTransaction();
          }, 3000);
        }
      } catch (error) {
        console.error('Error creating reply:', error);
        updateTransactionStatus('error', 'Failed to create reply');
        setError('Failed to create reply');
        
        // Hide transaction modal after error
        setTimeout(() => {
          hideTransaction();
        }, 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch user's replies
  const fetchUserReplies = async () => {
    if (!userAddress) return;
    
    try {
      const result = await contractService.getPostsByAuthor(userAddress, 0, 50);
      if (result.success) {
        // Filter only replies (posts with parentId > 0)
        const userRepliesData = result.data.filter(post => post.parentId !== '0');
        setUserReplies(userRepliesData);
      }
    } catch (error) {
      console.error('Error fetching user replies:', error);
    }
  };

  // Fetch user's liked posts
  const fetchLikedPosts = async () => {
    if (!userAddress) return;
    
    try {
      // Get all posts and check which ones the user has liked
      const allPosts = [...posts];
      const likedPostsData = [];
      
      for (const post of allPosts) {
        const hasLikedResult = await contractService.hasUserLiked(post.id, userAddress);
        if (hasLikedResult.success && hasLikedResult.data) {
          likedPostsData.push(post);
        }
      }
      
      setLikedPosts(likedPostsData);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  };

  // Fetch user's posts
  const fetchUserPosts = async () => {
    if (!userAddress) return [];
    
    try {
      const result = await contractService.getPostsByAuthor(userAddress);
      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  };

  const handleModerate = async (postId) => {
    if (isConnected && isModerator) {
      try {
        setLoading(true);
        setError('');
        
        showTransaction('moderate', 'Moderating post...');
        
        const result = await contractService.moderatePost(postId);
        if (result.success) {
          updateTransactionStatus('success', 'Post moderated successfully!');
          
          // Reload posts to reflect moderation
          await loadContractData();
          
          // Hide transaction modal after success
          setTimeout(() => {
            hideTransaction();
          }, 2000);
        } else {
          updateTransactionStatus('error', 'Failed to moderate post: ' + result.error);
          setError('Failed to moderate post: ' + result.error);
          
          // Hide transaction modal after error
          setTimeout(() => {
            hideTransaction();
          }, 3000);
        }
      } catch (error) {
        console.error('Error moderating post:', error);
        updateTransactionStatus('error', 'Failed to moderate post');
        setError('Failed to moderate post');
        
        // Hide transaction modal after error
        setTimeout(() => {
          hideTransaction();
        }, 3000);
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

  const navigateToProfile = () => {
    setCurrentPage('profile');
  };

  // Username functions
  const loadUsername = (address) => {
    const storedUsername = usernameService.getUsername(address);
    setUsername(storedUsername || '');
  };

  const handleSetUsername = () => {
    if (newUsername.trim() && userAddress) {
      const validation = usernameService.validateUsername(newUsername);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      if (!usernameService.isUsernameAvailable(newUsername, userAddress)) {
        setError('Username is already taken');
        return;
      }

      const success = usernameService.setUsername(userAddress, newUsername);
      if (success) {
        setUsername(newUsername);
        setNewUsername('');
        setShowUsernameModal(false);
        setError('');
      } else {
        setError('Failed to set username');
      }
    }
  };

  const handleEditUsername = () => {
    setNewUsername(username);
    setShowUsernameModal(true);
  };

  // Transaction status functions
  const showTransaction = (type, message) => {
    setTransactionStatus({
      type: type,
      message: message,
      status: 'pending'
    });
    setShowTransactionModal(true);
  };

  const updateTransactionStatus = (status, message = null) => {
    setTransactionStatus(prev => ({
      ...prev,
      status: status,
      message: message || prev.message
    }));
  };

  const hideTransaction = () => {
    setShowTransactionModal(false);
    setTimeout(() => {
      setTransactionStatus(null);
    }, 300);
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
        navigateToProfile={navigateToProfile}
        connectionError={connectionError}
        username={username}
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
          replies={replies}
          contractInfo={contractInfo}
          postStatistics={postStatistics}
          loading={loading}
          error={error}
          userAddress={userAddress}
          showReplyModal={showReplyModal}
          setShowReplyModal={setShowReplyModal}
          replyToPost={replyToPost}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          handleCreateReply={handleCreateReply}
                  userReplies={userReplies}
        likedPosts={likedPosts}
        fetchUserReplies={fetchUserReplies}
        fetchLikedPosts={fetchLikedPosts}
        navigateToProfile={navigateToProfile}
        username={username}
        handleEditUsername={handleEditUsername}
        />
      )}



      {currentPage === 'features' && (
        <FeaturesPage 
          isConnected={isConnected}
          userAddress={userAddress}
          walletType={walletType}
        />
      )}

      {currentPage === 'profile' && (
        <UserProfilePage 
          isConnected={isConnected}
          userAddress={userAddress}
          userReplies={userReplies}
          likedPosts={likedPosts}
          fetchUserReplies={fetchUserReplies}
          fetchLikedPosts={fetchLikedPosts}
          fetchUserPosts={fetchUserPosts}
          handleLike={handleLike}
          handleModerate={handleModerate}
          isModerator={isModerator}
          loading={loading}
          error={error}
          username={username}
          handleEditUsername={handleEditUsername}
        />
      )}

      <Footer />

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="modal-overlay" onClick={() => setShowUsernameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{username ? 'Edit Username' : 'Set Username'}</h2>
              <button className="modal-close" onClick={() => setShowUsernameModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Choose a unique username to display in the forum. This will be stored locally on your device.
              </p>
              <input
                type="text"
                className="username-input"
                placeholder="Enter your username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <div className="username-rules">
                <p>Username rules:</p>
                <ul>
                  <li>2-20 characters long</li>
                  <li>Letters, numbers, hyphens, and underscores only</li>
                  <li>Must be unique</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowUsernameModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSetUsername}
                disabled={!newUsername.trim()}
              >
                {username ? 'Update Username' : 'Set Username'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status Modal */}
      {showTransactionModal && transactionStatus && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="transaction-content">
              <div className="transaction-icon">
                {transactionStatus.status === 'pending' && (
                  <div className="spinner"></div>
                )}
                {transactionStatus.status === 'confirming' && (
                  <div className="spinner"></div>
                )}
                {transactionStatus.status === 'success' && (
                  <div className="success-icon">✓</div>
                )}
                {transactionStatus.status === 'error' && (
                  <div className="error-icon">✕</div>
                )}
              </div>
              <h3 className="transaction-title">
                {transactionStatus.type === 'post' && 'Creating Post'}
                {transactionStatus.type === 'reply' && 'Posting Reply'}
                {transactionStatus.type === 'like' && 'Processing Like'}
                {transactionStatus.type === 'moderate' && 'Moderating Post'}
              </h3>
              <p className="transaction-message">{transactionStatus.message}</p>
              {transactionStatus.status === 'error' && (
                <button className="btn btn-primary" onClick={hideTransaction}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;