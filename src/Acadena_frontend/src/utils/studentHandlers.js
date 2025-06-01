import { Acadena_backend } from 'declarations/Acadena_backend';

export const studentHandlers = {
  handleStudentSubmit: async (
    e,
    user,
    studentForm,
    setStudentForm,
    setLoading,
    loadMyStudents,
    loadMyInvitationCodes,
    loadSystemStatus
  ) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await Acadena_backend.createStudentWithInvitationCode(
        user.role.InstitutionAdmin,
        studentForm.firstName,
        studentForm.lastName,
        studentForm.email,
        studentForm.studentNumber,
        studentForm.program,
        parseInt(studentForm.yearLevel)
      );

      if ('ok' in result) {
        const [student, invitationCode] = result.ok;
        alert(`Student registered successfully!\n\nInvitation Code: ${invitationCode}\n\nPlease share this code with ${student.firstName} ${student.lastName} so they can claim their account using Internet Identity.`);
        setStudentForm({
          firstName: '',
          lastName: '',
          email: '',
          studentNumber: '',
          program: '',
          yearLevel: 1
        });
        await loadMyStudents();
        await loadMyInvitationCodes();
        await loadSystemStatus();
      } else {
        alert('Error registering student: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error registering student:', error);
      alert('Error registering student: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};
