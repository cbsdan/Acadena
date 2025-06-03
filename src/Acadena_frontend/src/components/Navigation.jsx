import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ getNavItems }) => {
  const location = useLocation();
  const navItems = getNavItems();

  return (
    <nav className="main-nav">
      {navItems.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          className={location.pathname === item.path ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
