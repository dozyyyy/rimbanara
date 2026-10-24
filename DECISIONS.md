# DECISIONS — RIMBANARA (web admin)

Catatan interpretasi dan keputusan teknis. Semua merujuk ke `../PRD.md`.

## Fase yang dikerjakan

**Fase 1 web admin**: fondasi workspace (Vite + React + TS + Tailwind), tipe data
semua koleksi, `lib/firebase.ts`, `lib/driveUrl.ts` + test, `.env.example`,
`firestore.rules`, dan dokumen ini.

**Fase 2 web admin**: login admin (A1) + guard `admins/{uid}`, Layout,
komponen bersama (Table, FormField, ImageUrlInput, LocationsEditor,
ConfirmDialog, Toast), dan CRUD Hutan (A3) serta Satwa (A4) dengan validasi
zod.

**Fase 3 web admin**: Dashboard (A2), CRUD Artikel (A5), CRUD Soal Kuis (A6),
Impor Data Contoh (A7) dengan `seed/seed-data.json`, serta README workspace.

## 1. Tailwind v4 dan `@tailwindcss/vite`

PRD §4 mencantumkan `tailwindcss`; Tailwind versi 4 membutuhkan paket
pendamping resmi `@tailwindcss/vite` (plugin Vite) atau `@tailwindcss/postcss`.
Saya memilih `@tailwindcss/vite` karena paling sedikit konfigurasi, dan sudah
mendapat persetujuan pemilik proyek untuk memasang Tailwind pada fase ini.
Versi terpasang: `tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3 (keduanya
devDependency). Tidak ada paket UI tambahan.

## 2. Lokasi tipe dan bentuknya

- `src/types/enums.ts` — nilai enum PRD §5.2 sebagai `as const` + union type
  (bukan `enum` TypeScript, karena `erasableSyntaxOnly` aktif di template Vite).
  Nilai string tidak diterjemahkan; UI memakai nilai yang sama.
- `src/types/models.ts` — `Wildlife`, `Forest`, `Article`, `QuizQuestion`,
  `AppUser`, `BestScores`, `QuizHistoryEntry`, `Admin`, `GeoLocation`,
  `WithId<T>`, `FavoriteKey`, `CONTENT_COLLECTIONS`.
- `createdAt`/`updatedAt` bertipe `Timestamp` (baca). Saat menulis, formulir
  akan memakai `serverTimestamp()` (fase CRUD).
- `QuizHistoryTopic` (`Semua` | `Hutan` | `Satwa`) dipisah dari `QuizTopic`
  (`Hutan` | `Satwa` | `Umum`) karena keduanya memang berbeda di PRD §5.3.
- Field opsional ditandai `?` (`localName`, `funFact`, `areaHa`, `imageUrl`
  kuis, `photoUrl`) agar dokumen lama tanpa field tersebut tetap valid.

## 3. `lib/firebase.ts`

Konfigurasi hanya dari `import.meta.env.VITE_FIREBASE_*` (PRD §4). Nilai yang
hilang menghasilkan error jelas saat startup, bukan `undefined` yang menjalar.
`initializeApp` dijaga `getApps()` agar HMR tidak membuat app ganda. Analytics
tidak diinisialisasi (di luar ruang lingkup, §3.3), sehingga
`VITE_FIREBASE_MEASUREMENT_ID` hanya didokumentasikan di `.env.example` dan tidak
dibaca kode.

## 4. `firestore.rules`

Diletakkan di `rimbanara-web/firestore.rules`, isinya **salinan persis** blok
PRD §6 (termasuk aturan `users` dan `users/{uid}/quizHistory`), diverifikasi
dengan `diff` terhadap blok PRD: identik byte-for-byte, 51 baris. Rules yang sama
juga ada di `rimbanara/firestore.rules`. Pemilik proyek mem-publish manual lewat
Firebase Console; agent tidak mengubah isinya.

## 5. Test konversi link Drive tanpa dependency baru

Allowlist PRD §4 tidak memuat test runner. Node 24 menjalankan TypeScript
langsung (type stripping), jadi test memakai `node:test` + `node:assert/strict`
pada `src/lib/driveUrl.test.ts`, dijalankan dengan `npm test`. Konsekuensinya
`tsconfig.app.json` menambahkan `"node"` ke `types` agar `node:test` punya tipe;
tidak ada efek pada bundel karena file test tidak diimpor aplikasi.

## 6. Cakupan `convertDriveUrl`

PRD §5.4 hanya menyebut pola `https://drive.google.com/file/d/<ID>/view...`.
Helper menangani pola itu (termasuk `edit`/`preview` dan query string), lalu
mengembalikan input apa adanya untuk URL lain (termasuk link `uc?export=view`
yang sudah benar, `lh3.googleusercontent.com`, dan string kosong). Pola
`drive.google.com/open?id=...` tidak dikonversi karena tidak disebut PRD; bisa
ditambah bila pemilik proyek memintanya.

