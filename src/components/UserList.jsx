import { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [editUser, setEditUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (cityFilter !== 'all') params.append('city', cityFilter);
      if (educationFilter !== 'all') params.append('education', educationFilter);
      const res = await axios.get(`${API_URL}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, genderFilter, cityFilter, educationFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`${API_URL}/api/users/${editUser.id}`, editUser, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setEditUser(null);
    fetchUsers();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users.map(u => ({
      Email: u.email,
      Gender: u.gender,
      City: u.city,
      Education: u.education,
      Image: u.selected_image
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `users_${new Date().toISOString()}.xlsx`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="text-center text-white text-2xl mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Registered Users</h2>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
          </div>

          {/* Filters and Search */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <input type="text" placeholder="Search by email..." className="border rounded-lg px-3 py-2" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="border rounded-lg px-3 py-2" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            <select className="border rounded-lg px-3 py-2" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="all">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Satara">Satara</option>
              <option value="Nashik">Nashik</option>
            </select>
            <select className="border rounded-lg px-3 py-2" value={educationFilter} onChange={e => setEducationFilter(e.target.value)}>
              <option value="all">All Education</option>
              {['SSC','HSC','BSC','BCOM','MCA','PhD'].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Export to Excel</button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border-b">Image</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Gender</th>
                  <th className="py-2 px-4 border-b">City</th>
                  <th className="py-2 px-4 border-b">Education</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <img src={`https://picsum.photos/id/${10+parseInt(user.selected_image)}/40/40`} alt="img" className="w-10 h-10 rounded-full" />
                    </td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">{user.gender}</td>
                    <td className="py-2 px-4 border-b">{user.city}</td>
                    <td className="py-2 px-4 border-b">{user.education}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button onClick={() => setEditUser(user)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                      <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} className="w-full border rounded px-3 py-2" required />
              <input type="password" placeholder="New password (leave blank to keep same)" onChange={e => setEditUser({...editUser, password: e.target.value})} className="w-full border rounded px-3 py-2" />
              <select value={editUser.gender} onChange={e => setEditUser({...editUser, gender: e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="male">Male</option><option value="female">Female</option><option value="others">Others</option>
              </select>
              <select value={editUser.city} onChange={e => setEditUser({...editUser, city: e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="Mumbai">Mumbai</option><option value="Pune">Pune</option><option value="Satara">Satara</option><option value="Nashik">Nashik</option>
              </select>
              <div className="flex gap-3">
                {[1,2,3,4].map(num => (
                  <label key={num} className="cursor-pointer">
                    <img src={`https://picsum.photos/id/${10+num}/50/50`} className={`w-12 h-12 rounded border-2 ${editUser.selected_image == num ? 'border-purple-600' : 'border-gray-300'}`} />
                    <input type="radio" name="edit_image" value={num} checked={editUser.selected_image == num} onChange={() => setEditUser({...editUser, selected_image: num.toString()})} className="hidden" />
                  </label>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Update</button>
                <button type="button" onClick={() => setEditUser(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}