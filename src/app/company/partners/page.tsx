"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  capitalAmount: number;
  departments: string[];
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "partner-1",
      name: "Ahmed Khaled",
      email: "ahmed@example.com",
      phone: "+1-555-0123",
      gender: "Male",
      capitalAmount: 100000,
      departments: ["Engineering", "Product"]
    },
    {
      id: "partner-2", 
      name: "Salma Ali",
      email: "salma@example.com",
      phone: "+1-555-0124",
      gender: "Female",
      capitalAmount: 50000,
      departments: ["Marketing", "Sales"]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    capitalAmount: 0,
    departments: [] as string[]
  });

  const availableDepartments = ["Engineering", "Product", "Marketing", "Sales", "Operations", "Finance"];

  const addPartner = () => {
    if (newPartner.name && newPartner.email) {
      const partner: Partner = {
        id: `partner-${Date.now()}`,
        ...newPartner
      };
      setPartners([...partners, partner]);
      setNewPartner({
        name: "",
        email: "",
        phone: "",
        gender: "",
        capitalAmount: 0,
        departments: []
      });
      setShowAddForm(false);
    }
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners(partners.map(partner => 
      partner.id === id ? { ...partner, ...updates } : partner
    ));
    setEditingPartner(null);
  };

  const removePartner = (id: string) => {
    setPartners(partners.filter(partner => partner.id !== id));
  };

  const toggleDepartment = (partnerId: string, department: string) => {
    setPartners(partners.map(partner => {
      if (partner.id === partnerId) {
        const departments = partner.departments.includes(department)
          ? partner.departments.filter(d => d !== department)
          : [...partner.departments, department];
        return { ...partner, departments };
      }
      return partner;
    }));
  };

  const totalCapitalAmount = partners.reduce((sum, partner) => sum + partner.capitalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Partner Management</h1>
            <p className="text-gray-600">Add founders and partners, assign them to departments</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-blue-600">{partners.length}</div>
              <div className="text-sm text-gray-600">Total Partners</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-green-600">${totalCapitalAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Capital Committed</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-purple-600">{availableDepartments.length}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-blue-600">{partners.length > 0 && totalCapitalAmount > 0 ? '✓' : '⚠'}</div>
              <div className="text-sm text-gray-600">Capital Pool Ready</div>
            </div>
          </div>

          {/* Add Partner Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Partner
            </button>
          </div>

          {/* Add Partner Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Partner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter partner's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="partner@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1-555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={newPartner.gender}
                    onChange={(e) => setNewPartner({...newPartner, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capital Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPartner.capitalAmount}
                    onChange={(e) => setNewPartner({...newPartner, capitalAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departments
                  </label>
                  <div className="space-y-2">
                    {availableDepartments.map((dept) => (
                      <label key={dept} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newPartner.departments.includes(dept)}
                          onChange={(e) => {
                            const departments = e.target.checked
                              ? [...newPartner.departments, dept]
                              : newPartner.departments.filter(d => d !== dept);
                            setNewPartner({...newPartner, departments});
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{dept}</span>
                      </label>
                    ))}
                  </div>
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
                  onClick={addPartner}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Partner
                </button>
              </div>
            </div>
          )}

          {/* Partners List */}
          <div className="space-y-4">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{partner.name}</h3>
                    <p className="text-gray-600">{partner.email}</p>
                    {partner.phone && <p className="text-sm text-gray-500">{partner.phone}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPartner(partner)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removePartner(partner.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capital Amount ($)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={partner.capitalAmount}
                        onChange={(e) => updatePartner(partner.id, {capitalAmount: parseFloat(e.target.value) || 0})}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">USD</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departments
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableDepartments.map((dept) => (
                        <label key={dept} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={partner.departments.includes(dept)}
                            onChange={() => toggleDepartment(partner.id, dept)}
                            className="mr-1"
                          />
                          <span className="text-sm">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {partner.departments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Assigned to:</div>
                    <div className="flex flex-wrap gap-2">
                      {partner.departments.map((dept) => (
                        <span key={dept} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Capital Pool Overview */}
          {partners.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-800">
                Capital Pool Overview
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Total committed: ${totalCapitalAmount.toFixed(2)}
              </div>
            </div>
          )}

          {/* Action Buttons */
          }
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => alert('Draft saved successfully!')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Save Draft
            </button>
            
            <div className="space-x-3">
              <button
                onClick={() => router.push('/company/tasks')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Tasks
              </button>
              <button
                onClick={() => router.push('/company/task-assignment')}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Assign Tasks to Partners
              </button>
              <button
                onClick={() => {
                  if (partners.length > 0 && totalCapitalAmount > 0) {
                    router.push('/company/equity-dashboard');
                  }
                }} 
                disabled={partners.length === 0 || totalCapitalAmount <= 0}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Equity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
