"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  CheckCircle, 
  Clock, 
  Users,
  Car,
  Factory,
  Building,
  Wind,
  Target,
  PlayCircle,
  PauseCircle,
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-react';
import AuthorityLayout from '@/components/authority/AuthorityLayout';

interface GRAPAction {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'industrial' | 'construction' | 'power' | 'agriculture' | 'public';
  stage: 1 | 2 | 3 | 4;
  status: 'pending' | 'active' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementedBy: string;
  startDate?: string;
  endDate?: string;
  effectiveness: number; // 0-100
  cost: number;
  affectedAreas: string[];
  compliance: number; // 0-100
}

interface GRAPStage {
  stage: number;
  name: string;
  aqiRange: string;
  description: string;
  color: string;
  actions: GRAPAction[];
  isActive: boolean;
}

export default function GRAPPage() {
  const [currentStage, setCurrentStage] = useState(3);
  const [stages, setStages] = useState<GRAPStage[]>([]);
  const [selectedAction, setSelectedAction] = useState<GRAPAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [avgAQI, setAvgAQI] = useState(245);

  useEffect(() => {
    fetchGRAPData();
  }, []);

  const fetchGRAPData = async () => {
    try {
      setLoading(true);
      
      // Generate GRAP stages and actions
      const grapStages: GRAPStage[] = [
        {
          stage: 1,
          name: 'Stage I - Poor',
          aqiRange: '201-300',
          description: 'Preventive and restrictive actions',
          color: 'yellow',
          isActive: false,
          actions: [
            {
              id: 'S1-001',
              title: 'Increase Public Transport Frequency',
              description: 'Increase frequency of buses and metro services by 20%',
              category: 'transport',
              stage: 1,
              status: 'completed',
              priority: 'medium',
              implementedBy: 'Delhi Transport Corporation',
              startDate: '2024-01-15',
              endDate: '2024-01-30',
              effectiveness: 85,
              cost: 50000,
              affectedAreas: ['All Delhi'],
              compliance: 90
            },
            {
              id: 'S1-002',
              title: 'Water Sprinkling on Roads',
              description: 'Intensive water sprinkling on major roads to control dust',
              category: 'public',
              stage: 1,
              status: 'active',
              priority: 'high',
              implementedBy: 'Municipal Corporation',
              startDate: '2024-01-10',
              effectiveness: 70,
              cost: 25000,
              affectedAreas: ['Central Delhi', 'South Delhi'],
              compliance: 85
            }
          ]
        },
        {
          stage: 2,
          name: 'Stage II - Very Poor',
          aqiRange: '301-400',
          description: 'Restrictive actions for industries and vehicles',
          color: 'orange',
          isActive: false,
          actions: [
            {
              id: 'S2-001',
              title: 'Ban on Diesel Generators',
              description: 'Complete ban on diesel generators except for essential services',
              category: 'power',
              stage: 2,
              status: 'active',
              priority: 'high',
              implementedBy: 'Delhi Pollution Control Committee',
              startDate: '2024-01-12',
              effectiveness: 75,
              cost: 0,
              affectedAreas: ['All Delhi'],
              compliance: 78
            },
            {
              id: 'S2-002',
              title: 'Construction Activity Restrictions',
              description: 'Ban on construction and demolition activities',
              category: 'construction',
              stage: 2,
              status: 'active',
              priority: 'critical',
              implementedBy: 'Delhi Development Authority',
              startDate: '2024-01-12',
              effectiveness: 80,
              cost: 100000,
              affectedAreas: ['NCR Region'],
              compliance: 65
            }
          ]
        },
        {
          stage: 3,
          name: 'Stage III - Severe',
          aqiRange: '401-450',
          description: 'Emergency measures including odd-even',
          color: 'red',
          isActive: true,
          actions: [
            {
              id: 'S3-001',
              title: 'Odd-Even Vehicle Restrictions',
              description: 'Odd-even scheme for private vehicles',
              category: 'transport',
              stage: 3,
              status: 'active',
              priority: 'critical',
              implementedBy: 'Delhi Traffic Police',
              startDate: '2024-01-14',
              effectiveness: 60,
              cost: 200000,
              affectedAreas: ['Delhi NCR'],
              compliance: 72
            },
            {
              id: 'S3-002',
              title: 'Industrial Shutdown',
              description: 'Closure of industries not running on clean fuels',
              category: 'industrial',
              stage: 3,
              status: 'pending',
              priority: 'critical',
              implementedBy: 'Delhi Pollution Control Committee',
              effectiveness: 85,
              cost: 500000,
              affectedAreas: ['Industrial Areas'],
              compliance: 0
            },
            {
              id: 'S3-003',
              title: 'School Closure Advisory',
              description: 'Advisory for schools to remain closed or shift to online mode',
              category: 'public',
              stage: 3,
              status: 'active',
              priority: 'high',
              implementedBy: 'Directorate of Education',
              startDate: '2024-01-15',
              effectiveness: 90,
              cost: 0,
              affectedAreas: ['All Delhi'],
              compliance: 95
            }
          ]
        },
        {
          stage: 4,
          name: 'Stage IV - Severe+',
          aqiRange: '450+',
          description: 'Emergency actions including complete lockdown',
          color: 'red',
          isActive: false,
          actions: [
            {
              id: 'S4-001',
              title: 'Complete Vehicle Ban',
              description: 'Ban on all non-essential vehicles',
              category: 'transport',
              stage: 4,
              status: 'pending',
              priority: 'critical',
              implementedBy: 'Delhi Government',
              effectiveness: 95,
              cost: 1000000,
              affectedAreas: ['Delhi NCR'],
              compliance: 0
            },
            {
              id: 'S4-002',
              title: 'Complete Industrial Shutdown',
              description: 'Shutdown of all industries except essential services',
              category: 'industrial',
              stage: 4,
              status: 'pending',
              priority: 'critical',
              implementedBy: 'Delhi Government',
              effectiveness: 90,
              cost: 2000000,
              affectedAreas: ['Delhi NCR'],
              compliance: 0
            }
          ]
        }
      ];

      setStages(grapStages);
      if (grapStages[2].actions.length > 0) {
        setSelectedAction(grapStages[2].actions[0]);
      }
    } catch (error) {
      console.error('Error fetching GRAP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const implementAction = (actionId: string) => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      actions: stage.actions.map(action => 
        action.id === actionId 
          ? { ...action, status: 'active', startDate: new Date().toISOString() }
          : action
      )
    })));
  };

  const suspendAction = (actionId: string) => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      actions: stage.actions.map(action => 
        action.id === actionId 
          ? { ...action, status: 'suspended' }
          : action
      )
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="w-4 h-4" />;
      case 'industrial': return <Factory className="w-4 h-4" />;
      case 'construction': return <Building className="w-4 h-4" />;
      case 'power': return <Zap className="w-4 h-4" />;
      case 'agriculture': return <Wind className="w-4 h-4" />;
      case 'public': return <Users className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const activeActions = stages.flatMap(s => s.actions).filter(a => a.status === 'active').length;
  const pendingActions = stages.flatMap(s => s.actions).filter(a => a.status === 'pending').length;
  const avgCompliance = stages.flatMap(s => s.actions).reduce((sum, a) => sum + a.compliance, 0) / stages.flatMap(s => s.actions).length;
  const totalCost = stages.flatMap(s => s.actions).filter(a => a.status === 'active').reduce((sum, a) => sum + a.cost, 0);

  if (loading) {
    return (
      <AuthorityLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading GRAP data...</p>
          </div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="space-y-6">
        {/* GRAP Status Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">GRAP Stage {currentStage} Active</h2>
              <p className="text-red-100">Severe air quality conditions - Emergency measures in effect</p>
              <p className="text-sm text-red-100 mt-1">Current AQI: {avgAQI} • Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <Shield className="w-16 h-16 text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Actions</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeActions}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-green-600" />
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
                <p className="text-sm font-medium text-slate-600">Pending Actions</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingActions}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
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
                <p className="text-sm font-medium text-slate-600">Avg Compliance</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{Math.round(avgCompliance)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
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
                <p className="text-sm font-medium text-slate-600">Implementation Cost</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">₹{(totalCost / 100000).toFixed(1)}L</p>
              </div>
              <TrendingUp className="w-8 h-8 text-slate-600" />
            </div>
          </motion.div>
        </div>

        {/* GRAP Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stage.stage * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                stage.isActive ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  stage.isActive ? 'bg-red-100' : 'bg-slate-100'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    stage.isActive ? 'text-red-600' : 'text-slate-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    stage.isActive ? 'text-red-900' : 'text-slate-900'
                  }`}>
                    {stage.name}
                  </h3>
                  <p className="text-sm text-slate-600">AQI {stage.aqiRange}</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">{stage.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Actions:</span>
                  <span className="font-medium">{stage.actions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Active:</span>
                  <span className="font-medium text-green-600">
                    {stage.actions.filter(a => a.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Pending:</span>
                  <span className="font-medium text-yellow-600">
                    {stage.actions.filter(a => a.status === 'pending').length}
                  </span>
                </div>
              </div>

              {stage.isActive && (
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Currently Active</p>
                  <p className="text-xs text-red-600 mt-1">Emergency measures in effect</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Current Stage Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actions List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Stage {currentStage} Actions</h3>
              <p className="text-slate-600 mt-1">Emergency response measures</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {stages.find(s => s.stage === currentStage)?.actions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => setSelectedAction(action)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedAction?.id === action.id ? 'bg-blue-50 border-blue-100' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(action.category)}
                        <h4 className="font-medium text-slate-900">{action.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(action.priority)}`}>
                          {action.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{action.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>By: {action.implementedBy}</span>
                        <span>Compliance: {action.compliance}%</span>
                        <span>Effectiveness: {action.effectiveness}%</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(action.status)}`}>
                        {action.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {selectedAction ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(selectedAction.category)}
                    <h3 className="text-lg font-semibold text-slate-900">{selectedAction.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{selectedAction.description}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(selectedAction.priority)}`}>
                      {selectedAction.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedAction.status)}`}>
                      {selectedAction.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Implementation Details */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Implementation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Implemented by:</span>
                      <span className="font-medium">{selectedAction.implementedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cost:</span>
                      <span className="font-medium">₹{(selectedAction.cost / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Effectiveness:</span>
                      <span className="font-medium">{selectedAction.effectiveness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Compliance:</span>
                      <span className="font-medium">{selectedAction.compliance}%</span>
                    </div>
                  </div>
                </div>

                {/* Affected Areas */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Affected Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAction.affectedAreas.map((area, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Actions</h4>
                  <div className="space-y-2">
                    {selectedAction.status === 'pending' && (
                      <button
                        onClick={() => implementAction(selectedAction.id)}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Implement Action
                      </button>
                    )}
                    {selectedAction.status === 'active' && (
                      <button
                        onClick={() => suspendAction(selectedAction.id)}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Suspend Action
                      </button>
                    )}
                    <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Compliance Report
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Select an action to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
}