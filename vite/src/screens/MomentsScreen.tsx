import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, PlusCircle, Send, Trash2 } from 'lucide-react';
import ScreenContainer  from '../components/Layout/ScreenContainer';
import BottomNav from '../components/Navigation/BottomNav';
import Avatar from '../components/Common/Avatar';
import LoadingSpinner  from '../components/Common/LoadingSpinner';
import ImageGrid from '../components/Moments/ImageGrid';
import { getMoments, likeMoment, unlikeMoment, deleteMoment, getComments, postComment, deleteComment } from '../services/momentsService';
import { useAppContext } from '../context/AppContext';

const MomentsScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    moments,
    comments,
    likeMoment,
    unlikeMoment,
    getCommentsForMoment,
    postComment,
    deleteComment,
    deleteMoment,
    getMoments,
    loading,
  } = useAppContext();

  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 确保在组件挂载或路由切换时加载数据
  useEffect(() => {
    const loadData = async () => {
      if (currentUser && !loading && (!moments.length || !isDataLoaded)) {
        console.log('🔄 MomentsScreen: 加载动态数据');
        try {
          await getMoments();
          setIsDataLoaded(true);
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Failed to load moments:', error);
          setIsInitialLoad(false);
        }
      } else if (currentUser && moments.length > 0 && isInitialLoad) {
        // 如果已经有数据了，说明不需要初始加载
        setIsDataLoaded(true);
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, [currentUser, loading, moments.length, isDataLoaded, isInitialLoad, getMoments]);

  const formatMomentTime = (dateString: string | undefined) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'A while ago';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const handleLikeToggle = (moment: Moment) => {
    if (moment.is_liked) {
      unlikeMoment(moment.id);
    } else {
      likeMoment(moment.id);
    }
  };

  const handleToggleComments = (momentId: string) => {
    if (activeMomentId === momentId) {
      setActiveMomentId(null);
    } else {
      setActiveMomentId(momentId);
      getCommentsForMoment(momentId);
    }
  };

  const handlePostComment = async (momentId: string) => {
    if (!newComment.trim()) return;
    try {
      await postComment(momentId, newComment.trim());
      setNewComment('');
    } catch {
      alert('Failed to post comment.');
    }
  };

  /**
   * 处理删除评论的函数
   * @param momentId - 动态ID
   * @param commentId - 评论ID
   */
  const handleDeleteComment = async (momentId: string, commentId: string) => {
    // 调试日志：检查传入的参数值
    console.log('handleDeleteComment called with:', { momentId, commentId });
    console.log('momentId type:', typeof momentId, 'commentId type:', typeof commentId);
    
    // 简化参数验证：只检查是否存在有效值
    if (!commentId || commentId === 'undefined' || commentId === 'null') {
      console.error('Invalid commentId:', commentId);
      alert('无法删除评论：评论ID无效');
      return;
    }
    
    if (!momentId || momentId === 'undefined' || momentId === 'null') {
      console.error('Invalid momentId:', momentId);
      alert('无法删除评论：动态ID无效');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        console.log('Calling deleteComment with validated params:', { momentId, commentId });
        await deleteComment(momentId, commentId);
      } catch (error) {
        console.error('Delete comment error:', error);
        alert('Failed to delete comment.');
      }
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (window.confirm('Are you sure you want to delete this moment?')) {
      try {
        await deleteMoment(momentId);
      } catch {
        alert('Failed to delete moment.');
      }
    }
  };

  /**
   * 处理用户头像和名称点击事件，跳转到用户详情页
   * @param userId - 用户ID
   */
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <ScreenContainer>
      {/* Compact Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center justify-center relative">
        <h1 className="text-base font-semibold text-slate-100">Moments</h1>
        <button
          onClick={() => navigate('/create-moment')}
          className="absolute right-3 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <PlusCircle size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900 p-3 pb-16">
        {/* Loading state */}
        {(loading || isInitialLoad) && !isDataLoaded && (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" text="Loading moments..." />
          </div>
        )}

        {/* Empty state */}
        {!loading && !isInitialLoad && isDataLoaded && moments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-slate-400 mb-4">
              <MessageCircle size={48} />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No moments yet</h3>
            <p className="text-slate-400 mb-6 max-w-xs">
              Be the first to share a moment! Tap the + button to create your first post.
            </p>
            <button
              onClick={() => navigate('/create-moment')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create First Moment
            </button>
          </div>
        )}

        {/* Moments list */}
        {!loading && !isInitialLoad && moments.length > 0 && moments.map((moment) => (
          <div key={moment.id} className="bg-slate-800 border border-slate-700 rounded-xl mb-4 overflow-hidden shadow-lg">
            {/* Post Header */}
            <div className="flex items-center p-3">
              <div 
                className="flex items-center flex-grow cursor-pointer hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => handleUserClick(moment.user.id)}
              >
                <Avatar
                  src={moment.user.photos[0]}
                  name={moment.user.name}
                  size="md"
                  className="mr-3"
                />
                <div className="flex-grow">
                  <h4 className="font-semibold text-slate-100 hover:text-indigo-300 transition-colors">{moment.user.name}</h4>
                  <p className="text-xs text-slate-400">{formatMomentTime(moment.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-3 pb-3">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">{moment.content}</p>
              
              {moment.images && moment.images.length > 0 && (
                <ImageGrid images={moment.images} />
              )}
            </div>

            {/* Post Actions */}
            <div className="flex justify-around items-center p-3 border-t border-slate-700">
              <button
                onClick={() => handleLikeToggle(moment)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  moment.is_liked
                    ? 'text-red-400 bg-red-400/10'
                    : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
                }`}
              >
                <Heart size={16} className={moment.is_liked ? 'fill-current' : ''} />
                <span className="text-sm">{moment.likes}</span>
              </button>
              
              <button 
                onClick={() => handleToggleComments(moment.id)}
                className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 px-3 py-2 rounded-lg transition-colors">
                <MessageCircle size={16} />
                <span className="text-sm">{moment.comments}</span>
              </button>

              {moment.user.id === currentUser?.id && (
                <button 
                  onClick={() => handleDeleteMoment(moment.id)}
                  className="flex items-center space-x-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Comments Section */}
            {activeMomentId === moment.id && (
              <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                {/* New Comment Form */}
                <div className="flex items-center mb-3">
                  <Avatar src={currentUser?.photos[0]} name={currentUser?.name || ''} size="sm" className="mr-2" />
                  <input 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-full py-1.5 px-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => handlePostComment(moment.id)}
                    disabled={!newComment.trim()}
                    className="ml-2 text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-2">
                  {(comments[moment.id] || []).map((comment: Comment) => (
                    <div key={comment.id} className="flex items-start">
                      <Avatar src={comment.user.avatar} name={comment.user.name} size="sm" className="mr-2 mt-1" />
                      <div className="flex-1 bg-slate-700 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{comment.user.name}</span>
                          {comment.user.id === currentUser?.id && (
                            <button 
                              onClick={() => {
                                // 调试日志：在按钮点击时检查comment对象和ID值
                                console.log('Delete button clicked for comment:', comment);
                                console.log('Comment ID value:', comment.id, 'Type:', typeof comment.id);
                                console.log('Moment ID value:', moment.id, 'Type:', typeof moment.id);
                                handleDeleteComment(moment.id, comment.id);
                              }} 
                              className="text-slate-500 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </ScreenContainer>
  );
};

export default MomentsScreen;