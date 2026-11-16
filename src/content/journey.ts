import type { Localized } from './index';

export const journeyArticle: {
  slug: string;
  title: string;
  description: Localized;
  sections: { title: string; description: Localized }[];
} = {
  slug: 'finding-my-way-into-security',
  title: 'Finding my way into security.',
  description: {
    id: 'Ringkasan arah belajar, kelas, dan latihan yang mendukung tujuan saya menuju security engineering.',
    en: 'A short overview of the learning, classes and practice supporting my goal of working in security engineering.',
  },
  sections: [
    {
      title: 'Development foundations — 2023',
      description: {
        id: 'Minat pada fullstack development menjadi arah awal pembelajaran saya ketika mulai kuliah pada 2023.',
        en: 'An interest in fullstack development was my first learning direction when I started college in 2023.',
      },
    },
    {
      title: 'Cybersecurity — 2024',
      description: {
        id: 'Pada pertengahan 2024, saya memilih untuk mendalami cybersecurity dan mulai mengenal konsep keamanan web seperti XSS dan SQL injection.',
        en: 'In mid-2024, I chose to focus on cybersecurity and began exploring web security concepts such as XSS and SQL injection.',
      },
    },
    {
      title: 'Structured learning',
      description: {
        id: 'Kelas Regular Online Cyber Security Beginner dari Coding Studio mencakup Nmap, Gobuster, dan konsep OWASP. Sertifikat kelas diterbitkan pada 17 September 2025.',
        en: 'Coding Studio’s Regular Online Cyber Security Beginner class covered Nmap, Gobuster, and OWASP concepts. The course certificate was issued on 17 September 2025.',
      },
    },
    {
      title: 'Practice and presentation',
      description: {
        id: 'Tugas akhir kelas menggunakan OWASP Juice Shop di TryHackMe, dengan presentasi temuan XSS. Latihan ini memperkenalkan cara melanjutkan belajar melalui berbagai machine yang tersedia.',
        en: 'The final assignment used OWASP Juice Shop on TryHackMe and included presenting an XSS finding. This introduced a way to continue learning through the available practice machines.',
      },
    },
    {
      title: 'Hands-on platforms',
      description: {
        id: 'Praktik berlanjut melalui lima room TryHackMe dan tiga machine Hack The Box yang telah diselesaikan. Saya juga berlatih di Starting Point dan mempelajari SQL injection UNION melalui PortSwigger.',
        en: 'Practice continued through five completed TryHackMe rooms and three completed Hack The Box machines. I also practised in Starting Point and studied SQL injection UNION through PortSwigger.',
      },
    },
    {
      title: 'Current direction',
      description: {
        id: 'Saya terus mengembangkan pengetahuan keamanan sistem dan aplikasi melalui belajar serta praktik, dengan tujuan menjadi Security Engineer.',
        en: 'I am continuing to develop my knowledge of system and application security through study and practice, with the goal of becoming a Security Engineer.',
      },
    },
  ],
};
