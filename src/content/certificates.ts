import type { Localized } from './index';

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  dateLabel: Localized;
  kind: Localized;
  description: Localized;
  url: string;
  verificationUrl?: string;
  validUntil?: string;
  featured: boolean;
}

// Printed dates and certificate types are documented in docs/CERTIFICATE_SOURCES.md.
export const certificates: Certificate[] = [
  {
    "id": "coding-studio-cyber-security-beginner",
    "title": "Regular Online – Cyber Security Beginner",
    "issuer": "Coding Studio",
    "date": "2025-09-17",
    "dateLabel": {
      "id": "Diterbitkan",
      "en": "Issued"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Kelas dasar cybersecurity yang menjadi titik awal latihan terarah melalui OWASP Juice Shop dan presentasi temuan XSS.",
      "en": "An introductory cybersecurity course that led into structured OWASP Juice Shop practice and an XSS findings presentation."
    },
    "url": "https://drive.google.com/file/d/1XltS5kQtqmtTaRW2OPpSxb1g7pUuDbDw/view",
    "featured": true
  },
  {
    "id": "dicoding-web-fundamentals",
    "title": "Belajar Dasar Pemrograman Web",
    "issuer": "Dicoding",
    "date": "2024-11-15",
    "dateLabel": {
      "id": "Diterbitkan",
      "en": "Issued"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Dasar HTML, CSS, layout responsif dengan Flexbox, serta tugas akhir halaman web.",
      "en": "HTML and CSS fundamentals, responsive Flexbox layouts and a final web-page submission."
    },
    "url": "https://drive.google.com/file/d/1odtCLZgeoloYPMJMT34x7lUugfbynegf/view",
    "verificationUrl": "https://dicoding.com/certificates/0LZ0Y28JNX65",
    "validUntil": "2027-11-15",
    "featured": true
  },
  {
    "id": "aws-cloud-computing-essentials",
    "title": "AWS SimuLearn: Cloud Computing Essentials",
    "issuer": "AWS Training & Certification",
    "date": "2026-08-15",
    "dateLabel": {
      "id": "Diselesaikan",
      "en": "Completed"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Fondasi cloud melalui pembelajaran berbasis simulasi AWS SimuLearn.",
      "en": "Cloud foundations through AWS SimuLearn simulation-based learning."
    },
    "url": "https://drive.google.com/file/d/1vhHwCVSNCLWrmClz_N7zgPVtW7Dx76pe/view",
    "featured": true
  },
  {
    "id": "hackerrank-java-basic",
    "title": "Java (Basic)",
    "issuer": "HackerRank",
    "date": "2026-04-05",
    "dateLabel": {
      "id": "Diperoleh",
      "en": "Earned"
    },
    "kind": {
      "id": "Tes keterampilan",
      "en": "Skills test"
    },
    "description": {
      "id": "Sertifikat kelulusan tes keterampilan Java tingkat dasar dari HackerRank.",
      "en": "A certificate for passing HackerRank’s Java basic skills test."
    },
    "url": "https://drive.google.com/file/d/1_H90_Eb9rd8S7FK6vdjUe0gB_tqlAeX1/view",
    "featured": true
  },
  {
    "id": "aws-cloud-public-sector-regulations",
    "title": "Regulasi & Best Practice Penggunaan Cloud di Sektor Publik (Bahasa Indonesia)",
    "issuer": "AWS Training & Certification",
    "date": "2026-07-20",
    "dateLabel": {
      "id": "Diselesaikan",
      "en": "Completed"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Pembelajaran regulasi dan praktik penggunaan cloud untuk sektor publik.",
      "en": "Learning about cloud regulations and usage best practices for the public sector."
    },
    "url": "https://drive.google.com/file/d/1WRSXxYxqx-KlIZvVecCrE3knC2mJpVAc/view",
    "featured": false
  },
  {
    "id": "aws-dynamodb-service-primer",
    "title": "Amazon DynamoDB Service Primer (Bahasa Indonesia)",
    "issuer": "AWS Training & Certification",
    "date": "2026-08-04",
    "dateLabel": {
      "id": "Diselesaikan",
      "en": "Completed"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Pengenalan layanan basis data Amazon DynamoDB.",
      "en": "An introduction to the Amazon DynamoDB database service."
    },
    "url": "https://drive.google.com/file/d/1hABBcGOuCGrTfLfySjEgPRK7tP4XM_pc/view",
    "featured": false
  },
  {
    "id": "aws-job-roles-in-the-cloud",
    "title": "Job Roles in the Cloud (Bahasa Indonesia)",
    "issuer": "AWS Training & Certification",
    "date": "2026-06-27",
    "dateLabel": {
      "id": "Diselesaikan",
      "en": "Completed"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Pengenalan peran pekerjaan dalam lingkungan cloud.",
      "en": "An introduction to job roles in cloud environments."
    },
    "url": "https://drive.google.com/file/d/1HByAjpVL-J2pDswKzsl4GNaeOy8zSWoS/view",
    "featured": false
  },
  {
    "id": "aws-microcredential-preview-experience",
    "title": "Microcredential Preview Experience",
    "issuer": "AWS Training & Certification",
    "date": "2026-08-15",
    "dateLabel": {
      "id": "Diselesaikan",
      "en": "Completed"
    },
    "kind": {
      "id": "Penyelesaian kelas",
      "en": "Course completion"
    },
    "description": {
      "id": "Penyelesaian pengalaman pengenalan microcredential AWS.",
      "en": "Completion of AWS’s introductory microcredential preview experience."
    },
    "url": "https://drive.google.com/file/d/1FKeXp0qTLIG-fQIUQDyze7B3BefLzDDV/view",
    "featured": false
  }
];
