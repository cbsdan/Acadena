import { useNavigate } from 'react-router-dom';

function AccountSetup({ onRegisterInstitution }) {
  const navigate = useNavigate();

  return (
    <div className="user-setup-required">
      <h3>Account Setup Required</h3>
      <p>You are authenticated but your account is not set up yet.</p>
      <p>Would you like to register an institution or claim an invitation?</p>
      <div className="setup-options">
        <button onClick={onRegisterInstitution}>
          Register Institution
        </button>
        <button onClick={() => navigate('/claim-invitation')}>
          Claim Invitation
        </button>
      </div>
    </div>
  );
}

export default AccountSetup;
