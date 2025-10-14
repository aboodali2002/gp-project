"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useAuth } from "../../_components/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { TopNavigation } from "../_components/top-navigation";

export default function CompanySetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    totalShares: 1000000,
    capitalWeight: 20,
    vestingPeriod: 48,
    vestingStartDate: new Date().toISOString().split('T')[0],
    vestingMethod: "MONTHLY" as const,
  });
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('companySetup');
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, isLoading, router, locale]);

  const createCompany = api.company.create.useMutation({
    onSuccess: (data) => {
      console.log("Company created:", data);
      setStep(3); // Move to success step
    },
    onError: (error) => {
      console.error("Error creating company:", error);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    createCompany.mutate({
      ...formData,
      vestingStartDate: new Date(formData.vestingStartDate || new Date()),
      ownerId: user.id,
    });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-16">
                <span className="text-center">{t('companyInfo')}</span>
                <span className="text-center">{t('equityLogic')}</span>
                <span className="text-center">{t('complete')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">{t('companyInformation')}</h2>
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('companyName')}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('enterCompanyName')}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('totalShares')}
                      </label>
                      <input
                        type="number"
                        value={formData.totalShares}
                        onChange={(e) => updateFormData('totalShares', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('vestingPeriod')}
                      </label>
                      <input
                        type="number"
                        value={formData.vestingPeriod}
                        onChange={(e) => updateFormData('vestingPeriod', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('vestingStartDate')}
                      </label>
                      <input
                        type="date"
                        value={formData.vestingStartDate}
                        onChange={(e) => updateFormData('vestingStartDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('vestingMethod')}
                      </label>
                      <select
                        value={formData.vestingMethod}
                        onChange={(e) => updateFormData('vestingMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MONTHLY">{t('monthly')}</option>
                        <option value="QUARTERLY">{t('quarterly')}</option>
                        <option value="ANNUAL">{t('annual')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('nextEquityLogic')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">{t('equityAllocationLogic')}</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('capitalWeight')} (%)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.capitalWeight}
                        onChange={(e) => updateFormData('capitalWeight', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-lg font-medium w-16">{formData.capitalWeight}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('capitalWeightDescription')}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">{t('allocationSummary')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('capitalBasedEquity')}:</span>
                        <span className="font-medium">{formData.capitalWeight}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('effortBasedEquity')}:</span>
                        <span className="font-medium">{100 - formData.capitalWeight}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-blue-900 mb-2">{t('nextSteps')}</h3>
                    <p className="text-sm text-blue-800">
                      {t('nextStepsDescription', { effortPercent: 100 - formData.capitalWeight })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    {t('back')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={createCompany.isPending}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {createCompany.isPending ? t('creating') : t('createCompany')}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-4">{t('companyCreatedSuccessfully')}</h2>
                <p className="text-gray-600 mb-6">
                  {t('companyCreatedDescription', { companyName: formData.name })}
                </p>
                <div className="space-y-2">
                  <a
                    href={`/${locale}/dashboard`}
                    className="block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('goToDashboard')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
