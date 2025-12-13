import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaImage } from 'react-icons/fa';

const CommunitySection = ({ user }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'Sarah (Dog lover)',
            text: 'Has anyone tried the new park on 5th street? My Golden Retriever loves it! 🐕',
            time: '10:30 AM',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            isMe: false,
        },
        {
            id: 2,
            sender: 'Mike (Cat dad)',
            text: 'Is it fenced? My husky runs specifically fast 😅',
            time: '10:32 AM',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            isMe: false,
        },
        {
            id: 3,
            sender: 'You',
            text: 'Yes! It is fully fenced and has separate areas for big and small dogs.',
            time: '10:35 AM',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`,
            isMe: true,
        },
    ]);

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: messages.length + 1,
            sender: 'You',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`,
            isMe: true,
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // Simulate a reply
        setTimeout(() => {
            const reply = {
                id: messages.length + 2,
                sender: 'Emily (Vet student)',
                text: 'That sounds amazing! I should take my beagle there this weekend.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
                isMe: false,
            };
            setMessages((prev) => [...prev, reply]);
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px] bg-white rounded-3xl shadow-xl overflow-hidden animate-fadeIn border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center shadow-md z-10">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">💬</span> Pet Parents Community
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">
                        Connect, share tips, and chat with 1,240+ pet lovers online
                    </p>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                        <img
                            key={i}
                            className="w-10 h-10 rounded-full border-2 border-white"
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                            alt="User"
                        />
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                        +1k
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 bg-opacity-50"
                style={{ backgroundImage: 'radial-gradient(#e0e7ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-end gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <img
                            src={msg.avatar}
                            alt={msg.sender}
                            className="w-10 h-10 rounded-full shadow-sm border-2 border-white bg-white"
                        />
                        <div
                            className={`max-w-[70%] p-4 rounded-2xl shadow-sm relative group ${msg.isMe
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}
                        >
                            {!msg.isMe && (
                                <p className="text-xs font-bold text-indigo-600 mb-1">{msg.sender}</p>
                            )}
                            <p className="leading-relaxed">{msg.text}</p>
                            <span
                                className={`text-[10px] absolute bottom-1 right-3 ${msg.isMe ? 'text-purple-200' : 'text-gray-400'
                                    }`}
                            >
                                {msg.time}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                    <button
                        type="button"
                        className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                        <FaImage size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full pl-4 pr-10 py-3 bg-gray-100 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-xl transition-all outline-none text-gray-700"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                        >
                            <FaSmile size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPaperPlane size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommunitySection;
