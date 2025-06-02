import { Acadena_backend } from 'declarations/Acadena_backend';
const CHUNK_SIZE = 1024 * 512; // 512KB per chunk

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
  },

  handleDocumentUpload: async (
    e,
    user,
    uploadForm,
    setUploadForm,
    setLoading,
    loadSystemStatus
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      const file = uploadForm.file;
      if (!file) throw new Error("No file selected");

      // 1. Generate a unique sessionId (could use Date.now + random)
      const sessionId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

      // 2. Start upload session
      const startRes = await Acadena_backend.startUpload(
        sessionId,
        uploadForm.studentId,
        user.role.InstitutionAdmin,
        { [uploadForm.documentType]: null },
        uploadForm.title,
        "", // description (add if you have)
        file.name,
        file.type
      );
      if (startRes.err) throw new Error("Failed to start upload session");

      // 3. Read and upload chunks
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let offset = 0;
      while (offset < uint8Array.length) {
        const chunk = Array.from(uint8Array.slice(offset, offset + CHUNK_SIZE));
        const chunkRes = await Acadena_backend.uploadChunk(sessionId, chunk);
        if (chunkRes.err) throw new Error("Failed to upload chunk");
        offset += CHUNK_SIZE;
      }

      // 4. Finalize upload
      const finalizeRes = await Acadena_backend.finalizeUpload(sessionId);
      if (finalizeRes.err) throw new Error("Failed to finalize upload");

      const [document, token] = finalizeRes.ok;
      alert(`Document uploaded successfully!\n\nToken: ${token}`);

      setUploadForm({
        studentId: '',
        documentType: 'Transcript',
        title: '',
        file: null
      });
      await loadSystemStatus();
    } catch (error) {
      alert('Error uploading document: ' + error.message);
    } finally {
      setLoading(false);
    }
  },

  fetchDocumentsByInstitution: async (institutionId, setDocuments, setLoading) => {
    setLoading(true);
    try {
      const result = await Acadena_backend.getDocumentsByInstitution(institutionId);
      if ('ok' in result) {
        setDocuments(result.ok);
      } else {
        alert('Error fetching documents: ' + JSON.stringify(result.err));
        setDocuments([]); // Optionally clear documents on error
      }
    } catch (error) {
      alert('Error fetching documents: ' + error.message);
      setDocuments([]); // Optionally clear documents on error
    } finally {
      setLoading(false); 
    }
  },
};
