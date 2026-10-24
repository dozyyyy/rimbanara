# RIMBANARA — Web Admin

Panel admin untuk mengelola konten aplikasi mobile RIMBANARA (hutan, satwa,
artikel, dan soal kuis). Dibangun dengan Vite + React + TypeScript + Tailwind
CSS, memakai Firebase Auth (Email/Password) dan Cloud Firestore.

Spesifikasi lengkap ada di `../PRD.md` (read-only). Catatan keputusan teknis ada
di [DECISIONS.md](DECISIONS.md).

## Prasyarat

- Node.js 20 atau lebih baru (dikembangkan dengan Node 24) dan npm.
- Proyek Firebase `rimbanara` yang sudah aktif.
- Akun admin: **dokumen `admins/{uid}`** di Firestore (dibuat manual, lihat
  bagian Prasyarat manual).

## Menjalankan

```bash
npm install
cp .env.example .env   # lalu isi nilainya
npm run dev            # http://localhost:5173
```

Perintah lain:

```bash
npm run lint    # ESLint
npm run build   # tsc -b && vite build
npm test        # unit test konversi link Google Drive (node:test)
```

## Variabel environment

`.env` tidak boleh di-commit (sudah ada di `.gitignore`). Isi dari Firebase
Console → Project settings → General → Your apps → Web app.

| Variabel | Keterangan |
|---|---|
| `VITE_FIREBASE_API_KEY` | API key web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | mis. `rimbanara.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `rimbanara` |
| `VITE_FIREBASE_STORAGE_BUCKET` | mis. `rimbanara.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `268733644722` |
| `VITE_FIREBASE_APP_ID` | App ID web |
| `VITE_FIREBASE_MEASUREMENT_ID` | Tidak dipakai aplikasi (Analytics di luar ruang lingkup) |

`.env.example` memuat semua nama variabel tanpa nilai.

## Prasyarat manual (sekali saja)

1. **Aktifkan Firebase Auth → Sign-in method → Email/Password.** Google
   sign-in hanya dipakai aplikasi mobile, bukan web admin.
2. **Buat akun admin** di Firebase Console → Authentication → Users (Add user),
   lalu salin UID-nya.
3. **Buat dokumen `admins/{uid}`** dengan field `email` (string) dan `role`
   (`"admin"`). Tanpa dokumen ini, login akan ditolak dengan pesan "Akun ini
   tidak memiliki akses admin" — termasuk untuk akun pengguna mobile biasa.
4. **Publish `firestore.rules`** di Firebase Console → Firestore Database →
   Rules. Isi file ini identik dengan PRD §6; jangan diubah tanpa persetujuan.
5. Pastikan foto memakai tautan yang dapat diakses publik. Untuk Google Drive,
   set file ke *Anyone with the link*; tombol "Konversi link Drive" mengubah
   `…/file/d/<ID>/view…` menjadi `…/uc?export=view&id=<ID>`.

## Prasyarat lintas workspace (Google Sign-In & SHA-1)

Web admin **tidak** memakai Google Sign-In dan tidak punya halaman registrasi.
Namun web admin dan aplikasi mobile berbagi satu proyek Firebase, jadi akun
Google dan sidik jari Android tetap harus didaftarkan agar mobile bisa masuk.
Langkah lengkapnya ada di
[README mobile § Google Sign-In dan sidik jari SHA-1](../rimbanara/README.md#google-sign-in-dan-sidik-jari-sha-1).
Ringkasnya:

1. Aktifkan provider **Google** di Firebase Authentication (web admin tetap
   hanya Email/Password).
2. Ambil SHA-1 dan SHA-256 keystore debug/release, misalnya:

   ```bash
   keytool -list -v \
     -keystore ~/.android/debug.keystore \
     -alias androiddebugkey -storepass android -keypass android
   ```

   atau `cd rimbanara/android && ./gradlew signingReport`.
3. Daftarkan kedua fingerprint pada aplikasi Android `com.rimbanara.app` di
   Firebase Console → Project settings → Your apps, lalu unduh ulang
   `google-services.json` untuk workspace mobile. Jangan mengedit file itu.
4. Pastikan `oauth_client` berisi `client_type: 1` (Android) dan `client_type: 3`
   (web). Web client ID pada `client_type: 3` dipakai mobile sebagai
   `serverClientId`.

## Halaman

| Rute | Fungsi |
|---|---|
| `/login` | Login admin Email/Password |
| `/` | Dashboard: jumlah dokumen per koleksi + jumlah draft (tanpa data pengguna) |
| `/hutan`, `/hutan/baru`, `/hutan/:id` | Daftar & form hutan |
| `/satwa`, `/satwa/baru`, `/satwa/:id` | Daftar & form satwa |
| `/artikel`, `/artikel/baru`, `/artikel/:id` | Daftar & form artikel |
| `/kuis`, `/kuis/baru`, `/kuis/:id` | Daftar & form soal kuis |
| `/impor` | Impor data contoh dari `seed/seed-data.json` |

Semua rute selain `/login` dilindungi dan hanya dapat dibuka oleh akun dengan
dokumen `admins/{uid}`.

## Impor data contoh

Menu **Impor Data** menulis isi [seed/seed-data.json](seed/seed-data.json) ke
Firestore: 9 satwa, 4 hutan, 3 artikel, dan 12 soal kuis (semua `isPublished:
true`, `imageUrl`/`coverImageUrl` kosong, `createdAt`/`updatedAt` diisi
`serverTimestamp()`). Jalankan **sekali saja** — halaman ini memperingatkan bila
koleksi sudah berisi data karena impor ulang akan membuat duplikasi.

Klaim faktual yang perlu diverifikasi pemilik proyek tercatat di
[seed/NEEDS_REVIEW.md](seed/NEEDS_REVIEW.md). Setelah impor, hubungkan relasi
`relatedForestIds`/`relatedWildlifeIds` lewat form admin karena ID dokumen
dibuat otomatis.

## Struktur folder

```
src/
  components/   Layout, Table, FormField, ImageUrlInput, LocationsEditor,
                ConfirmDialog, Toast, guard & provider auth
  lib/          firebase.ts (init dari env), driveUrl.ts (konversi link Drive)
  pages/        Login, Dashboard, Forests/, Wildlife/, Articles/, Quiz/,
                SeedImport
  services/     auth, firestore helper, CRUD per koleksi, dashboard, seed
  types/        enums, models (cermin PRD §5), schemas (zod)
seed/           seed-data.json, NEEDS_REVIEW.md
```

## Catatan

- Foto selalu berupa URL; **tidak ada upload file** dan Firebase Storage tidak
  dipakai.
- Tidak ada registrasi, Google sign-in, pengelolaan pengguna, maupun dark mode.
- Daftar memuat satu koleksi per kunjungan lalu melakukan pencarian, filter, dan
  paginasi di sisi klien (tanpa composite index).
- Dashboard memakai `getCountFromServer` sehingga tidak membaca seluruh dokumen
  dan tidak pernah menampilkan data pengguna.
- `npm run build` memberi peringatan ukuran chunk >500 kB (Firebase + Leaflet).
  Ini informasi, bukan error.
# rimbanara
