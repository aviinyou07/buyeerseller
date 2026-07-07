import React, { useState } from "react";
import { User, Lock, Bell, Palette, Globe, Shield, Save, Camera } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* Main Content */}
      <div className="bg-white border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-white p-4 border-b md:border-b-0 md:border-r border-gray-200 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100/80"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-black mb-4">Profile Information</h2>
              
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    <User size={40} className="text-gray-400" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-black text-white hover:bg-gray-800 rounded-full transition">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-black">Profile Photo</h3>
                  <p className="text-xs text-gray-500 mb-2">JPG, GIF or PNG. Max size of 800K</p>
                  <button className="px-4 py-2 border border-gray-200 text-sm font-medium text-black hover:bg-gray-50 transition">
                    Upload New
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black">First Name</label>
                  <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 border border-gray-200 bg-white text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black">Last Name</label>
                  <input type="text" defaultValue="User" className="w-full px-4 py-2.5 border border-gray-200 bg-white text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-black">Email Address</label>
                  <input type="email" defaultValue="admin@dashboard.com" className="w-full px-4 py-2.5 border border-gray-200 bg-white text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-black mb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black">New Password</label>
                  <input type="password" placeholder="Min. 8 characters" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-black flex items-center gap-2">
                      <Shield size={16} className="text-black" /> Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-black mb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive emails about new registrations and orders." },
                  { title: "Push Notifications", desc: "Get push alerts when new approvals are pending." },
                  { title: "Monthly Reports", desc: "Receive a monthly summary of dashboard analytics." }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 bg-white">
                    <div>
                      <h4 className="text-sm font-semibold text-black">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={index !== 2} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition border border-transparent">
              Cancel
            </button>
            <button className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 flex items-center gap-2 transition">
              <Save size={18} /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;