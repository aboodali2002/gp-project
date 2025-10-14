import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, fallback to 'en' if undefined
  const validLocale = locale && ['en', 'ar'].includes(locale) ? locale : 'en';
  
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
