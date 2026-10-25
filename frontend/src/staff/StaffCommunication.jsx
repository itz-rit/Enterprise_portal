import React from 'react';
import DailyRewardCard from '../components/DailyRewardCard';
import StaffCommunicationHub from '../components/StaffCommunicationHub';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffCommunicationPage = () => {
  const { staffUser } = useStaffAuth();
  
  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-8">
      <DailyRewardCard />
      <StaffCommunicationHub userId={staffUser?._id} />
    </div>
  );
};

export default StaffCommunicationPage;
