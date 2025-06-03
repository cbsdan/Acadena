import { useNavigate } from 'react-router-dom';

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="access-denied">
      <h3>Access Denied</h3>
      <p>You don't have permission to access this resource.</p>
      <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  );
}

export default AccessDenied;
