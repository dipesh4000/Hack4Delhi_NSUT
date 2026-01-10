"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import AuthorityLayout from '@/components/authority/AuthorityLayout';

interface Officer {
  id: string;
  name: string;
  email: string;
  phone: string;
  wardId: string;
  wardName: string;
  role: string;
  senior: string;
  ongoingComplaints: number;
  resolvedComplaints: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

interface Complaint {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdAt: string;
}

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficersData();
  }, []);

  const fetchOfficersData = async () => {
    try {
      // Mock data for officers
      const officersData: Officer[] = Array.from({ length: 25 }, (_, index) => ({
        id: `officer-${index + 1}`,
        name: `Officer ${index + 1}`,
        email: `officer${index + 1}@delhi.gov.in`,
        phone: `+91 98765${String(index + 1).padStart(5, '0')}`,
        wardId: `${index + 1}`,
        wardName: `Ward ${index + 1}`,
        role: index === 0 ? 'Ward Incharge' : 'Field Officer',
        senior: index === 0 ? 'Central Authority' : 'Officer 1',
        ongoingComplaints: Math.floor(Math.random() * 15) + 1,
        resolvedComplaints: Math.floor(Math.random() * 50) + 10,
        joinedDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
        status: Math.random() > 0.1 ? 'active' : 'inactive'
      }));

      // Mock complaints data
      const complaintsData: Complaint[] = Array.from({ length: 100 }, (_, index) => ({
        id: `complaint-${index + 1}`,
        title: `Pollution Issue ${index + 1}`,
        status: ['pending', 'in-progress', 'resolved'][Math.floor(Math.random() * 3)] as any,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        assignedTo: `officer-${Math.floor(Math.random() * 25) + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setOfficers(officersData);
      setComplaints(complaintsData);
      setSelectedOfficer(officersData[0]);
    } catch (error) {
      console.error('Error fetching officers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOfficerComplaints = (officerId: string) => {
    return complaints.filter(complaint => 
      complaint.assignedTo === officerId && complaint.status !== 'resolved'
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600 bg-red-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (loading) {
    return (
      <AuthorityLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Officers Data...</p>
          </div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="space-y-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Officers List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ward Officers</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {officers.map((officer) => (
                <div
                  key={officer.id}
                  onClick={() => setSelectedOfficer(officer)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedOfficer?.id === officer.id
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{officer.name}</h4>
                    <span className={`w-2 h-2 rounded-full ${
                      officer.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{officer.wardName}</p>
                  <p className="text-xs text-slate-500">{officer.role}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-red-600">{officer.ongoingComplaints} pending</span>
                    <span className="text-green-600">{officer.resolvedComplaints} resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedOfficer && (
              <>
                {/* Officer Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{selectedOfficer.name}</h3>
                      <p className="text-slate-600">{selectedOfficer.role}</p>
                      <p className="text-sm text-slate-500">Senior: {selectedOfficer.senior}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-medium text-slate-900">{selectedOfficer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="font-medium text-slate-900">{selectedOfficer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Ward</p>
                        <p className="font-medium text-slate-900">{selectedOfficer.wardName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedOfficer.ongoingComplaints}</p>
                      <p className="text-sm text-slate-600">Ongoing Complaints</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedOfficer.resolvedComplaints}</p>
                      <p className="text-sm text-slate-600">Resolved Complaints</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round((selectedOfficer.resolvedComplaints / (selectedOfficer.resolvedComplaints + selectedOfficer.ongoingComplaints)) * 100)}%
                      </p>
                      <p className="text-sm text-slate-600">Resolution Rate</p>
                    </div>
                  </div>
                </motion.div>

                {/* Ongoing Complaints */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Ongoing Complaints</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {getOfficerComplaints(selectedOfficer.id).map((complaint) => (
                      <div key={complaint.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{complaint.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {complaint.status === 'pending' && <AlertCircle className="w-4 h-4 text-red-500" />}
                            {complaint.status === 'in-progress' && <Clock className="w-4 h-4 text-blue-500" />}
                            {complaint.status === 'resolved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getOfficerComplaints(selectedOfficer.id).length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                        <p className="text-slate-500">No ongoing complaints</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
}