import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    gender: '', city: '', selected_image: '', education: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cities = ['Mumbai', 'Pune', 'Satara', 'Nashik'];
  const educationList = ['SSC', 'HSC', 'BSC', 'BCOM', 'MCA', 'PhD'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      let updated = [...form.education];
      if (checked) updated.push(value);
      else updated = updated.filter(v => v !== value);
      setForm({ ...form, education: updated });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.selected_image) {
      setError('Please select an image');
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/auth/register`, {
        email: form.email,
        password: form.password,
        gender: form.gender,
        city: form.city,
        selected_image: form.selected_image,
        education: form.education.join(',')
      });
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input type="password" name="password" required className="w-full px-4 py-2 border rounded-lg" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" required className="w-full px-4 py-2 border rounded-lg" value={form.confirmPassword} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Gender</label>
            <div className="flex gap-4">
              {['male', 'female', 'others'].map(g => (
                <label key={g} className="flex items-center gap-2">
                  <input type="radio" name="gender" value={g} onChange={handleChange} required /> {g}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <select name="city" className="w-full px-4 py-2 border rounded-lg" onChange={handleChange} required>
              <option value="">Select</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 4 Images Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Choose Profile Image</label>
            <div className="flex gap-3 flex-wrap">
              {[1,2,3,4].map(num => (
                <label key={num} className={`cursor-pointer border-2 rounded-xl p-2 transition-all ${form.selected_image === num.toString() ? 'border-purple-600 bg-purple-50' : 'border-gray-300'}`}>
                  <img src={`https://picsum.photos/id/${10+num}/80/80`} alt={`img${num}`} className="w-16 h-16 rounded-lg object-cover" />
                  <input type="radio" name="selected_image" value={num} className="hidden" onChange={handleChange} />
                  <p className="text-center text-sm mt-1">{num}</p>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Education</label>
            <div className="flex flex-wrap gap-3">
              {educationList.map(edu => (
                <label key={edu} className="flex items-center gap-1">
                  <input type="checkbox" value={edu} onChange={handleChange} /> {edu}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">Register</button>
        </form>
        <p className="text-center mt-4 text-gray-600">Already have account? <a href="/login" className="text-purple-600 hover:underline">Login</a></p>
      </div>
    </div>
  );
}