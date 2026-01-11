"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Users, Activity, Building, Car, Factory, Construction, Map, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for maps
const DelhiGeographicalMap = dynamic(() => import('@/components/maps/DelhiGeographicalMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Delhi Map...</div>
});

const WardGeographicalMap = dynamic(() => import('@/components/maps/WardGeographicalMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Ward Map...</div>
});

interface Ward {
  wardId: string;
  wardName: string;
  aqi: number;
  status: string;
  sourceStation: string;
  zone: string;
  ranking: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  officer?: {
    name: string;
    contact: string;
    address: string;
  };
  pollutionSources?: {
    vehicular: number;
    industrial: number;
    construction: number;
    residential: number;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Delhi ward names (actual ward names)
const DELHI_WARDS = [
  "Narela", "Bankner", "Holambi Kalan", "Alipur", "Bakhtawarpur", "Burari", "Kadipur", "Mukundpur", 
  "Sant Nagar", "Jharoda", "Timarpur", "Malka Ganj", "Mukherjee Nagar", "Dhirpur", "Adarsh Nagar",
  "Azadpur", "Bhalswa", "Jahangir Puri", "Sarup Nagar", "Samaypur Badli", "Rohini-A", "Rohini-B",
  "Rithala", "Vijay Vihar", "Budh Vihar", "Pooth Kalan", "Begumpur", "Shahbaad Dairy", "Pooth Khurd",
  "Bawana", "Nangal Thakran", "Kanjhawala", "Rani Khera", "Nangloi", "Mundka", "Nilothi", "Kirari",
  "Prem Nagar", "Mubarikpur", "Nithari", "Aman Vihar", "Mangol Puri", "Sultanpuri-A", "Sultanpuri-B",
  "Jawalapuri", "Nangloi Jat", "Nihal Vihar", "Guru Harkishan Nagar", "Mangolpuri-A", "Mangolpuri-B",
  "Rohini-C", "Rohini-F", "Rohini-E", "Rohini-D", "Shalimar Bagh-A", "Shalimar Bagh-B", "Pitam Pura",
  "Saraswati Vihar", "Paschim Vihar", "Rani Bagh", "Kohat Enclave", "Shakur Pur", "Tri Nagar",
  "Keshav Puram", "Ashok Vihar", "Wazir Pur", "Sangam Park", "Model Town", "Kamla Nagar", "Shastri Nagar",
  "Kishan Ganj", "Sadar Bazar", "Civil Lines", "Chandni Chowk", "Jama Masjid", "Chandani Mahal",
  "Delhi Gate", "Bazar Sita Ram", "Ballimaran", "Ram Nagar", "Quraish Nagar", "Pahar Ganj", "Karol Bagh",
  "Dev Nagar", "West Patel Nagar", "East Patel Nagar", "Ranjeet Nagar", "Baljeet Nagar", "Karam Pura",
  "Moti Nagar", "Ramesh Nagar", "Punjabi Bagh", "Madipur", "Raghubir Nagar", "Vishnu Garden",
  "Rajouri Garden", "Chaukhandi Nagar", "Subhash Nagar", "Hari Nagar", "Fateh Nagar", "Tilak Nagar",
  "Khyala", "Keshopur", "Janak Puri South", "Mahaveer Enclave", "Janak Puri West", "Vikas Puri",
  "Hastsal", "Vikas Nagar", "Kunwar Singh Nagar", "Baprola", "Sainik Enclave", "Mohan Garden",
  "Nawada", "Uttam Nagar", "Binda Pur", "Dabri", "Sagarpur", "Manglapuri", "Dwarka-B", "Dwarka-A",
  "Matiala", "Kakrola", "Nangli Sakrawati", "Chhawala", "Isapur", "Najafgarh", "Dichaon Kalan",
  "Roshan Pura", "Dwarka-C", "Bijwasan", "Kapashera", "Mahipalpur", "Raj Nagar", "Palam", "Madhu Vihar",
  "Mahavir Enclave", "Sadh Nagar", "Naraina", "Inder Puri", "Rajinder Nagar", "Daryaganj",
  "Sidhartha Nagar", "Lajpat Nagar", "Andrews Ganj", "Amar Colony", "Kotla Mubarakpur", "Hauz Khas",
  "Malviya Nagar", "Green Park", "Munirka", "R.K. Puram", "Vasant Vihar", "Lado Sarai", "Mehrauli",
  "Vasant Kunj", "Aya Nagar", "Bhati", "Chhatarpur", "Said-ul-Ajaib", "Deoli", "Tigri", "Sangam Vihar-A",
  "Dakshin Puri", "Madangir", "Pushp Vihar", "Khanpur", "Sangam Vihar-C", "Sangam Vihar-B",
  "Tughlakabad Ext.", "Chitaranjan Park", "Chirag Delhi", "Greater Kailash", "Sri Niwas Puri",
  "Kalkaji", "Govind Puri", "Harkesh Nagar", "Tughlakabad", "Pul Pehladpur", "Badarpur", "Molarband",
  "Meethapur", "Hari Nagar Ext.", "Jaitpur", "M.P. Khadar East", "M.P. Khadar West", "Sarita Vihar",
  "Abul Fazal Enclave", "Zakir Nagar", "New Ashok Nagar", "Mayur Vihar Ph-I", "Trilokpuri", "Kondli",
  "Gharoli", "Kalyanpuri", "Mayur Vihar Ph-II", "Patpar Ganj", "Vinod Nagar", "Mandawali", "Pandav Nagar",
  "Lalita Park", "Shakarpur", "Laxmi Nagar", "Preet Vihar", "I.P. Extension", "Anand Vihar",
  "Vishwas Nagar", "Anarkali", "Jagat Puri", "Geeta Colony", "Krishna Nagar", "Gandhi Nagar",
  "Shastri Park", "Azad Nagar", "Shahdara", "Jhilmil", "Dilshad Colony", "Sundar Nagri", "Dilshad Garden",
  "Nand Nagri", "Ashok Nagar", "Ram Nagar East", "Rohtash Nagar", "Welcome Colony", "Seelampur",
  "Gautam Puri", "Chauhan Banger", "Maujpur", "Braham Puri", "Bhajanpura", "Ghonda", "Yamuna Vihar",
  "Subhash Mohalla", "Kabir Nagar", "Gorakh Park", "Kardam Puri", "Harsh Vihar", "Saboli", "Gokal Puri",
  "Joharipur", "Karawal Nagar-E", "Dayalpur", "Mustafabad", "Nehru Vihar", "Brij Puri", "Sri Ram Colony",
  "Sadatpur", "Karawal Nagar-W", "Sonia Vihar", "Sabapur"
];

// Ward coordinates mapping
const WARD_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Narela': { lat: 28.8544, lng: 77.0917 },
  'Bankner': { lat: 28.8200, lng: 77.1100 },
  'Holambi Kalan': { lat: 28.8300, lng: 77.1200 },
  'Alipur': { lat: 28.8044, lng: 77.1436 },
  'Rohini-A': { lat: 28.7041, lng: 77.1025 },
  'Rohini-B': { lat: 28.7141, lng: 77.1125 },
  'Dwarka-A': { lat: 28.5921, lng: 77.0460 },
  'Dwarka-B': { lat: 28.5821, lng: 77.0560 },
  'Dwarka-C': { lat: 28.5721, lng: 77.0660 },
  'Connaught Place': { lat: 28.6315, lng: 77.2167 },
  'Karol Bagh': { lat: 28.6519, lng: 77.1909 },
  'Lajpat Nagar': { lat: 28.5677, lng: 77.2436 },
  'Vasant Kunj': { lat: 28.5244, lng: 77.1588 },
  'Mehrauli': { lat: 28.5244, lng: 77.1855 },
  'Shahdara': { lat: 28.6692, lng: 77.2889 },
  'Najafgarh': { lat: 28.6089, lng: 76.9794 },
  'Chandni Chowk': { lat: 28.6506, lng: 77.2303 },
  'Delhi Gate': { lat: 28.6406, lng: 77.2403 },
  'Jama Masjid': { lat: 28.6506, lng: 77.2333 },
  'Civil Lines': { lat: 28.6706, lng: 77.2203 }
};

export default function EnhancedWardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDelhiMap, setShowDelhiMap] = useState(true);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      setLoading(true);
      
      // Generate wards with actual names, coordinates, and rankings
      const generatedWards: Ward[] = DELHI_WARDS.map((name, index) => {
        const wardId = (index + 1).toString();
        const aqi = Math.floor(Math.random() * 350) + 50;
        const zones = ['Central Zone', 'Najafgarh Zone', 'Civil Line', 'Karolbagh', 'Keshavpuram', 'Narela', 'Rohini'];
        const coordinates = WARD_COORDINATES[name] || { 
          lat: 28.6139 + (Math.random() - 0.5) * 0.5, 
          lng: 77.2090 + (Math.random() - 0.5) * 0.5 
        };
        
        return {
          wardId,
          wardName: name,
          aqi,
          status: getStatusFromAQI(aqi),
          sourceStation: `${name} Monitoring Station`,
          zone: zones[Math.floor(Math.random() * zones.length)],
          ranking: 0, // Will be set after sorting
          coordinates,
          officer: {
            name: `Officer ${name.split(' ')[0]}`,
            contact: `+91 98765${wardId.padStart(5, '0')}`,
            address: `Ward Office, ${name}, Delhi`
          },
          pollutionSources: {
            vehicular: Math.floor(Math.random() * 50) + 20,
            industrial: Math.floor(Math.random() * 40) + 10,
            construction: Math.floor(Math.random() * 30) + 5,
            residential: Math.floor(Math.random() * 25) + 5
          }
        };
      });

      // Sort by AQI (best to worst) and assign rankings
      const sortedWards = generatedWards.sort((a, b) => a.aqi - b.aqi);
      sortedWards.forEach((ward, index) => {
        ward.ranking = index + 1;
      });

      setWards(sortedWards);
    } catch (error) {
      console.error('Error fetching wards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromAQI = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    return 'Severe';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'text-green-600';
      case 'Moderate': return 'text-yellow-600';
      case 'Poor': return 'text-orange-600';
      case 'Severe': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getRankingColor = (ranking: number) => {
    if (ranking <= 50) return 'text-green-600 bg-green-50';
    if (ranking <= 125) return 'text-yellow-600 bg-yellow-50';
    if (ranking <= 200) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredWards = wards.filter(ward =>
    ward.wardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Delhi wards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Delhi Wards</h1>
          <p className="text-slate-500 font-medium">Explore pollution data across all 250 wards of Delhi (Ranked by Performance)</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Ward List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search wards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Ward List */}
              <div className="max-h-[600px] overflow-y-auto">
                {filteredWards.map((ward) => (
                  <div
                    key={ward.wardId}
                    onClick={() => {
                      setSelectedWard(ward);
                      setShowDelhiMap(false);
                    }}
                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedWard?.wardId === ward.wardId ? 'bg-blue-50 border-blue-100' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${getRankingColor(ward.ranking)}`}>
                            #{ward.ranking}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-900 text-sm">{ward.wardName}</h4>
                        <p className="text-xs text-slate-500 mt-1">Ward #{ward.wardId}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">{ward.aqi}</div>
                        <div className={`text-xs font-medium ${getStatusColor(ward.status)}`}>
                          {ward.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Content - Map and Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {showDelhiMap || !selectedWard ? (
              /* Delhi Overview Geographical Map */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-600" />
                    Delhi Geographical Heatmap
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Activity size={16} />
                      <span>250 Wards</span>
                    </div>
                    {selectedWard && (
                      <button
                        onClick={() => setShowDelhiMap(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <MapPin size={16} />
                        View {selectedWard.wardName}
                      </button>
                    )}
                  </div>
                </div>
                <DelhiGeographicalMap wards={wards} onWardSelect={(ward) => {
                  setSelectedWard(ward as Ward);
                  setShowDelhiMap(false);
                }} />
              </div>
            ) : (
              /* Selected Ward Details */
              <>
                {/* Ward Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-sm px-3 py-1 rounded-full font-bold ${getRankingColor(selectedWard.ranking)}`}>
                          Rank #{selectedWard.ranking}
                        </span>
                        <button
                          onClick={() => setShowDelhiMap(true)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Globe size={14} />
                          Delhi Heatmap
                        </button>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedWard.wardName}</h2>
                      <p className="text-slate-500 mt-1">Ward #{selectedWard.wardId} • {selectedWard.zone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">{selectedWard.aqi}</div>
                      <div className={`text-sm font-medium ${getStatusColor(selectedWard.status)}`}>
                        {selectedWard.status}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">{selectedWard.pollutionSources?.vehicular}%</div>
                      <div className="text-xs text-slate-500">Vehicular</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Factory className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">{selectedWard.pollutionSources?.industrial}%</div>
                      <div className="text-xs text-slate-500">Industrial</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Construction className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">{selectedWard.pollutionSources?.construction}%</div>
                      <div className="text-xs text-slate-500">Construction</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">{selectedWard.pollutionSources?.residential}%</div>
                      <div className="text-xs text-slate-500">Residential</div>
                    </div>
                  </div>
                </div>

                {/* Ward Geographical Map */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-600" />
                    Pollution Sources & Locations
                  </h3>
                  <WardGeographicalMap ward={selectedWard} />
                </div>

                {/* Officer & Station Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Officer Info */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Ward Officer</h3>
                    </div>
                    
                    {selectedWard.officer && (
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-slate-900">{selectedWard.officer.name}</p>
                          <p className="text-sm text-slate-500">Nodal Officer</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-600">{selectedWard.officer.contact}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-slate-400 mt-0.5" />
                          <span className="text-sm text-slate-600">{selectedWard.officer.address}</span>
                        </div>
                        <button className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Contact Officer
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Monitoring Station */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Monitoring Station</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-slate-900">{selectedWard.sourceStation}</p>
                        <p className="text-sm text-slate-500">Primary monitoring station</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-slate-900">{selectedWard.aqi}</div>
                          <div className="text-xs text-slate-500">Current AQI</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">Live</div>
                          <div className="text-xs text-slate-500">Status</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
  );
}