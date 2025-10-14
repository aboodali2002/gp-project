"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

export function HtmlAttributes() {
  const locale = useLocale();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after the component mounts
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only update attributes after hydration is complete
    if (isHydrated && typeof window !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale, isHydrated]);

  return null;
}
