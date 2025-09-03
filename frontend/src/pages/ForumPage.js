import React from 'react';
import './ForumPage.css';

function ForumPage({ 
  isConnected, 
  isModerator, 
  showCreatePost, 
  setShowCreatePost, 
  newPostContent, 
  setNewPostContent, 
  handleCreatePost, 
  handleLike, 
  handleReply, 
  handleModerate,
  posts,
  contractInfo,
  postStatistics,
  loading,
  error,
  userAddress
}) {
  return (
    <main className="forum-main">
      <div className="container">
        <div className="forum-layout">
          {/* Sidebar */}
          <aside className="forum-sidebar">
            <div className="sidebar-section">
              <h3>Forum Features</h3>
              <ul className="category-list">
                <li><a href="#" className="category-link">📝 Create Posts</a></li>
                <li><a href="#" className="category-link">💬 Reply to Posts</a></li>
                <li><a href="#" className="category-link">❤️ Like Content</a></li>
                <li><a href="#" className="category-link">🔍 View Replies</a></li>
                <li><a href="#" className="category-link">👤 User Posts</a></li>
                <li><a href="#" className="category-link">📊 Statistics</a></li>
              </ul>
            </div>
            
            <div className="sidebar-section">
              <h3>Smart Contract Info</h3>
              <div className="contract-info">
                <div className="info-item">
                  <span className="info-label">Content Mode:</span>
                  <span className="info-value">
                    {contractInfo ? (contractInfo.contentIsCID ? 'IPFS CID' : 'Plain Text') : 'Loading...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rate Limit:</span>
                  <span className="info-value">
                    {contractInfo ? `${contractInfo.rateLimit} seconds` : 'Loading...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Posts:</span>
                  <span className="info-value">
                    {contractInfo ? contractInfo.totalPosts : 'Loading...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contract Owner:</span>
                  <span className="info-value">
                    {contractInfo ? `${contractInfo.owner.slice(0, 6)}...${contractInfo.owner.slice(-4)}` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            {isModerator && (
              <div className="sidebar-section">
                <h3>Moderation Tools</h3>
                <div className="moderation-tools">
                  <button className="btn btn-secondary">View Reports</button>
                  <button className="btn btn-secondary">Moderate Posts</button>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="forum-content">
            <div className="forum-header">
              <h1>On-Chain Forum</h1>
              <p>Decentralized forum powered by Conflux blockchain - Create posts, reply, and like content directly on-chain</p>
              <button className="btn btn-primary" onClick={() => setShowCreatePost(true)}>Create New Post</button>
            </div>

            {/* Forum Statistics */}
            <div className="forum-stats">
              <div className="stat-card">
                <div className="stat-number">
                  {postStatistics ? postStatistics.totalPosts : '0'}
                </div>
                <div className="stat-label">Total Posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {postStatistics ? postStatistics.totalReplies : '0'}
                </div>
                <div className="stat-label">Total Replies</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {postStatistics ? postStatistics.totalLikes : '0'}
                </div>
                <div className="stat-label">Total Likes</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {contractInfo ? `${contractInfo.rateLimit}s` : '60s'}
                </div>
                <div className="stat-label">Rate Limit</div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="posts-section">
              <h2>Recent Posts</h2>
              
              {error && (
                <div className="error-message">
                  <p>Error: {error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="loading-message">
                  <p>Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="no-posts-message">
                  <p>No posts yet. Be the first to create a post!</p>
                </div>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
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
                            title="Like"
                            disabled={!isConnected}
                          >
                            <span>❤️</span> {post.likeCount}
                          </button>
                          <button 
                            className="action-btn reply-btn" 
                            onClick={() => handleReply(post.id)} 
                            title="Reply"
                            disabled={!isConnected}
                          >
                            <span>💬</span> 0
                          </button>
                          <button className="action-btn share-btn" title="Share">
                            <span>🔗</span>
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
                        <span className="post-author">
                          @{post.author.slice(0, 6)}...{post.author.slice(-4)}
                        </span>
                        <span className="post-time">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="post-id">Post #{post.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Post</h2>
              <button className="modal-close" onClick={() => setShowCreatePost(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                className="post-textarea"
                placeholder="What's on your mind? (Max 2000 characters)"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                maxLength={2000}
                rows={6}
              />
              <div className="character-count">
                {newPostContent.length}/2000 characters
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreatePost(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ForumPage;
