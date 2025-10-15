import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Filter, Users, UserCheck, UserX, Clock, Settings, LogOut, Eye, Upload, UserPlus, Trash2, Home, Shield, Plus, X } from 'lucide-react';

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

// Indian States
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Districts by State (Major ones)
const DISTRICTS = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Maharashtra": ["Ahmed Nagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"]
};

// Major Indian Colleges
const INDIAN_COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT BHU",
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Rourkela", "NIT Calicut",
  "BITS Pilani", "Delhi University", "Jawaharlal Nehru University",
  "Banaras Hindu University", "Anna University", "Jadavpur University",
  "Presidency University Kolkata", "University of Hyderabad",
  "Jamia Millia Islamia", "Aligarh Muslim University", "Pune University",
  "Mumbai University", "Calcutta University", "Madras University",
  "IIIT Hyderabad", "IIIT Bangalore", "ISI Kolkata", "CMI Chennai",
  "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "TISS Mumbai",
  "St. Xavier's College Mumbai", "St. Stephen's College Delhi",
  "Loyola College Chennai", "Christ University Bangalore",
  "Manipal Institute of Technology", "VIT Vellore", "SRM University",
  "Amity University", "Other"
];

function HiringPortal() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('All');
  
  // Form Data
  const [formData, setFormData] = useState({
    resume: null,
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    profile: '',
    experience: '',
    currentSalary: '',
    availableToJoin: '',
    homeState: '',
    homeDistrict: '',
    currentState: '',
    photo: null,
    additionalDocs: [],
    education: [{
      qualification: '',
      otherQualification: '',
      college: '',
      otherCollege: '',
      year: ''
    }],
    workExperience: [{
      organization: '',
      jobTitle: '',
      joiningDate: '',
      currentlyWorking: false,
      relievingDate: '',
      location: ''
    }],
    motivation: '',
    payCut: '',
    privacyConsent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState({
    rejected: `Dear {name},\n\nThank you for your interest in the {position} position at Avanti Fellows.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe encourage you to apply for future opportunities.\n\nBest regards,\nAvanti Fellows Team`,
    shortlisted: `Dear {name},\n\nCongratulations! You have been shortlisted for the {position} position at Avanti Fellows.\n\nWe will contact you within 2-3 business days.\n\nBest regards,\nAvanti Fellows Team`
  });
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    role: 'admin',
    name: ''
  });
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('File size should be less than 5MB');
        return;
      }
      if (fieldName === 'resume' && file.type !== 'application/pdf') {
        alert('Resume must be a PDF file');
        return;
      }
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleAdditionalDocsChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5000000) {
        alert(`${file.name} is too large. Max 5MB per file.`);
        return false;
      }
      return true;
    });
    setFormData(prev => ({ ...prev, additionalDocs: [...prev.additionalDocs, ...validFiles] }));
  };

  const removeAdditionalDoc = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalDocs: prev.additionalDocs.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        qualification: '',
        otherQualification: '',
        college: '',
        otherCollege: '',
        year: ''
      }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        organization: '',
        jobTitle: '',
        joiningDate: '',
        currentlyWorking: false,
        relievingDate: '',
        location: ''
      }]
    }));
  };

  const removeWorkExperience = (index) => {
    if (formData.workExperience.length > 1) {
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter((_, i) => i !== index)
      }));
    }
  };

  const updateWorkExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleFormSubmit = async () => {
    // Validation
    if (!formData.resume) {
      alert('Please upload your resume');
      return;
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.dob || 
        !formData.gender || !formData.profile || !formData.experience || 
        !formData.currentSalary || !formData.availableToJoin || !formData.homeState || 
        !formData.homeDistrict || !formData.currentState || !formData.motivation || 
        !formData.payCut) {
      alert('Please fill all required fields');
      return;
    }
    if (!formData.privacyConsent) {
      alert('Please accept the privacy policy');
      return;
    }

    setSubmitting(true);

    try {
      let resumeURL = '';
      let photoURL = '';
      let additionalDocsURLs = [];

      // Upload resume
      if (formData.resume) {
        const resumeRef = ref(storage, `resumes/${Date.now()}_${formData.resume.name}`);
        await uploadBytes(resumeRef, formData.resume);
        resumeURL = await getDownloadURL(resumeRef);
      }

      // Upload photo
      if (formData.photo) {
        const photoRef = ref(storage, `candidate-photos/${Date.now()}_${formData.photo.name}`);
        await uploadBytes(photoRef, formData.photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Upload additional documents
      for (const doc of formData.additionalDocs) {
        const docRef = ref(storage, `additional-docs/${Date.now()}_${doc.name}`);
        await uploadBytes(docRef, doc);
        const docURL = await getDownloadURL(docRef);
        additionalDocsURLs.push({ name: doc.name, url: docURL });
      }

      // Add candidate to Firestore
      await addDoc(collection(db, 'candidates'), {
        resumeURL,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        profile: formData.profile,
        experience: formData.experience,
        currentSalary: formData.currentSalary,
        availableToJoin: formData.availableToJoin,
        homeState: formData.homeState,
        homeDistrict: formData.homeDistrict,
        currentState: formData.currentState,
        photo: photoURL,
        additionalDocs: additionalDocsURLs,
        education: formData.education,
        workExperience: formData.workExperience,
        motivation: formData.motivation,
        payCut: formData.payCut,
        contacted: 'No',
        screening: 'No',
        fits: 'No',
        status: 'Pending',
        submittedAt: new Date().toISOString()
      });

      alert('Application submitted successfully! We will contact you soon.');
      
      // Reset form
      setFormData({
        resume: null,
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        profile: '',
        experience: '',
        currentSalary: '',
        availableToJoin: '',
        homeState: '',
        homeDistrict: '',
        currentState: '',
        photo: null,
        additionalDocs: [],
        education: [{
          qualification: '',
          otherQualification: '',
          college: '',
          otherCollege: '',
          year: ''
        }],
        workExperience: [{
          organization: '',
          jobTitle: '',
          joiningDate: '',
          currentlyWorking: false,
          relievingDate: '',
          location: ''
        }],
        motivation: '',
        payCut: '',
        privacyConsent: false
      });

      // Reset file inputs
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');

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
      const userCredential = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.password);
      
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

  // HOME PAGE - Application Form
  if (currentView === 'home') {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Apply for a Position</h2>
              <p className="text-gray-600">Fill out the form below to submit your application</p>
            </div>

            <div className="space-y-8">
              {/* Resume Upload - FIRST */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Upload Your Resume <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">Upload your resume (PDF only, max 5MB). We'll try to auto-fill some details.</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-5 h-5" />
                    <span>Choose PDF Resume</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'resume')}
                      accept=".pdf"
                      className="hidden"
                    />
                  </label>
                  {formData.resume && (
                    <span className="text-sm text-green-600 font-medium">✓ {formData.resume.name}</span>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Prefer not to disclose">Prefer not to disclose</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Your Photo (Optional)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Choose Photo</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {formData.photo && (
                      <span className="text-xs text-green-600 mt-1 block">✓ {formData.photo.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Job Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Applied For <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="profile"
                      value={formData.profile}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Position</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Program Manager">Program Manager</option>
                      <option value="Coordinator">Coordinator</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Experience</option>
                      {Array.from({ length: 31 }, (_, i) => i).map(year => (
                        <option key={year} value={year}>{year} {year === 1 ? 'year' : 'years'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Salary per annum (in INR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="currentSalary"
                      value={formData.currentSalary}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available to Join (in days) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="availableToJoin"
                      value={formData.availableToJoin}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Days</option>
                      {Array.from({ length: 60 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="homeState"
                      value={formData.homeState}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home District <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="homeDistrict"
                      value={formData.homeDistrict}
                      onChange={handleFormChange}
                      disabled={!formData.homeState}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select District</option>
                      {formData.homeState && DISTRICTS[formData.homeState]?.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Location (State) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currentState"
                      value={formData.currentState}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Education Details</h3>
                {formData.education.map((edu, index) => (
                  <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg relative">
                    {index > 0 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Qualification <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={edu.qualification}
                          onChange={(e) => updateEducation(index, 'qualification', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          <option value="B.E">B.E</option>
                          <option value="B.Tech">B.Tech</option>
                          <option value="M.Sc">M.Sc</option>
                          <option value="M.Tech">M.Tech</option>
                          <option value="B.Com">B.Com</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="M.Com">M.Com</option>
                          <option value="Diploma">Diploma</option>
                          <option value="B.Pharma">B.Pharma</option>
                          <option value="M.Pharma">M.Pharma</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      {edu.qualification === 'Others' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specify Qualification <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.otherQualification}
                            onChange={(e) => updateEducation(index, 'otherQualification', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter qualification"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          College Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={edu.college}
                          onChange={(e) => updateEducation(index, 'college', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select College</option>
                          {INDIAN_COLLEGES.map(college => (
                            <option key={college} value={college}>{college}</option>
                          ))}
                        </select>
                      </div>

                      {edu.college === 'Other' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specify College Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.otherCollege}
                            onChange={(e) => updateEducation(index, 'otherCollege', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter college name"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year of Graduation <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add More Education
                </button>
              </div>

              {/* Work Experience */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Work Experience Details</h3>
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg relative">
                    {index > 0 && (
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => updateWorkExperience(index, 'organization', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Company Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => updateWorkExperience(index, 'jobTitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Senior Developer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining</label>
                        <input
                          type="date"
                          value={exp.joiningDate}
                          onChange={(e) => updateWorkExperience(index, 'joiningDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="City, State"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exp.currentlyWorking}
                          onChange={(e) => updateWorkExperience(index, 'currentlyWorking', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Currently I work here</label>
                      </div>

                      {!exp.currentlyWorking && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Relieving</label>
                          <input
                            type="date"
                            value={exp.relievingDate}
                            onChange={(e) => updateWorkExperience(index, 'relievingDate', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addWorkExperience}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Experience Details
                </button>
              </div>

              {/* Additional Documents */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Additional Documents (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">Upload cover letter, certificates, or other relevant documents</p>
                <label className="flex items-center gap-2 px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Choose Files</span>
                  <input
                    type="file"
                    onChange={handleAdditionalDocsChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                  />
                </label>
                {formData.additionalDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.additionalDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded">
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <button
                          onClick={() => removeAdditionalDoc(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Additional Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What motivates you to work with Avanti Fellows and in the development sector? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="5"
                      placeholder="Share your motivation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Considering Avanti Fellows being in the not-for-profit sector, are you open to take a material pay cut, if required? Please elaborate. <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="payCut"
                      value={formData.payCut}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="5"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Consent */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleFormChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    <span className="text-red-500">*</span> By applying, you hereby accept the data processing terms under the Privacy Policy and give consent to processing of the data as part of this job application.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <strong>Note:</strong> Only Super Admins can edit email templates.
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
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Profiles</option>
              <option value="Teacher">Teacher</option>
              <option value="Program Manager">Program Manager</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

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
                  <p className="text-xs text-gray-500">{candidate.experience} years exp</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-700">
                <p><strong>Email:</strong> {candidate.email}</p>
                <p><strong>Phone:</strong> {candidate.phone}</p>
                {candidate.resumeURL && (
                  <a href={candidate.resumeURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Resume
                  </a>
                )}
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
