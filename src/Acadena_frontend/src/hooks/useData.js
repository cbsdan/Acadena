import { useState, useEffect } from 'react';
import { internetIdentityService } from '../services/InternetIdentityService';

export const useData = (user, isAuthenticated) => {
  const [institutions, setInstitutions] = useState([]);
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [myInvitationCodes, setMyInvitationCodes] = useState([]);
  const [incomingTransferRequests, setIncomingTransferRequests] = useState([]);

  const loadSystemStatus = async () => {
    try {
      const actor = internetIdentityService.getActor();
      if (actor) {
        const status = await actor.getSystemStatus();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Error loading system status:', error);
    }
  };

  const loadInstitutions = async () => {
    try {
      const actor = internetIdentityService.getActor();
      if (actor) {
        const institutionsList = await actor.getAllInstitutions();
        setInstitutions(institutionsList);
      }
    } catch (error) {
      console.error('Error loading institutions:', error);
    }
  };

  const loadMyStudents = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    
    try {
      const actor = internetIdentityService.getActor();
      if (actor) {
        const result = await actor.getStudentsByInstitution(user.role.InstitutionAdmin);
        if ('ok' in result) {
          setStudents(result.ok);
        } else if ('err' in result) {
          // Optionally, handle backend error here (e.g., show toast)
          setStudents([]);
        }
      }
    } catch (error) {
      setStudents([]);
      console.error('Error loading students:', error);
    }
  };

  const loadMyDocuments = async () => {
    try {
      const actor = internetIdentityService.getActor();
      if (actor) {
        const result = await actor.getMyDocuments();
        if ('ok' in result) {
          setDocuments(result.ok);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadMyInvitationCodes = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    try {
      const actor = internetIdentityService.getActor();
      if (actor) {
        const result = await actor.getMyInvitationCodes();
        if ('ok' in result) {
          setMyInvitationCodes(result.ok);
        } else if ('err' in result) {
          console.error('Error loading invitation codes:', result.err);
          setMyInvitationCodes([]);
        }
      }
    } catch (error) {
      console.error('Error loading invitation codes:', error);
      setMyInvitationCodes([]);
    }
  };

  // Add a loader for transfer requests, only incoming
  const loadIncomingTransferRequests = async () => {
    if (!user || !user.role.InstitutionAdmin) return;
    try {
      const actor = internetIdentityService.getActor();
      if (actor) {
        const requests = await actor.getTransferRequestsForInstitution();
        // Only show incoming (to this institution, but not created by this institution)
        const filtered = requests.filter(req => req.toInstitutionId === user.role.InstitutionAdmin && req.fromInstitutionId !== user.role.InstitutionAdmin);
        setIncomingTransferRequests(filtered);
      }
    } catch (error) {
      setIncomingTransferRequests([]);
      console.error('Error loading transfer requests:', error);
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
          await loadIncomingTransferRequests();
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
    incomingTransferRequests,
    setIncomingTransferRequests,
    loadData,
    loadSystemStatus,
    loadInstitutions,
    loadMyStudents,
    loadMyDocuments,
    loadMyInvitationCodes,
    loadIncomingTransferRequests
  };
};
