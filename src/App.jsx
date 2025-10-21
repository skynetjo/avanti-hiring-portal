import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Send, Filter, Users, UserCheck, UserX, Clock, Settings, LogOut, Eye, Upload, UserPlus, Trash2, Home, Shield, Plus, X, Briefcase, MapPin, Building } from 'lucide-react';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT-pJd8imqgq9k2P1fuKJqj9H03gMF3rs",
  authDomain: "avanti-hiring-portal.firebaseapp.com",
  projectId: "avanti-hiring-portal",
  storageBucket: "avanti-hiring-portal.firebasestorage.app",
  messagingSenderId: "544084510109",
  appId: "1:544084510109:web:9c1e1e6b45d0fb097f9b74"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const EMAILJS_SERVICE_ID = "service_hd66vgh";
const EMAILJS_PUBLIC_KEY = "0ZZohllMdqRrY6rSB";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

const DISTRICTS = {
  "Andhra Pradesh": ["Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", "Nellore", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Srikakulam", "Sri Sathya Sai", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke-Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Dibang Valley", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", "Keyi Panyor", "Bichom"],
  "Assam": ["Baksa", "Bajali", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur-Ramanujganj", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Korea", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sarangarh-Bilaigarh", "Sakti", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad", "Vav-Tharad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bangalore Rural", "Bangalore Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Kalaburagi", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Bijapur", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Maihar", "Mandla", "Mandsaur", "Mauganj", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Pandhurna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Osmanabad", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nanded", "Nandurbar", "Nagpur", "Nashik", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
  "Nagaland": ["Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyü", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Boudh", "Bhadrak", "Balangir", "Bargarh", "Balasore", "Cuttack", "Debagarh", "Dhenkanal", "Ganjam", "Gajapati", "Jharsuguda", "Jajpur", "Jagatsinghpur", "Khordha", "Kendujhar", "Kalahandi", "Kandhamal", "Koraput", "Kendrapara", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nuapada", "Nayagarh", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Balotra", "Banswara", "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Deeg", "Dholpur", "Didwana Kuchaman", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Khairthal-Tijara", "Kota", "Kotputli-Behror", "Nagaur", "Pali", "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Nilgiris", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Tiruppur", "Tiruchirappalli", "Theni", "Tirunelveli", "Thanjavur", "Thoothukudi", "Tirupattur", "Tiruvallur", "Tiruvarur", "Tiruvannamalai", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal–Malkajgiri", "Mulugu", "Nalgonda", "Nagarkurnool", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Bagpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shrawasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh", "Zanskar"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};


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
  const [currentView, setCurrentView] = useState('job-listings');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('All');
  const [selectedExperienceFilter, setSelectedExperienceFilter] = useState('All');
  const [selectedJoiningDateFilter, setSelectedJoiningDateFilter] = useState('All');
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
const [selectedJob, setSelectedJob] = useState(null);
const [jobFilters, setJobFilters] = useState({ department: 'All', location: 'All' });

console.log('🔄 Component render - jobs.length:', jobs.length);

  const [formData, setFormData] = useState({
    resume: null,
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    jobId: '',
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
    howHeard: '',
    referrerName: '',
    privacyConsent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState({
    rejected: `Dear {name},\n\nThank you for your interest in the {position} position at Avanti Fellows.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe encourage you to apply for future opportunities.\n\nBest regards,\nAvanti Fellows Team`,
    shortlisted: `Dear {name},\n\nCongratulations! You have been shortlisted for the {position} position at Avanti Fellows.\n\nWe will contact you within 2-3 business days.\n\nBest regards,\nAvanti Fellows Team`,
    applicationReceived: `Dear {name},\n\nThank you for applying to the {position} position at Avanti Fellows.\n\nWe have received your application and our team will review it shortly. We will get back to you soon.\n\nBest regards,\nAvanti Fellows Team`
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState({
    email: '',
    password: '',
    role: 'guest',
    name: ''
  });
  const [newJob, setNewJob] = useState({
  title: '',
  department: '',
  location: '',
  aboutAvanti: '',
  solvingFor: '',
  principles: '',
  responsibilities: '',
  lookingFor: '',
  whatWeOffer: '',
  deadline: '',
  salary: '',
  isActive: true,
  heroImage: ''
});
  const [editingJob, setEditingJob] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    contacted: 0,
    screening: 0,
    fits: 0,
    shortlisted: 0,
    rejected: 0,
    notContacted: 0,
    hired: 0
  });

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
  setFormData(prev => ({
    ...prev,
    education: prev.education.filter((_, i) => i !== index)
  }));
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
  setFormData(prev => ({
    ...prev,
    workExperience: prev.workExperience.filter((_, i) => i !== index)
  }));
};

const updateWorkExperience = (index, field, value) => {
  setFormData(prev => ({
    ...prev,
    workExperience: prev.workExperience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    )
  }));
};

const handleAdditionalDocsChange = (e) => {
  const files = Array.from(e.target.files);
  setFormData(prev => ({
    ...prev,
    additionalDocs: [...prev.additionalDocs, ...files]
  }));
};

const removeAdditionalDoc = (index) => {
  setFormData(prev => ({
    ...prev,
    additionalDocs: prev.additionalDocs.filter((_, i) => i !== index)
  }));
};

const handleUpdateJob = async () => {
  if (userRole !== 'super_admin') {
    alert('Only Super Admins can edit jobs');
    return;
  }

  if (!editingJob.title || !editingJob.department || !editingJob.location) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const jobRef = doc(db, 'jobs', editingJob.id);
    const { id, ...jobData } = editingJob;
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: new Date().toISOString()
    });

    alert('Job updated successfully!');
    setEditingJob(null);
    loadJobs();
  } catch (error) {
    console.error('Error updating job:', error);
    alert('Failed to update job');
  }
};

const handleDeleteJob = async (jobId, jobTitle) => {
  if (userRole !== 'super_admin') {
    alert('Only Super Admins can delete jobs');
    return;
  }

  if (confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      alert('Job deleted successfully!');
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  }
};

const deleteCandidate = async (candidateId, candidateName) => {
  if (userRole !== 'super_admin') {
    alert('Only Super Admins can delete candidates');
    return;
  }

  if (confirm(`Are you sure you want to permanently delete ${candidateName}'s application? This cannot be undone.`)) {
    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
      alert('Candidate deleted successfully!');
      loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate');
    }
  }
};
  useEffect(() => {
  console.log('🚀 App mounted, loading jobs for public view...');
  // Load jobs immediately for everyone (public access)
  loadJobs();
  
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log('👤 Auth state changed, user:', user?.email || 'No user');
    setUser(user);
    if (user) {
      await loadUserRole(user.uid);
      loadCandidates();
      loadTeamMembers();
      loadEmailTemplates();
    } else {
      setUserRole(null);
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, []);

  useEffect(() => {
    applyFilters();
  }, [selectedProfile, selectedStatusFilter, candidates]);

  useEffect(() => {
    calculateStats();
  }, [filteredCandidates]);
  
  useEffect(() => {
  // Reset district filter when state changes
  if (selectedStateFilter !== 'All') {
    const availableDistricts = DISTRICTS[selectedStateFilter] || [];
    if (selectedDistrictFilter !== 'All' && !availableDistricts.includes(selectedDistrictFilter)) {
      setSelectedDistrictFilter('All');
    }
  }
}, [selectedStateFilter]);
  
  useEffect(() => {
  applyFilters();
}, [selectedProfile, selectedStatusFilter, selectedStateFilter, selectedDistrictFilter, selectedExperienceFilter, selectedJoiningDateFilter, candidates]);

  const loadUserRole = async (uid) => {
    try {
      const membersSnapshot = await getDocs(collection(db, 'teamMembers'));
      const memberDoc = membersSnapshot.docs.find(doc => doc.data().uid === uid);
      if (memberDoc) {
        setUserRole(memberDoc.data().role);
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

  const loadTeamMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teamMembers'));
      const membersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const loadJobs = async () => {
  try {
    console.log('🔄 Loading jobs from Firebase...');
    const querySnapshot = await getDocs(collection(db, 'jobs'));
    const jobsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('✅ Jobs loaded from Firebase:', jobsData);
    console.log('📊 Number of jobs:', jobsData.length);
    jobsData.forEach((job, index) => {
      console.log(`Job ${index + 1}:`, {
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        isActive: job.isActive
      });
    });
    setJobs(jobsData);
  } catch (error) {
    console.error('❌ Error loading jobs:', error);
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

// ADD THIS COMPLETE FUNCTION HERE ⬇️⬇️⬇️
const sendEmail = async (candidate, type) => {
  try {
    const template = emailTemplates[type];
    if (!template) {
      console.error(`No email template found for type: ${type}`);
      return false;
    }

    // Map type to correct EmailJS template IDs
    const templateIds = {
      rejected: 'template_rejected',
      shortlisted: 'template_shortlisted',
      applicationReceived: 'template_received'
    };

    const templateId = templateIds[type];
    if (!templateId) {
      console.error(`No template ID mapping for type: ${type}`);
      return false;
    }

    console.log(`Attempting to send email to ${candidate.email} with template ${templateId}`);

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: candidate.email,
          to_name: candidate.name,
          position: candidate.profile,
          from_name: 'Avanti Fellows'
        }
      })
    });

    if (response.ok) {
      console.log('✅ Email sent successfully to:', candidate.email);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Email send failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
// END OF NEW FUNCTION ⬆️⬆️⬆️

  const applyFilters = () => {
  let filtered = [...candidates];

  if (selectedProfile !== 'All') {
    filtered = filtered.filter(c => c.profile === selectedProfile);
  }

  if (selectedStatusFilter !== 'All') {
    if (selectedStatusFilter === 'Not Contacted') {
      filtered = filtered.filter(c => c.contacted === 'No');
    } else if (selectedStatusFilter === 'Contacted') {
      filtered = filtered.filter(c => c.contacted === 'Yes');
    } else if (selectedStatusFilter === 'Screening') {
      filtered = filtered.filter(c => c.screening === 'Yes');
    } else if (selectedStatusFilter === 'Fits') {
      filtered = filtered.filter(c => c.fits === 'Yes');
    } else if (selectedStatusFilter === 'Shortlisted') {
      filtered = filtered.filter(c => c.status === 'Shortlisted');
    } else if (selectedStatusFilter === 'Rejected') {
      filtered = filtered.filter(c => c.status === 'Rejected');
    } else if (selectedStatusFilter === 'Hired') {
      filtered = filtered.filter(c => c.status === 'Hired');
    }
  }

  // State filter
  if (selectedStateFilter !== 'All') {
    filtered = filtered.filter(c => 
      c.homeState === selectedStateFilter || c.currentState === selectedStateFilter
    );
  }

  // District filter
  if (selectedDistrictFilter !== 'All') {
    filtered = filtered.filter(c => c.homeDistrict === selectedDistrictFilter);
  }

  // Experience filter
  if (selectedExperienceFilter !== 'All') {
    filtered = filtered.filter(c => {
      const candidateExp = parseInt(c.experience);
      if (selectedExperienceFilter === '0') return candidateExp === 0;
      if (selectedExperienceFilter === '1-2') return candidateExp >= 1 && candidateExp <= 2;
      if (selectedExperienceFilter === '3-5') return candidateExp >= 3 && candidateExp <= 5;
      if (selectedExperienceFilter === '6-10') return candidateExp >= 6 && candidateExp <= 10;
      if (selectedExperienceFilter === '10+') return candidateExp > 10;
      return true;
    });
  }

  // Joining date filter
  if (selectedJoiningDateFilter !== 'All') {
    filtered = filtered.filter(c => {
      const candidateJoin = parseInt(c.availableToJoin);
      if (selectedJoiningDateFilter === '0-15') return candidateJoin >= 0 && candidateJoin <= 15;
      if (selectedJoiningDateFilter === '16-30') return candidateJoin >= 16 && candidateJoin <= 30;
      if (selectedJoiningDateFilter === '31-45') return candidateJoin >= 31 && candidateJoin <= 45;
      if (selectedJoiningDateFilter === '46+') return candidateJoin >= 46;
      return true;
    });
  }

  setFilteredCandidates(filtered);
};
  const calculateStats = () => {
    const total = filteredCandidates.length;
    const contacted = filteredCandidates.filter(c => c.contacted === 'Yes').length;
    const screening = filteredCandidates.filter(c => c.screening === 'Yes').length;
    const fits = filteredCandidates.filter(c => c.fits === 'Yes').length;
    const shortlisted = filteredCandidates.filter(c => c.status === 'Shortlisted').length;
    const rejected = filteredCandidates.filter(c => c.status === 'Rejected').length;
    const hired = filteredCandidates.filter(c => c.status === 'Hired').length;
    const notContacted = filteredCandidates.filter(c => c.contacted === 'No').length;
    setStats({ total, contacted, screening, fits, shortlisted, rejected, notContacted, hired });
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
      setCurrentView('job-listings');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkRecentApplication = async (email, phone) => {
  try {
    const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentApplication = candidatesSnapshot.docs.find(doc => {
      const data = doc.data();
      const submittedDate = data.submittedAt ? new Date(data.submittedAt) : null;
      
      // Check if email or phone matches AND application is within last 6 months
      if ((data.email === email || data.phone === phone) && submittedDate && !isNaN(submittedDate.getTime())) {
        return submittedDate > sixMonthsAgo;
      }
      return false;
    });

    if (recentApplication) {
      const lastApplicationDate = new Date(recentApplication.data().submittedAt);
      const monthsAgo = Math.floor((new Date() - lastApplicationDate) / (1000 * 60 * 60 * 24 * 30));
      
      // Calculate the date when they can reapply (6 months from last application)
      const canReapplyDate = new Date(lastApplicationDate);
      canReapplyDate.setMonth(canReapplyDate.getMonth() + 6);
      
      return {
        hasRecent: true,
        lastAppliedDate: lastApplicationDate.toLocaleDateString('en-IN'),
        monthsAgo: monthsAgo,
        canReapplyDate: canReapplyDate.toLocaleDateString('en-IN')
      };
    }

    return { hasRecent: false };
  } catch (error) {
    console.error('Error checking recent application:', error);
    return { hasRecent: false };
  }
};
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
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

  const handleFormSubmit = async () => {
  // Age validation - MUST BE FIRST
  if (!formData.dob) {
    alert('Please enter your date of birth');
    return;
  }

  const age = calculateAge(formData.dob);
  if (age < 18) {
    alert(`Sorry, you are not eligible to apply. You must be at least 18 years old to apply for this position. Your current age is ${age} years.`);
    return;
  }

  // Check for recent application - SECOND CHECK
  const recentCheck = await checkRecentApplication(formData.email, formData.phone);
  if (recentCheck.hasRecent) {
  alert(`You have already applied on ${recentCheck.lastAppliedDate} (${recentCheck.monthsAgo} months ago). Please wait at least 6 months before applying again. You can reapply after ${recentCheck.canReapplyDate}.`);
  return;
}

  // Validation
  if (!formData.resume) {
    alert('Please upload your resume (PDF format)');
    return;
  }
  if (!formData.name || !formData.email || !formData.phone || !formData.dob || 
      !formData.gender || !formData.profile || !formData.experience || 
      !formData.currentSalary || !formData.availableToJoin || !formData.homeState || 
      !formData.homeDistrict || !formData.currentState || !formData.motivation || 
      !formData.payCut || !formData.howHeard) {
    alert('Please fill all required fields marked with *');
    return;
  }

  if (formData.howHeard === 'Referral' && !formData.referrerName) {
    alert('Please provide the employee name who referred you');
    return;
  }

  const hasValidEducation = formData.education.some(edu => 
    edu.qualification && edu.college && edu.year
  );
  if (!hasValidEducation) {
    alert('Please fill at least one complete education entry');
    return;
  }

  if (!formData.privacyConsent) {
    alert('Please accept the privacy policy to continue');
    return;
  }

  setSubmitting(true);

  try {
    let resumeURL = '';
    let photoURL = '';
    let additionalDocsURLs = [];

    if (formData.resume) {
      const resumeRef = ref(storage, `resumes/${Date.now()}_${formData.resume.name}`);
      await uploadBytes(resumeRef, formData.resume);
      resumeURL = await getDownloadURL(resumeRef);
    }

    if (formData.photo) {
      const photoRef = ref(storage, `candidate-photos/${Date.now()}_${formData.photo.name}`);
      await uploadBytes(photoRef, formData.photo);
      photoURL = await getDownloadURL(photoRef);
    }

    for (const doc of formData.additionalDocs) {
      const docRef = ref(storage, `additional-docs/${Date.now()}_${doc.name}`);
      await uploadBytes(docRef, doc);
      const docURL = await getDownloadURL(docRef);
      additionalDocsURLs.push({ name: doc.name, url: docURL });
    }

    const candidateData = {
      resumeURL,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      age: age,
      gender: formData.gender,
      jobId: formData.jobId,
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
      howHeard: formData.howHeard,
      referrerName: formData.referrerName || '',
      contacted: 'No',
      screening: 'No',
      fits: 'No',
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'candidates'), candidateData);

    // Send application received email
    const emailSent = await sendEmail({
      name: formData.name,
      email: formData.email,
      profile: formData.profile
    }, 'applicationReceived');

    if (emailSent) {
      alert('✅ Application submitted successfully! We will contact you soon. Please check your email for confirmation.');
    } else {
      alert('✅ Application submitted successfully! However, we could not send a confirmation email. We will contact you soon via the email address you provided.');
    }

    // Reset form
    setFormData({
      resume: null,
      name: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      jobId: '',
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
      howHeard: '',
      referrerName: '',
      privacyConsent: false
    });

    document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
    setCurrentView('job-listings');

  } catch (error) {
    console.error('Error submitting application:', error);
    alert('Failed to submit application. Please try again.');
  } finally {
    setSubmitting(false);
  }
};
  const updateCandidate = async (candidateId, field, value, candidate) => {
  if (userRole === 'guest') {
    alert('You do not have permission to edit candidates');
    return;
  }

  // Show confirmation for status changes that trigger emails
  if (field === 'status' && (value === 'Rejected' || value === 'Shortlisted')) {
    const confirmed = window.confirm(
      `An email will be sent to ${candidate.name} (${candidate.email}) informing them about being ${value.toLowerCase()}. Do you want to continue?`
    );

    if (!confirmed) {
      return;
    }
  }

  try {
    // First update the database
    const candidateRef = doc(db, 'candidates', candidateId);
    await updateDoc(candidateRef, { [field]: value });
    console.log(`✅ Database updated: ${field} = ${value}`);

    // Then send email for status changes
    if (field === 'status' && (value === 'Rejected' || value === 'Shortlisted')) {
      console.log(`Attempting to send ${value.toLowerCase()} email...`);
      
      try {
        const emailSent = await sendEmail(candidate, value.toLowerCase());
        
        if (emailSent) {
          alert(`✅ Status updated to ${value} and email sent successfully to ${candidate.name}`);
        } else {
          alert(`⚠️ Status updated to ${value}, but failed to send email to ${candidate.name}. Please contact them manually at ${candidate.email}`);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        alert(`⚠️ Status updated to ${value}, but failed to send email to ${candidate.name}. Please contact them manually at ${candidate.email}`);
      }
    } else {
      // For non-status changes or other status values
      alert(`✅ Candidate updated successfully`);
    }

    // Reload candidates to refresh the UI
    await loadCandidates();
    
  } catch (error) {
    console.error('❌ Error updating candidate:', error);
    alert('Failed to update candidate. Error: ' + error.message);
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

  const handleAddTeamMember = async () => {
    if (userRole !== 'super_admin') {
      alert('Only Super Admins can add team members');
      return;
    }

    if (!newTeamMember.email || !newTeamMember.password || !newTeamMember.name) {
      alert('Please fill all fields');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newTeamMember.email, newTeamMember.password);

      await addDoc(collection(db, 'teamMembers'), {
        uid: userCredential.user.uid,
        email: newTeamMember.email,
        name: newTeamMember.name,
        role: newTeamMember.role,
        createdAt: new Date().toISOString()
      });

      alert('Team member added successfully!');
      setNewTeamMember({ email: '', password: '', role: 'guest', name: '' });
      loadTeamMembers();

      await signInWithEmailAndPassword(auth, user.email, loginPassword);
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member: ' + error.message);
    }
  };

  const handleDeleteTeamMember = async (memberId, memberEmail) => {
    if (userRole !== 'super_admin') {
      alert('Only Super Admins can delete team members');
      return;
    }

    if (memberEmail === user.email) {
      alert('You cannot delete yourself!');
      return;
    }

    if (confirm(`Are you sure you want to delete ${memberEmail}?`)) {
      try {
        await deleteDoc(doc(db, 'teamMembers', memberId));
        alert('Team member deleted successfully!');
        loadTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to delete team member');
      }
    }
  };

  const handleAddJob = async () => {
  if (userRole !== 'super_admin') {
    alert('Only Super Admins can add jobs');
    return;
  }

  if (!newJob.title || !newJob.department || !newJob.location || !newJob.deadline) {
    alert('Please fill all required fields: Title, Department, Location, and Deadline');
    return;
  }

  try {
    // Create job object with all fields
    const jobData = {
      title: newJob.title || '',
      department: newJob.department || '',
      location: newJob.location || '',
      aboutAvanti: newJob.aboutAvanti || '',
      solvingFor: newJob.solvingFor || '',
      principles: newJob.principles || '',
      responsibilities: newJob.responsibilities || '',
      lookingFor: newJob.lookingFor || '',
      whatWeOffer: newJob.whatWeOffer || '',
      deadline: newJob.deadline || '',
      salary: newJob.salary || '',
      heroImage: newJob.heroImage || '',
      isActive: newJob.isActive !== false, // Default to true if not specified
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'jobs'), jobData);

    alert('Job posted successfully!');
    setNewJob({
      title: '',
      department: '',
      location: '',
      aboutAvanti: '',
      solvingFor: '',
      principles: '',
      responsibilities: '',
      lookingFor: '',
      whatWeOffer: '',
      deadline: '',
      salary: '',
      heroImage: '',
      isActive: true
    });
    loadJobs();
    setCurrentView('admin-dashboard');
  } catch (error) {
    console.error('Error adding job:', error);
    alert('Failed to add job');
  }
};

  const getFilteredJobs = () => {
  console.log('All jobs:', jobs);
  console.log('Current filters:', jobFilters);
  
  const filtered = jobs.filter(job => {
    console.log('Checking job:', job.title, 'isActive:', job.isActive, 'department:', job.department, 'location:', job.location);
    
    // Skip jobs without required fields
    if (!job.title || !job.department || !job.location) {
      console.log('Job filtered out: missing required fields (title, department, or location)');
      return false;
    }
    
    // Must be active (explicitly check for false, as undefined/null should be treated as inactive)
    if (job.isActive === false) {
      console.log('Job filtered out: not active');
      return false;
    }
    
    // Filter by department if not "All"
    if (jobFilters.department !== 'All' && job.department !== jobFilters.department) {
      console.log('Job filtered out: department mismatch');
      return false;
    }
    
    // Filter by location if not "All"
    if (jobFilters.location !== 'All' && job.location !== jobFilters.location) {
      console.log('Job filtered out: location mismatch');
      return false;
    }
    
    console.log('Job passed all filters!');
    return true;
  });
  
  console.log('Filtered jobs:', filtered);
  return filtered;
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // JOB LISTINGS PAGE
if (currentView === 'job-listings') {
  const departments = [...new Set(jobs.map(j => j.department))];
  const locations = [...new Set(jobs.map(j => j.location))];
  const filteredJobs = getFilteredJobs();

  console.log('🏠 JOB LISTINGS VIEW');
  console.log('📦 Total jobs in state:', jobs.length);
  console.log('🔍 Filtered jobs count:', filteredJobs.length);
  console.log('🏢 Available departments:', departments);
  console.log('📍 Available locations:', locations);
  console.log('⚙️ Current filters:', jobFilters);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">Avanti Fellows</h1>
                <p className="text-sm text-gray-600">Career Opportunities</p>
              </div>
              <button
                onClick={() => setCurrentView('admin-login')}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-red-500 text-white rounded-lg hover:from-yellow-600 hover:to-red-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
  {/* Hero Section with Background Image */}
  <div className="relative h-96 mb-12 rounded-2xl overflow-hidden shadow-2xl">
    <img 
      src="https://images.unsplash.com/photo-1760716077057-5b383e53108e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940" 
      alt="Team collaboration" 
      className="w-full h-full object-cover"
    />



    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 flex items-center">
      <div className="max-w-3xl mx-auto px-8 text-white">
        <h1 className="text-5xl font-bold mb-4">Be a part of building something bigger than you</h1>
        <p className="text-xl mb-6">Join us in transforming education across India</p>
        <a href="#open-positions" className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Browse all jobs
        </a>
      </div>
    </div>
  </div>

  {/* Open Positions Section */}
  <div id="open-positions" className="mb-8">
    <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Open Positions</h2>
  </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
                <select
                  value={jobFilters.department}
                  onChange={(e) => setJobFilters({...jobFilters, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="All">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Location</label>
                <select
                  value={jobFilters.location}
                  onChange={(e) => setJobFilters({...jobFilters, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="All">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                </div>
                {(job.lookingFor || job.solvingFor) && (
  <p className="text-gray-700 mb-4 line-clamp-3">
    {job.lookingFor || job.solvingFor}
  </p>
)}
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setCurrentView('job-details');
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-colors font-medium"
                >
                  View Details & Apply
                </button>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No job openings match your filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // JOB DETAILS PAGE
  if (currentView === 'job-details' && selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => setCurrentView('job-listings')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Back to Job Listings
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedJob.title}</h1>
            <div className="flex items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span>{selectedJob.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{selectedJob.location}</span>
              </div>
              {selectedJob.salary && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Salary:</span>
                  <span>{selectedJob.salary}</span>
                </div>
              )}
            </div>

            <div className="space-y-6 mb-8">
  {selectedJob.aboutAvanti && (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">About Avanti Fellows</h2>
      <p className="text-gray-700 whitespace-pre-line">{selectedJob.aboutAvanti}</p>
    </div>
  )}

  {selectedJob.solvingFor && (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">What are we solving for?</h2>
      <p className="text-gray-700 whitespace-pre-line">{selectedJob.solvingFor}</p>
    </div>
  )}

  {selectedJob.principles && (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">What are some of the principles/approaches we use?</h2>
      <p className="text-gray-700 whitespace-pre-line">{selectedJob.principles}</p>
    </div>
  )}

  {selectedJob.responsibilities && (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">What will you do?</h2>
      <p className="text-gray-700 whitespace-pre-line">{selectedJob.responsibilities}</p>
    </div>
  )}

  {selectedJob.lookingFor && (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">Who are we looking for in this role?</h2>
      <p className="text-gray-700 whitespace-pre-line">{selectedJob.lookingFor}</p>
    </div>
  )}

  {selectedJob.whatWeOffer && (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-3">What We Offer:</h2>
      <p className="text-gray-700 whitespace-pre-line">{selectedJob.whatWeOffer}</p>
    </div>
  )}

  {selectedJob.deadline && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800 font-semibold">Application Deadline: {new Date(selectedJob.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  )}
</div>

            <button
              onClick={() => {
                setFormData({...formData, jobId: selectedJob.id, profile: selectedJob.title});
                setCurrentView('application-form');
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-4 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-all font-semibold text-lg shadow-lg"
            >
              Apply for this Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  // APPLICATION FORM
  if (currentView === 'application-form') {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => setCurrentView('job-details')}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Back to Job Details
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Application Form</h2>
              <p className="text-gray-600">Applying for: <strong>{formData.profile}</strong></p>
            </div>

            <div className="space-y-8">
              {/* Resume Upload */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Upload Your Resume <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">Upload your resume (PDF only, max 5MB)</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white rounded-lg cursor-pointer hover:from-yellow-600 hover:to-red-600 transition-colors">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      Total Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Days</option>
                      {Array.from({ length: 60 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about this job? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="howHeard"
                      value={formData.howHeard}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Option</option>
                      <option value="Social Media">Social Media</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Google/Bing Search">Google/Bing Search</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {formData.howHeard === 'Referral' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name (Referrer) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="referrerName"
                        value={formData.referrerName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter the name of the employee who referred you"
                      />
                    </div>
                  )}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home District (Optional)
                    </label>
                    <select
                      name="homeDistrict"
                      value={formData.homeDistrict}
                      onChange={handleFormChange}
                      disabled={!formData.homeState}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Company Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => updateWorkExperience(index, 'jobTitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Senior Developer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining</label>
                        <input
                          type="date"
                          value={exp.joiningDate}
                          onChange={(e) => updateWorkExperience(index, 'joiningDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="City, State"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exp.currentlyWorking}
                          onChange={(e) => updateWorkExperience(index, 'currentlyWorking', e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addWorkExperience}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 mt-1"
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
                className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-4 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-all font-semibold text-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 mx-auto mb-4 text-orange-600" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('job-listings')}
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
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Templates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Email Templates</h2>
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
                    Application Received Email
                  </label>
                  <textarea
                    value={emailTemplates.applicationReceived}
                    onChange={(e) => setEmailTemplates({...emailTemplates, applicationReceived: e.target.value})}
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    disabled={userRole !== 'super_admin'}
                  />
                  <p className="text-xs text-gray-500 mt-2">Use {'{name}'} and {'{position}'} as placeholders</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Email Template
                  </label>
                  <textarea
                    value={emailTemplates.rejected}
                    onChange={(e) => setEmailTemplates({...emailTemplates, rejected: e.target.value})}
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    disabled={userRole !== 'super_admin'}
                  />
                  <p className="text-xs text-gray-500 mt-2">Use {'{name}'} and {'{position}'} as placeholders</p>
                </div>

                {userRole === 'super_admin' && (
                  <button
                    onClick={saveEmailTemplates}
                    className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-all font-medium shadow-md"
                  >
                    Save Templates
                  </button>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Team Members</h2>

              {userRole === 'super_admin' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Add New Team Member</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newTeamMember.name}
                      onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="email"
                      placeholder="Email ID"
                      value={newTeamMember.email}
                      onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newTeamMember.password}
                      onChange={(e) => setNewTeamMember({...newTeamMember, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <select
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="guest">Guest (View Only)</option>
                      <option value="program_manager">Program Manager</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button
                      onClick={handleAddTeamMember}
                      className="w-full bg-gradient-to-r from-yellow-500 to-red-500 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      Add Team Member
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        member.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                        member.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
                        member.role === 'program_manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role === 'super_admin' ? 'Super Admin' : 
                         member.role === 'admin' ? 'Admin' :
                         member.role === 'program_manager' ? 'Program Manager' : 'Guest'}
                      </span>
                    </div>
                    {userRole === 'super_admin' && member.email !== user.email && (
                      <button
                        onClick={() => handleDeleteTeamMember(member.id, member.email)}
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
      </div>
    );
  }

  // MANAGE JOBS PAGE
  if (currentView === 'manage-jobs') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Manage Job Openings</h1>
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
                <strong>Note:</strong> Only Super Admins can add, edit, or delete jobs.
              </p>
            </div>
          )}

          {userRole === 'super_admin' && !editingJob && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Job</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
    <input
      type="text"
      value={newJob.title}
      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="e.g., Physics Teacher"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
    <input
      type="text"
      value={newJob.department}
      onChange={(e) => setNewJob({...newJob, department: e.target.value})}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="e.g., Teaching"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
    <input
      type="text"
      value={newJob.location}
      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="e.g., Bangalore, Karnataka"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
    <input
      type="text"
      value={newJob.salary}
      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="e.g., ₹3-5 LPA"
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
    <input
      type="date"
      value={newJob.deadline}
      onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image URL (Optional)</label>
    <input
      type="url"
      value={newJob.heroImage}
      onChange={(e) => setNewJob({...newJob, heroImage: e.target.value})}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="https://example.com/image.jpg"
    />
    <p className="text-xs text-gray-500 mt-1">Upload image to a service like imgur.com or use unsplash.com URLs</p>
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">About Avanti Fellows</label>
    <textarea
      value={newJob.aboutAvanti}
      onChange={(e) => setNewJob({...newJob, aboutAvanti: e.target.value})}
      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="Describe Avanti Fellows..."
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">What are we solving for?</label>
    <textarea
      value={newJob.solvingFor}
      onChange={(e) => setNewJob({...newJob, solvingFor: e.target.value})}
      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="Describe the problem you're solving..."
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">What are some principles/approaches we use?</label>
    <textarea
      value={newJob.principles}
      onChange={(e) => setNewJob({...newJob, principles: e.target.value})}
      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="List principles and approaches..."
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">What will you do? (Responsibilities)</label>
    <textarea
      value={newJob.responsibilities}
      onChange={(e) => setNewJob({...newJob, responsibilities: e.target.value})}
      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="List key responsibilities..."
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">Who are we looking for?</label>
    <textarea
      value={newJob.lookingFor}
      onChange={(e) => setNewJob({...newJob, lookingFor: e.target.value})}
      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="List qualifications, skills, experience..."
    />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">What We Offer</label>
    <textarea
      value={newJob.whatWeOffer}
      onChange={(e) => setNewJob({...newJob, whatWeOffer: e.target.value})}
      className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      placeholder="List benefits, perks, culture..."
    />
  </div>
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={newJob.isActive}
                    onChange={(e) => setNewJob({...newJob, isActive: e.target.checked})}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active (visible to applicants)</label>
                </div>
              </div>
              <button
                onClick={handleAddJob}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-all font-medium shadow-md"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Post Job
              </button>
            </div>
          )}

          {editingJob && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Job</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <input
                    type="text"
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({...editingJob, department: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <input
                    type="text"
                    value={editingJob.salary}
                    onChange={(e) => setEditingJob({...editingJob, salary: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    value={editingJob.description}
                    onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                    className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <textarea
                    value={editingJob.requirements}
                    onChange={(e) => setEditingJob({...editingJob, requirements: e.target.value})}
                    className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={editingJob.isActive}
                    onChange={(e) => setEditingJob({...editingJob, isActive: e.target.checked})}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active (visible to applicants)</label>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleUpdateJob}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-red-500 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-red-600 transition-all font-medium shadow-md"
                >
                  Update Job
                </button>
                <button
                  onClick={() => setEditingJob(null)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-all font-medium shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Current Job Openings</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      </div>
                      <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                        job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {userRole === 'super_admin' && (
  <div className="flex gap-2">
    <button
      onClick={() => setEditingJob(job)}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Edit
    </button>
    <button
      onClick={() => {
        const { id, createdAt, updatedAt, ...jobData } = job;
        setNewJob({...jobData, title: jobData.title + ' (Copy)'});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
    >
      Duplicate
    </button>
    <button
      onClick={() => handleDeleteJob(job.id, job.title)}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
)}










                  </div>
                </div>
              ))}
            </div>
            {jobs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No jobs posted yet</p>
            )}
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
                                   userRole === 'admin' ? 'Admin' : 
                                   userRole === 'program_manager' ? 'Program Manager' : 'Guest'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('job-listings')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                Home
              </button>
              {userRole === 'super_admin' && (
                <button
                  onClick={() => setCurrentView('manage-jobs')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  Manage Jobs
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-600" />
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
              <UserCheck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-800">{stats.hired}</p>
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
  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
    <Filter className="w-5 h-5 text-orange-600" />
    Filter Candidates
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Profile/Position</label>
      <select
        value={selectedProfile}
        onChange={(e) => setSelectedProfile(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      >
        <option value="All">All Profiles</option>
        <option value="Teacher">Teacher</option>
        <option value="Program Manager">Program Manager</option>
        <option value="Coordinator">Coordinator</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
      <select
        value={selectedStatusFilter}
        onChange={(e) => setSelectedStatusFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      >
        <option value="All">All Status</option>
        <option value="Not Contacted">Not Contacted</option>
        <option value="Contacted">Contacted</option>
        <option value="Screening">Screening</option>
        <option value="Fits">Fits</option>
        <option value="Shortlisted">Shortlisted</option>
        <option value="Rejected">Rejected</option>
        <option value="Hired">Hired</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">State (Home/Current)</label>
      <select
        value={selectedStateFilter}
        onChange={(e) => setSelectedStateFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      >
        <option value="All">All States</option>
        {INDIAN_STATES.map(state => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Home District</label>
      <select
        value={selectedDistrictFilter}
        onChange={(e) => setSelectedDistrictFilter(e.target.value)}
        disabled={selectedStateFilter === 'All'}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="All">All Districts</option>
        {selectedStateFilter !== 'All' && DISTRICTS[selectedStateFilter]?.map(district => (
          <option key={district} value={district}>{district}</option>
        ))}
      </select>
      {selectedStateFilter === 'All' && (
        <p className="text-xs text-gray-500 mt-1">Select a state first</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
      <select
        value={selectedExperienceFilter}
        onChange={(e) => setSelectedExperienceFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      >
        <option value="All">All Experience</option>
        <option value="0">0 years (Fresher)</option>
        <option value="1-2">1-2 years</option>
        <option value="3-5">3-5 years</option>
        <option value="6-10">6-10 years</option>
        <option value="10+">10+ years</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Available to Join (Days)</label>
      <select
        value={selectedJoiningDateFilter}
        onChange={(e) => setSelectedJoiningDateFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
      >
        <option value="All">Any Time</option>
        <option value="0-15">0-15 days (Immediate)</option>
        <option value="16-30">16-30 days</option>
        <option value="31-45">31-45 days</option>
        <option value="46+">46+ days</option>
      </select>
    </div>
  </div>

  {/* Clear Filters Button */}
  <div className="mt-4 flex justify-end">
    <button
      onClick={() => {
        setSelectedProfile('All');
        setSelectedStatusFilter('All');
        setSelectedStateFilter('All');
        setSelectedDistrictFilter('All');
        setSelectedExperienceFilter('All');
        setSelectedJoiningDateFilter('All');
      }}
      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
    >
      Clear All Filters
    </button>
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
        {userRole === 'super_admin' && (
          <button
            onClick={() => deleteCandidate(candidate.id, candidate.name)}
            className="text-red-600 hover:text-red-800"
            title="Delete candidate"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone:</strong> {candidate.phone}</p>
        <p><strong>Age:</strong> {candidate.age} years</p>
        <p><strong>Home:</strong> {candidate.homeDistrict}, {candidate.homeState}</p>
        <p><strong>Current:</strong> {candidate.currentState}</p>
        {candidate.howHeard && (
          <p><strong>Source:</strong> {candidate.howHeard}</p>
        )}
        {candidate.referrerName && (
          <p><strong>Referred by:</strong> {candidate.referrerName}</p>
        )}
        {candidate.resumeURL && (
          <a href={candidate.resumeURL} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent hover:underline block">
            View Resume
          </a>
        )}
      </div>

      {/* View Full Profile Button */}
      <button
        onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
        className="w-full mb-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        {expandedCandidate === candidate.id ? 'Hide Full Profile' : 'View Full Profile'}
      </button>

      {/* Expanded Details */}
      {expandedCandidate === candidate.id && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          <h4 className="font-bold text-gray-800 mb-3 text-sm">Full Profile Details</h4>
          
          <div className="space-y-3 text-xs">
            {/* Personal Info */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Personal Information:</p>
              <p><strong>DOB:</strong> {candidate.dob}</p>
              <p><strong>Gender:</strong> {candidate.gender}</p>
            </div>

            {/* Job Details */}
            <div>
              <p className="font-semibold text-gray-700 mb-1">Job Details:</p>
              <p><strong>Current Salary:</strong> ₹{candidate.currentSalary}</p>
              <p><strong>Can Join In:</strong> {candidate.availableToJoin} days</p>
            </div>

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Education:</p>
                {candidate.education.map((edu, idx) => (
                  <div key={idx} className="ml-2 mb-2 pb-2 border-b border-gray-200 last:border-0">
                    <p><strong>Degree:</strong> {edu.qualification === 'Others' ? edu.otherQualification : edu.qualification}</p>
                    <p><strong>College:</strong> {edu.college === 'Other' ? edu.otherCollege : edu.college}</p>
                    <p><strong>Year:</strong> {edu.year}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Work Experience */}
            {candidate.workExperience && candidate.workExperience.length > 0 && candidate.workExperience[0].organization && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Work Experience:</p>
                {candidate.workExperience.map((exp, idx) => (
                  <div key={idx} className="ml-2 mb-2 pb-2 border-b border-gray-200 last:border-0">
                    <p><strong>Organization:</strong> {exp.organization}</p>
                    <p><strong>Role:</strong> {exp.jobTitle}</p>
                    <p><strong>Location:</strong> {exp.location}</p>
                    <p><strong>Duration:</strong> {exp.joiningDate} to {exp.currentlyWorking ? 'Present' : exp.relievingDate}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Motivation */}
            {candidate.motivation && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Motivation:</p>
                <p className="text-gray-600 italic">{candidate.motivation}</p>
              </div>
            )}

            {/* Pay Cut Question */}
            {candidate.payCut && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">About Pay Cut:</p>
                <p className="text-gray-600 italic">{candidate.payCut}</p>
              </div>
            )}

            {/* Additional Documents */}
            {candidate.additionalDocs && candidate.additionalDocs.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Additional Documents:</p>
                {candidate.additionalDocs.map((doc, idx) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline ml-2">
                    📄 {doc.name}
                  </a>
                ))}
              </div>
            )}

            {/* Application Date */}
            {candidate.submittedAt && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Applied On:</p>
                <p>{new Date(candidate.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 border-t pt-4">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Contacted?</label>
          <select
            value={candidate.contacted || 'No'}
            onChange={(e) => updateCandidate(candidate.id, 'contacted', e.target.value, candidate)}
            disabled={userRole === 'guest'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
            disabled={userRole === 'guest'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
            disabled={userRole === 'guest'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
            disabled={userRole === 'guest'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          >
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
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
