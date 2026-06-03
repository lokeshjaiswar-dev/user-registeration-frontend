import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    gender: '', city: '', selected_image: '', education: [],
    image1: '', image2: '', image3: '', image4: ''   // new fields
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: '', image2: '', image3: '', image4: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const cities = ['Mumbai', 'Pune', 'Satara', 'Nashik'];
  const educationList = ['SSC', 'HSC', 'BSC', 'BCOM', 'MCA', 'PhD'];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirm = (confirm, pwd) => {
    if (!confirm) return 'Please confirm your password';
    if (confirm !== pwd) return 'Passwords do not match';
    return '';
  };

  const handleBlur = (field, value) => {
    let err = '';
    if (field === 'email') err = validateEmail(value);
    if (field === 'password') err = validatePassword(value);
    if (field === 'confirmPassword') err = validateConfirm(value, form.password);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle custom image upload for each slot (1-4)
  const handleImageUpload = (e, imageKey) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setForm(prev => ({ ...prev, [imageKey]: base64String }));
        setImagePreviews(prev => ({ ...prev, [imageKey]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const pwdErr = validatePassword(form.password);
    const confirmErr = validateConfirm(form.confirmPassword, form.password);
    
    // Validate that at least avatar is selected (custom images optional)
    if (emailErr || pwdErr || confirmErr || !form.gender || !form.city || !form.selected_image || form.education.length === 0) {
      setErrors({ email: emailErr, password: pwdErr, confirmPassword: confirmErr });
      if (!form.gender) setServerError('Please select gender');
      else if (!form.city) setServerError('Please select city');
      else if (!form.selected_image) setServerError('Please choose a profile avatar');
      else if (form.education.length === 0) setServerError('Please select at least one education credential');
      else setServerError('Please correct the validation problems highlighted above');
      return;
    }
    setServerError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/auth/register`, {
        email: form.email,
        password: form.password,
        gender: form.gender,
        city: form.city,
        selected_image: form.selected_image,
        image1: form.image1,
        image2: form.image2,
        image3: form.image3,
        image4: form.image4,
        education: form.education.join(',')
      });
      setSuccess('Registration successful! Redirecting to auth center...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration pipeline failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl w-full mx-auto p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Get started with your profile control engine</p>
        </div>

        {serverError && (
          <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-sm font-semibold mb-5 border border-rose-200/60 flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-sm font-semibold mb-5 border border-emerald-200/60 flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email, password, confirm, gender, city (same as before) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 ${
                errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`} 
              placeholder="e.g. name@company.com"
              value={form.email} 
              onChange={handleChange} 
              onBlur={(e) => handleBlur('email', e.target.value)} 
            />
            {errors.email && <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <input 
                type="password" 
                name="password" 
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 ${
                  errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
                value={form.password} 
                onChange={handleChange} 
                onBlur={(e) => handleBlur('password', e.target.value)} 
              />
              {errors.password && <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 ${
                  errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
                value={form.confirmPassword} 
                onChange={handleChange} 
                onBlur={(e) => handleBlur('confirmPassword', e.target.value)} 
              />
              {errors.confirmPassword && <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gender Identification</label>
            <div className="grid grid-cols-3 gap-2.5">
              {['male', 'female', 'others'].map(g => {
                const isChecked = form.gender === g;
                return (
                  <label 
                    key={g} 
                    className={`flex items-center justify-center border-2 px-3 py-2.5 rounded-xl font-semibold capitalize text-sm transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" name="gender" value={g} checked={isChecked} onChange={handleChange} className="sr-only" /> 
                    {g}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target Location</label>
            <div className="relative">
              <select 
                name="city" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer" 
                value={form.city}
                onChange={handleChange}
              >
                <option value="">Select operational city</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          {/* EXISTING AVATAR SECTION – unchanged */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Profile Image Avatar</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(num => {
                const isSelected = form.selected_image === num.toString();
                const avatarUrls = {
                  1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                  2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
                  3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
                  4: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
                };

                return (
                  <label 
                    key={num} 
                    className={`relative cursor-pointer border-2 rounded-xl p-1.5 transition-all text-center group flex flex-col items-center justify-between min-h-[96px] ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 ring-4 ring-indigo-500/10' 
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center p-1">
                      <img src={avatarUrls[num]} alt={`Avatar ${num}`} className="w-full h-full object-contain transition duration-200 group-hover:scale-105" />
                    </div>
                    <input type="radio" name="selected_image" value={num} checked={isSelected} className="sr-only" onChange={handleChange} />
                    <span className={`text-[10px] font-bold mt-1.5 inline-block px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      Style {num}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* NEW SECTION: Upload 4 Custom Images */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Additional Images (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(num => {
                const key = `image${num}`;
                return (
                  <div key={num} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <p className="text-sm font-medium text-slate-700 mb-1">Image {num}</p>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      onChange={(e) => handleImageUpload(e, key)}
                      className="w-full text-sm text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {imagePreviews[key] && (
                      <div className="mt-2 flex justify-center">
                        <img src={imagePreviews[key]} alt={`preview ${num}`} className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Education Credentials</label>
            <div className="flex flex-wrap gap-2">
              {educationList.map(edu => {
                const isChecked = form.education.includes(edu);
                return (
                  <label 
                    key={edu} 
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                      isChecked 
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input type="checkbox" value={edu} checked={isChecked} onChange={handleChange} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 w-3.5 h-3.5" /> 
                    {edu}
                  </label>
                );
              })}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98] mt-4">
            Complete Registration
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
            Sign In instead
          </Link>
        </p>
      </div>
    </div>
  );
}