## 7. Struktur folder

Sesuai PRD §8.1, kerangka direktori `src/lib`, `src/types`, `src/services`,
`src/components`, dan `src/pages` sudah dibuat. `lib/` dan `types/` sudah berisi
file nyata; tiga direktori lainnya masih kosong dan akan diisi pada fase
berikutnya (routing, login, dashboard, CRUD).

## 8. Template Vite yang dihapus

`src/App.css`, `src/assets/` (logo React/Vite, hero), dan `public/icons.svg`
dihapus karena hanya milik halaman demo. `public/favicon.svg` dipertahankan
(dirujuk `index.html`). `index.html` memakai `lang="id"` dan judul
"RIMBANARA · Admin Konten".

## 9. Belum dikerjakan (fase berikutnya)

Dashboard (A2), CRUD Artikel (A5) dan Kuis (A6), impor seed (A7), serta
pembaruan README workspace.

---

# Fase 2 — A1, A3, A4, §5.4

## 10. Dependency yang ditambahkan

Dari allowlist PRD §4: `react-router-dom` 7.18.4, `react-hook-form` 7.90.0,
`zod` 4.6.7, `@hookform/resolvers` 5.9.2, `leaflet` 1.9.4, `react-leaflet`
5.0.0, `lucide-react` 1.59.0.

Dua catatan:

- `@hookform/resolvers` **dipin ke 5.9.2**. Versi 6.0.0 gagal dipasang karena
  konflik peer opsional `effect@^4` (npm ERESOLVE), bukan karena kode proyek.
  Versi 5.9.2 mendukung zod 4 dan dipakai tanpa `--legacy-peer-deps`.
- `@types/leaflet` ditambahkan sebagai **devDependency tipe saja**. `leaflet`
  tidak membawa deklarasi tipe sendiri, sehingga `react-leaflet` gagal
  di-typecheck tanpanya. Tidak ada kode runtime dari paket ini.

## 11. Login dan guard (A1)

- Login hanya Email/Password: `signInWithEmailAndPassword`, lalu baca
  `admins/{uid}`. Tidak ada registrasi, tidak ada Google, tidak ada halaman
  daftar.
- Jika dokumen admin tidak ada: `signOut()` dan pesan
  "Akun ini tidak memiliki akses admin" (teks PRD §8.2). Ini juga menolak akun
  mobile biasa.
- `AuthProvider` mengulang pengecekan `admins/{uid}` saat sesi dipulihkan, jadi
  akun non-admin tidak bisa masuk lewat sesi lama.
- `RequireAdmin` menampilkan "Memeriksa sesi..." selama status awal belum pasti,
  lalu mengalihkan ke `/login`. Tidak ada rute admin yang terbuka tanpa
  dokumen admin.
- Pesan error Firebase Auth dipetakan ke bahasa Indonesia di
  `services/auth.ts` (`invalid-credential`, `too-many-requests`, jaringan,
  akun nonaktif, default).

## 12. Rute dan navigasi

Rute mengikuti PRD §8.1: `/login`, `/hutan`, `/hutan/baru`, `/hutan/:id`,
`/satwa`, `/satwa/baru`, `/satwa/:id`, `/` dialihkan ke `/hutan`. Sidebar hanya
memuat menu yang benar-benar ada (Hutan, Satwa); tautan Dashboard/Artikel/Kuis/
Impor ditambahkan bersama halamannya agar tidak ada tautan mati.

## 13. Strategi baca dan paginasi

Daftar memuat seluruh koleksi sekali per kunjungan (`getDocs`), lalu pencarian,
filter status, dan paginasi 10 baris dilakukan di klien sesuai PRD §8.2.
Tidak ada `orderBy` maupun `where` di query sehingga tidak perlu composite
index.

## 14. Validasi form

- Skema zod ada di `src/types/schemas.ts`, dipakai bersama oleh form Hutan dan
  Satwa.
- Field teks inti wajib diisi (nama, provinsi, deskripsi, karakteristik;
  satwa menambah nama ilmiah dan habitat). PRD hanya menandai `name` dan
  `scientificName` sebagai wajib, tetapi data kosong pada field inti akan
  merusak tampilan mobile, jadi semuanya divalidasi.
- Opsional: `localName`, `funFact`, `areaHa`. Nilai kosong dibuang sebelum
  ditulis (`stripUndefined`) agar Firestore tidak menerima `undefined`.
- `nameLower` dibuat otomatis dari `name` di service.
- Baris flora/galeri yang kosong difilter saat menyimpan; URL galeri wajib
  `https://`.
