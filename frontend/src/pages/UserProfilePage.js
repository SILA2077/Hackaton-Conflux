import React, { useState, useEffect } from 'react';
import './UserProfilePage.css';
import usernameService from '../services/usernameService';

function UserProfilePage({ 
  isConnected, 
  userAddress, 
  userReplies, 
  likedPosts, 
  fetchUserReplies, 
  fetchLikedPosts,
  fetchUserPosts,
  handleLike,
  handleModerate,
  isModerator,
  loading,
  error,
  username,
  handleEditUsername
}) {
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  // Fetch user data when component mounts
  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserData();
    }
  }, [isConnected, userAddress]);

  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      await Promise.all([
        fetchUserReplies(),
        fetchLikedPosts()
      ]);
      const posts = await fetchUserPosts();
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingUserData(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString() + ' at ' + new Date(timestamp).toLocaleTimeString();
  };

  const renderUserPosts = () => (
    <div className="user-data-section">
      <div className="section-header">
        <h3>Your Posts ({userPosts.length})</h3>
        <button 
          className="refresh-btn" 
          onClick={loadUserData}
          disabled={loadingUserData}
        >
          {loadingUserData ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingUserData ? (
        <div className="loading-message">
          <p>Loading your posts...</p>
        </div>
      ) : userPosts.length === 0 ? (
        <div className="no-data-message">
          <p>You haven't created any posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="posts-list">
          {userPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h3 className="post-title">
                  {post.content.length > 100 
                    ? `${post.content.substring(0, 100)}...` 
                    : post.content}
                </h3>
                <div className="post-actions">
                  <button 
                    className="action-btn like-btn" 
                    onClick={() => handleLike(post.id)} 
                    title="Like Post"
                    disabled={!isConnected}
                  >
                    <span>❤️</span> {post.likeCount}
                  </button>
                  {isModerator && (
                    <button 
                      className="action-btn moderate-btn" 
                      onClick={() => handleModerate(post.id)} 
                      title="Moderate Post"
                    >
                      <span>🛡️</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="post-meta">
                <span className="post-author">@{usernameService.getDisplayName(post.author)}</span>
                <span className="post-time">{formatDate(post.createdAt)}</span>
                <span className="post-id">Post #{post.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReplies = () => (
    <div className="user-data-section">
      <div className="section-header">
        <h3>Your Replies ({userReplies.length})</h3>
        <button 
          className="refresh-btn" 
          onClick={loadUserData}
          disabled={loadingUserData}
        >
          {loadingUserData ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingUserData ? (
        <div className="loading-message">
          <p>Loading your replies...</p>
        </div>
      ) : userReplies.length === 0 ? (
        <div className="no-data-message">
          <p>You haven't replied to any posts yet. Start a conversation!</p>
        </div>
      ) : (
        <div className="replies-list">
          {userReplies.map((reply) => (
            <div key={reply.id} className="reply-card">
              <div className="reply-content">
                <p className="reply-text">{reply.content}</p>
                <div className="reply-meta">
                  <span className="reply-author">@{usernameService.getDisplayName(reply.author)}</span>
                  <span className="reply-time">{formatDate(reply.createdAt)}</span>
                  <span className="reply-id">Reply #{reply.id}</span>
                </div>
              </div>
              <div className="reply-actions">
                <button 
                  className="action-btn like-btn" 
                  onClick={() => handleLike(reply.id)} 
                  title="Like Reply"
                  disabled={!isConnected}
                >
                  <span>❤️</span> {reply.likeCount}
                </button>
                {isModerator && (
                  <button 
                    className="action-btn moderate-btn" 
                    onClick={() => handleModerate(reply.id)} 
                    title="Moderate Reply"
                  >
                    <span>🛡️</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLikedPosts = () => (
    <div className="user-data-section">
      <div className="section-header">
        <h3>Liked Posts ({likedPosts.length})</h3>
        <button 
          className="refresh-btn" 
          onClick={loadUserData}
          disabled={loadingUserData}
        >
          {loadingUserData ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {loadingUserData ? (
        <div className="loading-message">
          <p>Loading your liked posts...</p>
        </div>
      ) : likedPosts.length === 0 ? (
        <div className="no-data-message">
          <p>You haven't liked any posts yet. Like some posts to see them here!</p>
        </div>
      ) : (
        <div className="liked-posts-list">
          {likedPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h3 className="post-title">
                  {post.content.length > 100 
                    ? `${post.content.substring(0, 100)}...` 
                    : post.content}
                </h3>
                <div className="post-actions">
                  <button 
                    className="action-btn like-btn" 
                    onClick={() => handleLike(post.id)} 
                    title="Unlike"
                    disabled={!isConnected}
                  >
                    <span>❤️</span> {post.likeCount}
                  </button>
                  {isModerator && (
                    <button 
                      className="action-btn moderate-btn" 
                      onClick={() => handleModerate(post.id)} 
                      title="Moderate"
                    >
                      <span>🛡️</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="post-preview">{post.content}</p>
              <div className="post-meta">
                <span className="post-author">@{usernameService.getDisplayName(post.author)}</span>
                <span className="post-time">{formatDate(post.createdAt)}</span>
                <span className="post-id">Post #{post.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isConnected) {
    return (
      <main className="user-profile-main">
        <div className="container">
          <div className="not-connected-message">
            <h2>Please Connect Your Wallet</h2>
            <p>You need to connect your wallet to view your profile data.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="user-profile-main">
      <div className="container">
        <div className="profile-header">
          <h1>User Profile</h1>
          <div className="user-info">
            <div className="user-avatar">
              <span>👤</span>
            </div>
            <div className="user-details">
              <h2>{username ? `@${username}` : `@${formatAddress(userAddress)}`}</h2>
              <p>Conflux eSpace User</p>
              <button 
                className="edit-username-btn"
                onClick={handleEditUsername}
                title={username ? "Edit username" : "Set username"}
              >
                {username ? '✏️ Edit Username' : '✏️ Set Username'}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            📝 My Posts ({userPosts.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'replies' ? 'active' : ''}`}
            onClick={() => setActiveTab('replies')}
          >
            💬 My Replies ({userReplies.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            ❤️ Liked Posts ({likedPosts.length})
          </button>
        </div>

        <div className="profile-content">
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}

          {activeTab === 'posts' && renderUserPosts()}
          {activeTab === 'replies' && renderReplies()}
          {activeTab === 'liked' && renderLikedPosts()}
        </div>
      </div>
    </main>
  );
}

export default UserProfilePage;
