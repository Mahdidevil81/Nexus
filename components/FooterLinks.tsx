
import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const FooterLinks: React.FC = () => {
  return (
    <>
      <style>{`
        .nexus-footer {
          position: relative;
          width: 100%;
          padding: 40px 0;
          background: linear-gradient(to top, rgba(10, 10, 10, 0.9), transparent);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          z-index: 10;
          margin-top: 50px;
          font-family: 'Inter', sans-serif;
        }

        .nexus-social-links {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .nexus-social-item {
          color: #C5A059;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          opacity: 0.6;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .nexus-social-item:hover {
          opacity: 1;
          text-shadow: 0 0 10px rgba(197, 160, 89, 0.5);
          transform: translateY(-3px);
        }

        .nexus-social-item::after {
          content: '';
          width: 0;
          height: 1px;
          background: #C5A059;
          transition: width 0.3s ease;
        }

        .nexus-social-item:hover::after {
          width: 100%;
        }

        .nexus-copyright {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 10px;
        }

        .nexus-divider {
          width: 50px;
          height: 1px;
          background: rgba(197, 160, 89, 0.3);
          margin-bottom: 10px;
        }
      `}</style>

      <footer className="nexus-footer">
        <div className="nexus-divider"></div>
        
        <div className="nexus-social-links">
          <a href="https://instagram.com/mahdi.devil" target="_blank" rel="noopener noreferrer" className="nexus-social-item">Instagram</a>
          <a href="https://t.me/mahdi_devil" target="_blank" rel="noopener noreferrer" className="nexus-social-item">Telegram</a>
          <a href="https://youtube.com/@mahdidevil" target="_blank" rel="noopener noreferrer" className="nexus-social-item">YouTube</a>
          <a href="https://github.com/mahdidevil" target="_blank" rel="noopener noreferrer" className="nexus-social-item">GitHub</a>
        </div>

        <div className="nexus-copyright">
          © 2026 Nexus Consciousness • Architected by Mahdi Devil
        </div>
      </footer>
    </>
  );
};

export default FooterLinks;
