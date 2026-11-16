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
    id: 'Dari minat pada fullstack development, mencari arah lewat kelas dan lab, sampai memilih untuk terus belajar menuju security engineering.',
    en: 'From an interest in fullstack development to finding direction through classes and labs, and continuing toward security engineering.',
  },
  sections: [
    {
      title: 'The first direction — 2023',
      description: {
        id: 'Pada 2023, saya mulai kuliah dengan ketertarikan untuk menjadi fullstack developer. Itu menjadi arah awal yang ingin saya pelajari. Ketertarikan pada cybersecurity baru muncul kemudian, ketika saya mulai mempertimbangkan bidang lain yang bisa saya dalami.',
        en: 'In 2023, I started college with an interest in becoming a fullstack developer. That was the first direction I wanted to explore. My interest in cybersecurity came later, as I began considering other fields to study.',
      },
    },
    {
      title: 'Choosing where to start — 2024',
      description: {
        id: 'Sekitar Juli–Agustus 2024, saya tertarik pada dua bidang: AI dan cybersecurity. Saat itu, AI terasa lebih sulit untuk saya dekati, sementara cybersecurity terasa lebih memungkinkan untuk mulai dipelajari. Setelah mempertimbangkan keduanya, saya memilih untuk lebih fokus pada cybersecurity. Pilihan itu menjadi titik awal perjalanan belajar saya di bidang ini.',
        en: 'Around July–August 2024, I became interested in two fields: AI and cybersecurity. At that stage, AI felt harder for me to approach, while cybersecurity felt more approachable as a place to begin. After considering both, I chose to focus more on cybersecurity. That decision started my learning journey in the field.',
      },
    },
    {
      title: 'Beginning before the path was clear',
      description: {
        id: 'Awalnya saya masih bingung harus mulai dari mana. Saya memutuskan untuk mulai mengenal teknik serangan seperti XSS, SQL injection, serta DoS dan DDoS. Setelah mencoba belajar dengan cara itu, saya kembali kesulitan menentukan apa yang perlu dipelajari berikutnya. Saya kemudian memilih mengikuti kelas online untuk mencari arah belajar yang lebih jelas.',
        en: 'At first, I was unsure where to begin. I decided to start by learning about attack techniques such as XSS, SQL injection, and DoS and DDoS. After exploring them, I again found it difficult to decide what to study next. I then chose an online class to find a clearer learning direction.',
      },
    },
    {
      title: 'Finding structure through a class',
      description: {
        id: 'Saya mengikuti kelas Regular Online Cyber Security Beginner dari Coding Studio. Di sana saya mempelajari dasar-dasar seperti Nmap, Gobuster, dan konsep OWASP. Untuk tugas akhirnya, saya diminta mencari kerentanan pada OWASP Juice Shop di TryHackMe dan mempresentasikan temuan saya. Presentasi tersebut membahas kerentanan XSS. Pengalaman dengan Juice Shop juga memperkenalkan saya pada banyak machine yang tersedia untuk latihan. Dari situ, saya menemukan cara untuk melanjutkan belajar lewat praktik, di samping membaca materi. Sertifikat kelas saya diterbitkan pada 17 September 2025.',
        en: 'I took Coding Studio’s Regular Online Cyber Security Beginner class. It introduced foundations such as Nmap, Gobuster, and OWASP concepts. For the final assignment, I was asked to find vulnerabilities in OWASP Juice Shop on TryHackMe and present my findings. My presentation covered an XSS vulnerability. Working with Juice Shop also showed me that there were many machines available to practise on. It gave me a way to continue learning through hands-on practice alongside reading. My course certificate was issued on 17 September 2025.',
      },
    },
    {
      title: 'Continuing through practice',
      description: {
        id: 'Setelah kelas, saya melanjutkan latihan di TryHackMe dan kemudian mengenal Hack The Box. Lima room THM yang sudah saya selesaikan adalah Kenobi, Mr Robot CTF, OWASP Juice Shop, RootMe, dan Vulnversity. Di HTB, saya sudah menyelesaikan Cap, Silentium, dan Principal. Sebagian besar Starting Point juga sudah selesai, sementara Unified dan Vaccine belum. Ada beberapa machine lain yang sempat saya coba tetapi belum saya selesaikan. Saya juga sempat belajar di PortSwigger untuk memahami SQL injection dengan teknik UNION.',
        en: 'After the class, I continued practising on TryHackMe and later discovered Hack The Box. The five THM rooms I have completed are Kenobi, Mr Robot CTF, OWASP Juice Shop, RootMe, and Vulnversity. On HTB, I have completed Cap, Silentium, and Principal. Most of Starting Point is also complete, while Unified and Vaccine remain unfinished. I have attempted other machines without completing them. I also spent time studying SQL injection UNION techniques through PortSwigger.',
      },
    },
    {
      title: 'The direction I want to keep exploring',
      description: {
        id: 'Sekarang, arah yang ingin saya tuju adalah menjadi Security Engineer. Hal yang paling berarti bagi saya adalah saya masih bertahan di cybersecurity dan masih mau mengeksplorasi hal-hal baru di dalamnya. Perjalanan ini masih berlangsung: saya terus belajar dan mencari tahu bagian mana yang perlu saya pahami lebih jauh.',
        en: 'The direction I want to pursue now is becoming a Security Engineer. What matters most to me is that I have stayed with cybersecurity and remain willing to explore new things within it. This journey is still ongoing: I am continuing to learn and work out what I need to understand more deeply.',
      },
    },
  ],
};
