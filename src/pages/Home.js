import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home({ user }) {
  // Extract username before the '@' symbol
  const username = user?.signInDetails?.loginId?.split('@')[0] || 'Guest';
  
  // Typing effect states
  const [typedDescription, setTypedDescription] = useState('');
  const description = "本網站提供先進的文字轉語音功能，讓您輕鬆將文字轉化為高品質音頻。無論是學習語言、創作內容，或是提升資訊的可及性，我們都能滿足您的需求。";

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index + 1 < description.length) {
        setTypedDescription((prev) => prev + description[index]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 70); // Adjust typing speed here (e.g., 50ms per character)

    return () => clearInterval(typingInterval);
  }, [description]);

  return (
    <main className="home-container">
      <header className="home-header">
        <h1 className="home-title">歡迎, {username}</h1>
        <h2 className="home-subtitle">將文字轉換為語音，提升你的工作效率</h2>
        <p className="home-description">{typedDescription}</p>
        <Link to="/text-to-speech" className="home-button">
          開始使用文字轉語音
        </Link>
      </header>

      <section className="features-section">
        <div className="feature-item">
          <h3>多語言支援</h3>
          <p>支援多國語言和語音選擇，適用於不同需求。</p>
        </div>
        <div className="feature-item">
          <h3>高品質音效</h3>
          <p>採用高品質音效技術，呈現流暢自然的語音效果。</p>
        </div>
        <div className="feature-item">
          <h3>即時處理</h3>
          <p>快速生成音頻，提供即時響應，提升您的效率。</p>
        </div>
      </section>
    </main>
  );
}