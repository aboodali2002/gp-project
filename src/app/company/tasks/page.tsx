"use client";

import { useState } from "react";

interface Task {
  id: string;
  name: string;
  description: string;
  importance: "LOW" | "MEDIUM" | "HIGH";
  weight: number;
  department: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      name: "Develop core API",
      description: "Build the main backend API endpoints",
      importance: "HIGH",
      weight: 3,
      department: "Engineering"
    },
    {
      id: "task-2", 
      name: "Create user interface",
      description: "Design and implement the frontend",
      importance: "HIGH",
      weight: 3,
      department: "Engineering"
    },
    {
      id: "task-3",
      name: "Market research",
      description: "Analyze target market and competitors",
      importance: "MEDIUM",
      weight: 2,
      department: "Marketing"
    },
    {
      id: "task-4",
      name: "Social media setup",
      description: "Create social media accounts and content",
      importance: "LOW",
      weight: 1,
      department: "Marketing"
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    importance: "LOW" as const,
    department: ""
  });

  const departments = ["Engineering", "Product", "Marketing", "Sales", "Operations", "Finance"];
  const importanceWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 };

  const addTask = () => {
    if (newTask.name && newTask.department) {
      const task: Task = {
        id: `task-${Date.now()}`,
        ...newTask,
        weight: importanceWeights[newTask.importance]
      };
      setTasks([...tasks, task]);
      setNewTask({
        name: "",
        description: "",
        importance: "LOW",
        department: ""
      });
      setShowAddForm(false);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    setEditingTask(null);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const moveTask = (taskId: string, newDepartment: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, department: newDepartment } : task
    ));
  };

  // Calculate department summaries
  const departmentSummaries = departments.map(dept => {
    const deptTasks = tasks.filter(task => task.department === dept);
    const totalWeight = deptTasks.reduce((sum, task) => sum + task.weight, 0);
    return {
      name: dept,
      taskCount: deptTasks.length,
      totalWeight,
      tasks: deptTasks
    };
  });

  const totalTasks = tasks.length;
  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600">Add and manage tasks across departments with importance levels</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-green-600">{totalWeight}</div>
              <div className="text-sm text-gray-600">Total Weight</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-purple-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => t.importance === "HIGH").length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>

          {/* Add Task Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Task
            </button>
          </div>

          {/* Add Task Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={newTask.department}
                    onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Importance Level
                  </label>
                  <select
                    value={newTask.importance}
                    onChange={(e) => setNewTask({...newTask, importance: e.target.value as "LOW" | "MEDIUM" | "HIGH"})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low (Weight: 1)</option>
                    <option value="MEDIUM">Medium (Weight: 2)</option>
                    <option value="HIGH">High (Weight: 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Brief description of the task"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}

          {/* Department Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {departmentSummaries.map((dept) => (
              <div key={dept.name} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
                  <div className="text-sm text-gray-600">
                    {dept.taskCount} tasks, {dept.totalWeight} weight
                  </div>
                </div>

                {dept.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {dept.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{task.name}</div>
                          {task.description && (
                            <div className="text-xs text-gray-600">{task.description}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.importance === "HIGH" ? "bg-red-100 text-red-800" :
                            task.importance === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {task.importance}
                          </span>
                          <span className="text-xs text-gray-600">Weight: {task.weight}</span>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No tasks assigned</div>
                )}
              </div>
            ))}
          </div>

          {/* All Tasks List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div className="flex-1">
                    <div className="font-medium">{task.name}</div>
                    {task.description && (
                      <div className="text-sm text-gray-600">{task.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Department: {task.department}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.importance === "HIGH" ? "bg-red-100 text-red-800" :
                      task.importance === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {task.importance}
                    </span>
                    <span className="text-sm text-gray-600">Weight: {task.weight}</span>
                    <select
                      value={task.department}
                      onChange={(e) => moveTask(task.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
              Save Draft
            </button>
            
            <div className="space-x-3">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Preview Equity
              </button>
              <button 
                disabled={tasks.length === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
