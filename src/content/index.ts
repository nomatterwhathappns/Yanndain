export type Language = 'id' | 'en';
export type Localized = { id: string; en: string };
export const local = (value: Localized, language: Language) => value[language];
export const words = (id: string, en: string): Localized => ({ id, en });

// Add real files and verified contact details when available. A CV link remains
// absent until a genuine PDF is configured; one language can serve as fallback.
export const profile = {
  name: 'Ryanda Fajr Abdilah', username: 'Yanndain',
  cv: { id: null, en: null } as Record<Language, string | null>,
  email: null as string | null, github: null as string | null, linkedin: null as string | null,
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
  projectsFirst: 'Learning', projectsSecond: 'by doing.',
  projectsIntro: words('Ruang untuk eksperimen dan proses di baliknya. Susunan awal ini akan diisi dengan karya nyata.', 'A space for experiments and the process behind them. This opening collection will be filled with real work.'),
  allProjects: words('Jelajahi semua proyek', 'Explore all projects'),
  bridgeFirst: 'Stay', bridgeSecond: 'curious.',
  journalFirst: 'Notes', journalSecond: 'along the way.',
  journalIntro: words('Pertanyaan, proses, dan penemuan kecil. Tempat untuk merangkai apa yang dipelajari, satu catatan pada satu waktu.', 'Questions, process, and little discoveries. A place to piece together what was learned, one note at a time.'),
  allNotes: words('Buka semua catatan', 'Enter the journal'),
  focusFirst: 'Learning', focusSecond: 'right now.',
  focusText: words('Security engineering. Memulai bab berikutnya dari rasa ingin tahu tentang cara sistem bekerja dan bagaimana menjaganya.', 'Security engineering. Starting a new chapter of understanding how systems work and how to protect them.'),
  horizonFirst: 'Keep', horizonSecond: 'exploring.',
  contactFirst: 'Let’s', contactSecond: 'connect.',
  contactText: words('Ruang untuk percakapan berikutnya.', 'A space for the next conversation.'),
  contactPending: words('Email dan tautan sosial akan ditambahkan.', 'Email and social links will be added.'),
  email: words('Kirim email', 'Send an email'), surface: words('Kembali ke permukaan', 'Back to the surface'),
  preview: words('Pratinjau', 'Preview'),
  previewNotice: words('Contoh susunan konten. Belum merupakan proyek atau tulisan yang telah dikerjakan.', 'A preview of the content layout. This is not a completed project or published article.'),
  projectPreviewNotice: words('Koleksi ini berisi contoh tata letak studi kasus. Proyek asli akan ditambahkan setelah dikerjakan dan didokumentasikan.', 'This collection previews the case study layouts. Real projects will be added once they have been completed and documented.'),
  articlePreviewNotice: words('Belum ada tulisan yang diterbitkan. Buka contoh berikut untuk melihat bagaimana catatan belajar akan disajikan.', 'No articles have been published yet. Open the preview below to see how learning notes will be presented.'),
  all: words('Semua', 'All'), emptyFilter: words('Belum ada konten dalam kategori ini.', 'There is no content in this category yet.'),
  viewPreview: words('Lihat susunan', 'View the layout'),
  contents: 'On this page',
  nextProject: words('Lihat proyek lainnya', 'More projects'), nextArticle: words('Kembali ke jurnal', 'Back to the journal'),
  notFound: 'Page not found.',
};
export interface Project {
  slug: string; title: string; description: Localized; category: string;
  art: 'lab' | 'signal' | 'flow';
  sections: { title: string; description: Localized }[];
}
export const projects: Project[] = [
  {
    slug: 'lab-preview', category: 'Security Engineering', art: 'lab',
    title: 'A home lab.',
    description: words('Pratinjau dokumentasi lab dan rancangan sistem.', 'A preview of lab documentation and system design.'),
    sections: [
      { title: 'The starting question', description: words('Tujuan proyek, masalah yang ingin dipahami, dan batas lingkungan pengujian akan dijelaskan di sini.', 'The project’s purpose, the problem to understand, and the boundaries of the test environment will go here.') },
      { title: 'Designing the environment', description: words('Tempat untuk diagram arsitektur, komponen yang dipakai, serta alasan memilih setiap pendekatan.', 'A place for the architecture diagram, the components used, and the reasoning behind each decision.') },
      { title: 'Process and results', description: words('Langkah praktik, bukti pengujian, hasil yang diamati, dan kendala akan ditulis berdasarkan pekerjaan nyata.', 'Practical steps, test evidence, observed results, and challenges will be documented from actual work.') },
      { title: 'What was learned', description: words('Refleksi, keterbatasan hasil, dan hal yang ingin diperbaiki pada percobaan berikutnya.', 'Reflections, limitations, and what to improve in the next experiment.') },
    ],
  },
  {
    slug: 'signals-preview', category: 'Detection', art: 'signal',
    title: 'Reading the signals.',
    description: words('Pratinjau pengamatan, analisis, dan temuan.', 'A preview of observations, analysis, and findings.'),
    sections: [
      { title: 'What was observed', description: words('Konteks data dan pertanyaan analisis akan dituliskan setelah eksperimen dilakukan.', 'The data context and analytical question will be recorded after the experiment.') },
      { title: 'The analysis', description: words('Ruang untuk contoh log, alur penyelidikan, dan penjelasan bukti yang ditemukan.', 'A space for log examples, the investigation process, and an explanation of the evidence.') },
      { title: 'Evaluating the results', description: words('Hasil deteksi, kemungkinan salah identifikasi, serta langkah perbaikan berikutnya.', 'Detection results, possible misidentifications, and the next improvements.') },
    ],
  },
  {
    slug: 'automation-preview', category: 'Automation', art: 'flow',
    title: 'Small tools.',
    description: words('Pratinjau proses mengubah ide menjadi alat.', 'A preview of turning an idea into a tool.'),
    sections: [
      { title: 'Idea and purpose', description: words('Pekerjaan yang ingin disederhanakan dan alasan mengapa alat ini diperlukan.', 'The work to simplify and why the tool is needed.') },
      { title: 'Building and testing', description: words('Ruang untuk kode, cara penggunaan, serta pengujian yang membuktikan perilakunya.', 'A place for code, usage instructions, and tests that verify its behavior.') },
      { title: 'Evaluation', description: words('Apa yang berhasil, batas kemampuan alat, dan kemungkinan pengembangan berikutnya.', 'What works, the tool’s limitations, and possible future improvements.') },
    ],
  },
];
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
