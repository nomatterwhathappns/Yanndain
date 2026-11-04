import { words } from './index';

export const interactionCopy = {
  dismiss: words('Tutup petunjuk', 'Dismiss hint'),
  help: words('Petunjuk interaksi', 'Interaction guide'),
  replay: words('Tampilkan petunjuk lagi', 'Show hints again'),
  helpIntro: words('Coba saat menjelajah. Semua isi tetap bisa dibuka tanpa memainkan lautnya.', 'Try these as you explore. All content is accessible without interacting with the ocean.'),
  ocean: words('Gerakkan kursor di dekat ikan. Klik laut kosong untuk membuat gelombang.', 'Move near the fish. Click open water to send a ripple.'),
  oceanTouch: words('Ketuk laut yang kosong untuk membuat ikan bereaksi.', 'Tap open water to see the fish respond.'),
  tornado: words('Gerakkan kursor melewati pusaran ikan.', 'Move your cursor through the fish spiral.'),
  vortex: words('Sentuh lingkaran ikan dengan kursor.', 'Move your cursor through the ring of fish.'),
  corridor: words('Gerakkan kursor ke sisi laut untuk melihat kedalamannya.', 'Move toward the sides of the water to explore its depth.'),
  formationTouch: words('Ketuk di dekat ikan untuk mengubah alirannya.', 'Tap near the fish to shift their flow.'),
  mapNodes: words('Sorot titik bercahaya untuk membaca topiknya.', 'Hover over a glowing point to read its topic.'),
  mapNodesTouch: words('Ketuk titik bercahaya untuk membaca topiknya.', 'Tap a glowing point to read its topic.'),
  mapNodesKeyboard: words('Tab ke titik peta. Tombol panah berpindah titik; Esc menutup penjelasan.', 'Tab to a map point. Arrow keys move between points; Esc closes the note.'),
  mapRoute: words('Klik jalur untuk mengarahkan ikan penunjuk.', 'Click the route to guide the little fish.'),
  mapRouteTouch: words('Ketuk jalur untuk mengarahkan ikan penunjuk.', 'Tap the route to guide the little fish.'),
  mapRouteKeyboard: words('Gunakan “Arahkan ikan” untuk menuju titik berikutnya.', 'Use “Guide the fish” to visit the next point.'),
  mapGuide: words('Arahkan ikan', 'Guide the fish'),
  mapTopics: words('Sorot topik', 'Highlight topics'),
  projectPreview: words('Buka “Lihat isi” untuk mengintip proyek tanpa pindah halaman.', 'Open “Peek inside” to preview a project without leaving this page.'),
  projectScroll: words('Scroll di dalam koleksi untuk melihat proyek berikutnya.', 'Scroll inside the collection to see the next project.'),
  peek: words('Lihat isi', 'Peek inside'),
  detail: words('Buka detail', 'Open details'),
  explore: 'Explore the ocean',
  exploreDescription: words('Jelajahi lautnya. Posisi bacaanmu tetap tersimpan.', 'Explore the water. Your place in the portfolio is kept.'),
  explorePointer: words('Geser untuk melihat sekitar. Klik laut untuk membuat gelombang.', 'Drag to look around. Click the water to send a ripple.'),
  exploreTouch: words('Geser untuk melihat sekitar. Ketuk untuk membuat gelombang.', 'Drag to look around. Tap to send a ripple.'),
  exploreKeyboard: words('Gunakan tombol panah untuk melihat sekitar, Spasi untuk gelombang, dan Esc untuk kembali.', 'Use arrow keys to look around, Space for a ripple, and Esc to return.'),
  exploreStill: words('Geser untuk melihat sekitar. Animasi sedang dijeda.', 'Drag to look around. Animation is paused.'),
  exploreStillKeyboard: words('Gunakan tombol panah untuk melihat sekitar dan Esc untuk kembali. Animasi sedang dijeda.', 'Use arrow keys to look around and Esc to return. Animation is paused.'),
  back: words('Kembali ke portofolio', 'Back to portfolio'),
  reset: words('Atur ulang pandangan', 'Reset view'),
  viewLabel: words('Laut interaktif', 'Interactive ocean'),
};

export type DiscoveryId = 'ocean' | 'tornado' | 'vortex' | 'corridor' | 'map-nodes' | 'map-route' | 'project-preview' | 'project-scroll';

export function discoverFeature(id: DiscoveryId) {
  document.dispatchEvent(new CustomEvent('feature-discovered', { detail: id }));
}
