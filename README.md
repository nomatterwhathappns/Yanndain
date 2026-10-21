# Yanndain

Portfolio bilingual dengan laut 3D interaktif menggunakan TypeScript, Three.js, dan Vite. Judul tetap berbahasa Inggris; deskripsi dan navigasi tersedia dalam bahasa Indonesia dan Inggris.

## Download dan jalankan

Download melalui **Code → Download ZIP** di GitHub, lalu ekstrak. Pasang Node.js **22.12 atau lebih baru**, kemudian buka terminal di folder hasil ekstrak:

```sh
npm ci
npm run dev
```

Buka alamat yang dicetak terminal di browser komputer yang sama.

## Struktur proyek

```text
src/
├── main.ts                 # Entry point
├── app/
│   └── bootstrap.ts        # Halaman, routing, menu, bahasa, integrasi scene
├── content/
│   └── index.ts            # Profil, terjemahan, data proyek dan jurnal
├── ocean/
│   ├── scene.ts            # Scene, kamera, cahaya, schooling dan formasi
│   ├── fish-models.ts      # Geometri ikan, manta dan hiu
│   ├── tornado.ts          # Jalur spiral vertikal untuk section About
│   └── swimming.ts         # Jalur berenang dan distribusi ikan
├── styles/
│   └── main.css            # Layout, komponen dan responsivitas
└── vite-env.d.ts
public/                     # Aset statis
tests/                      # Pengujian browser
docs/                       # Keputusan desain
index.html                  # Dokumen dasar Vite
vite.preview.config.ts      # Ekspor HTML lengkap
```

Edit profil dan isi website di `src/content/index.ts`. Data proyek dan jurnal yang belum nyata ditandai sebagai preview. CV dan kontak hanya muncul setelah URL atau data asli diisi.

## Build

```sh
npm run build
npm run preview
```

Hasil produksi berada di `dist/`. Hosting produksi perlu mengarahkan route seperti `/id/about` ke `index.html`.

## HTML lengkap untuk preview

HTML lengkap dibagikan terpisah lewat chat. File hasil ekspor tidak disimpan di branch GitHub agar repository berisi source yang dapat diedit tanpa salinan bundle besar.

Untuk membuat HTML lengkap sendiri:

```sh
npm run build:preview
```

Buka `yanndain-preview.html` atau `yanndain-ocean-v4.html` yang dihasilkan di root proyek dengan browser. File tersebut sudah menyertakan CSS, JavaScript, font, dan model 3D; tidak memerlukan server. Route menggunakan hash agar navigasi berfungsi saat membuka file lokal. Source `index.html` memerlukan server Vite.

## Pengujian

```sh
npm run build:preview
npm run test:e2e
```

Suite menggunakan Chromium di `/usr/bin/chromium`, atau lokasi executable dari variabel `CHROMIUM_PATH`. Pengujian mencakup navigasi, bahasa, mobile, formasi, gerakan ikan tanpa scroll, WebGL fallback, dan HTML portable. Software rendering bukan ukuran performa GPU pengguna.

Scene berisi 900 ikan: 700 sardine, 120 jack, 50 reef, 24 lanternfish, 2 manta dan 4 hiu. Reduced motion menghentikan animasi berkelanjutan; pengguna dapat mengaktifkannya melalui menu.
