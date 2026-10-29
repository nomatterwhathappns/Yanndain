import { words } from './index';

// Proposed note topics, not completed milestones or published articles.
export const journalStops = [
  { id: 'foundations', title: 'Foundations', x: 8, y: 70, mobileX: 21, mobileY: 13.3333,
    description: words('Tempat untuk catatan tentang jaringan, Linux, dan cara sistem bekerja. Menghubungkan konsep dasar dengan hal yang ditemui saat praktik.', 'A place for notes on networks, Linux, and how systems work. Connecting the fundamentals to observations from practice.') },
  { id: 'offensive-labs', title: 'Offensive labs', x: 28, y: 24, mobileX: 77, mobileY: 32,
    description: words('Ruang untuk mendokumentasikan pembelajaran dari HTB dan THM: pendekatan yang dicoba, kendala, dan pemahaman yang didapat.', 'A space to document learning from HTB and THM: approaches tried, obstacles encountered, and insights gained.') },
  { id: 'new-directions', title: 'New directions', x: 47, y: 76, mobileX: 26, mobileY: 51.1111,
    description: words('Peralihan dari eksplorasi red team menuju security engineering. Tempat mencatat pertanyaan baru tentang membangun dan menjaga keamanan sistem.', 'The shift from red team exploration toward security engineering. A place to record new questions about building and maintaining secure systems.') },
  { id: 'defensive-practice', title: 'Defensive practice', x: 72, y: 21, mobileX: 76, mobileY: 72,
    description: words('Topik untuk eksperimen berikutnya: konfigurasi keamanan, pengamatan log, dan pengujian deteksi. Catatannya akan diisi berdasarkan praktik yang dilakukan.', 'Topics for future experiments: security configuration, log observations, and detection testing. Notes will be based on actual hands-on practice.') },
  { id: 'field-notes', title: 'Field notes', x: 91, y: 64, mobileX: 32, mobileY: 89.3333,
    description: words('Tempat menyimpan temuan kecil, kesalahan yang diperbaiki, dan hal yang masih ingin dipahami. Catatan pendek juga punya tempat di sini.', 'A place for small discoveries, mistakes resolved, and things still to understand. Short notes belong here too.') },
];

export const journalMapCopy = {
  intro: words('Sebuah peta untuk catatan belajar. Jelajahi titiknya untuk melihat topik yang akan didokumentasikan.', 'A map for learning notes. Explore the stops to discover the topics to be documented.'),
  hint: words('Sorot atau pilih titik untuk menjelajah.', 'Hover over or select a stop to explore.'),
  touchHint: words('Ketuk titik untuk melihat ceritanya.', 'Tap a stop to see its story.'),
  label: words('Peta topik catatan belajar', 'Learning notes topic map'),
  preview: words('Pratinjau topik', 'Topic preview'),
};
