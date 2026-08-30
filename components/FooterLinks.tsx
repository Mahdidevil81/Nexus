
import React from 'react';

const FooterLinks: React.FC = () => {
  return (
    <>
      <style>{`
        .nexus-footer {
          position: relative;
          width: 100%;
          padding: 60px 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          z-index: 10;
          margin-top: 80px;
          font-family: 'Inter', sans-serif;
        }

        .nexus-copyright {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
          text-transform: uppercase;
          letter-spacing: 4px;
          font-weight: 300;
          transition: all 0.3s ease;
        }

        .nexus-copyright:hover {
          color: rgba(255, 255, 255, 0.5);
        }

        .nexus-divider {
          width: 40px;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <footer className="nexus-footer">
        <div className="nexus-divider"></div>
        <div className="nexus-copyright">
          © 2026 Nexus Consciousness • Built by Mahdi Devil
        </div>
      </footer>
    </>
  );
};

export default React.memo(FooterLinks);
