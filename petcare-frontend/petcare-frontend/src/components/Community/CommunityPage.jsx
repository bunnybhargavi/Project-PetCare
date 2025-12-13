import React from 'react';
import Navbar from '../Layout/Navbar';
import CommunitySection from '../Dashboard/CommunitySection';
import { useAuth } from '../../context/AuthContext';

const CommunityPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto">
          <CommunitySection user={user} />
        </div>
      </div>
    </>
  );
};

export default CommunityPage;

