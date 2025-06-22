import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Save, X, Camera, Settings, Bell, Moon, Sun, Shield, LogOut, Trash2, BookOpen, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    mobile: '',
    profileImage: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    defaultStudyTime: 60,
    preferredStudyTime: 'morning',
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [timetables, setTimetables] = useState([]);
  const [newTimetable, setNewTimetable] = useState({
    name: '',
    description: '',
    schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'study', label: 'Study Settings', icon: BookOpen },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const studyTimes = [
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 10PM)' },
    { value: 'night', label: 'Night (10PM - 2AM)' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'StudyApp';
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dspnqdbs1';

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        mobile: user.mobile || '',
        profileImage: user.profileImage || ''
      });
      setPreferences(user.preferences || preferences);
    }
    fetchTimetables();
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'StudyApp');

    try {
      toast.loading('Uploading image...', { id: 'image-upload' });

      // Upload to Cloudinary
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await res.json();
      const imageUrl = data.secure_url;

      // Update backend with new image URL
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/user/profile`,
        { profileImage: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setProfileData((prev) => ({ ...prev, profileImage: imageUrl }));
      toast.success('Profile image updated successfully!', { id: 'image-upload' });
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Failed to upload image. Please try again.', { id: 'image-upload' });
    }
  };

  const fetchTimetables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/study/timetables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetables(response.data);
    } catch (error) {
      console.error('Failed to fetch timetables:', error);
      toast.error('Failed to fetch timetables');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/user/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/user/preferences`, preferences, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/user/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAddTimetable = async () => {
    if (!newTimetable.name.trim()) {
      toast.error('Please enter a timetable name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (editingTimetableId) {
        await axios.put(`${API_URL}/api/study/timetables/${editingTimetableId}`, newTimetable, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingTimetableId(null);
      } else {
        await axios.post(`${API_URL}/api/study/timetables`, newTimetable, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchTimetables();
      setNewTimetable({
        name: '',
        description: '',
        schedule: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
      });
      toast.success('Timetable saved successfully!');
    } catch (error) {
      toast.error('Failed to save timetable');
    }
  };

  const handleSetActive = async (timetableId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/study/timetables/${timetableId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedTimetables = timetables.map((t) => ({
        ...t,
        isActive: t._id === timetableId,
      }));
      setTimetables(updatedTimetables);
      toast.success('Timetable set as active!');
    } catch (error) {
      console.error('Failed to set timetable active:', error);
      toast.error('Failed to set timetable active');
    }
  };

  const handleDeleteTimetable = async (timetableId) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/study/timetables/${timetableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetables(timetables.filter((t) => t._id !== timetableId));
      toast.success('Timetable deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete timetable');
    }
  };

  const handleEditTimetable = (timetableId) => {
    const timetableToEdit = timetables.find((t) => t._id === timetableId);
    if (!timetableToEdit) return;

    setNewTimetable({
      name: timetableToEdit.name,
      description: timetableToEdit.description || '',
      schedule: timetableToEdit.schedule || {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
      },
    });
    setEditingTimetableId(timetableId);
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const addDaySlot = (day) => {
    const daySlots = newTimetable.schedule[day] || [];
    setNewTimetable({
      ...newTimetable,
      schedule: {
        ...newTimetable.schedule,
        [day]: [...daySlots, { time: '09:00', subject: '', duration: 60 }],
      },
    });
  };

  const updateDaySlot = (day, index, field, value) => {
    const updatedDaySlots = [...(newTimetable.schedule[day] || [])];
    updatedDaySlots[index] = { ...updatedDaySlots[index], [field]: value };
    setNewTimetable({
      ...newTimetable,
      schedule: {
        ...newTimetable.schedule,
        [day]: updatedDaySlots,
      },
    });
  };

  const removeDaySlot = (day, index) => {
    const updatedDaySlots = [...(newTimetable.schedule[day] || [])];
    updatedDaySlots.splice(index, 1);
    setNewTimetable({
      ...newTimetable,
      schedule: {
        ...newTimetable.schedule,
        [day]: updatedDaySlots,
      },
    });
  };

  const handleStudyDayToggle = (day) => {
    const updatedDays = preferences.studyDays.includes(day)
      ? preferences.studyDays.filter((d) => d !== day)
      : [...preferences.studyDays, day];
    setPreferences({ ...preferences, studyDays: updatedDays });
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl sm:text-2xl">
                {profileData.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary-700 transition-colors">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {profileData.name || 'User'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{profileData.email}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Personal Information</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl text-sm sm:text-base"
          >
            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white opacity-50 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
              disabled={!isEditing}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
            <input
              type="tel"
              value={profileData.mobile}
              onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
              disabled={!isEditing}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white disabled:opacity-50 text-sm sm:text-base"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium text-sm sm:text-base"
            >
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm sm:text-base"
            >
              Cancel
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">App Preferences</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {preferences.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Choose your preferred theme</p>
              </div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${preferences.theme === 'light'
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                Light
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${preferences.theme === 'dark'
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                Dark
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Bell size={20} />
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-white">Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Receive study reminders and updates</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
              className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${preferences.notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
              />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSavePreferences}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium text-sm sm:text-base"
          >
            Save Settings
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  const renderStudyTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Study Preferences</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Study Time (minutes)
            </label>
            <input
              type="number"
              value={preferences.defaultStudyTime}
              onChange={(e) => setPreferences({ ...preferences, defaultStudyTime: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
              min="15"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Study Time
            </label>
            <select
              value={preferences.preferredStudyTime}
              onChange={(e) => setPreferences({ ...preferences, preferredStudyTime: e.target.value })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
            >
              {studyTimes.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Study Days</label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map((day) => (
                <motion.button
                  key={day.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStudyDayToggle(day.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${preferences.studyDays.includes(day.value)
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                >
                  {day.label}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSavePreferences}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium text-sm sm:text-base"
          >
            Save Study Settings
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Weekly Timetables ({timetables.length}/3)
        </h3>

        {timetables.length < 3 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="font-medium text-gray-800 dark:text-white mb-4">
              {editingTimetableId ? 'Edit Timetable' : 'Add New Timetable'}
            </h4>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Timetable name..."
                value={newTimetable.name}
                onChange={(e) => setNewTimetable({ ...newTimetable, name: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm sm:text-base"
              />

              <textarea
                placeholder="Description (optional)..."
                value={newTimetable.description}
                onChange={(e) => setNewTimetable({ ...newTimetable, description: e.target.value })}
                rows={2}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none text-sm sm:text-base"
              />

              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="space-y-3">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize border-b border-gray-200 dark:border-gray-600 pb-1">
                      {day}
                    </h5>

                    {(newTimetable.schedule[day] || []).map((slot, index) => (
                      <div key={index} className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                          <div className="flex space-x-2">
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(e) => updateDaySlot(day, index, 'time', e.target.value)}
                              className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Min"
                              value={slot.duration}
                              onChange={(e) => updateDaySlot(day, index, 'duration', parseInt(e.target.value))}
                              className="w-16 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                              min="15"
                              max="300"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Subject"
                              value={slot.subject}
                              onChange={(e) => updateDaySlot(day, index, 'subject', e.target.value)}
                              className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm"
                            />
                            {(newTimetable.schedule[day] || []).length > 1 && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeDaySlot(day, index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <X size={16} />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addDaySlot(day)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors text-sm"
                    >
                      + Add {day.charAt(0).toUpperCase() + day.slice(1)} Slot
                    </motion.button>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddTimetable}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium text-sm sm:text-base"
              >
                {editingTimetableId ? 'Update Timetable' : 'Add Timetable'}
              </motion.button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {timetables.map((timetable, index) => (
            <motion.div
              key={timetable._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-800 dark:text-white text-sm sm:text-base truncate">
                      {timetable.name}
                    </h4>
                    {timetable.isActive && (
                      <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs font-medium rounded-full flex-shrink-0">
                        Active
                      </div>
                    )}
                  </div>
                  {timetable.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{timetable.description}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Weekly schedule</p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {!timetable.isActive && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetActive(timetable._id)}
                      className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                    >
                      Set Active
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditTimetable(timetable._id)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteTimetable(timetable._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Change Password</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChangePassword}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium text-sm sm:text-base"
          >
            Change Password
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 sm:p-6 border border-red-200 dark:border-red-800"
      >
        <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-600">Deactivate Account</p>
              <p className="text-sm text-red-500">This will temporarily disable your account</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm sm:text-base flex-shrink-0"
            >
              Deactivate
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            to="/about"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            <Info size={16} />
            <span>About</span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="overflow-x-auto">
        <div className="flex space-x-2 pb-2 min-w-max">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 text-sm sm:text-base ${activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="min-h-[60vh]">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'study' && renderStudyTab()}
        {activeTab === 'security' && renderSecurityTab()}
      </div>
    </div>
  );
};

export default Profile;