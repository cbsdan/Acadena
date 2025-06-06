import { Acadena_backend } from 'declarations/Acadena_backend';
import { internetIdentityService } from '../services/InternetIdentityService';
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

      const sessionId = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const actor = internetIdentityService.getActor();
      if (!actor) throw new Error("Not authenticated. Please log in.");

      const startRes = await actor.startUpload(
        sessionId,
        uploadForm.studentId,
        user.role.InstitutionAdmin,
        { [uploadForm.documentType]: null },
        uploadForm.title,
        "",
        file.name,
        file.type
      );
      if (startRes.err) throw new Error("Failed to start upload session");

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let offset = 0;
      while (offset < uint8Array.length) {
        const chunk = Array.from(uint8Array.slice(offset, offset + CHUNK_SIZE));
        const chunkRes = await actor.uploadChunk(sessionId, chunk);
        if (chunkRes.err) throw new Error("Failed to upload chunk");
        offset += CHUNK_SIZE;
      }

      const finalizeRes = await actor.finalizeUpload(sessionId);
      if (finalizeRes.err) throw new Error("Failed to finalize upload");

      const [document, token] = finalizeRes.ok;

      setUploadForm({
        studentId: '',
        documentType: 'Transcript',
        title: '',
        file: null
      });

      await loadSystemStatus();

      return { document, token };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
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

  fetchDocumentsByStudent: async (studentId, setDocuments, setLoading) => {
    setLoading(true);
    try {
      const actor = internetIdentityService.getActor();
      const result = await actor.getDocumentsByStudent(studentId);
      if ('ok' in result) {
        setDocuments(result.ok);
        return result.ok;
      } else {
        console.error('Error fetching student documents:', result.err);
        setDocuments([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching student documents:', error);
      setDocuments([]);
      return [];
    } finally {
      setLoading(false);
    }
  },

  getDocumentById: async (documentId) => {
    try {
      const result = await Acadena_backend.getDocument(documentId);
      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error fetching document by ID:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Error fetching document by ID:', error);
      return null;
    }
  },

  verifyDocument: async (documentId, setLoading) => {
    if (setLoading) setLoading(true);
    try {
      const result = await Acadena_backend.verifyDocument(documentId);
      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error verifying document:', result.err);
        return false;
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      return false;
    } finally {
      if (setLoading) setLoading(false);
    }
  },

  downloadDocument: async (documentData) => {
    try {
      // Create downloadable content with document metadata and content
      const documentContent = `
ACADENA DOCUMENT VERIFICATION REPORT
====================================

Document Details:
- Title: ${documentData.title}
- Type: ${Object.keys(documentData.documentType)[0] || 'Unknown'}
- Document ID: ${documentData.id}
- Issue Date: ${new Date(Number(documentData.issueDate) / 1000000).toLocaleDateString()}
- Issuing Institution: ${documentData.issuingInstitutionId}
- Verification Status: ${documentData.isVerified ? 'VERIFIED ✓' : 'PENDING VERIFICATION'}

Digital Signature:
${documentData.signature}

Document Content:
${documentData.content || 'No content available'}

${documentData.description ? `\nDescription:\n${documentData.description}` : ''}

---
This document was generated from the Acadena blockchain-based document verification system.
Verification can be performed using the document ID and digital signature.
Generated on: ${new Date().toLocaleString()}
      `.trim();

      // Create and download the file using global window.document
      const blob = new Blob([documentContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${documentData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${documentData.id}.txt`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading document:', error);
      return false;
    }
  },
};
