"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { api } from "~/trpc/react";
import { AuthenticatedNavigation } from "../_components/authenticated-navigation";
import { useDarkMode } from "../_components/dark-mode-provider";
import { useAuth } from "../../_components/auth-context";
import Link from "next/link";
import { LanguageSwitcher } from "../_components/language-switcher";

export default function Dashboard() {
  const router = useRouter();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { user, isLoading } = useAuth();

  // Check if user has a company
  const { data: companies, isLoading: companiesLoading } = api.company.getAllByUser.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id }
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    } else if (!companiesLoading && companies && companies.length === 0) {
      // User is logged in but has no company, redirect to company setup
      router.push(`/${locale}/company-setup`);
    }
  }, [user, isLoading, companies, companiesLoading, router, locale]);

  // Company data - populated from user registration
  const [companyData, setCompanyData] = useState({
    name: "",
    capitalWeight: 20,
    effortWeight: 80,
    totalShares: 1000000,
    vestingPeriod: 48,
  });

  // Update company data when user data loads
  useEffect(() => {
    if (user?.companyName) {
      setCompanyData(prev => ({
        ...prev,
        name: user.companyName || ""
      }));
    }
  }, [user]);

  const [departments, setDepartments] = useState<Array<{id: number; name: string; weight: number}>>([]);

  const [partners, setPartners] = useState<Array<{id: number; name: string; email: string; capitalAmount: number; departments: string[]}>>([]);

  const [tasks, setTasks] = useState<Array<{id: number; name: string; department: string; importance: "LOW" | "MEDIUM" | "HIGH"; weight: number; assignedPartners: number[]}>>([]);

  // Task inline state
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", description: "", importance: "MEDIUM", department: "", assignedPartners: [] as number[] });
  const departmentNames = departments.map((d) => d.name);
  const importanceWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 } as const;

  const addTask = () => {
    if (!newTask.name.trim() || !newTask.department.trim()) return;
    const nextId = Math.max(0, ...tasks.map((t) => (typeof t.id === "number" ? t.id : Number(t.id) || 0))) + 1;
    setTasks([
      ...tasks,
      {
        id: nextId,
        name: newTask.name.trim(),
        department: newTask.department,
        importance: newTask.importance as "LOW" | "MEDIUM" | "HIGH",
        weight: importanceWeights[newTask.importance as keyof typeof importanceWeights],
        assignedPartners: newTask.assignedPartners,
        ...(newTask.description ? { description: newTask.description } : {}),
      },
    ]);
    setNewTask({ name: "", description: "", importance: "MEDIUM", department: "", assignedPartners: [] });
    setShowAddTaskForm(false);
  };

  const removeTaskById = (id: number | string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTaskToDepartment = (id: number | string, dept: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, department: dept } : t)));
  };

  const getAvailablePartnersForDepartment = (department: string) => {
    return partners.filter(partner => 
      partner.departments.includes(department)
    );
  };

  const togglePartnerSelection = (partnerId: number) => {
    setNewTask(prev => ({
      ...prev,
      assignedPartners: prev.assignedPartners.includes(partnerId)
        ? prev.assignedPartners.filter(id => id !== partnerId)
        : [...prev.assignedPartners, partnerId]
    }));
  };

  // Inline add forms state
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", weight: 0 });
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", email: "", capitalAmount: 0, departments: [] as string[] });
  const [editingPartner, setEditingPartner] = useState<number | null>(null);

  const addDepartment = () => {
    if (!newDepartment.name.trim()) return;
    const id = Math.max(0, ...departments.map((d) => Number(d.id) || 0)) + 1;
    setDepartments([...departments, { id, name: newDepartment.name.trim(), weight: newDepartment.weight }]);
    setNewDepartment({ name: "", weight: 0 });
    setShowAddDepartmentForm(false);
  };

  const removeDepartmentById = (id: number) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  const addPartner = () => {
    if (!newPartner.name.trim() || !newPartner.email.trim()) return;
    const id = Math.max(0, ...partners.map((p) => Number(p.id) || 0)) + 1;
    setPartners([
      ...partners,
      {
        id,
        name: newPartner.name.trim(),
        email: newPartner.email.trim(),
        capitalAmount: newPartner.capitalAmount,
        departments: newPartner.departments,
      },
    ]);
    setNewPartner({ name: "", email: "", capitalAmount: 0, departments: [] });
    setShowAddPartnerForm(false);
  };

  const removePartnerById = (id: number) => {
    setPartners(partners.filter((p) => p.id !== id));
  };

  const updatePartner = (id: number, updates: any) => {
    setPartners(partners.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const togglePartnerDepartment = (partnerId: number, department: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;
    
    const currentDepartments = partner.departments || [];
    const isAssigned = currentDepartments.includes(department);
    
    const updatedDepartments = isAssigned
      ? currentDepartments.filter(d => d !== department)
      : [...currentDepartments, department];
    
    updatePartner(partnerId, { departments: updatedDepartments });
  };

  const saveStateToStorage = () => {
    try {
      const state = {
        companyData,
        departments,
        partners,
        tasks,
      };
      localStorage.setItem("cq_state", JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save state", err);
    }
  };

  const totalDepartmentWeight = departments.reduce((sum, dept) => sum + dept.weight, 0);
  const totalCapitalAmount = partners.reduce((sum, partner) => sum + (partner.capitalAmount || 0), 0);
  const isAllocationValid =
    Math.abs(totalDepartmentWeight - companyData.effortWeight) < 0.01 && (partners.length === 0 || totalCapitalAmount > 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Navigation */}
      <nav className={`border-b transition-colors duration-300 ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      }`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href={`/${locale}/dashboard`} 
            className={`text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
            }`}
          >
            CorporateQuota
          </Link>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link
              href={`/${locale}/dashboard`}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}
            >
              🏠 Dashboard
            </Link>
            <Link
              href={`/${locale}/reports`}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              📊 Reports
            </Link>
            {user && (
              <div className="flex items-center space-x-2">
                <span className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Welcome, {user.fullName}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = `/${locale}/login`;
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('description')}</p>
        </div>

        {/* Bento Grid Layout - Removed fixed height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Company Setup - lg:col-span-3 */}
          <div
            className={`lg:col-span-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('companySetup.title')}</h2>
              <div className="text-2xl">🏢</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('companySetup.companyName')}</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-gray-50 text-gray-900'
                }`}>
                  {companyData.name || "Not set"}
                </div>
                <p className="text-xs text-gray-500 mt-1">Set during registration</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('companySetup.totalShares')}</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-gray-50 text-gray-900'
                }`}>
                  {companyData.totalShares.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Default: 1,000,000 shares</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('companySetup.vestingPeriod')}</label>
                <div className={`w-full px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-gray-50 text-gray-900'
                }`}>
                  {companyData.vestingPeriod} months
                </div>
                <p className="text-xs text-gray-500 mt-1">Default: 48 months (4 years)</p>
              </div>
            </div>
          </div>

          {/* Capital vs Effort Split - lg:col-span-6 */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('capitalEffort.title')}</h2>
              <div className="text-2xl">⚖️</div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('capitalEffort.capitalWeight')}: {companyData.capitalWeight}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={companyData.capitalWeight}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setCompanyData({
                        ...companyData,
                        capitalWeight: value,
                        effortWeight: 100 - value,
                      });
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('capitalEffort.capital')}</span>
                  <span className="text-sm text-gray-500">{companyData.capitalWeight}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${companyData.capitalWeight}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('capitalEffort.effort')}</span>
                  <span className="text-sm text-gray-500">{companyData.effortWeight}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${companyData.effortWeight}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights - lg:col-span-3 */}
          <div
            className={`lg:col-span-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('quickInsights.title')}</h2>
              <div className="text-2xl">📊</div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{departments.length}</div>
                <div className="text-sm text-gray-500">{t('quickInsights.departments')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{partners.length}</div>
                <div className="text-sm text-gray-500">{t('quickInsights.partners')}</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isAllocationValid ? "text-green-600" : "text-red-600"}`}>
                  {isAllocationValid ? "✓" : "⚠"}
                </div>
                <div className="text-sm text-gray-500">{t('quickInsights.allocationValid')}</div>
              </div>
            </div>
          </div>

          {/* Department Management - lg:col-span-6 */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('departmentManagement.title')}</h2>
              <div className="text-2xl">🏢</div>
            </div>

            <div className="space-y-4">
              {departments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏢</div>
                  <p>{t('departmentManagement.noDepartments')}</p>
                </div>
              ) : (
                departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-sm text-gray-500">{t('departmentManagement.weight')}: {dept.weight}%</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dept.weight || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setDepartments(
                          departments.map((d) => (d.id === dept.id ? { ...d, weight: isNaN(value) ? 0 : value } : d))
                        );
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <button
                      onClick={() => removeDepartmentById(dept.id as number)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
                ))
              )}

              {!showAddDepartmentForm ? (
                <button
                  onClick={() => setShowAddDepartmentForm(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  + {t('departmentManagement.addDepartment')}
                </button>
              ) : (
                <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={t('departmentManagement.departmentName')}
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      className={`flex-1 px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder={t('departmentManagement.weight')}
                      value={newDepartment.weight || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setNewDepartment({ ...newDepartment, weight: isNaN(value) ? 0 : value });
                      }}
                      className={`w-24 px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowAddDepartmentForm(false);
                        setNewDepartment({ name: "", weight: 0 });
                      }}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      {t('common.cancel')}
                    </button>
                    <button onClick={addDepartment} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      {t('common.add')}
                    </button>
                  </div>
                </div>
              )}

              <div
                className={`text-sm p-2 rounded ${
                  Math.abs(totalDepartmentWeight - companyData.effortWeight) < 0.01
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                {t('departmentManagement.total')}: {totalDepartmentWeight}% ({t('departmentManagement.expected')}: {companyData.effortWeight}%)
              </div>
            </div>
          </div>

          {/* Partner Management - lg:col-span-6 */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('partnerManagement.title')}</h2>
              <div className="text-2xl">👥</div>
            </div>

            <div className="space-y-4">
              {partners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p>{t('partnerManagement.noPartners')}</p>
                </div>
              ) : (
                partners.map((partner) => (
                <div key={partner.id} className={`p-3 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.email}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingPartner(editingPartner === partner.id ? null : partner.id as number)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {editingPartner === partner.id ? t('common.cancel') : t('common.edit')}
                      </button>
                      <button
                        onClick={() => removePartnerById(partner.id as number)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {/* Normal Display */}
                  {editingPartner !== partner.id && (
                    <>
                      {/* Capital Amount Display */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-medium">${partner.capitalAmount || 0}</span>
                        <span className="text-sm text-gray-500">{t('partnerManagement.capitalAmount')}</span>
                      </div>

                      {/* Department Display */}
                      {(partner.departments || []).length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">{t('partnerManagement.assignedTo')}:</div>
                          <div className="flex flex-wrap gap-1">
                            {(partner.departments || []).map(dept => (
                              <span key={dept} className={`px-2 py-1 rounded text-xs ${
                                isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Edit Mode */}
                  {editingPartner === partner.id && (
                    <div className="space-y-3">
                      {/* Name and Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder={t('partnerManagement.fullName')}
                          value={partner.name}
                          onChange={(e) => updatePartner(partner.id as number, { name: e.target.value })}
                          className={`px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                        />
                        <input
                          type="email"
                          placeholder={t('partnerManagement.email')}
                          value={partner.email}
                          onChange={(e) => updatePartner(partner.id as number, { email: e.target.value })}
                          className={`px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                        />
                      </div>

                      {/* Capital Amount */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="$ {t('partnerManagement.amount')}"
                          value={partner.capitalAmount || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            updatePartner(partner.id as number, { capitalAmount: isNaN(value) ? 0 : value });
                          }}
                          className={`w-24 px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                        />
                        <span className="text-sm text-gray-500">{t('partnerManagement.capitalAmount')}</span>
                      </div>

                      {/* Department Assignment */}
                      <div>
                        <div className="text-sm font-medium mb-2">{t('partnerManagement.assignToDepartments')}:</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {departmentNames.map(dept => {
                            const isAssigned = (partner.departments || []).includes(dept);
                            return (
                              <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => togglePartnerDepartment(partner.id as number, dept)}
                                  className="rounded"
                                />
                                <span className="text-sm">{dept}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                ))
              )}

              {!showAddPartnerForm ? (
                <button
                  onClick={() => setShowAddPartnerForm(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  + {t('partnerManagement.addPartner')}
                </button>
              ) : (
                <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder={t('partnerManagement.fullName')}
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      className={`px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="email"
                      placeholder={t('partnerManagement.email')}
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                      className={`px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$ {t('partnerManagement.amount')}"
                      value={newPartner.capitalAmount || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setNewPartner({ ...newPartner, capitalAmount: isNaN(value) ? 0 : value });
                      }}
                      className={`px-2 py-1 border rounded text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  {/* Department Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('partnerManagement.assignToDepartments')}:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {departmentNames.map(dept => (
                        <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPartner.departments.includes(dept)}
                            onChange={(e) => {
                              const departments = e.target.checked
                                ? [...newPartner.departments, dept]
                                : newPartner.departments.filter(d => d !== dept);
                              setNewPartner({ ...newPartner, departments });
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowAddPartnerForm(false);
                        setNewPartner({ name: "", email: "", capitalAmount: 0, departments: [] });
                      }}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      {t('common.cancel')}
                    </button>
                    <button onClick={addPartner} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      {t('common.add')}
                    </button>
                  </div>
                </div>
              )}

              <div className="text-sm p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {t('partnerManagement.totalCapitalCommitted')}: ${totalCapitalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Task Management -- MOVED OUTSIDE of the fixed grid for flexibility */}
        <section
          id="tasks"
          className={`mt-8 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t('taskManagement.title')}</h2>
            <div className="text-2xl">🧩</div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {t('taskManagement.total')}: {tasks.length} {t('taskManagement.tasks')} · {t('taskManagement.highPriority')}: {tasks.filter((t) => t.importance === "HIGH").length}
            </div>
            {!showAddTaskForm && (
              <button
                onClick={() => setShowAddTaskForm(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                + {t('taskManagement.addTask')}
              </button>
            )}
          </div>

          {showAddTaskForm && (
            <div className="p-4 mb-4 border-2 border-dashed rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder={t('taskManagement.taskName')}
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className={`px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                <select
                  value={newTask.department}
                  onChange={(e) => setNewTask({ ...newTask, department: e.target.value, assignedPartners: [] })}
                  className={`px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">{t('taskManagement.selectDepartment')}</option>
                  {departmentNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTask.importance}
                  onChange={(e) => setNewTask({ ...newTask, importance: e.target.value as "LOW" | "MEDIUM" | "HIGH" })}
                  className={`px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="LOW">{t('taskManagement.low')} ({t('taskManagement.weight')}: 1)</option>
                  <option value="MEDIUM">{t('taskManagement.medium')} ({t('taskManagement.weight')}: 2)</option>
                  <option value="HIGH">{t('taskManagement.high')} ({t('taskManagement.weight')}: 3)</option>
                </select>
              </div>
              
              {/* Partner Selection */}
              {newTask.department && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('taskManagement.assignPartners')}:</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                    {getAvailablePartnersForDepartment(newTask.department).map(partner => (
                      <label key={partner.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTask.assignedPartners.includes(partner.id as number)}
                          onChange={() => togglePartnerSelection(partner.id as number)}
                          className="rounded"
                        />
                        <span className="text-sm">{partner.name}</span>
                      </label>
                    ))}
                    {getAvailablePartnersForDepartment(newTask.department).length === 0 && (
                      <div className="text-sm text-gray-500 col-span-2">{t('taskManagement.noPartnersAvailable')}</div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddTaskForm(false);
                    setNewTask({ name: "", description: "", importance: "MEDIUM", department: "", assignedPartners: [] });
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                >
                  {t('common.cancel')}
                </button>
                <button onClick={addTask} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  {t('common.add')}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>{t('taskManagement.noTasks')}</p>
              </div>
            ) : (
              tasks.map((task) => {
              const assignedPartners = task.assignedPartners 
                ? partners.filter(p => task.assignedPartners.includes(p.id as number))
                : [];
              
              return (
                <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{task.name}</div>
                      <div className="text-xs text-gray-500">{t('taskManagement.department')}: {task.department}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          task.importance === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : task.importance === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.importance}
                      </span>
                      <span className="text-xs text-gray-600">{t('taskManagement.weight')}: {task.weight}</span>
                      <select
                        value={task.department}
                        onChange={(e) => moveTaskToDepartment(task.id as number, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-transparent"
                      >
                        {departmentNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => removeTaskById(task.id as number)} className="text-red-600 hover:text-red-800 text-sm">
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Assigned Partners */}
                  {assignedPartners.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 mb-1">{t('taskManagement.assignedPartners')}:</div>
                      <div className="flex flex-wrap gap-1">
                        {assignedPartners.map(partner => (
                          <span key={partner.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {partner.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => {
              saveStateToStorage();
              alert(t('common.draftSaved'));
            }}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.saveDraft')}
          </button>
          <button
            onClick={() => {
              router.push(`/${locale}/reports`);
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('common.viewReports')}
          </button>
        </div>
      </div>
    </div>
  );
}
