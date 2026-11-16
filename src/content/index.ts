export type Language = 'id' | 'en';
export type Localized = { id: string; en: string };
export const local = (value: Localized, language: Language) => value[language];
export const words = (id: string, en: string): Localized => ({ id, en });

// Add real files and verified contact details when available. A CV link remains
// absent until a genuine PDF is configured; one language can serve as fallback.
export const profile = {
  name: 'Ryanda Fajr Abdilah', username: 'Yanndain',
  cv: { id: null, en: null } as Record<Language, string | null>,
  email: null as string | null,
  github: 'https://github.com/nomatterwhathappns',
  instagram: 'https://www.instagram.com/ryanndafajr?cplk=MWd4dzBndTd1ZjBoMg==',
  linkedin: null as string | null,
};
export const copy = {
  home: words('Beranda', 'Home'), about: words('Tentang', 'About'),
  projects: words('Proyek', 'Projects'), journal: words('Jurnal', 'Journal'),
  contact: words('Kontak', 'Contact'), menu: words('Jelajahi', 'Explore'),
  openMenu: words('Buka menu', 'Open menu'), closeMenu: words('Tutup menu', 'Close menu'),
  skip: words('Langsung ke konten', 'Skip to content'),
  back: words('Kembali', 'Back'), backHome: words('Kembali ke beranda', 'Back to home'),
  viewCV: words('Lihat CV', 'View CV'),
  reduceMotion: words('Kurangi animasi', 'Reduce animation'), enableMotion: words('Aktifkan animasi', 'Enable animation'),
  heroFirst: 'Aspiring to become a', heroSecond: 'Professional Security Engineer.',
  heroDescription: words('Sedang mendalami security engineering melalui eksperimen dan belajar mandiri.', 'Exploring security engineering through experimentation and independent learning.'),
  dive: words('Lihat proyek', 'View projects'),
  aboutFirst: 'A little', aboutSecond: 'about me',
  aboutIntro: words('Saya mulai kuliah pada 2023 dengan minat pada fullstack development, lalu memilih mendalami cybersecurity pada pertengahan 2024. Kelas online dan latihan di THM serta HTB membantu saya menemukan cara belajar melalui praktik.', 'I started college in 2023 with an interest in fullstack development, then chose to explore cybersecurity in mid-2024. An online class and THM and HTB labs helped me find a way to learn through practice.'),
  readStory: words('Kenali lebih dekat', 'More about me'),
  aboutStory: words('Ketertarikan saya bermula dari fullstack development saat mulai kuliah pada 2023. Sekitar Juli–Agustus 2024, saya memilih lebih fokus pada cybersecurity. Kelas Cyber Security Beginner dari Coding Studio memperkenalkan latihan terarah melalui OWASP Juice Shop dan presentasi temuan XSS. Setelah kelas, saya melanjutkan praktik di TryHackMe, Hack The Box, dan mempelajari SQLi UNION melalui PortSwigger. Yang paling berarti bagi saya adalah masih mau terus mengeksplorasi bidang ini.', 'My interest began with fullstack development when I started college in 2023. Around July–August 2024, I chose to focus more on cybersecurity. Coding Studio’s Cyber Security Beginner class introduced structured practice through OWASP Juice Shop and an XSS findings presentation. After the class, I continued practising on TryHackMe and Hack The Box, and studied SQLi UNION through PortSwigger. What matters most to me is still wanting to explore this field.'),
  viewProjects: words('Lihat proyek', 'View projects'),
  projectsFirst: 'Learning', projectsSecond: 'by doing.',
  projectsIntro: words('Proyek dari ruang belajar dan eksperimen saya: alat keamanan, forensik digital, dan aplikasi belajar. Buka ceritanya atau jelajahi kode di GitHub.', 'Projects from my learning and experiments: security tools, digital forensics, and a study workspace. Read the story or explore the code on GitHub.'),
  repository: words('Lihat di GitHub', 'View on GitHub'),
  allProjects: words('Jelajahi semua proyek', 'Explore all projects'),
  bridgeFirst: 'Learn.', bridgeSecond: 'Build. Repeat.',
  journalFirst: 'My learning', journalSecond: 'journey.',
  journalIntro: words('Berawal dari minat pada fullstack saat mulai kuliah pada 2023, lalu menemukan arah di cybersecurity melalui kelas dan latihan. Sampai sekarang, saya masih ingin terus mengulik.', 'Starting with an interest in fullstack when I entered college in 2023, then finding direction in cybersecurity through a class and hands-on practice. I am still exploring.'),
  allNotes: words('Baca perjalanan saya', 'Read my journey'),
  journalKind: words('Perjalanan belajar', 'Learning journey'),
  certificatesIntro: words('Kelas dan tes keterampilan yang menyertai perjalanan belajar saya, dari pengembangan web sampai cybersecurity dan cloud.', 'Courses and skills tests alongside my learning journey, from web development to cybersecurity and cloud.'),
  viewCertificate: words('Lihat sertifikat', 'View certificate'),
  verifyCertificate: words('Verifikasi', 'Verify'),
  moreCertificates: words('Sertifikat lainnya', 'More certificates'),
  validUntil: words('Berlaku hingga', 'Valid until'),
  focusText: words('Fokus saat ini adalah security engineering, terutama memahami cara mengamankan sistem dan mengurangi risiko dari serangan yang sebelumnya dipelajari.', 'The current focus is security engineering, particularly understanding how to secure systems and reduce the risks posed by previously studied attacks.'),
  contactFirst: 'Let’s', contactSecond: 'connect.',
  contactText: words('Ruang untuk percakapan berikutnya.', 'A space for the next conversation.'),
  contactPending: words('Email dan tautan sosial akan ditambahkan.', 'Email and social links will be added.'),
  email: words('Kirim email', 'Send an email'), surface: words('Kembali ke permukaan', 'Back to the surface'),
  preview: words('Pratinjau', 'Preview'),
  all: words('Semua', 'All'), emptyFilter: words('Belum ada konten dalam kategori ini.', 'There is no content in this category yet.'),
  viewPreview: words('Lihat susunan', 'View the layout'),
  contents: 'On this page',
  nextProject: words('Lihat proyek lainnya', 'More projects'), nextArticle: words('Kembali ke jurnal', 'Back to the journal'),
  notFound: 'Page not found.',
};
export { projects, type Project } from './projects';

export { journeyArticle as article } from './journey';