- `createdAt` diisi `serverTimestamp()` sekali saat create, `updatedAt` setiap
  simpan (di service, bukan di komponen).

## 15. Komponen bersama

- `Table` menampilkan loading/error/kosong, toolbar (pencarian + filter status),
  dan paginasi. `TableToolbar` dipakai kedua halaman daftar.
- `ImageUrlInput` memvalidasi `https://`, menyediakan tombol "Konversi link
  Drive", dan pratinjau dengan fallback bila gambar gagal dimuat (§5.4).
- `LocationsEditor` mengelola baris label/lat/lng; klik peta Leaflet mengisi
  koordinat baris aktif. Penanda memakai `CircleMarker` (bukan ikon marker)
  agar tidak bergantung pada aset gambar Leaflet di bundler. Tile OSM dengan
  atribusi wajib.
- `ConfirmDialog` dipakai untuk hapus data dan keluar; `Toast` untuk umpan balik
  sukses/gagal. Keduanya tanpa dependency tambahan.

## 16. Uji manual UI dan batasannya

Guard diverifikasi di browser: `/hutan` tanpa sesi dialihkan ke `/login`, dan
login dengan kredensial salah menampilkan "Email atau password salah." dari
Firebase Auth asli. Halaman daftar dan form diuji dengan **bypass guard
sementara** (sudah dihapus kembali, tidak ada kode bypass yang tersisa): form
Hutan dan Satwa tampil, validasi zod menampilkan pesan Indonesia, konversi link
Drive mengubah URL dan menampilkan fallback saat gambar gagal, serta klik peta
mengisi lat/lng baris aktif.

Penyimpanan, pengubahan, dan penghapusan dokumen **belum diuji** karena butuh
akun admin asli dan menulis data nyata ke Firestore.

Temuan saat uji: koleksi konten masih bisa dibaca tanpa sesi, yang berarti
`firestore.rules` §6 mungkin belum dipublikasikan di Firebase Console.
Pemilik proyek perlu mem-publish rules tersebut.

## 17. Peringatan build

`vite build` memberi peringatan ukuran chunk >500 kB (Firebase + Leaflet). Ini
informasi, bukan error; pemecahan chunk akan dipertimbangkan bila diminta.

---

# Fase 3 — A2, A5, A6, A7 + README

## 18. Dashboard (A2)

Empat kartu untuk `forests`, `wildlife`, `articles`, `quizQuestions`. Setiap
kartu memakai dua query agregasi: total dokumen dan jumlah `isPublished ==
false` (draft), sehingga dashboard tidak membaca seluruh dokumen. Data pengguna
(`users`, `quizHistory`, `admins`) tidak pernah dihitung atau ditampilkan.
Tombol "Muat ulang" menjalankan ulang query; ada state loading (skeleton) dan
error.

## 19. Artikel (A5) dan Kuis (A6)

Mengikuti pola fase 2: daftar memuat koleksi sekali per kunjungan dengan
pencarian, filter status, dan paginasi 10 baris di klien; form memakai
`react-hook-form` + zod; hapus memakai dialog konfirmasi. Artikel diurutkan
berdasarkan judul, soal kuis berdasarkan topik lalu pertanyaan.

Form kuis menampilkan empat input opsi tetap dengan radio penanda jawaban benar
(`correctIndex` 0–3). `imageUrl` kuis opsional; nilai kosong dibuang sebelum
ditulis.

## 20. Impor data contoh (A7)

- `seed/seed-data.json` dibaca lewat `import` JSON dari Vite, sehingga tidak ada
  request tambahan. `tsc` memerlukannya, jadi `resolveJsonModule` diaktifkan di
  `tsconfig.app.json`.
- Isi: 9 satwa, 4 hutan, 3 artikel, 12 soal kuis — semuanya `isPublished: true`
  dan URL foto kosong sesuai PRD. Berkas seed **tidak** memuat `nameLower`,
  `createdAt`, atau `updatedAt`: ketiganya ditambahkan saat penulisan
  (`nameLower` dihitung dari nama, timestamp memakai `serverTimestamp()`).
- Halaman `/impor` menampilkan jumlah data saat ini versus jumlah dokumen seed,
  memberi peringatan bila ada koleksi yang sudah berisi data, dan meminta
  konfirmasi sebelum menulis. Progres ditampilkan per dokumen.
- `relatedForestIds`/`relatedWildlifeIds` di seed sengaja kosong karena ID
  dokumen baru dibuat saat impor; relasi diisi manual lewat form.
- Klaim faktual yang perlu dicek ulang dicatat di `seed/NEEDS_REVIEW.md`.

## 21. Koreksi data contoh

