import React, { useState } from "react";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);

    // Simulate bot reply
    setTimeout(() => {
      const botResponse = { sender: "bot", text: "Thanks for your question! We'll respond soon." };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="floating-chatbot-container">
      {/* Toggle Button */}
      <button
        onClick={toggleChat}
        className="floating-chatbot-toggle"
        aria-label="Open Chatbot"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <span className="chat-header-title">EduBot Assistant</span>
            <button onClick={toggleChat} className="chat-close-btn">✖</button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Type your message..."
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="chat-send-btn"
                disabled={!input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
