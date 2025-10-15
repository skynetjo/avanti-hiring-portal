import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Filter, Users, UserCheck, UserX, Clock, Settings, LogOut, Eye, Upload, UserPlus, Trash2, Home, FileText, Shield } from 'lucide-react';

// Firebase Configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

function HiringPortal() {
  // Auth & User States
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home'); // home, admin-login, admin-dashboard, settings, manage-admins

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Candidate States
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('All');

  // Application Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile: '',
    education: '',
    experience: '',
    companies: '',
    photo: null
  });
  const [submitting, setSubmitting] = useState(false);

  // Email Template States
  const [emailTemplates, setEmailTemplates] = useState({
    rejected: `Dear {name},

Thank you for your interest in the {position} position at Avanti Fellows. 

After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We appreciate the time you invested in the application process.

We encourage you to apply for future opportunities that match your skills and experience.

Best regards,
Avanti Fellows Hiring Team`,
    shortlisted: `Dear {name},

Congratulations! We are pleased to inform you that you have been shortlisted for the {position} position at Avanti Fellows.

Our team will contact you within the next 2-3 business days to discuss the next steps in the hiring process.

Thank you for your interest in joining our team.

Best regards,
Avanti Fellows Hiring Team`
  });

  // Admin Management States
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    role: 'admin',
    name: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    contacted: 0,
    screening: 0,
    fits: 0,
    shortlisted: 0,
    rejected: 0,
    notContacted: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserRole(user.uid);
        loadCandidates();
        loadAdmins();
        loadEmailTemplates();
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedProfile === 'All') {
      setFilteredCandidates(candidates);
    } else {
      setFilteredCandidates(candidates.filter(c => c.profile === selectedProfile));
    }
  }, [selectedProfile, candidates]);

  useEffect(() => {
    calculateStats();
  }, [filteredCandidates]);

  const loadUserRole = async (uid) => {
    try {
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      const adminDoc = adminsSnapshot.docs.find(doc => doc.data().uid === uid);
      if (adminDoc) {
        setUserRole(adminDoc.data().role);
        setCurrentView('admin-dashboard');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'candidates'));
      const candidatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      const adminsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'settings'));
      if (!querySnapshot.empty) {
        const settingsDoc = querySnapshot.docs[0];
        if (settingsDoc.data().emailTemplates) {
          setEmailTemplates(settingsDoc.data().emailTemplates);
        }
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  };

  const calculateStats = () => {
    const total = filteredCandidates.length;
    const contacted = filteredCandidates.filter(c => c.contacted === 'Yes').length;
    const screening = filteredCandidates.filter(c => c.screening === 'Yes').length;
    const fits = filteredCandidates.filter(c => c.fits === 'Yes').length;
    const shortlisted = filteredCandidates.filter(c => c.status === 'Shortlisted').length;
    const rejected = filteredCandidates.filter(c => c.status === 'Rejected').length;
    const notContacted = filteredCandidates.filter(c => c.contacted === 'No').length;
    setStats({ total, contacted, screening, fits, shortlisted, rejected, notContacted });
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Please enter email and password');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('File size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleFormSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.profile || 
        !formData.education || !formData.experience || !formData.companies) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let photoURL = '';
      
      // Upload photo if provided
      if (formData.photo) {
        const photoRef = ref(storage, `candidate-photos/${Date.now()}_${formData.photo.name}`);
        await uploadBytes(photoRef, formData.photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Add candidate to Firestore
      await addDoc(collection(db, 'candidates'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profile: formData.profile,
        education: formData.education,
        experience: formData.experience,
        companies: formData.companies,
        photo: photoURL,
        contacted: 'No',
        screening: 'No',
        fits: 'No',
        status: 'Pending',
        submittedAt: new Date().toISOString()
      });

      alert('Application submitted successfully! We will contact you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        profile: '',
        education: '',
        experience: '',
        companies: '',
        photo: null
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCandidate = async (candidateId, field, value, candidate) => {
    if (userRole === 'viewer') {
      alert('You do not have permission to edit candidates');
      return;
    }

    try {
      const candidateRef = doc(db, 'candidates', candidateId);
      await updateDoc(candidateRef, { [field]: value });
      
      // Send email if status changed
      if (field === 'status' && (value === 'Rejected' || value === 'Shortlisted')) {
        await sendEmail(candidate, value.toLowerCase());
      }
      
      loadCandidates();
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to update candidate');
    }
  };

  const sendEmail = async (candidate, type) => {
    try {
      const template = type === 'rejected' ? emailTemplates.rejected : emailTemplates.shortlisted;
      const emailBody = template
        .replace(/{name}/g, candidate.name)
        .replace(/{position}/g, candidate.profile);

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: type === 'rejected' ? 'template_rejected' : 'template_shortlisted',
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: candidate.email,
            to_name: candidate.name,
            message: emailBody,
            position: candidate.profile
          }
        })
      });

      if (response.ok) {
        alert(`Email sent successfully to ${candidate.name}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const saveEmailTemplates = async () => {
    if (userRole !== 'super_admin') {
      alert('Only Super Admins can edit email templates');
      return;
    }

    try {
      const settingsQuery = query(collection(db, 'settings'));
      const settingsSnapshot = await getDocs(settingsQuery);
      
      if (settingsSnapshot.empty) {
        await addDoc(collection(db, 'settings'), {
          emailTemplates,
          updatedAt: new Date().toISOString()
        });
      } else {
        const settingsDoc = settingsSnapshot.docs[0];
        await updateDoc(doc(db, 'settings', settingsDoc.id), {
          emailTemplates,
          updatedAt: new Date().toISOString()
        });
      }
      
      alert('Email templates saved successfully!');
      setCurrentView('admin-dashboard');
    } catch (error) {
      console.error('Error saving templates:', error);
      alert('Failed to save templates');
    }
  };

  const handleAddAdmin = async () => {
    if (userRole !== 'super_admin') {
      alert('Only Super Admins can add new admins');
      return;
    }

    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.password);
      
      // Add admin to Firestore
      await addDoc(collection(db, 'admins'), {
        uid: userCredential.user.uid,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: new Date().toISOString()
      });

      alert('Admin added successfully!');
      setNewAdmin({ email: '', password: '', role: 'admin', name: '' });
      loadAdmins();
      
      // Re-login as current admin
      await signInWithEmailAndPassword(auth, user.email, loginPassword);
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Failed to add admin: ' + error.message);
    }
  };

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    if (userRole !== 'super_admin') {
      alert('Only Super Admins can delete admins');
      return;
    }

    if (adminEmail === user.email) {
      alert('You cannot delete yourself!');
      return;
    }

    if (confirm(`Are you sure you want to delete ${adminEmail}?`)) {
      try {
        await deleteDoc(doc(db, 'admins', adminId));
        alert('Admin deleted successfully!');
        loadAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // HOME PAGE - Public Application Form
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">Avanti Fellows</h1>
                <p className="text-sm text-gray-600">Join Our Team - Career Portal</p>
              </div>
              <button
                onClick={() => setCurrentView('admin-login')}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Apply for a Position</h2>
              <p className="text-gray-600">Fill out the form below to submit your application</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Applied For <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="profile"
                    value={formData.profile}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Position</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Program Manager">Program Manager</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Education Qualification <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Qualification</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Companies/Organizations Worked For <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="companies"
                  value={formData.companies}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company 1, Company 2, Company 3"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Your Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Choose File</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  {formData.photo && (
                    <span className="text-sm text-green-600">✓ {formData.photo.name}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Max file size: 5MB. Supported formats: JPG, PNG</p>
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN LOGIN PAGE
  if (currentView === 'admin-login' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Avanti Fellows Hiring Portal</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@avantifellows.org"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="w-full text-gray-600 py-2 hover:text-gray-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SETTINGS PAGE
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Email Template Settings</h1>
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {userRole !== 'super_admin' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Only Super Admins can edit email templates. You can view them here.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Email Template
                </label>
                <textarea
                  value={emailTemplates.rejected}
                  onChange={(e) => setEmailTemplates({...emailTemplates, rejected: e.target.value})}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rejection email template..."
                  disabled={userRole !== 'super_admin'}
                />
                <p className="text-xs text-gray-500 mt-2">Use {'{name}'} and {'{position}'} as placeholders</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortlisted Email Template
                </label>
                <textarea
                  value={emailTemplates.shortlisted}
                  onChange={(e) => setEmailTemplates({...emailTemplates, shortlisted: e.target.value})}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter shortlisted email template..."
                  disabled={userRole !== 'super_admin'}
                />
                <p className="text-xs text-gray-500 mt-2">Use {'{name}'} and {'{position}'} as placeholders</p>
              </div>

              {userRole === 'super_admin' && (
                <button
                  onClick={saveEmailTemplates}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Templates
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MANAGE ADMINS PAGE
  if (currentView === 'manage-admins') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Manage Admins</h1>
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {userRole !== 'super_admin' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Only Super Admins can add or delete admin accounts.
              </p>
            </div>
          )}

          {/* Add New Admin */}
          {userRole === 'super_admin' && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Admin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddAdmin}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Add Admin
              </button>
            </div>
          )}

          {/* Admin List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Current Admins</h2>
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{admin.name}</h3>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <span className={`inline-block mt-1 px-3 py-1 text-xs rounded-full ${
                      admin.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      admin.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 
                       admin.role === 'admin' ? 'Admin' : 'Viewer'}
                    </span>
                  </div>
                  {userRole === 'super_admin' && admin.email !== user.email && (
                    <button
                      onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="font-bold text-gray-800 mb-4">Role Permissions:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Super Admin:</strong> Full access - can add/remove admins, edit templates, view and update candidates</p>
              <p><strong>Admin:</strong> Can view and update candidates, but cannot manage admins or edit templates</p>
              <p><strong>Viewer:</strong> Can only view candidates, no editing permissions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Avanti Fellows</h1>
              <p className="text-sm text-gray-600">
                Hiring Dashboard - {userRole === 'super_admin' ? 'Super Admin' : 
                                   userRole === 'admin' ? 'Admin' : 'Viewer'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
              {userRole === 'super_admin' && (
                <button
                  onClick={() => setCurrentView('manage-admins')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Manage Admins
                </button>
              )}
              <button
                onClick={() => setCurrentView('settings')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.contacted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Screening</p>
                <p className="text-2xl font-bold text-gray-800">{stats.screening}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-teal-600" />
              <div>
                <p className="text-xs text-gray-600">Fits</p>
                <p className="text-2xl font-bold text-gray-800">{stats.fits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.shortlisted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Not Contacted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.notContacted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Profiles</option>
              <option value="Teacher">Teacher</option>
              <option value="Program Manager">Program Manager</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={candidate.photo || 'https://via.placeholder.com/80'}
                  alt={candidate.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.profile}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-700">
                <p><strong>Email:</strong> {candidate.email}</p>
                <p><strong>Phone:</strong> {candidate.phone}</p>
                <p><strong>Education:</strong> {candidate.education}</p>
                <p><strong>Experience:</strong> {candidate.experience} years</p>
                <p><strong>Companies:</strong> {candidate.companies}</p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Contacted?</label>
                  <select
                    value={candidate.contacted || 'No'}
                    onChange={(e) => updateCandidate(candidate.id, 'contacted', e.target.value, candidate)}
                    disabled={userRole === 'viewer'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">Screening Done?</label>
                  <select
                    value={candidate.screening || 'No'}
                    onChange={(e) => updateCandidate(candidate.id, 'screening', e.target.value, candidate)}
                    disabled={userRole === 'viewer'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">Fits for Program?</label>
                  <select
                    value={candidate.fits || 'No'}
                    onChange={(e) => updateCandidate(candidate.id, 'fits', e.target.value, candidate)}
                    disabled={userRole === 'viewer'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1">Status</label>
                  <select
                    value={candidate.status || 'Pending'}
                    onChange={(e) => updateCandidate(candidate.id, 'status', e.target.value, candidate)}
                    disabled={userRole === 'viewer'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No candidates found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HiringPortal;
