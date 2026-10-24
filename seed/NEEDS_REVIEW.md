# NEEDS_REVIEW — data contoh

Data di `seed-data.json` disusun dari pengetahuan umum tentang satwa dan hutan
Indonesia. Berikut hal yang **perlu diverifikasi pemilik proyek** sebelum
dipublikasikan sebagai konten resmi.

## Status konservasi (IUCN Red List)

Daftar Merah IUCN diperbarui dari waktu ke waktu; status di bawah adalah status
yang umum dirujuk, tetapi tanggal penilaian terbaru perlu dicek.

| Satwa | Status di seed |
|---|---|
| Orangutan Sumatera (*Pongo abelii*) | CR |
| Harimau Sumatera (*Panthera tigris sumatrae*) | CR |
| Badak Jawa (*Rhinoceros sondaicus*) | CR |
| Komodo (*Varanus komodoensis*) | EN |
| Maleo (*Macrocephalon maleo*) | EN |
| Cendrawasih Kuning Besar (*Paradisaea apoda*) | LC |
| Pesut Mahakam (*Orcaella brevirostris*) | EN |
| Anoa Dataran Rendah (*Bubalus depressicornis*) | EN |
| Kakatua Koki (*Cacatua galerita*) | LC |

## Angka dan klaim

1. **Populasi badak Jawa** ditulis "kurang dari 100 individu". Angka resmi
   berubah setiap pemantauan; perbarui bila perlu.
2. **Penyebaran kakatua koki** dibatasi ke Papua bagian selatan. Spesies ini
   juga diketahui terintroduksi di Maluku, tetapi tidak dicantumkan agar tidak
   menyesatkan.
3. **Pesut Mahakam** dinyatakan sebagai populasi air tawar; spesies
   *Orcaella brevirostris* sendiri juga hidup di perairan laut di Asia.
4. **Anoa** disebut "sapi liar terkecil di dunia" — klaim umum, perlu dicek
   rumusannya bila akan dipakai di materi resmi.
5. **Maleo**: klaim anak burung mampu terbang hampir segera setelah menetas
   sesuai perilakunya, tetapi detail waktunya perlu dicek.

## Flora per taman nasional

Daftar flora hanya contoh jenis yang umum dijumpai, bukan daftar lengkap:

- Gunung Leuser: Meranti, Kantung semar, Rafflesia
- Ujung Kulon: Merbau, Bambu, Rotan
- Tanjung Puting: Ramin, Jelutung, Punak
- Komodo: Lontar, Asam, Bakau

## Koordinat

Semua `locations` adalah **titik perkiraan** pusat kawasan atau sebaran, bukan
batas resmi kawasan. Ganti dengan koordinat yang benar bila data akan dipakai
untuk navigasi atau peta publik.

## Relasi antar konten

`relatedForestIds` dan `relatedWildlifeIds` sengaja kosong karena ID dokumen
dibuat otomatis saat impor. Hubungkan manual lewat form admin setelah impor
bila ingin menampilkan item terkait di aplikasi mobile.
