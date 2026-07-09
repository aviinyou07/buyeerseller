import React, { useState, useEffect } from "react";
import { User, Lock, Bell, Camera, Save, Loader2, ShieldCheck, Mail, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../utils/api";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchProfile = () => {
      const p = api.getProfile();
      if (p) {
        setProfileData({
          full_name: p.full_name || "",
          email: p.email || "",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    if (!profileData.full_name || !profileData.email) {
      toast.error("Name and Email are required");
      return;
    }
    
    setProfileLoading(true);
    try {
      const res = await api.put("/auth/profile", profileData);
      if (res.success && res.data?.admin) {
        localStorage.setItem("admin_profile", JSON.stringify(res.data.admin));
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error("Please fill out all password fields");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put("/auth/password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      if (res.success) {
        toast.success("Password updated successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex-1 space-y-6">
      
      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50/50 p-3 sm:p-4 border-b md:border-b-0 md:border-r border-gray-100 flex flex-row md:flex-col overflow-x-auto [&::-webkit-scrollbar]:hidden gap-2 md:space-y-2 md:gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-blue-100" : "text-gray-400"} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 md:p-10">
          
          {/* PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details and contact information.</p>
                </div>
              </div>
              
              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl border border-gray-100 mb-6 sm:mb-8 text-center sm:text-left">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <UserCircle2 size={40} className="text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Profile Photo</h3>
                  <p className="text-xs text-gray-500 mb-3 sm:mb-4">This will be displayed on your profile.</p>
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    Upload New
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={14} className="text-gray-400" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={saveProfile}
                  disabled={profileLoading}
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {profileLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {/* SECURITY SETTINGS */}
          {activeTab === "security" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Lock size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Update your password and secure your account.</p>
                </div>
              </div>
              
              <div className="space-y-5 p-6 bg-gray-50/50 border border-gray-100 rounded-2xl mb-8">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Current Password</label>
                  <input 
                    type="password" 
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <input 
                    type="password" 
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Min. 8 characters" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border border-blue-100 bg-blue-50/50 rounded-2xl flex flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-[13px] sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                    <ShieldCheck size={18} className="text-blue-600 shrink-0" /> <span className="leading-tight">Two-Factor Authentication</span>
                  </h4>
                  <p className="text-[12px] sm:text-sm text-gray-600 mt-1">Add an extra layer of security to your account.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Action Footer */}
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={savePassword}
                  disabled={passwordLoading}
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SETTINGS */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Manage how you receive alerts and updates.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive emails about new registrations and orders." },
                  { title: "Push Notifications", desc: "Get push alerts when new approvals are pending." },
                  { title: "Monthly Reports", desc: "Receive a monthly summary of dashboard analytics." }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 sm:p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:border-blue-100 transition-colors gap-4">
                    <div>
                      <h4 className="text-[13px] sm:text-sm font-bold text-gray-900 leading-tight">{item.title}</h4>
                      <p className="text-[12px] sm:text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked={index !== 2} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;