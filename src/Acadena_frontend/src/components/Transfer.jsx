import React, { useState } from 'react';
import './assets/styles/dashboard.css';
import './assets/styles/institutionregister.css';
import { useDispatch, useSelector } from 'react-redux';
import { transferStudentToInstitution, fetchTransferRequests } from '../redux/actions/transferAction';
import { fetchAllInstitutions } from '../redux/actions/institutionsAction';
import { fetchAllStudents } from '../redux/actions/studentAction';
import { useAuth } from '../hooks';
import { acceptTransferRequest } from '../redux/actions/acceptTransferRequest';

const Transfer = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [toast, setToast] = useState(null);

  // Use the correct selector for institutions
  const institutions = useSelector(state => state.institutions.institutions) || [];
  // If you want to use students from Redux, ensure your studentReducer has a students array
  const students = useSelector(state => state.student.students) || [];

  const transferRequests = useSelector(state => state.transfer.requests) || [];
  const transferLoading = useSelector(state => state.transfer.loading);
  const transferError = useSelector(state => state.transfer.error);

  // Filter institutions by search and exclude current institution
  const filteredInstitutions = institutions.filter(inst =>
    (inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.id.toLowerCase().includes(search.toLowerCase())) &&
    (!user?.role?.InstitutionAdmin || inst.id !== user.role.InstitutionAdmin)
  );

  // Check if the selected student is already being transferred
  const isStudentBeingTransferred = studentId && transferRequests.some(req => req.studentId === studentId && req.status === 'pending');

  // Fetch all students for dropdown (reuse document fetch logic if needed)
  // For this example, we assume students are already in Redux as state.student.students
  // If not, you can dispatch an action to fetch them here (e.g., useEffect)

  React.useEffect(() => {
    dispatch(fetchAllInstitutions());
    dispatch(fetchAllStudents());
    dispatch(fetchTransferRequests());
  }, [dispatch]);

  const handleTransfer = () => {
    if (!selectedInstitution || !studentId) return;
    dispatch(transferStudentToInstitution({ studentId, toInstitutionId: selectedInstitution.id }))
      .then(res => {
        setToast({ type: 'success', message: 'Transfer request sent!' });
        setTimeout(() => setToast(null), 3000);
      })
      .catch(() => {
        setToast({ type: 'error', message: 'Transfer failed.' });
        setTimeout(() => setToast(null), 3000);
      });
  };

  const handleAccept = (transferId) => {
    dispatch(acceptTransferRequest(transferId))
      .then(res => {
        if (!res.error) {
          setToast({ type: 'success', message: 'Transfer accepted!' });
          dispatch(fetchTransferRequests());
        } else {
          setToast({ type: 'error', message: res.error.message || 'Accept failed.' });
        }
        setTimeout(() => setToast(null), 3000);
      });
  };

  return (
    <div className="dashboard" style={{ minHeight: '100vh' }}>
      <div className="dashboard-wrapper">
        <div className="content-section" style={{ maxWidth: 700, margin: '2rem auto' }}>
          <h2 className="section-title" style={{ marginBottom: 24 }}>Transfer Student to Another Institution</h2>
          <div style={{ marginBottom: 24 }}>
            <label className="info-label">Search Institution</label>
            <input
              className="input"
              type="text"
              placeholder="Enter institution name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="info-label">Select Institution</label>
            <select
              className="input"
              value={selectedInstitution ? selectedInstitution.id : ''}
              onChange={e => {
                const inst = institutions.find(i => i.id === e.target.value);
                setSelectedInstitution(inst || null);
              }}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }}
            >
              <option value="">Select an institution...</option>
              {filteredInstitutions.length === 0 && <option disabled>No institutions found</option>}
              {filteredInstitutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.id})
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="info-label">Select Student to Transfer</label>
            <select
              className="input"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }}
            >
              <option value="">Select a student...</option>
              {students && students.length > 0 ? (
                students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.id})
                  </option>
                ))
              ) : (
                <option disabled>No students found</option>
              )}
            </select>
          </div>
          <button
            className="action-btn"
            style={{ width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 700, fontSize: 16, padding: 14, borderRadius: 10, border: 'none', marginBottom: 16 }}
            onClick={handleTransfer}
            disabled={!selectedInstitution || !studentId || isStudentBeingTransferred}
            title={isStudentBeingTransferred ? 'This student already has a pending transfer request.' : ''}
          >
            Transfer Student
          </button>
          {/* Toast Notification */}
          {toast && (
            <div className={`toast-notification ${toast.type}`} style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
              <div className="toast-content">
                <svg className="toast-icon" viewBox="0 0 24 24" fill="none">
                  {toast.type === 'success' ? (
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" />
                  ) : (
                    <g>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
                    </g>
                  )}
                </svg>
                <span>{toast.message}</span>
              </div>
            </div>
          )}
        </div>
        {/* Transfer Requests Panel */}
        <div className="content-section" style={{ maxWidth: 700, margin: '2rem auto', marginTop: 32, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef', padding: 24 }}>
          <h3 style={{ marginBottom: 16, color: '#4f46e5' }}>Transfer Requests</h3>
          {transferLoading && <div>Loading transfer requests...</div>}
          {transferError && <div style={{ color: '#ef4444' }}>Error: {transferError}</div>}
          {(!transferLoading && transferRequests.length === 0) && <div style={{ color: '#64748b' }}>No transfer requests found.</div>}
          {transferRequests.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#e0e7ef' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>Student</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>From</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>To</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transferRequests.map((req, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>{req.studentName || req.studentId}</td>
                    <td style={{ padding: 8 }}>{req.fromInstitutionName || req.fromInstitutionId}</td>
                    <td style={{ padding: 8 }}>{req.toInstitutionName || req.toInstitutionId}</td>
                    <td style={{ padding: 8 }}>{req.status || 'Pending'}</td>
                    <td style={{ padding: 8 }}>{req.date ? new Date(req.date).toLocaleString() : ''}</td>
                    <td style={{ padding: 8 }}>
                      {req.status === 'pending' && (
                        <button
                          className="action-btn"
                          style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => handleAccept(req.id)}
                        >
                          Accept
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;
