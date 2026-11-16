import { words } from './index';

// Short public milestones supplied by the owner; undated stages stay undated.
export const journalStops = [
  {
    id: 'first-steps', title: 'First steps', period: words('2023', '2023'), progress: .02, mobileProgress: 0,
    description: words('Saya mulai kuliah pada 2023 dengan minat pada fullstack development, yang menjadi arah awal perjalanan belajar saya.', 'I started college in 2023 with an interest in fullstack development, the first direction in my learning journey.'),
  },
  {
    id: 'choosing-cyber', title: 'Choosing cybersecurity', period: words('Pertengahan 2024', 'Mid-2024'), progress: .14, mobileProgress: .125,
    description: words('Cybersecurity mulai menjadi fokus belajar saya pada pertengahan 2024, membuka arah baru untuk mengenal keamanan sistem dan aplikasi.', 'Cybersecurity became my learning focus in mid-2024, opening a new direction for exploring how systems and web applications are secured.'),
  },
  {
    id: 'web-exploration', title: 'Web security basics', period: words('Fondasi web', 'Web foundations'), progress: .26, mobileProgress: .25,
    description: words('Saya mulai mengenal dasar-dasar keamanan web melalui XSS dan SQL injection, sebagai bekal untuk memahami kerentanan aplikasi.', 'I began exploring web security fundamentals through XSS and SQL injection, building a starting point for understanding application vulnerabilities.'),
  },
  {
    id: 'security-class', title: 'Structured learning', period: words('Coding Studio', 'Coding Studio'), progress: .38, mobileProgress: .375,
    description: words('Kelas Cyber Security Beginner dari Coding Studio memberi struktur belajar melalui pengenalan Nmap, Gobuster, dan konsep OWASP.', 'Coding Studio’s Cyber Security Beginner class gave my learning more structure through introductions to Nmap, Gobuster, and OWASP concepts.'),
  },
  {
    id: 'xss-presentation', title: 'Presenting XSS', period: words('Tugas akhir', 'Final assignment'), progress: .50, mobileProgress: .5,
    description: words('Dalam tugas akhir kelas, saya meninjau OWASP Juice Shop di TryHackMe dan mempresentasikan temuan kerentanan XSS.', 'For the class’s final assignment, I examined OWASP Juice Shop on TryHackMe and presented an XSS vulnerability finding.'),
  },
  {
    id: 'thm-practice', title: 'TryHackMe practice', period: words('5 room selesai', '5 rooms completed'), progress: .62, mobileProgress: .625,
    description: words('Saya menyelesaikan lima room TryHackMe: Kenobi, Mr Robot CTF, OWASP Juice Shop, RootMe, dan Vulnversity, sebagai bagian dari latihan.', 'I completed five TryHackMe rooms: Kenobi, Mr Robot CTF, OWASP Juice Shop, RootMe, and Vulnversity, as part of my practice.'),
  },
  {
    id: 'htb-practice', title: 'Hack The Box practice', period: words('3 machine selesai', '3 machines completed'), progress: .74, mobileProgress: .75,
    description: words('Saya menyelesaikan Cap, Silentium, dan Principal di Hack The Box, sambil terus mengembangkan pemahaman melalui latihan.', 'I completed Cap, Silentium, and Principal on Hack The Box, while continuing to develop my understanding through practice.'),
  },
  {
    id: 'portswigger-focus', title: 'A closer look at SQLi', period: words('PortSwigger', 'PortSwigger'), progress: .86, mobileProgress: .875,
    description: words('Saya belajar SQL injection UNION melalui PortSwigger untuk memperdalam pemahaman tentang salah satu teknik dalam pengujian keamanan aplikasi web.', 'I studied SQL injection UNION through PortSwigger to develop my understanding of this technique within web application security testing.'),
  },
  {
    id: 'still-exploring', title: 'Still exploring', period: words('Arah saat ini', 'Current direction'), progress: .98, mobileProgress: 1,
    description: words('Arah yang ingin saya tuju adalah menjadi Security Engineer, sambil terus membangun pemahaman dan pengalaman melalui belajar serta praktik.', 'My goal is to become a Security Engineer, continuing to build understanding and experience through study and hands-on practice.'),
  },
];

export const journalMapCopy = {
  intro: words('Jejak belajar saya: dari pengembangan web, kelas cybersecurity, dan latihan lab menuju security engineering.', 'My learning path through web development, cybersecurity classes and hands-on labs toward security engineering.'),
  hint: words('Sorot titik untuk membaca ringkasannya.', 'Hover over a stop to read its summary.'),
  touchHint: words('Ketuk titik untuk membaca ringkasannya.', 'Tap a stop to read its summary.'),
  label: words('Peta perjalanan belajar', 'Learning journey map'),
  close: words('Tutup penjelasan', 'Close description'),
};
