"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Partner {
  id: string;
  name: string;
  email: string;
  departments: Array<{
    department: {
      id: string;
      name: string;
      weight: number;
    };
  }>;
}

interface Task {
  id: string;
  name: string;
  description: string;
  importance: "LOW" | "MEDIUM" | "HIGH";
  weight: number;
  department: {
    id: string;
    name: string;
    weight: number;
  };
}

interface TaskAssignment {
  id: string;
  task: Task;
  partner: Partner;
}

export default function TaskAssignmentPage() {
  const router = useRouter();
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  // Mock data for demonstration - in real app this would come from API
  const [partners] = useState<Partner[]>([
    {
      id: "partner-1",
      name: "Ahmed Khaled",
      email: "ahmed@example.com",
      departments: [
        {
          department: {
            id: "dept-1",
            name: "Engineering",
            weight: 40
          }
        },
        {
          department: {
            id: "dept-2", 
            name: "Product",
            weight: 20
          }
        }
      ]
    },
    {
      id: "partner-2",
      name: "Salma Ali",
      email: "salma@example.com",
      departments: [
        {
          department: {
            id: "dept-3",
            name: "Marketing",
            weight: 30
          }
        },
        {
          department: {
            id: "dept-4",
            name: "Sales",
            weight: 10
          }
        }
      ]
    }
  ]);

  const [tasks] = useState<Task[]>([
    {
      id: "task-1",
      name: "Develop core API",
      description: "Build the main backend API endpoints",
      importance: "HIGH",
      weight: 3,
      department: {
        id: "dept-1",
        name: "Engineering",
        weight: 40
      }
    },
    {
      id: "task-2",
      name: "Create user interface",
      description: "Design and implement the frontend",
      importance: "HIGH",
      weight: 3,
      department: {
        id: "dept-1",
        name: "Engineering",
        weight: 40
      }
    },
    {
      id: "task-3",
      name: "Market research",
      description: "Analyze target market and competitors",
      importance: "MEDIUM",
      weight: 2,
      department: {
        id: "dept-3",
        name: "Marketing",
        weight: 30
      }
    },
    {
      id: "task-4",
      name: "Social media setup",
      description: "Create social media accounts and content",
      importance: "LOW",
      weight: 1,
      department: {
        id: "dept-3",
        name: "Marketing",
        weight: 30
      }
    }
  ]);

  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);

  // Filter tasks based on selected partner's departments
  const availableTasks = selectedPartner 
    ? tasks.filter(task => {
        const partner = partners.find(p => p.id === selectedPartner);
        if (!partner) return false;
        return partner.departments.some(dept => dept.department.id === task.department.id);
      })
    : [];

  // Filter partners based on selected task's department
  if (selectedTask)
    {
        partners.filter(partner => 
        partner.departments.some(dept => dept.department.id === tasks.find(t => t.id === selectedTask)?.department.id)
      )
    }
    ;

  const assignTask = () => {
    if (selectedPartner && selectedTask) {
      const partner = partners.find(p => p.id === selectedPartner);
      const task = tasks.find(t => t.id === selectedTask);
      
      if (partner && task) {
        const newAssignment: TaskAssignment = {
          id: `assignment-${Date.now()}`,
          task,
          partner
        };
        
        setAssignments([...assignments, newAssignment]);
        setSelectedPartner("");
        setSelectedTask("");
        setShowAssignmentForm(false);
      }
    }
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
  };

  // Calculate effort for each partner
  const calculatePartnerEffort = (partnerId: string) => {
    const partnerAssignments = assignments.filter(a => a.partner.id === partnerId);
    let totalEffort = 0;
    
    // Group by department
    const departmentGroups = new Map<string, TaskAssignment[]>();
    partnerAssignments.forEach(assignment => {
      const deptId = assignment.task.department.id;
      if (!departmentGroups.has(deptId)) {
        departmentGroups.set(deptId, []);
      }
      departmentGroups.get(deptId)!.push(assignment);
    });

    const effortBreakdown = Array.from(departmentGroups.entries()).map(([_deptId, assignments]) => {
      const department = assignments[0]?.task.department;
      const totalTaskWeight = assignments.reduce((sum, a) => sum + a.task.weight, 0);
      const departmentWeight = department?.weight ?? 0;
      const effortContribution = (totalTaskWeight / 100) * (departmentWeight / 100);
      
      return {
        departmentName: department?.name,
        departmentWeight,
        taskCount: assignments.length,
        totalTaskWeight,
        effortContribution,
        effortPercentage: effortContribution * 100
      };
    });

    totalEffort = effortBreakdown.reduce((sum, dept) => sum + dept.effortContribution, 0);

    return {
      totalEffort,
      totalEffortPercentage: totalEffort * 100,
      effortBreakdown
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Task Assignment</h1>
            <p className="text-gray-600">Assign tasks to partners and calculate their effort contribution</p>
          </div>

          {/* Assignment Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assign Task to Partner</h2>
              <button
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {showAssignmentForm ? "Cancel" : "+ New Assignment"}
              </button>
            </div>

            {showAssignmentForm && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Partner
                  </label>
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a partner</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name} ({partner.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Task
                  </label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedPartner}
                  >
                    <option value="">Choose a task</option>
                    {availableTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.name} ({task.department.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedPartner("");
                      setSelectedTask("");
                      setShowAssignmentForm(false);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={assignTask}
                    disabled={!selectedPartner || !selectedTask}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign Task
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Assignments */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
            {assignments.length === 0 ? (
              <p className="text-gray-500 italic">No assignments yet</p>
            ) : (
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{assignment.task.name}</div>
                      <div className="text-sm text-gray-600">
                        Assigned to: {assignment.partner.name} | 
                        Department: {assignment.task.department.name} | 
                        Weight: {assignment.task.weight}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Partner Effort Calculation */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Partner Effort Calculation</h2>
            <div className="space-y-6">
              {partners.map(partner => {
                const effort = calculatePartnerEffort(partner.id);
                const partnerAssignments = assignments.filter(a => a.partner.id === partner.id);
                
                return (
                  <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{partner.name}</h3>
                      <div className="text-sm text-gray-600">
                        Total Effort: {effort.totalEffortPercentage.toFixed(2)}%
                      </div>
                    </div>
                    
                    {partnerAssignments.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-2">Assigned Tasks:</div>
                        {effort.effortBreakdown.map((dept, index) => (
                          <div key={index} className="ml-4 p-2 bg-gray-50 rounded">
                            <div className="font-medium text-sm">{dept.departmentName}</div>
                            <div className="text-xs text-gray-600">
                              {dept.taskCount} tasks, {dept.totalTaskWeight} weight, 
                              {dept.effortPercentage.toFixed(2)}% effort
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No tasks assigned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/company/tasks')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back to Tasks
            </button>
            
            <div className="space-x-3">
              <button
                onClick={() => router.push('/company/equity-dashboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Preview Equity
              </button>
              <button
                onClick={() => router.push('/company/equity-allocation')}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Calculate Final Equity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
