import React from 'react';
import CommunicationManager from '../components/CommunicationManager';
import { MessageSquare } from 'lucide-react';

const CommunicationPage = () => {
  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <div>
            <h1>Communication Hub</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>
              Manage rewards, task assignments, and system notices from one central location.
            </p>
          </div>
          <div className="page-actions desktop-only">
            <div className="chip" style={{ background: 'rgba(255,255,255,0.16)', color: 'white', borderColor: 'rgba(255,255,255,0.16)' }}>
              <MessageSquare size={14} />
              Operations Center
            </div>
          </div>
        </div>
      </section>

      <CommunicationManager />
    </div>
  );
};

export default CommunicationPage;
