import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Mentor {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  linkedin?: string;
  experience?: number;
  rating?: number;
  reviews?: number;
  topMentor?: boolean;
}

const sampleMentors = [
  {
    name: 'Yash Patel',
    expertise: 'Business And Management',
    bio: "Strategy Manager @ Parag Milk Foods (MD's Office) | 300k+ Impressions | 32x National Case Comp Podiums",
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.8,
    reviews: 250,
    experience: 4,
    topMentor: true,
    services: [
      { name: 'Quick Call | Mentorship on any topic of your choice', duration: '15 Min', price: 49, type: '1:1 Call' },
      { name: 'Case Competition & Deck Review', duration: '30 Min', price: 99, type: '1:1 Call' },
    ],
  },
 

];

const MentorManagementPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [form, setForm] = useState<Omit<Mentor, 'id'>>({ name: '', expertise: '', bio: '', linkedin: '', experience: 1, rating: 0, reviews: 0, topMentor: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', duration: '', price: '', type: '' });
  const [services, setServices] = useState<any[]>([]);

  const fetchMentors = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'mentors'));
    setMentors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor)));
    setLoading(false);
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.duration || !serviceForm.price || !serviceForm.type) return;
    setServices([...services, { ...serviceForm }]);
    setServiceForm({ name: '', duration: '', price: '', type: '' });
  };

  const handleRemoveService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const mentorData = { ...form, services };
    if (editingId) {
      await updateDoc(doc(db, 'mentors', editingId), mentorData);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'mentors'), mentorData);
    }
    setForm({ name: '', expertise: '', bio: '', linkedin: '', experience: 1, rating: 0, reviews: 0, topMentor: false });
    setServices([]);
    fetchMentors();
    setLoading(false);
  };

  const handleEdit = (mentor: Mentor & { services?: any[] }) => {
    setForm({ name: mentor.name, expertise: mentor.expertise, bio: mentor.bio, linkedin: mentor.linkedin || '', experience: mentor.experience || 1, rating: mentor.rating || 0, reviews: mentor.reviews || 0, topMentor: mentor.topMentor || false });
    setServices(mentor.services || []);
    setServiceForm({ name: '', duration: '', price: '', type: '' });
    setEditingId(mentor.id);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteDoc(doc(db, 'mentors', id));
    fetchMentors();
    setLoading(false);
  };

  const handleAddSampleMentors = async () => {
    setLoading(true);
    for (const mentor of sampleMentors) {
      await addDoc(collection(db, 'mentors'), mentor);
    }
    fetchMentors();
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Mentor Management</h2>

      <h3 className="text-lg font-semibold mb-2">Add / Edit Mentor</h3>
      <form onSubmit={handleAddOrUpdate} className="space-y-4 mb-8 bg-white p-6 rounded shadow">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Mentor Name"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="expertise"
          value={form.expertise}
          onChange={handleChange}
          placeholder="Expertise (e.g., AI, Web Dev)"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Short Bio"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn URL"
          className="w-full border px-3 py-2 rounded"
        />
        <div className="mb-2 font-medium text-gray-700">Experience & Ratings</div>
        <div className="flex gap-4">
          <input
            type="number"
            name="experience"
            value={form.experience}
            onChange={handleChange}
            placeholder="Years of Experience"
            className="w-1/3 border px-3 py-2 rounded"
            min={0}
          />
          <input
            type="number"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            placeholder="Rating"
            className="w-1/3 border px-3 py-2 rounded"
            min={0}
            max={5}
            step={0.1}
          />
          <input
            type="number"
            name="reviews"
            value={form.reviews}
            onChange={handleChange}
            placeholder="Reviews"
            className="w-1/3 border px-3 py-2 rounded"
            min={0}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="topMentor"
            checked={form.topMentor}
            onChange={handleChange}
            className="accent-blue-600"
          />
          Top Mentor
        </label>
        <div className="mt-4">
          <div className="mb-2 font-medium text-gray-700">Services</div>
          <div className="text-xs text-gray-500 mb-2">After adding services, click <b>{editingId ? 'Update Mentor' : 'Add Mentor'}</b> to save them.</div>
          <div className="flex flex-wrap gap-2 items-end mb-2">
            <input
              type="text"
              name="name"
              value={serviceForm.name}
              onChange={handleServiceChange}
              placeholder="Service Name"
              className="border px-3 py-2 rounded w-40"
            />
            <input
              type="text"
              name="duration"
              value={serviceForm.duration}
              onChange={handleServiceChange}
              placeholder="Duration (e.g., 15 Min)"
              className="border px-3 py-2 rounded w-32"
            />
            <input
              type="text"
              name="type"
              value={serviceForm.type}
              onChange={handleServiceChange}
              placeholder="Type (e.g., 1:1 Call)"
              className="border px-3 py-2 rounded w-32"
            />
            <input
              type="number"
              name="price"
              value={serviceForm.price}
              onChange={handleServiceChange}
              placeholder="Price"
              className="border px-3 py-2 rounded w-24"
              min={0}
            />
            <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleAddService}>Add Service</button>
          </div>
          <div className="flex flex-col gap-2">
            {services.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                <span className="font-medium text-blue-900">{s.name}</span>
                <span className="text-xs text-gray-600">{s.type} • {s.duration}</span>
                <span className="text-xs text-green-700 font-semibold">₹{s.price}</span>
                <button type="button" className="ml-auto text-red-500 hover:underline" onClick={() => handleRemoveService(idx)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {editingId ? 'Update Mentor' : 'Add Mentor'}
        </button>
        {editingId && (
          <button
            type="button"
            className="ml-4 text-gray-600 underline"
            onClick={() => { setEditingId(null); setForm({ name: '', expertise: '', bio: '', linkedin: '', experience: 1, rating: 0, reviews: 0, topMentor: false }); setServices([]); }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3 className="text-lg font-semibold mb-4">All Mentors</h3>
      <button
        type="button"
        className="mb-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        onClick={handleAddSampleMentors}
        disabled={loading}
      >
        Add Sample Mentors
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mentors.map(mentor => (
          <div key={mentor.id} className="bg-gray-50 p-4 rounded shadow flex flex-col">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {mentor.name}
              {mentor.topMentor && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-bold">Top Mentor</span>}
            </h3>
            <p className="text-blue-700 font-medium">{mentor.expertise}</p>
            <p className="text-gray-700 mt-1 mb-2">{mentor.bio}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
              {mentor.linkedin && <a href={mentor.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {mentor.experience !== undefined && <span>{mentor.experience} yrs</span>}
              {mentor.rating !== undefined && <span>⭐ {mentor.rating}</span>}
              {mentor.reviews !== undefined && <span>({mentor.reviews} reviews)</span>}
            </div>
            {/* Show services if available */}
            {mentor.services && mentor.services.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-gray-700 mb-1">Services:</div>
                <ul className="list-disc list-inside text-xs text-gray-700">
                  {mentor.services.map((s: any, idx: number) => (
                    <li key={idx}><span className="font-medium text-blue-900">{s.name}</span> <span className="text-gray-500">({s.type}, {s.duration}, ₹{s.price})</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex space-x-2 mt-auto">
              <button onClick={() => handleEdit(mentor)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(mentor.id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorManagementPage; 
