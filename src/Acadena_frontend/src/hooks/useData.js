import { useState, useEffect } from 'react';
import { Acadena_backend } from 'declarations/Acadena_backend';

export const useData = (user, isAuthenticated) => {
  const [institutions, setInstitutions] = useState([]);
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [myInvitationCodes, setMyInvitationCodes] = useState([]);

  const loadSystemStatus = async () => {
    try {
      const status = await Acadena_backend.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const loadInstitutions = async () => {
    try {
      const institutionsList = await Acadena_backend.getAllInstitutions();
      setInstitutions(institutionsList);
    } catch (error) {
      console.error('Error loading institutions:', error);
    }
  };

  const loadMyStudents = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    
    try {
      const result = await Acadena_backend.getStudentsByInstitution(user.role.InstitutionAdmin);
      if ('ok' in result) {
        setStudents(result.ok);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadMyDocuments = async () => {
    try {
      const result = await Acadena_backend.getMyDocuments();
      if ('ok' in result) {
        setDocuments(result.ok);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadMyInvitationCodes = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    
    try {
      const result = await Acadena_backend.getMyInvitationCodes();
      if ('ok' in result) {
        setMyInvitationCodes(result.ok);
      }
    } catch (error) {
      console.error('Error loading invitation codes:', error);
    }
  };

  const loadData = async () => {
    try {
      await loadSystemStatus();
      await loadInstitutions();
      
      if (user) {
        if (user.role.InstitutionAdmin) {
          await loadMyStudents();
          await loadMyInvitationCodes();
        } else if (user.role.Student) {
          await loadMyDocuments();
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, user]);

  return {
    institutions,
    setInstitutions,
    students,
    setStudents,
    documents,
    setDocuments,
    systemStatus,
    setSystemStatus,
    myInvitationCodes,
    setMyInvitationCodes,
    loadData,
    loadSystemStatus,
    loadInstitutions,
    loadMyStudents,
    loadMyDocuments,
    loadMyInvitationCodes
  };
};
