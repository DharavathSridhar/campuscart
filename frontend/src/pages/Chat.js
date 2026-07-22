import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { io } from 'socket.io-client';
import { FiSend, FiArrowLeft, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(userId || null);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });
    socket.current.emit('join');
    socket.current.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c => c.userId === msg.sender ? { ...c, lastMessage: msg } : c));
    });
    return () => socket.current?.disconnect();
  }, [user._id]);

  useEffect(() => {
    API.get('/messages/conversations').then(r => { setConversations(r.data.conversations); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeChat) {
      API.get(`/messages/${activeChat}`).then(r => {
        setMessages(r.data.messages);
        API.get(`/auth/me`).then(() => {}).catch(() => {});
      }).catch(() => {});
      const conv = conversations.find(c => c.userId === activeChat);
      if (conv) setChatUser(conv.user);
    }
  }, [activeChat, conversations]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const msg = { sender: user._id, receiver: activeChat, content: newMessage };
    try {
      await API.post('/messages', { receiverId: activeChat, content: newMessage });
      socket.current.emit('sendMessage', { ...msg, receiverId: activeChat });
      setConversations(prev => {
        const updated = prev.map(c => c.userId === activeChat ? { ...c, lastMessage: { content: newMessage, createdAt: new Date() } } : c);
        return updated;
      });
      setNewMessage('');
    } catch (err) { toast.error('Failed to send message'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
              ) : (
                conversations.map(conv => (
                  <button key={conv.userId} onClick={() => setActiveChat(conv.userId)} className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-all ${activeChat === conv.userId ? 'bg-primary-50' : ''}`}>
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.user?.profileImage ? <img src={conv.user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" /> : <FiUser className="text-primary-600" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-gray-800 text-sm truncate">{conv.user?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.content}</p>
                    </div>
                    {conv.unreadCount > 0 && <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {activeChat ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                  <button onClick={() => setActiveChat(null)} className="md:hidden p-2 rounded-lg hover:bg-gray-100"><FiArrowLeft /></button>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    {chatUser?.profileImage ? <img src={chatUser.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" /> : <FiUser className="text-primary-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{chatUser?.fullName}</p>
                    <p className="text-xs text-gray-400">{chatUser?.campus}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((msg, i) => (
                    <div key={msg._id || i} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${msg.sender === user._id ? 'bg-primary-500 text-white rounded-br-md' : 'bg-white text-gray-800 shadow-sm rounded-bl-md'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === user._id ? 'text-primary-100' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex space-x-3">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="input-field flex-1" placeholder="Type a message..." />
                  <button type="submit" disabled={!newMessage.trim()} className="btn-primary !rounded-xl !px-5 disabled:opacity-50"><FiSend /></button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center"><FiUser className="text-5xl mx-auto mb-3 opacity-30" /><p>Select a conversation to start chatting</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
