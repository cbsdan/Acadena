import { Acadena_backend } from 'declarations/Acadena_backend';

export const invitationHandlers = {
  handleInvitationCodeSubmit: async (
    e,
    invitationCodeForm,
    setInvitationCodeForm,
    setLoading,
    setCurrentView
  ) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, check the invitation code info
      const infoResult = await Acadena_backend.getInvitationCodeInfo(invitationCodeForm.code);
      if ('err' in infoResult) {
        alert('Invalid invitation code or code not found.');
        setLoading(false);
        return;
      }
      
      const info = infoResult.ok;
      if (!info.isValid) {
        alert('This invitation code has expired or has already been used.');
        setLoading(false);
        return;
      }
      
      // Show confirmation
      const confirmClaim = confirm(`You are about to claim an account for:\n\nStudent: ${info.studentName}\nInstitution: ${info.institutionId}\n\nThis will link your Internet Identity to this student account. Continue?`);
      
      if (!confirmClaim) {
        setLoading(false);
        return;
      }
      
      // Claim the invitation code
      const result = await Acadena_backend.claimInvitationCode(invitationCodeForm.code);
      
      if ('ok' in result) {
        alert('Account successfully claimed! You can now log in with your Internet Identity.');
        setInvitationCodeForm({ code: '' });
        setCurrentView('login');
      } else {
        alert('Error claiming invitation code: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error claiming invitation code:', error);
      alert('Error claiming invitation code: ' + error.message);
    } finally {
      setLoading(false);
    }
  },

  handleCheckInvitationCode: async (
    invitationCodeForm,
    setInvitationCodeInfo,
    setLoading
  ) => {
    if (!invitationCodeForm.code) {
      alert('Please enter an invitation code.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await Acadena_backend.getInvitationCodeInfo(invitationCodeForm.code);
      if ('ok' in result) {
        setInvitationCodeInfo(result.ok);
      } else {
        alert('Invalid invitation code or code not found.');
        setInvitationCodeInfo(null);
      }
    } catch (error) {
      console.error('Error checking invitation code:', error);
      alert('Error checking invitation code: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};
