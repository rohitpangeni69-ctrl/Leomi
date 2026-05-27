import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'LEOMI': 'LEOMI',
          'Premium Fashion in Nepal': 'Premium Fashion in Nepal',
          'Search products...': 'Search products...',
          'Women': 'Women',
          'Men': 'Men',
          'Accessories': 'Accessories',
          'Add to Cart': 'Add to Cart',
          'Out of Stock': 'Out of Stock',
          'My Wishlist': 'My Wishlist',
          'Your Cart': 'Your Cart',
          'Checkout': 'Checkout',
          'Total': 'Total',
          'Language': 'Language',
          'Flash Sale': 'Flash Sale',
          'Loading...': 'Loading...',
          'Shop Now': 'Shop Now',
          'New Arrivals': 'New Arrivals',
        }
      },
      ne: {
        translation: {
          'LEOMI': 'LEOMI',
          'Premium Fashion in Nepal': 'नेपालमा प्रिमियम फेसन',
          'Search products...': 'सामान खोज्नुहोस्...',
          'Women': 'महिला',
          'Men': 'पुरुष',
          'Accessories': 'सहायक सामग्री',
          'Add to Cart': 'कार्टमा थप्नुहोस्',
          'Out of Stock': 'स्टक बाहिर',
          'My Wishlist': 'मेरो इच्छा सूची',
          'Your Cart': 'तपाईंको कार्ट',
          'Checkout': 'चेकआउट',
          'Total': 'कुल',
          'Language': 'भाषा',
          'Flash Sale': 'फ्ल्यास सेल',
          'Loading...': 'लोड हुँदैछ...',
          'Shop Now': 'अहिले किनमेल गर्नुहोस्',
          'New Arrivals': 'नयाँ आगमन',
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
