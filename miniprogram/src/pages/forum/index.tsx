import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Textarea, Input, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { getForumPosts, createForumPost } from '@/utils/api';
import { SOCIAL_ICONS } from '@/utils/icons';
import './index.scss';

interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  author: string;
  time: string;
  votes: number;
  views: number;
  commentCount: number;
  tags: string[];
  aiSummary?: string;
}

const categories = [
  { id: 'all', label: '全部' },
  { id: 'question', label: '问答' },
  { id: 'discussion', label: '讨论' },
  { id: 'guide', label: '攻略' },
  { id: 'review', label: '测评' },
];

const typeColors: Record<string, string> = {
  question: '#3b82f6',
  discussion: '#8b5cf6',
  guide: '#059669',
  review: '#f59e0b',
};

const typeLabels: Record<string, string> = {
  question: '问答',
  discussion: '讨论',
  guide: '攻略',
  review: '测评',
};

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('discussion');
  const [posting, setPosting] = useState(false);

  usePullDownRefresh(async () => {
    await loadPosts();
    Taro.stopPullDownRefresh();
  });

  const loadPosts = async () => {
    setLoading(true);
    try {
      const cat = activeCategory !== 'all' ? activeCategory : undefined;
      const res = await getForumPosts(cat);
      setPosts(res.data || []);
    } catch (err) {
      console.error('加载帖子失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [activeCategory]);

  const handlePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Taro.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }
    setPosting(true);
    try {
      const res = await createForumPost({
        type: newType, title: newTitle.trim(), content: newContent.trim(),
      });
      // 审核拒绝
      if (res.error === 'content_rejected') {
        Taro.showModal({
          title: 'AI审核未通过',
          content: res.moderation?.suggestion || '内容不符合社区准则，请修改后重试',
          showCancel: false,
        });
        return;
      }
      // 待审核
      if (res.moderation?.needsReview) {
        Taro.showToast({ title: '帖子已提交审核', icon: 'none', duration: 2000 });
      } else {
        Taro.showToast({ title: '发布成功！', icon: 'success' });
      }
      setShowNewPost(false);
      setNewTitle('');
      setNewContent('');
      await loadPosts();
    } catch (err) {
      Taro.showToast({ title: '发布失败，请重试', icon: 'none' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <View className='forum-page'>
      {/* Categories */}
      <ScrollView scrollX className='categories'>
        {categories.map(cat => (
          <View
            key={cat.id}
            className={`cat-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Text>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Posts */}
      {loading ? (
        <View className='loading'><Text>加载中...</Text></View>
      ) : (
        <View className='post-list'>
          {posts.map(post => (
            <View key={post.id} className='post-card'>
              <View className='post-header'>
                <View
                  className='post-type-badge'
                  style={{ background: typeColors[post.type] || '#999' }}
                >
                  <Text className='badge-text'>{typeLabels[post.type] || post.type}</Text>
                </View>
                <Text className='post-time'>{post.time}</Text>
              </View>
              <Text className='post-title'>{post.title}</Text>
              <Text className='post-content'>{post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}</Text>
              {post.aiSummary && (
                <View className='ai-summary'>
                  <View className='ai-label-row'>
                    <Image src={SOCIAL_ICONS.robot} className='forum-icon' />
                    <Text className='ai-label'>AI解读</Text>
                  </View>
                  <Text className='ai-text'>{post.aiSummary}</Text>
                </View>
              )}
              <View className='post-footer'>
                <View className='post-author-row'>
                  <Image src={SOCIAL_ICONS.userAvatar} className='forum-icon' />
                  <Text className='post-author'>{post.author}</Text>
                </View>
                <View className='post-stats'>
                  <View className='stat-row'><Image src={SOCIAL_ICONS.thumbUp} className='forum-icon-sm' /><Text>{post.votes}</Text></View>
                  <View className='stat-row'><Image src={SOCIAL_ICONS.eye} className='forum-icon-sm' /><Text>{post.views}</Text></View>
                  <View className='stat-row'><Image src={SOCIAL_ICONS.comment} className='forum-icon-sm' /><Text>{post.commentCount}</Text></View>
                </View>
              </View>
              {post.tags.length > 0 && (
                <View className='post-tags'>
                  {post.tags.slice(0, 3).map(tag => (
                    <Text key={tag} className='tag'>{tag}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}

          {posts.length === 0 && !loading && (
            <View className='empty'><Text>暂无帖子，来发第一帖吧！</Text></View>
          )}
        </View>
      )}

      {/* FAB */}
      <View className='fab' onClick={() => setShowNewPost(true)}>
        <Image src={SOCIAL_ICONS.write} className='fab-icon-img' />
      </View>

      {/* New Post Modal */}
      {showNewPost && (
        <View className='modal-overlay' onClick={() => setShowNewPost(false)}>
          <View className='modal' onClick={(e) => e.stopPropagation()}>
            <View className='modal-header'>
              <Text className='modal-title'>发布帖子</Text>
              <Text className='modal-close' onClick={() => setShowNewPost(false)}>✕</Text>
            </View>

            <View className='type-selector'>
              {categories.filter(c => c.id !== 'all').map(cat => (
                <View
                  key={cat.id}
                  className={`type-option ${newType === cat.id ? 'active' : ''}`}
                  onClick={() => setNewType(cat.id)}
                >
                  <Text>{cat.label}</Text>
                </View>
              ))}
            </View>

            <Input
              className='title-input'
              placeholder='帖子标题'
              value={newTitle}
              onInput={(e) => setNewTitle(e.detail.value)}
              maxlength={50}
            />

            <Textarea
              className='content-input'
              placeholder='分享你的旅行见闻...'
              value={newContent}
              onInput={(e) => setNewContent(e.detail.value)}
              maxlength={2000}
              autoHeight
            />

            <View className='modal-footer'>
              <Text className='char-count'>{newContent.length}/2000</Text>
              <View
                className={`post-btn ${newTitle.trim() && newContent.trim() && !posting ? 'active' : ''}`}
                onClick={handlePost}
              >
                <Text>{posting ? '发布中...' : '发布'}</Text>
              </View>
            </View>

            <View className='moderation-notice'>
              <View className='notice-row'>
                <Image src={SOCIAL_ICONS.moderation} className='forum-icon' />
                <Text className='notice-text'>所有内容将通过AI智能审核，请遵守社区准则</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
