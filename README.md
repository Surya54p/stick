# stick (Simpel Ticketing)

**stick** adalah platform *Simple Ticketing* berbasis **SaaS (Software as a Service)** yang dirancang untuk mempermudah pengelolaan tiket pengaduan dan permintaan dalam sebuah organisasi.

## Apa itu stick?

stick memungkinkan tim atau organisasi membuat **workspace** ticketing mereka sendiri — terisolasi dan mandiri. Setiap workspace memiliki daftar tiket, anggota, dan pengaturan masing-masing, sehingga cocok untuk berbagai tim seperti *IT Support*, *Operations*, atau *Customer Service*.

### Konsep Utama

- **Multi-Tenancy (Workspace)** — Setiap tim dapat memiliki workspace terpisah dengan data yang terisolasi satu sama lain.
- **Sistem Role** — Tiga peran utama mengatur alur kerja:
  - **Admin** — Pemilik workspace, mengelola anggota dan pengaturan.
  - **Agent** — Menangani tiket, memperbarui status, dan berinteraksi dengan pembuat tiket.
  - **Customer** — Membuat tiket pengaduan/permintaan dan memantau statusnya.

### Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | Next.js (React, TypeScript) |
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **Migrasi DB** | Alembic |