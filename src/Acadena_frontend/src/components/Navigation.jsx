import React from 'react';

const Navigation = ({ getNavItems, currentView, setCurrentView }) => (
  <nav className="main-nav">
    {getNavItems().map((item) => (
      <button
        key={item.key}
        className={currentView === item.key ? 'active' : ''}
        onClick={() => setCurrentView(item.key)}
      >
        {item.label}
      </button>
    ))}
  </nav>
);

export default Navigation;
