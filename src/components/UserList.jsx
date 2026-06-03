import { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AVATAR_MAP = {
  1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  4: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
};

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [editUser, setEditUser] = useState(null);
  const [loggedInEmail, setLoggedInEmail] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLoggedInEmail(decoded.email);
      } catch (e) {
        console.error('Invalid token');
      }
    }
    fetchUsers();
  }, []);

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
    if (window.confirm('Are you sure you want to delete this user?')) {
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
      AvatarStyle: u.selected_image,
      HasCustomImages: !!(u.image1 || u.image2 || u.image3 || u.image4)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `users_${new Date().toISOString()}.xlsx`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Helper: check if string is a valid base64 image
  const isValidImage = (str) => {
    return str && typeof str === 'string' && str.startsWith('data:image');
  };

  // Helper: get array of valid custom images
  const getValidImages = (user) => {
    const images = [user.image1, user.image2, user.image3, user.image4];
    return images.filter(img => isValidImage(img));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium tracking-wide">Fetching user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">User Manager</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Control center for registered profiles</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right border-r border-slate-200 pr-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Session</p>
              <p className="font-semibold text-slate-700 text-sm">{loggedInEmail || 'admin@system.com'}</p>
            </div>
            <button onClick={logout} className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 shadow-sm">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              <input type="text" placeholder="Search by email..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 font-medium" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium cursor-pointer" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium cursor-pointer" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                <option value="all">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Satara">Satara</option>
                <option value="Nashik">Nashik</option>
              </select>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium cursor-pointer" value={educationFilter} onChange={e => setEducationFilter(e.target.value)}>
                <option value="all">All Education</option>
                {['SSC','HSC','BSC','BCOM','MCA','PhD'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="lg:self-center">
              <button onClick={exportToExcel} className="w-full lg:w-auto inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Export Sheet
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Avatar</th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Custom Images</th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">City</th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Education</th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? (
                  users.map(user => {
                    const validImages = getValidImages(user);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-full bg-slate-100 p-0.5 border border-slate-200 overflow-hidden group-hover:scale-105 transition-transform duration-200">
                            <img 
                              src={AVATAR_MAP[user.selected_image] || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                              alt="avatar" 
                              className="w-full h-full object-contain" 
                              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'; }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {validImages.length === 0 ? (
                            <span className="text-slate-400 text-xs italic">No custom images</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {validImages.map((img, idx) => (
                                <img 
                                  key={idx} 
                                  src={img} 
                                  alt={`custom-${idx}`} 
                                  className="w-8 h-8 rounded-md border border-slate-200 object-cover shadow-sm hover:scale-110 transition-transform"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">{user.email}</td>
                        <td className="py-4 px-6 text-slate-600 capitalize whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.gender === 'male' ? 'bg-blue-50 text-blue-700' : user.gender === 'female' ? 'bg-pink-50 text-pink-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {user.gender}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 whitespace-nowrap font-medium">{user.city}</td>
                        <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                          <span className="bg-slate-100 border border-slate-200/60 text-slate-700 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide">
                            {user.education}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-right space-x-2">
                          <button onClick={() => setEditUser(user)} className="bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150">Edit</button>
                          <button onClick={() => handleDelete(user.id)} className="bg-white border border-slate-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150">Delete</button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" className="py-12 text-center text-slate-400 font-medium">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-[3px] transition-opacity">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 relative">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">Modify User Profile</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Change core configurations and profile tags</p>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Security Password</label>
                <input type="password" placeholder="Leave blank to retain current" onChange={e => setEditUser({...editUser, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Gender</label>
                  <select value={editUser.gender} onChange={e => setEditUser({...editUser, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium cursor-pointer">
                    <option value="male">Male</option><option value="female">Female</option><option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">City</label>
                  <select value={editUser.city} onChange={e => setEditUser({...editUser, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium cursor-pointer">
                    <option value="Mumbai">Mumbai</option><option value="Pune">Pune</option><option value="Satara">Satara</option><option value="Nashik">Nashik</option>
                  </select>
                </div>
              </div>

              {/* Avatar selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Avatar</label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(num => (
                    <label key={num} className="cursor-pointer group relative flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-xl object-cover bg-slate-100 p-1 border-2 transition-all flex items-center justify-center ${editUser.selected_image == num ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-slate-200 group-hover:border-slate-300'}`}>
                        <img src={AVATAR_MAP[num]} alt="option" className="w-full h-full object-contain" />
                      </div>
                      <input type="radio" name="edit_avatar" value={num} checked={editUser.selected_image == num} onChange={() => setEditUser({...editUser, selected_image: num.toString()})} className="hidden" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom images update */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Custom Images (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map(num => {
                    const key = `image${num}`;
                    return (
                      <div key={num} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                        <p className="text-xs font-medium text-slate-600 mb-1">Image {num}</p>
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditUser({...editUser, [key]: reader.result});
                            reader.readAsDataURL(file);
                          }
                        }} className="text-xs w-full" />
                        {editUser[key] && editUser[key].startsWith('data:image') && (
                          <div className="mt-2 flex justify-center">
                            <img src={editUser[key]} alt="preview" className="w-12 h-12 object-cover rounded border border-slate-200" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setEditUser(null)} className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold transition">Discard</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}