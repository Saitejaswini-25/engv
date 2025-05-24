import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Upload, Download, Clock, User } from 'lucide-react';

interface Handout {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploadedBy: string;
  uploadDate: string;
  category: string;
  fileSize: string;
}

const Handouts: React.FC = () => {
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [newHandout, setNewHandout] = useState({
    title: '',
    description: '',
    category: 'General',
    file: null as File | null
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { currentUser } = useAuth();

  // Mock data for demonstration
  useEffect(() => {
    setHandouts([
      {
        id: '1',
        title: 'Aptitude Preparation Guide',
        description: 'Comprehensive guide for aptitude test preparation including tips and tricks',
        fileUrl: '#',
        uploadedBy: 'Admin',
        uploadDate: '2024-03-20',
        category: 'Aptitude',
        fileSize: '2.5 MB'
      },
      {
        id: '2',
        title: 'Technical Interview Tips',
        description: 'Essential tips and common questions for technical interviews',
        fileUrl: '#',
        uploadedBy: 'Admin',
        uploadDate: '2024-03-19',
        category: 'Technical',
        fileSize: '1.8 MB'
      },
      {
        id: '3',
        title: 'Logical Reasoning Practice',
        description: 'Practice questions and solutions for logical reasoning',
        fileUrl: '#',
        uploadedBy: 'Admin',
        uploadDate: '2024-03-18',
        category: 'Logical',
        fileSize: '3.2 MB'
      }
    ]);
  }, []);

  const categories = ['All', 'Aptitude', 'Technical', 'Logical', 'Verbal', 'General'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewHandout(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would upload the file to Firebase Storage
    // and save the metadata to Firestore
    alert('File upload functionality will be implemented with Firebase');
  };

  const filteredHandouts = selectedCategory === 'All' 
    ? handouts 
    : handouts.filter(h => h.category === selectedCategory);

  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Please login to access handouts</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Study Handouts</h1>
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Section - Only visible to the allowed user */}
      {currentUser.uid === 'mI00k7qWEyX6XYmjHD181DcV7i82' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Handout
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newHandout.title}
                  onChange={(e) => setNewHandout(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newHandout.category}
                  onChange={(e) => setNewHandout(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {categories.filter(c => c !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newHandout.description}
                onChange={(e) => setNewHandout(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Handout
            </button>
          </form>
        </div>
      )}

      {/* Handouts List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHandouts.map((handout) => (
          <div key={handout.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                {handout.category}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">{handout.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{handout.description}</p>
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <span>Size: {handout.fileSize}</span>
              </div>
            </div>
            <a
              href={handout.fileUrl}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Handouts; 