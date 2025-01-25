import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          語音轉換器
        </Link>

        {/* Hamburger Icon with animated lines */}
        <div className={`navbar-toggle ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>
      </div>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <Link to="/" className="navbar-link" onClick={toggleMenu}>主畫面</Link>
        <Link to="/text-to-speech" className="navbar-link" onClick={toggleMenu}>語音轉換器</Link>
        <Link to="/history" className="navbar-link" onClick={toggleMenu}>歷史紀錄</Link>
        <Link to="/profile" className="navbar-link" onClick={toggleMenu}>個人資料</Link>
        <a className={"logout-button navbar-link"} onClick={onSignOut}>登出</a>
      </div>
    </nav>
  );
}