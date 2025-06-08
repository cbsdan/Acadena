import React, { useState } from 'react';
import './assets/styles/dashboard.css';
import './assets/styles/institutionregister.css';
import { useDispatch, useSelector } from 'react-redux';
import { transferStudentToInstitution, fetchTransferRequests } from '../redux/actions/transferAction';
import { fetchAllInstitutions } from '../redux/actions/institutionsAction';
import { fetchAllStudents } from '../redux/actions/studentAction';

const Transfer = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [transferStatus, setTransferStatus] = useState(null);

  // Use the correct selector for institutions
  const institutions = useSelector(state => state.institutions.institutions) || [];
  // If you want to use students from Redux, ensure your studentReducer has a students array
  const students = useSelector(state => state.student.students) || [];

  const transferRequests = useSelector(state => state.transfer.requests) || [];
  const transferLoading = useSelector(state => state.transfer.loading);
  const transferError = useSelector(state => state.transfer.error);

  // Filter institutions by search
  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.id.toLowerCase().includes(search.toLowerCase())
  );

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
    dispatch(transferStudentToInstitution({ studentId, institutionId: selectedInstitution.id }))
      .then(res => setTransferStatus('Transfer successful!'))
      .catch(() => setTransferStatus('Transfer failed.'));
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
            disabled={!selectedInstitution || !studentId}
          >
            Transfer Student
          </button>
          {transferStatus && <div style={{ marginTop: 16, color: transferStatus.includes('success') ? '#10b981' : '#ef4444' }}>{transferStatus}</div>}
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