Kakatua Koki (*Cacatua galerita*) semula ditempatkan di Maluku. Spesies ini
asli Papua dan Australia serta hanya terintroduksi di sebagian Maluku, sehingga
entri diubah ke Papua (Merauke) agar tidak menyesatkan.

## 22. Navigasi

Sidebar kini memuat Dashboard, Hutan, Satwa, Artikel, Kuis, dan Impor Data,
semua rute sudah ada (tidak ada tautan mati). `/` menampilkan Dashboard dan
wildcard dialihkan ke `/`.

## 23. Uji manual fase ini

Halaman Dashboard, Artikel, Kuis, dan Impor diuji tampil di browser dengan
bypass guard sementara (sudah dihapus, tidak tersisa di kode). Penulisan
dokumen — CRUD artikel/kuis dan eksekusi impor — **belum diuji** karena butuh
akun admin asli dan akan menulis data nyata; uji impor sengaja tidak dijalankan
agar tidak menduplikasi isi Firestore.

## 24. README

README workspace ditulis ulang: prasyarat, cara menjalankan, daftar variabel
env, prasyarat manual (aktifkan Email/Password, buat `admins/{uid}`, publish
rules, pengaturan link Drive), daftar rute, langkah impor seed, struktur folder,
dan batasan.

## 25. Pembaruan desain UI/UX panel admin

Tampilan panel dirapikan tanpa mengubah rute, perilaku data, atau dependensi
(PRD §4 tetap dipatuhi; tidak ada paket UI baru). Keputusan desain:

- **Tema**: tetap terang saja (PRD §8.2). Ditambahkan token warna `brand`
  (hijau hutan) dan `cream` (krem hangat) di `src/index.css` memakai `@theme`
  Tailwind v4. Sidebar memakai hijau tua sebagai permukaan navigasi, bukan
  dark mode: seluruh area kerja dan formulir tetap terang.
- **Aset merek**: `public/logo-mark.png` dibuat dari `logo.png` proyek
  (dipotong ke bagian lambang, 320 px) dan dipakai di sidebar, layar login, dan
  splash pemeriksaan sesi. Tidak ada unggahan foto konten; aturan URL https
  tidak berubah.
- **Kerangka**: sidebar tetap (lebar 18rem) dengan grup navigasi dan kartu akun,
  header lengket, serta drawer khusus layar kecil. Komponen baru: `Brand`,
  `PageHeader`, `FormSection`, `Switch`, `FormAside`, `Tag`,
  `ConservationBadge`.
- **Dashboard**: kartu ringkasan dengan rasio publikasi, aksi cepat, dan catatan
  cakupan data. Angka tetap hanya dari `getCountFromServer`; tidak ada data
  pengguna yang ditampilkan.
- **Daftar**: toolbar pencarian dengan ikon, filter status berbentuk segmented
  control, skeleton saat memuat, empty/error state yang jelas, dan paginasi
  bernomor. Di layar kecil, kolom sekunder disembunyikan dan nilai
  jenis/wilayah/konservasi dipindahkan ke bawah nama agar tabel tidak perlu
  digeser horizontal.
- **Formulir**: dikelompokkan menjadi kartu bagian, status publikasi memakai
  switch aksesibel, tombol simpan/batal ada di kartu samping yang lengket di
  desktop serta bilah simpan lengket di layar kecil. Validasi, payload, dan
  `serverTimestamp()` tidak berubah.
- **Tambahan kecil**: dialog konfirmasi dengan tone bahaya/netral, toast dengan
  ikon dan tombol tutup, pratinjau gambar berbingkai, multi-select relasi dengan
  pencarian, dan editor lokasi bernomor dengan penanda aktif di peta.

## 26. Uji manual pembaruan desain

Seluruh layar (login, dashboard, empat daftar, empat formulir, impor) diuji di
browser pada lebar desktop dan ponsel. Alur yang dijalankan: validasi login,
sesi bertahan setelah reload, penjagaan rute, pencarian, filter status, paginasi,
empty state, dialog hapus, toast, switch publikasi, validasi formulir, pratinjau
gambar, konversi link Drive, pemilihan lokasi lewat peta, serta navigasi drawer
di layar kecil.

Dengan akun admin proyek, CRUD nyata diuji pada koleksi artikel memakai satu
dokumen sementara `[TES ADMIN]` (dibuat, diubah, lalu dihapus kembali) sehingga
jumlah artikel akhir sama seperti sebelum pengujian. Impor data contoh **tidak**
dijalankan pada Firestore nyata karena akan menduplikasi konten; halaman impor
hanya diperiksa (peringatan, jumlah data, tombol nonaktif saat memuat).
`npm run build`, `npm run lint`, dan `npm test` lulus setelah perubahan.
