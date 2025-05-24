import React from 'react';

const CodePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Coding Point</h1>
          <p className="text-xl text-blue-100">We're working on something amazing.</p>
          <p className="text-2xl mt-6 text-white font-semibold">Coming Soon 🚀</p>
        </div>
      </section>
    </>
  );
};

export default CodePage;
