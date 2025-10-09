"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function EquityAllocation() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Array<{
    id: string;
    name: string;
    weight: number;
    description?: string;
  }>>([]);
  
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    weight: 0,
    description: "",
  });

  const [capitalWeight, setCapitalWeight] = useState(20);
  const effortWeight = 100 - capitalWeight;

  // Mock company data - in a real app, this would come from the selected company
  const companyId = "company-1";

  const addDepartment = () => {
    if (newDepartment.name.trim()) {
      const department = {
        id: `dept-${Date.now()}`,
        name: newDepartment.name,
        weight: newDepartment.weight,
        description: newDepartment.description,
      };
      setDepartments([...departments, department]);
      setNewDepartment({ name: "", weight: 0, description: "" });
    }
  };

  const removeDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  const updateDepartmentWeight = (id: string, weight: number) => {
    setDepartments(departments.map(dept => 
      dept.id === id ? { ...dept, weight } : dept
    ));
  };

  const totalDepartmentWeight = departments.reduce((sum, dept) => sum + dept.weight, 0);
  const isWeightValid = Math.abs(totalDepartmentWeight - effortWeight) < 0.01;
  const weightDifference = totalDepartmentWeight - effortWeight;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Equity Allocation</h1>
            <p className="text-gray-600">Configure capital vs effort weighting and department allocations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Capital vs Effort Configuration */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Capital vs Effort Split</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capital Weight (%)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={capitalWeight}
                      onChange={(e) => setCapitalWeight(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-medium w-16">{capitalWeight}%</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Allocation Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Capital-based equity:</span>
                      <span className="font-medium">{capitalWeight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effort-based equity:</span>
                      <span className="font-medium">{effortWeight}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Department Management</h2>
              
              {/* Add New Department */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Engineering, Marketing, Sales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDepartment.weight}
                    onChange={(e) => setNewDepartment({...newDepartment, weight: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Brief description of the department's role"
                  />
                </div>

                <button
                  onClick={addDepartment}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Department
                </button>
              </div>

              {/* Department List */}
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <h3 className="font-medium">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-sm text-gray-600">{dept.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={dept.weight}
                        onChange={(e) => updateDepartmentWeight(dept.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                      <button
                        onClick={() => removeDepartment(dept.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Validation and Summary */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Allocation Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{capitalWeight}%</div>
                <div className="text-sm text-gray-600">Capital Weight</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{effortWeight}%</div>
                <div className="text-sm text-gray-600">Effort Weight</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${isWeightValid ? 'text-green-600' : 'text-red-600'}`}>
                  {totalDepartmentWeight.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Department Total</div>
              </div>
            </div>

            {/* Validation Messages */}
            {!isWeightValid && (
              <div className={`mt-4 p-4 rounded-md ${
                Math.abs(weightDifference) < 5 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  Math.abs(weightDifference) < 5 ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {weightDifference > 0 
                    ? `Department weights exceed effort allocation by ${weightDifference.toFixed(1)}%`
                    : `Department weights are ${Math.abs(weightDifference).toFixed(1)}% below effort allocation`
                  }
                </div>
                <div className={`text-sm mt-1 ${
                  Math.abs(weightDifference) < 5 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {weightDifference > 0 
                    ? "Reduce department weights to match the effort allocation."
                    : "Increase department weights to match the effort allocation."
                  }
                </div>
              </div>
            )}

            {isWeightValid && departments.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="font-medium text-green-800">
                  ✓ Department weights are correctly allocated
                </div>
                <div className="text-sm text-green-700 mt-1">
                  You can now proceed to add partners and tasks.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => {
                  // TODO: Implement save draft functionality
                  alert('Draft saved successfully!');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Save Draft
              </button>
              
              <div className="space-x-3">
                <button 
                  onClick={() => {
                    router.push('/company/partners');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Partners
                </button>
                <button 
                  onClick={() => {
                    if (isWeightValid && departments.length > 0) {
                      // TODO: Implement confirm allocation functionality
                      alert('Allocation confirmed! Redirecting to dashboard...');
                      router.push('/company/equity-dashboard');
                    }
                  }}
                  disabled={!isWeightValid || departments.length === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
