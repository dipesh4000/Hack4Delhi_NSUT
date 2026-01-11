"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle,
  Filter,
  Search,
  Calendar,
  Image as ImageIcon,
  Phone,
  Mail,
  ChevronDown,
  Download
} from 'lucide-react';

interface Complaint {
  _id: string;
  userId: string;
  userName: string; // Fallback for older complaints
  description: string;
  category: 'air_quality' | 'industrial' | 'vehicular' | 'construction' | 'burning' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  wardId: string;
  wardName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  citizen?: { // Made optional for backward compatibility
    name: string;
    phone?: string;
    email?: string;
  };
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: string;
  estimatedResolution?: string;
  resolutionNotes?: string;
}

export default function ReportsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/complaints');
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
      } else {
        console.error('Failed to fetch complaints');
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
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

  // Filter complaints
  const filteredComplaints = complaints
    .filter(c => {
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.priority !== 'all' && c.priority !== filters.priority) return false;
      if (filters.category !== 'all' && c.category !== filters.category) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const descMatch = (c.description || '').toLowerCase().includes(searchLower);
        const wardMatch = (c.wardName || '').toLowerCase().includes(searchLower);
        const citizenMatch = (c.citizen?.name || c.userName || '').toLowerCase().includes(searchLower);
        if (!descMatch && !wardMatch && !citizenMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    critical: complaints.filter(c => c.priority === 'critical').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Citizen Reports</h1>
            <p className="text-slate-500 font-medium mt-1">All complaints submitted by citizens</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={18} />
            <span className="font-medium">Export</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reports</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by description, ward, or citizen name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                <option value="air_quality">Air Quality</option>
                <option value="industrial">Industrial</option>
                <option value="vehicular">Vehicular</option>
                <option value="construction">Construction</option>
                <option value="burning">Burning</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No reports found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => (
                <motion.div
                  key={complaint._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    {complaint.imageUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={complaint.imageUrl} 
                          alt="Complaint" 
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCategoryIcon(complaint.category)}</span>
                          <h3 className="font-semibold text-slate-900 line-clamp-1">
                            {complaint.description.substring(0, 80)}...
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{complaint.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {complaint.citizen?.name || complaint.userName || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {complaint.wardName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                        {complaint.citizen?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {complaint.citizen.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedComplaint && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getCategoryIcon(selectedComplaint.category)}</span>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Complaint Details</h2>
                      <p className="text-sm text-slate-500">ID: {selectedComplaint._id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedComplaint(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl text-slate-400">×</span>
                  </button>
                </div>

                {selectedComplaint.imageUrl && (
                  <img 
                    src={selectedComplaint.imageUrl} 
                    alt="Complaint evidence" 
                    className="w-full rounded-lg mb-6 max-h-96 object-cover"
                  />
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
                    <p className="text-slate-900">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Category</h3>
                      <p className="text-slate-900 capitalize">{selectedComplaint.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Priority</h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Location</h3>
                    <p className="text-slate-900">{selectedComplaint.location.address}</p>
                    <p className="text-sm text-slate-500">{selectedComplaint.wardName}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Citizen Information</h3>
                    <div className="space-y-2">
                      <p className="text-slate-900 flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {selectedComplaint.citizen?.name || selectedComplaint.userName || 'Anonymous'}
                      </p>
                      {selectedComplaint.citizen?.phone && (
                        <p className="text-slate-900 flex items-center gap-2">
                          <Phone size={16} className="text-slate-400" />
                          {selectedComplaint.citizen.phone}
                        </p>
                      )}
                      {selectedComplaint.citizen?.email && (
                        <p className="text-slate-900 flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          {selectedComplaint.citizen.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Submitted</h3>
                    <p className="text-slate-900">
                      {new Date(selectedComplaint.createdAt).toLocaleString('en-IN', { 
                        dateStyle: 'long', 
                        timeStyle: 'short' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
  );
}
