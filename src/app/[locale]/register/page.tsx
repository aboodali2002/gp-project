"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from "../../_components/auth-context";
import { useRouter } from "next/navigation";
import { AuthNavigation } from "../_components/auth-navigation";
import { useDarkMode } from "../_components/dark-mode-provider";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { isDark } = useDarkMode();

  // Debug logging
  console.log('Register Page - Current locale:', locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    if (!formData.agreeToTerms) {
      setError(t('mustAgreeToTerms'));
      return;
    }

    try {
      const success = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        router.push(`/${locale}/company-setup`);
      } else {
        setError(t('registrationFailed'));
      }
    } catch {
      setError(t('registrationFailed'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <AuthNavigation />
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tCommon('companyName')}</h1>
            <h2 className={`mt-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('createAccountTitle')}
            </h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('alreadyHaveAccount')}{" "}
              <Link
                href={`/${locale}/login`}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('signInHere')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('emailAddress')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    placeholder="john@example.com"
                  />
                </div>
              </div>


              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('password')}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('confirmPassword')}
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                    placeholder={t('confirmYourPassword')}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  {t('agreeToTerms')}{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    {t('termsAndConditions')}
                  </a>{" "}
                  {t('and')}{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    {t('privacyPolicy')}
                  </a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('createAccount')}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}