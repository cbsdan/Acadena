import { Acadena_backend } from 'declarations/Acadena_backend';

export const documentHandlers = {
  handleDocumentSubmit: async (
    e,
    user,
    documentForm,
    setDocumentForm,
    setLoading,
    loadSystemStatus
  ) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const documentType = { [documentForm.documentType]: null };
      
      const result = await Acadena_backend.issueDocument(
        documentForm.studentId,
        user.role.InstitutionAdmin,
        documentType,
        documentForm.title,
        documentForm.content
      );

      if ('ok' in result) {
        alert('Document issued successfully!');
        setDocumentForm({
          studentId: '',
          documentType: 'Transcript',
          title: '',
          content: ''
        });
        await loadSystemStatus();
      } else {
        alert('Error issuing document: ' + JSON.stringify(result.err));
      }
    } catch (error) {
      console.error('Error issuing document:', error);
      alert('Error issuing document: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};
