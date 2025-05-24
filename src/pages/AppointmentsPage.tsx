import React from 'react';
import AppointmentBooking from '../components/AppointmentBooking';
import AppointmentsList from '../components/AppointmentsList';

const AppointmentsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <AppointmentBooking />
        </div>
        <div>
          <AppointmentsList />
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage; 