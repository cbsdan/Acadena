import React, { useState } from 'react';
import './assets/styles/dashboard.css';
import './assets/styles/institutionregister.css';
import { useDispatch, useSelector } from 'react-redux';
import { transferStudentToInstitution } from '../redux/actions/transferAction';

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

  // Filter institutions by search
  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.id.toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
              {filteredInstitutions.length === 0 && <div style={{ color: '#64748b' }}>No institutions found.</div>}
              {filteredInstitutions.map(inst => (
                <div
                  key={inst.id}
                  className={`info-card card-0${selectedInstitution && selectedInstitution.id === inst.id ? ' selected' : ''}`}
                  style={{ cursor: 'pointer', border: selectedInstitution && selectedInstitution.id === inst.id ? '2px solid #667eea' : undefined }}
                  onClick={() => setSelectedInstitution(inst)}
                >
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{inst.name}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>ID: {inst.id}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>Type: {inst.type}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>Location: {inst.location}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="info-label">Student ID to Transfer</label>
            <input
              className="input"
              type="text"
              placeholder="Enter student ID..."
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }}
            />
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
      </div>
    </div>
  );
};

export default Transfer;
