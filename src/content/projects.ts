import type { Localized } from './index';

export interface Project {
  slug: string;
  title: string;
  description: Localized;
  category: string;
  repository: string;
  stack: string[];
  sections: { title: string; description: Localized }[];
}

// Summaries are grounded in the source revisions recorded in docs/PROJECT_SOURCES.md.
export const projects: Project[] = [
  {
    "slug": "studyos",
    "title": "StudyOS",
    "category": "AI & Learning",
    "description": {
      "id": "Workspace belajar berbasis AI yang menyatukan materi, percakapan bersitasi, catatan, kuis, dan pencatatan waktu belajar.",
      "en": "An AI study workspace bringing source materials, cited conversations, notes, quizzes, and study timers together."
    },
    "repository": "https://github.com/nomatterwhathappns/StudyOs",
    "stack": [
      "TypeScript",
      "React",
      "Express",
      "tRPC",
      "IndexedDB"
    ],
    "sections": [
      {
        "title": "From sources to understanding",
        "description": {
          "id": "Materi dari URL, PDF, DOCX, TXT, Markdown, dan CSV dikumpulkan dalam sesi belajar. Panel Source dan Chat menghubungkan bacaan dengan percakapan AI, penjelasan teks terpilih, serta terjemahan Inggris–Indonesia. Jawaban dapat menampilkan sitasi ke potongan materi yang digunakan.",
          "en": "URLs, PDFs, DOCX, TXT, Markdown, and CSV files become materials inside a study session. Source and Chat connect reading with AI conversations, selected-text explanations, and English–Indonesian translation. Responses can link citations back to the material chunks they use."
        }
      },
      {
        "title": "Practice beyond the conversation",
        "description": {
          "id": "Kuis pilihan ganda, penyimpanan istilah dan vocabulary, serta jadwal review membantu melanjutkan proses belajar setelah membaca. Catatan rich text memakai Tiptap; stopwatch dan countdown mencatat waktu belajar yang dapat disimpan ke riwayat sesi dan dilihat di dashboard.",
          "en": "Multiple-choice quizzes, saved key terms and vocabulary, and review scheduling carry learning beyond reading. Tiptap powers rich-text notes; stopwatch and countdown timers record study time that can be saved to session history and viewed on the dashboard."
        }
      },
      {
        "title": "Choose the AI connection",
        "description": {
          "id": "Koneksi AI dikelola melalui Profile: endpoint, model, autentikasi, dan pengaturan streaming dipilih secara eksplisit. Backend Express dan tRPC mendukung format OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, dan Google Generative Language, lalu memakai satu koneksi aktif untuk tugas belajar.",
          "en": "AI connections are managed in Profile, with explicit choices for endpoint, model, authentication, and streaming. The Express and tRPC backend supports OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, and Google Generative Language formats, using one active connection for study tasks."
        }
      },
      {
        "title": "Two stores, different responsibilities",
        "description": {
          "id": "Sesi, materi, chat, catatan, kuis, dan riwayat disimpan di IndexedDB browser melalui Dexie. Konfigurasi koneksi AI disimpan terpisah dan terenkripsi pada server. Data belajar belum tersinkron antarperangkat, dan penyimpanan koneksi membutuhkan disk server yang persisten.",
          "en": "Dexie stores sessions, materials, chat, notes, quizzes, and history in the browser’s IndexedDB. AI connection settings live separately in an encrypted server store. Study data is not yet synchronized between devices, and connection storage needs persistent server disk."
        }
      }
    ]
  },
  {
    "slug": "ci-cd-pipeline-security-auditor",
    "title": "CI/CD Pipeline Security Auditor",
    "category": "DevSecOps",
    "description": {
      "id": "Auditor statis untuk menemukan konfigurasi GitHub Actions yang perlu ditinjau, dari izin token dan penanganan secret hingga alur data tak tepercaya.",
      "en": "A static auditor for GitHub Actions configurations that need review, from token permissions and secret handling to untrusted data flow."
    },
    "repository": "https://github.com/nomatterwhathappns/CI-CD-Pipeline-Security-Auditor",
    "stack": [
      "Python",
      "PyYAML",
      "GitHub Actions",
      "SARIF"
    ],
    "sections": [
      {
        "title": "Reviewing the pipeline",
        "description": {
          "id": "Workflow CI/CD menghubungkan kode, kredensial, runner, dan artifact. Proyek ini membaca file YAML sebagai data dan menerapkan 23 aturan untuk menandai pola berisiko, seperti action yang belum dipatok ke SHA, izin write-all, penyisipan data ke script, serta perpindahan artifact atau cache antar batas kepercayaan. Workflow dan script yang diperiksa tidak dijalankan.",
          "en": "CI/CD workflows connect code, credentials, runners and artifacts. This project reads YAML as data and applies 23 rules to flag risky patterns, including unpinned actions, write-all permissions, data interpolated into scripts, and artifacts or caches crossing trust boundaries. The inspected workflows and scripts are never executed."
        }
      },
      {
        "title": "Following the data",
        "description": {
          "id": "Analisis alur data menelusuri sumber tak tepercaya melalui environment, output langkah atau job, dan input yang dikenali sebelum nilainya kembali menjadi bagian kode script. Mode deep mengikuti composite action dan reusable workflow lokal di dalam akar repo yang ditentukan. Jejak temuan menyimpan identitas lokasi, sementara referensi yang belum dapat dianalisis tetap dicatat secara eksplisit.",
          "en": "Data-flow analysis follows untrusted sources through recognized environment variables, step or job outputs, and inputs before they become script source again. Deep mode follows local composite actions and reusable workflows within an explicit repository root. Finding traces preserve location identifiers, while references outside the supported analysis remain explicitly unresolved."
        }
      },
      {
        "title": "Findings that fit CI",
        "description": {
          "id": "Hasil tersedia sebagai teks, JSON, dan SARIF, dilengkapi severity, confidence, lokasi sumber, serta saran perbaikan. Ambang severity dapat menentukan kegagalan CI. Baseline membedakan temuan lama dan baru; pengecualian terbatas menurut file, job, atau langkah menyertakan alasan dan tanggal kedaluwarsa agar keputusan peninjauan tetap dapat ditelusuri.",
          "en": "Results are available as text, JSON and SARIF, with severity, confidence, source locations and remediation guidance. Severity thresholds can gate CI. Baselines distinguish existing findings from new ones; exceptions scoped to a file, job or step carry a reason and expiry date so review decisions remain traceable."
        }
      },
      {
        "title": "Making the boundaries visible",
        "description": {
          "id": "Repo menyediakan pasangan contoh baik dan buruk untuk setiap aturan, pengujian parser, alur data, kebijakan, dan format laporan. Pemeriksaan ini merupakan lapisan tambahan untuk review: model statisnya terbatas, dependensi remote tidak diunduh, dan snapshot advisory offline perlu diperbarui. Tidak adanya temuan bukan jaminan bahwa sebuah pipeline aman.",
          "en": "The repository includes good and bad examples for every rule, plus parser, data-flow, policy and report-format tests. The auditor is an additional review layer: its static model is bounded, remote dependencies are not downloaded, and its offline advisory snapshot needs maintenance. A clean report does not establish that a pipeline is secure."
        }
      }
    ]
  },
  {
    "slug": "recycle-bin-forensics",
    "title": "Recycle Bin Forensics",
    "category": "Digital Forensics",
    "description": {
      "id": "Aplikasi desktop dan CLI untuk membaca artefak Recycle Bin Windows, menyusun linimasa penghapusan, dan mengekspor temuan forensik secara offline.",
      "en": "An offline desktop and CLI toolkit for examining Windows Recycle Bin artifacts, building deletion timelines, and exporting forensic findings."
    },
    "repository": "https://github.com/nomatterwhathappns/Recycle-Bin-Forensics",
    "stack": [
      "Python",
      "Tkinter",
      "Binary parsing",
      "SHA-256"
    ],
    "sections": [
      {
        "title": "Reading what deletion leaves behind",
        "description": {
          "id": "Recycle Bin menyimpan metadata yang bisa menjelaskan nama dan lokasi asli file, ukuran yang tercatat, serta waktu penghapusan. Proyek ini membaca format $I versi 1 dan 2, mendekode path UTF-16LE, dan mempertahankan FILETIME mentah hingga presisi 100 nanodetik. Struktur yang rusak dan nilai yang mencurigakan dicatat sebagai temuan, bukan disembunyikan.",
          "en": "Recycle Bin metadata can preserve a file’s original name and location, recorded size, and deletion time. This project reads $I formats 1 and 2, decodes UTF-16LE paths, and preserves raw FILETIME at 100-nanosecond precision. Malformed structures and unusual values remain visible as findings rather than being silently discarded."
        }
      },
      {
        "title": "From artifacts to an investigation view",
        "description": {
          "id": "Scanner menghubungkan metadata dengan payload $R di folder yang sama dan mencatat payload tanpa pasangan metadata. Pencarian, filter ekstensi, SID, ukuran, dan rentang waktu membantu mempersempit tinjauan. Linimasa diurutkan dari waktu yang tersimpan dalam artefak, sementara inventaris lengkap tetap tersedia dalam JSON.",
          "en": "The scanner correlates metadata with sibling $R payloads and records payloads without matching metadata. Search, extension, SID, size, and time filters help focus a review. Timelines use the deletion times encoded in the artifacts, while the complete inventory remains available in JSON."
        }
      },
      {
        "title": "One engine, desktop and command line",
        "description": {
          "id": "Antarmuka Tkinter dan CLI memakai mesin analisis yang sama. Aplikasi desktop menyediakan tabel, detail, pengurutan, progres, dan pembatalan pekerjaan. Temuan dapat diekspor sebagai JSON, CSV, tampilan terminal, atau laporan HTML mandiri yang bisa dicari dan diurutkan tanpa koneksi internet. Ekspor disertai manifest SHA-256 dan perintah verifikasi.",
          "en": "The Tkinter desktop and CLI share one analysis engine. The desktop offers a results table, details, sorting, progress, and cancellation. Findings can be exported as JSON, CSV, terminal output, or a self-contained HTML report with offline search and sorting. File exports include SHA-256 manifests and a verification command."
        }
      },
      {
        "title": "Keeping the evidence and its limits clear",
        "description": {
          "id": "Kode memisahkan pembacaan bukti, analisis, dan penulisan laporan; menolak symlink serta penimpaan ekspor; dan menyediakan turunan laporan yang disamarkan untuk dibagikan. Repo juga memuat korpus sintetis, pengujian parser, dan alat pembanding independen. Fokusnya adalah triase artefak: alat ini tidak memulihkan file terhapus atau membuktikan siapa yang menghapusnya.",
          "en": "The implementation separates evidence reading, analysis, and report writing; rejects symlinks and overwritten exports; and supports explicitly redacted sharing copies. The repository also includes a synthetic corpus, parser tests, and independent comparison tooling. Its focus is artifact triage: it does not recover deleted files or establish who deleted them."
        }
      }
    ]
  },
  {
    "slug": "linscope",
    "title": "LinScope",
    "category": "Infrastructure Security",
    "description": {
      "id": "Pemeriksa konfigurasi keamanan Linux yang mengubah bukti lokal menjadi temuan, rekomendasi, dan laporan yang bisa ditinjau.",
      "en": "A Linux security configuration checker that turns local evidence into findings, recommendations and reviewable reports."
    },
    "repository": "https://github.com/nomatterwhathappns/LinScope",
    "stack": [
      "Python",
      "Linux",
      "CLI"
    ],
    "sections": [
      {
        "title": "Start with the evidence.",
        "description": {
          "id": "LinScope membaca konfigurasi dan metadata host Linux tanpa mengubah pengaturan keamanannya. Setiap temuan menyertakan ID tetap, status, tingkat keparahan, bukti, dan rekomendasi. Bukti yang tidak bisa dikumpulkan tetap ditandai UNKNOWN agar keterbatasan pemeriksaan terlihat.",
          "en": "LinScope reads Linux host configuration and metadata without changing security settings. Each finding carries a stable ID, status, severity, evidence and a recommendation. Evidence that cannot be collected stays UNKNOWN so gaps remain visible."
        }
      },
      {
        "title": "A closer look at the host.",
        "description": {
          "id": "Pemeriksaan mencakup SSH, akun, izin file, autentikasi, jaringan, layanan, kernel, dan logging, termasuk ACL, kebijakan sudo, hardening systemd, serta metadata Docker. Profil server, desktop, router, atau container membantu menyatakan konteks host; kolektor memakai batas waktu dan ukuran keluaran.",
          "en": "Checks cover SSH, accounts, file permissions, authentication, networking, services, kernel settings and logging, including ACLs, sudo policy, systemd hardening and Docker metadata. Server, desktop, router or container profiles state the host context; collectors use time and output limits."
        }
      },
      {
        "title": "Reports with a history.",
        "description": {
          "id": "Hasil tersedia sebagai teks, JSON, dan HTML mandiri. Kebijakan JSON dapat menambahkan pengecualian risiko dengan alasan dan tanggal kedaluwarsa tanpa menyembunyikan temuan asli. Riwayat lokal dan perbandingan offline membandingkan snapshot dengan cakupan serta aturan yang kompatibel, sehingga perubahan aturan tidak keliru dianggap sebagai perbaikan host.",
          "en": "Results are available as text, JSON and standalone HTML. JSON policies can attach accepted-risk exceptions with a reason and expiry without hiding original findings. Local history and offline comparisons match compatible scopes and assessment rules, so a rule change is not mistaken for a host fix."
        }
      },
      {
        "title": "Built for review.",
        "description": {
          "id": "Proyek ini memakai Python 3.10+ tanpa dependensi Python tambahan saat dijalankan, dengan pengujian sintetis untuk kolektor, laporan, kebijakan, dan perbandingan. Fokus utamanya Ubuntu/Debian. Hasilnya membantu peninjauan konfigurasi, bukan sertifikasi kepatuhan, pemindai CVE, atau jaminan bahwa host aman.",
          "en": "The project uses Python 3.10+ without third-party Python runtime dependencies, with synthetic tests for collectors, reporting, policies and comparisons. Its main target is Ubuntu/Debian. Results support configuration review rather than compliance certification, CVE scanning or a guarantee that a host is secure."
        }
      }
    ]
  }
];
