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
  aboutIntro: words('Berawal dari eksplorasi red team di HTB dan THM, kini fokus belajar beralih ke cara membangun dan menjaga keamanan sistem. Pengalaman memahami serangan menjadi bekal untuk mempelajari pertahanan.', 'Starting with red team exploration on HTB and THM, the focus has shifted toward building and maintaining secure systems. Understanding attacks provides a foundation for learning defense.'),
  readStory: words('Kenali lebih dekat', 'More about me'),
  aboutStory: words('Di luar perkuliahan, keamanan siber dipelajari secara mandiri melalui latihan di Hack The Box dan TryHackMe. Prosesnya banyak melibatkan mencoba, menemui kendala, lalu mencari tahu penyebabnya. Latihan yang awalnya berfokus pada red team kini dilanjutkan dengan mempelajari sisi pertahanan sistem.', 'Outside of coursework, cybersecurity is studied independently through labs on Hack The Box and TryHackMe. The process involves trying things, running into problems, and figuring out what caused them. Training that initially focused on red teaming now continues with learning how to defend systems.'),
  viewProjects: words('Lihat proyek', 'View projects'),
  projectsFirst: 'Learning', projectsSecond: 'by doing.',
  projectsIntro: words('Proyek dari ruang belajar dan eksperimen saya: alat keamanan, forensik digital, dan aplikasi belajar. Buka ceritanya atau jelajahi kode di GitHub.', 'Projects from my learning and experiments: security tools, digital forensics, and a study workspace. Read the story or explore the code on GitHub.'),
  repository: words('Lihat di GitHub', 'View on GitHub'),
  allProjects: words('Jelajahi semua proyek', 'Explore all projects'),
  bridgeFirst: 'Learn.', bridgeSecond: 'Build. Repeat.',
  journalFirst: 'Notes', journalSecond: 'along the way.',
  journalIntro: words('Pertanyaan, proses, dan penemuan kecil. Tempat untuk merangkai apa yang dipelajari, satu catatan pada satu waktu.', 'Questions, process, and little discoveries. A place to piece together what was learned, one note at a time.'),
  allNotes: words('Buka semua catatan', 'Enter the journal'),
  focusText: words('Fokus saat ini adalah security engineering, terutama memahami cara mengamankan sistem dan mengurangi risiko dari serangan yang sebelumnya dipelajari.', 'The current focus is security engineering, particularly understanding how to secure systems and reduce the risks posed by previously studied attacks.'),
  contactFirst: 'Let’s', contactSecond: 'connect.',
  contactText: words('Ruang untuk percakapan berikutnya.', 'A space for the next conversation.'),
  contactPending: words('Email dan tautan sosial akan ditambahkan.', 'Email and social links will be added.'),
  email: words('Kirim email', 'Send an email'), surface: words('Kembali ke permukaan', 'Back to the surface'),
  preview: words('Pratinjau', 'Preview'),
  previewNotice: words('Contoh susunan konten. Belum merupakan proyek atau tulisan yang telah dikerjakan.', 'A preview of the content layout. This is not a completed project or published article.'),
  articlePreviewNotice: words('Belum ada tulisan yang diterbitkan. Buka contoh berikut untuk melihat bagaimana catatan belajar akan disajikan.', 'No articles have been published yet. Open the preview below to see how learning notes will be presented.'),
  all: words('Semua', 'All'), emptyFilter: words('Belum ada konten dalam kategori ini.', 'There is no content in this category yet.'),
  viewPreview: words('Lihat susunan', 'View the layout'),
  contents: 'On this page',
  nextProject: words('Lihat proyek lainnya', 'More projects'), nextArticle: words('Kembali ke jurnal', 'Back to the journal'),
  notFound: 'Page not found.',
};
export { projects, type Project } from './projects';

export const article = {
  slug: 'first-page',
  title: 'A first question.',
  description: words('Sebuah halaman terbuka untuk penemuan pertama.', 'An open page for the first discovery.'),
  sections: [
    { title: 'The question', description: words('Setiap catatan dimulai dari pertanyaan. Nantinya bagian ini menjelaskan topik yang dipelajari dan alasan topik itu menarik.', 'Every note starts with a question. This section will introduce the subject being explored and why it matters.') },
    { title: 'Trying it out', description: words('Langkah praktik, pengamatan, potongan kode, atau screenshot akan ditempatkan di sini. Catatan disusun dari pengalaman yang benar-benar dijalani.', 'Practical steps, observations, code, or screenshots will go here. Notes will be based on actual hands-on experience.') },
    { title: 'What I learned', description: words('Rangkuman pemahaman baru, hal yang belum terjawab, dan referensi yang membantu melanjutkan proses belajar.', 'A reflection on new understanding, unanswered questions, and references that help continue learning.') },
  ],
};
