import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Users, LogOut } from 'lucide-react';

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      pollInterval.current = setInterval(() => {
        loadMessages();
        loadUsers();
      }, 2000);
    }
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [isLoggedIn]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const savedUsername = await window.storage.get('chat_username');
      if (savedUsername && savedUsername.value) {
        setUsername(savedUsername.value);
        setIsLoggedIn(true);
      }
      await loadMessages();
      await loadUsers();
    } catch (error) {
      console.log('No saved data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const result = await window.storage.get('chat_messages', true);
      if (result && result.value) {
        setMessages(JSON.parse(result.value));
      }
    } catch (error) {
      setMessages([]);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await window.storage.get('chat_users', true);
      if (result && result.value) {
        const allUsers = JSON.parse(result.value);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const activeUsers = allUsers.filter(u => u.lastSeen > fiveMinutesAgo);
        setUsers(activeUsers);
      }
    } catch (error) {
      setUsers([]);
    }
  };

  const updateUserPresence = async (user) => {
    try {
      const result = await window.storage.get('chat_users', true);
      let allUsers = [];
      if (result && result.value) {
        allUsers = JSON.parse(result.value);
      }
      const existingIndex = allUsers.findIndex(u => u.username === user);
      if (existingIndex !== -1) {
        allUsers[existingIndex].lastSeen = Date.now();
      } else {
        allUsers.push({ username: user, lastSeen: Date.now() });
      }
      await window.storage.set('chat_users', JSON.stringify(allUsers), true);
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  };

  const handleLogin = async () => {
    if (username.trim()) {
      try {
        await window.storage.set('chat_username', username.trim());
        await updateUserPresence(username.trim());
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to login:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('chat_username');
      setIsLoggedIn(false);
      setUsername('');
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const sendMessage = async () => {
    if (input.trim() && username) {
      const newMessage = {
        id: Date.now(),
        username: username,
        text: input.trim(),
        timestamp: Date.now()
      };

      try {
        const result = await window.storage.get('chat_messages', true);
        let allMessages = [];
        if (result && result.value) {
          allMessages = JSON.parse(result.value);
        }
        allMessages.push(newMessage);
        if (allMessages.length > 100) {
          allMessages = allMessages.slice(-100);
        }
        await window.storage.set('chat_messages', JSON.stringify(allMessages), true);
        await updateUserPresence(username);
        setMessages(allMessages);
        setInput('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading chat...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-blue-500">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Users size={64} className="text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Join Chat Room
          </h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter your username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            maxLength={20}
          />
          <button
            onClick={handleLogin}
            disabled={!username.trim()}
            className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 font-semibold"
          >
            Join Chat
          </button>
          <p className="text-sm text-gray-500 mt-4 text-center">
            This is a shared chat room. All messages are visible to everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-purple-500" />
            <h1 className="text-2xl font-bold text-gray-800">Chat Room</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <User size={18} className="text-gray-600" />
              <span className="font-semibold text-gray-800">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col bg-white m-4 rounded-lg shadow-md">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.username === username
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {msg.username}
                        </span>
                        <span
                          className={`text-xs ${
                            msg.username === username ? 'text-purple-200' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="break-words">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Send size={20} />
                  Send
                </button>
              </div>
            </div>
          </div>

          <div className="w-64 bg-white m-4 ml-0 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} />
              Online Users ({users.length})
            </h2>
            <div className="space-y-2">
              {users.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-800">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
