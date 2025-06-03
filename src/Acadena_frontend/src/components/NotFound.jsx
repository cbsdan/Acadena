import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="error-message">
      <h3>Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  );
}

export default NotFound;
