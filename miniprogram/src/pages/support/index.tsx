import { useState, useRef } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { chatWithSupport } from '@/utils/api';
import './index.scss';

interface Message {
  id: number;
  role: 'user' | 'ai' | 'system';
  content: string;
  time: string;
}

const quickActions = [
  '我的账号被封禁了',
  '我要申诉',
  '退款进度查询',
  '如何修改手机号？',
  '转人工客服',
  '投诉建议',
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0, role: 'ai',
      content: '你好！我是智游清远客服小助手 🤖\n\n我可以帮你处理：\n• 账号问题（封禁/解封/申诉）\n• 支付与退款\n• 行程问题\n• 论坛举报\n• 其他咨询\n\n💡 复杂问题我会自动转接人工客服',
      time: '现在',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const scrollId = useRef('msg-0');

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now(), role: 'user', content: text.trim(), time: now };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    scrollId.current = `msg-${userMsg.id}`;

    try {
      const history = messages.filter(m => m.id > 0).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));
      history.push({ role: 'user', content: text.trim() });

      const res = await chatWithSupport(history, ticketId);

      // Check if ticket was created
      if (res.ticketId && !ticketId) {
        setTicketId(res.ticketId);
      }

      // Check for escalation
      if (res.escalated || res.status === 'HUMAN_QUEUE') {
        const sysMsg: Message = {
          id: Date.now() + 1, role: 'system',
          content: '🔄 已转接人工客服，请稍候...',
          time: now,
        };
        setMessages(prev => [...prev, sysMsg]);
        scrollId.current = `msg-${sysMsg.id}`;
      }

      const aiMsg: Message = {
        id: Date.now() + 2, role: 'ai',
        content: res.reply || res.content || '抱歉，暂时无法回答，请稍后重试。',
        time: now,
      };
      setMessages(prev => [...prev, aiMsg]);
      scrollId.current = `msg-${aiMsg.id}`;
    } catch {
      const errMsg: Message = {
        id: Date.now() + 1, role: 'ai',
        content: '网络出了点问题，请检查网络后重试 😅',
        time: now,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (score: number) => {
    Taro.showToast({ title: `感谢您的${score >= 4 ? '好' : ''}评！`, icon: 'success' });
  };

  return (
    <View className='support-page'>
      {/* Header */}
      <View className='support-header'>
        <Text className='header-title'>在线客服</Text>
        <Text className='header-subtitle'>
          {ticketId ? `工单号: ${ticketId.slice(0, 8)}...` : 'AI智能客服 · 7×24小时'}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        scrollY
        className='message-list'
        scrollIntoView={scrollId.current}
        scrollWithAnimation
      >
        {messages.map(msg => (
          <View key={msg.id} id={`msg-${msg.id}`} className={`msg-row ${msg.role}`}>
            {msg.role !== 'user' && (
              <View className={`msg-avatar ${msg.role}`}>
                <Text>{msg.role === 'system' ? '📢' : '🤖'}</Text>
              </View>
            )}
            <View className={`msg-bubble ${msg.role}`}>
              <Text className='msg-text'>{msg.content}</Text>
            </View>
          </View>
        ))}
        {loading && (
          <View className='msg-row ai'>
            <View className='msg-avatar ai'><Text>🤖</Text></View>
            <View className='msg-bubble ai typing'>
              <Text className='msg-text'>正在处理...</Text>
            </View>
          </View>
        )}

        {/* Satisfaction rating */}
        {messages.length > 4 && !loading && (
          <View className='rate-section'>
            <Text className='rate-title'>对本次服务满意吗？</Text>
            <View className='rate-stars'>
              {[1, 2, 3, 4, 5].map(s => (
                <Text key={s} className='rate-star' onClick={() => handleRate(s)}>
                  {s <= 3 ? '⭐' : '⭐'}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <View className='quick-section'>
          <Text className='quick-title'>常见问题 👇</Text>
          <View className='quick-list'>
            {quickActions.map((q, i) => (
              <View key={i} className='quick-item' onClick={() => sendMessage(q)}>
                <Text>{q}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View className='input-bar'>
        <Input
          className='chat-input'
          placeholder='描述您的问题...'
          value={inputValue}
          onInput={(e) => setInputValue(e.detail.value)}
          onConfirm={() => sendMessage(inputValue)}
          confirmType='send'
          disabled={loading}
        />
        <View
          className={`send-btn ${inputValue.trim() && !loading ? 'active' : ''}`}
          onClick={() => sendMessage(inputValue)}
        >
          <Text>发送</Text>
        </View>
      </View>
    </View>
  );
}
