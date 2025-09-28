import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Dashboard from './interviewer/Dashboard';
import CandidateDetail from './interviewer/CandidateDetail';
import { selectAllCandidates } from '../store/slices/candidatesSlice';

const InterviewerTab = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  
  const candidates = useSelector(selectAllCandidates);

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="p-6">
      <Dashboard onViewCandidate={handleViewCandidate} />
      
      <CandidateDetail
        visible={detailVisible}
        candidate={selectedCandidate}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default InterviewerTab;