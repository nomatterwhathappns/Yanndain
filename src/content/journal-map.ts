import { words } from './index';

// Personal milestones supplied by the owner; undated stages stay undated.
export const journalStops = [
  { id: 'first-steps', title: 'A first direction', period: words('2023', '2023'), groups: ['beginnings'], x: 8, y: 70, mobileX: 21, mobileY: 13.3333,
    description: words('Saya mulai kuliah pada 2023 dengan ketertarikan untuk menjadi fullstack developer. Itu adalah arah awal yang ingin saya pelajari.', 'I started college in 2023 with an interest in becoming a fullstack developer. It was the first direction I wanted to explore.') },
  { id: 'choosing-cyber', title: 'Choosing cybersecurity', period: words('Pertengahan 2024', 'Mid-2024'), groups: ['beginnings', 'direction'], x: 28, y: 24, mobileX: 77, mobileY: 32,
    description: words('Sekitar Juli–Agustus 2024, saya mempertimbangkan AI dan cybersecurity. Saat itu AI terasa lebih sulit untuk didekati, dan saya memilih cybersecurity sebagai bidang yang lebih memungkinkan untuk mulai saya pelajari.', 'Around July–August 2024, I considered AI and cybersecurity. AI felt harder for me to approach at the time, and I chose cybersecurity as a more approachable place to start.') },
  { id: 'learning-path', title: 'A learning path', period: words('Sertifikat · 2025', 'Certificate · 2025'), groups: ['practice'], x: 47, y: 76, mobileX: 26, mobileY: 51.1111,
    description: words('Kelas Cyber Security Beginner mengenalkan Nmap, Gobuster, OWASP, serta latihan OWASP Juice Shop. Presentasi akhir saya membahas XSS. Sertifikatnya diterbitkan pada 17 September 2025; pengalaman ini membuka jalan untuk belajar melalui praktik.', 'The Cyber Security Beginner class introduced Nmap, Gobuster, OWASP and OWASP Juice Shop practice. My final presentation covered XSS. The certificate was issued on 17 September 2025; the experience opened a path into hands-on learning.') },
  { id: 'hands-on-labs', title: 'Learning by doing', period: words('Setelah kelas', 'After the class'), groups: ['practice'], x: 72, y: 21, mobileX: 76, mobileY: 72,
    description: words('Saya melanjutkan latihan di TryHackMe, lalu mengenal Hack The Box. Lima room THM dan tiga machine HTB sudah saya selesaikan. Ada juga latihan yang masih belum selesai, termasuk Unified dan Vaccine di Starting Point.', 'I continued practising on TryHackMe, then discovered Hack The Box. I have completed five THM rooms and three HTB machines. Some practice remains unfinished, including Unified and Vaccine in Starting Point.') },
  { id: 'still-exploring', title: 'Still exploring', period: words('Sekarang', 'Now'), groups: ['practice', 'direction'], x: 91, y: 64, mobileX: 32, mobileY: 89.3333,
    description: words('Saya juga mempelajari SQLi UNION melalui PortSwigger. Arah yang ingin saya tuju adalah menjadi Security Engineer. Hal yang paling berarti adalah tetap bertahan di cybersecurity dan masih ingin terus menguliknya.', 'I also studied SQLi UNION through PortSwigger. The direction I want to pursue is becoming a Security Engineer. What matters most is staying with cybersecurity and still wanting to explore it.') },
];

export const journalFilters = [
  { id: 'all', label: words('Semua tahap', 'All stages') },
  { id: 'beginnings', label: words('Awal perjalanan', 'Beginnings') },
  { id: 'practice', label: words('Latihan', 'Practice') },
  { id: 'direction', label: words('Arah belajar', 'Direction') },
];

export const journalMapCopy = {
  intro: words('Lima titik perjalanan saya: dari minat awal saat kuliah, menemukan cara belajar melalui praktik, sampai arah yang ingin saya tuju sekarang.', 'Five stops along my journey: from an early interest at college to finding hands-on learning and the direction I want to pursue now.'),
  hint: words('Sorot titik untuk membaca ceritanya. Klik jalur untuk mengarahkan ikan.', 'Hover over a stop to read its story. Click the route to guide the fish.'),
  touchHint: words('Ketuk titik untuk membaca cerita, atau jalur untuk mengarahkan ikan.', 'Tap a stop to read its story, or the route to guide the fish.'),
  label: words('Peta perjalanan belajar', 'Learning journey map'),
  close: words('Tutup penjelasan', 'Close description'),
};
