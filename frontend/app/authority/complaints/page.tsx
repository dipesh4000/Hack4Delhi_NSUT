"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  Search,
  Phone,
  Mail,
  Calendar,
  Flag,
  ArrowRight
} from 'lucide-react';
import AuthorityLayout from '@/components/authority/AuthorityLayout';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'air_quality' | 'industrial' | 'vehicular' | 'construction' | 'burning' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  wardId: string;
  wardName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  citizen: {
    name: string;
    phone: string;
    email: string;
  };
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: string;
  estimatedResolution?: string;
  resolutionNotes?: string;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    ward: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, filters, searchTerm]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      
      // Generate sample complaints data
      const sampleComplaints: Complaint[] = Array.from({ length: 50 }, (_, index) => {
        const categories = ['air_quality', 'industrial', 'vehicular', 'construction', 'burning', 'other'] as const;
        const priorities = ['low', 'medium', 'high', 'critical'] as const;
        const statuses = ['pending', 'investigating', 'in_progress', 'resolved', 'closed'] as const;
        
        const wardId = Math.floor(Math.random() * 250) + 1;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const complaintTitles = {
          air_quality: ['High pollution levels in area', 'Smog affecting visibility', 'Breathing difficulties due to air quality'],
          industrial: ['Factory emissions causing pollution', 'Industrial waste burning', 'Chemical smell from factory'],
          vehicular: ['Heavy traffic causing pollution', 'Diesel vehicles emitting black smoke', 'Traffic congestion increasing pollution'],
          construction: ['Construction dust pollution', 'Illegal construction activities', 'Dust from building demolition'],
          burning: ['Garbage burning in open area', 'Crop residue burning', 'Plastic burning causing toxic fumes'],
          other: ['General pollution complaint', 'Environmental concern', 'Air quality deterioration']
        };

        return {
          id: `COMP-${(index + 1).toString().padStart(4, '0')}`,
          title: complaintTitles[category][Math.floor(Math.random() * complaintTitles[category].length)],
          description: `Detailed description of the ${category} issue affecting the local area. Citizens are experiencing health issues and requesting immediate action.`,
          category,
          priority,
          status,
          wardId: wardId.toString(),
          wardName: `Ward ${wardId}`,
          location: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.5,
            lng: 77.2090 + (Math.random() - 0.5) * 0.5,
            address: `Sector ${Math.floor(Math.random() * 50) + 1}, Ward ${wardId}, Delhi`
          },
          citizen: {
            name: `Citizen ${index + 1}`,
            phone: `+91 98765${(index + 1).toString().padStart(5, '0')}`,
            email: `citizen${index + 1}@email.com`
          },
          attachments: Math.random() > 0.5 ? [`photo_${index + 1}.jpg`] : [],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          assignedOfficer: status !== 'pending' ? `Officer ${Math.floor(Math.random() * 10) + 1}` : undefined,
          estimatedResolution: status === 'in_progress' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          resolutionNotes: status === 'resolved' ? 'Issue has been resolved through appropriate measures.' : undefined
        };
      });

      setComplaints(sampleComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(c => c.priority === filters.priority);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    if (filters.ward !== 'all') {
      filtered = filtered.filter(c => c.wardId === filters.ward);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.wardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citizen.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  };

  const updateComplaintStatus = (complaintId: string, newStatus: Complaint['status']) => {
    setComplaints(prev => prev.map(c => 
      c.id === complaintId 
        ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
        : c
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'air_quality': return '🌫️';
      case 'industrial': return '🏭';
      case 'vehicular': return '🚗';
      case 'construction': return '🏗️';
      case 'burning': return '🔥';
      default: return '📋';
    }
  };

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const criticalCount = complaints.filter(c => c.priority === 'critical').length;
  const todayCount = complaints.filter(c => 
    new Date(c.createdAt).toDateString() === new Date().toDateString()
  ).length;

  if (loading) {
    return (
      <AuthorityLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading complaints...</p>
          </div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Complaints</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{complaints.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Filters */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedComplaint?.id === complaint.id ? 'bg-red-50 border-red-100' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(complaint.category)}</span>
                        <h4 className="font-medium text-slate-900">{complaint.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {complaint.wardName}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {complaint.citizen.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complaint Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {selectedComplaint ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(selectedComplaint.category)}</span>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedComplaint.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{selectedComplaint.description}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Citizen Details */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Citizen Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-slate-400" />
                      <span className="text-slate-600">{selectedComplaint.citizen.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-slate-600">{selectedComplaint.citizen.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <span className="text-slate-600">{selectedComplaint.citizen.email}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Location</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <span className="text-slate-600">{selectedComplaint.location.address}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Actions</h4>
                  <div className="space-y-2">
                    {selectedComplaint.status === 'pending' && (
                      <button
                        onClick={() => updateComplaintStatus(selectedComplaint.id, 'investigating')}
                        className="w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        Start Investigation
                      </button>
                    )}
                    {selectedComplaint.status === 'investigating' && (
                      <button
                        onClick={() => updateComplaintStatus(selectedComplaint.id, 'in_progress')}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {selectedComplaint.status === 'in_progress' && (
                      <button
                        onClick={() => updateComplaintStatus(selectedComplaint.id, 'resolved')}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button className="w-full py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                      Contact Citizen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Select a complaint to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
}