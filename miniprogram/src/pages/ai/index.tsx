import { useState, useRef } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { chatWithAI } from '@/utils/api';
import { CHAT_ICONS } from '@/utils/icons';
import './index.scss';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

const quickQuestions = [
  '推荐适合亲子游的村落',
  '清远有哪些瑶族文化体验？',
  '英西峰林自驾路线怎么走？',
  '三天两夜清远行程推荐',
  '清远有什么特产值得买？',
  '哪个温泉最值得去？',
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0, role: 'ai',
      content: '你好！我是智游清远AI助手\n\n我可以帮你：\n• 推荐适合你的清远村落\n• 规划行程路线\n• 解答旅行问题\n• 介绍瑶族/壮族文化\n\n试试问我吧！',
      time: '现在',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollId = useRef('msg-0');

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now(), role: 'user', content: text.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    scrollId.current = `msg-${userMsg.id}`;

    try {
      const history = messages.filter(m => m.id > 0).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));
      const res = await chatWithAI(text.trim(), history);
      const aiMsg: Message = {
        id: Date.now() + 1, role: 'ai',
        content: res.reply || res.recommendation || '抱歉，我暂时无法回答这个问题，请稍后再试。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
      scrollId.current = `msg-${aiMsg.id}`;
    } catch (err) {
      const errMsg: Message = {
        id: Date.now() + 1, role: 'ai',
        content: '网络出了点问题，请检查网络后重试',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='ai-page'>
      {/* Messages */}
      <ScrollView
        scrollY
        className='message-list'
        scrollIntoView={scrollId.current}
        scrollWithAnimation
      >
        {messages.map(msg => (
          <View key={msg.id} id={`msg-${msg.id}`} className={`msg-row ${msg.role}`}>
            {msg.role === 'ai' && (
              <View className='msg-avatar'>
                <Image src={CHAT_ICONS.robot} className='ai-avatar-icon' />
              </View>
            )}
            <View className={`msg-bubble ${msg.role}`}>
              <Text className='msg-text'>{msg.content}</Text>
            </View>
            <Text className='msg-time'>{msg.time}</Text>
          </View>
        ))}
        {loading && (
          <View className='msg-row ai'>
            <View className='msg-bubble ai typing'>
              <Text className='msg-text'>思考中...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <View className='quick-questions'>
          <Text className='quick-title'>试试这些问题</Text>
          <View className='quick-list'>
            {quickQuestions.map((q, i) => (
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
          placeholder='输入你的旅行问题...'
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
