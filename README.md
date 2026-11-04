# Catatan Resep Kopi - Aplikasi To-Do List

Aplikasi mobile untuk mencatat takaran racikan kopi/minuman favorit buatan sendiri. Resep diperlakukan seperti item to-do: bisa dicentang kalau sudah dicoba.

## Teknologi

- **Frontend:** React Native (Expo) + TypeScript
- **State Management:** React Hooks (useState, useContext)
- **Navigasi:** React Navigation (Native Stack)
- **Storage:** AsyncStorage (lokal)
- **UI:** React Native Core Components
- **Node.js:** 24

## Fitur Wajib

1. ✅ Tambah resep: nama racikan, daftar bahan + takaran, langkah pembuatan, kategori, catatan pribadi
2. ✅ Daftar resep di halaman utama (FlatList)
3. ✅ Centang "sudah dicoba / belum dicoba"
4. ✅ Edit resep
5. ✅ Hapus resep (dengan dialog konfirmasi)
6. ✅ Kategori: Kopi Panas, Kopi Dingin, Non-Kopi
7. ✅ Favorit (ikon bintang/love)
8. ✅ Search berdasarkan nama + filter berdasarkan kategori
9. ✅ Validasi input (nama resep dan minimal 1 bahan tidak boleh kosong)
10. ✅ Empty state kalau belum ada resep ("Belum ada resep, yuk tambah!")
11. ✅ Data tersimpan lokal pakai AsyncStorage

## Fitur Login (tambahan)

1. ✅ SplashScreen: logo/ikon kopi + loading 2 detik, lalu pindah ke Login/Home
2. ✅ LoginScreen: input username/email + password (toggle visibility), tombol "Masuk" dengan loading
3. ✅ RegisterScreen: buat akun baru (username, password, konfirmasi)
4. ✅ Validasi: field wajib, password minimal 6 karakter
5. ✅ Simpan status login di AsyncStorage
6. ✅ Tombol Logout di HomeScreen (dengan dialog konfirmasi)
7. ✅ Resep disimpan per user (key AsyncStorage pakai ID user)

## Cara Menjalankan

### Install Dependencies

```bash
npm install
```

### Jalankan di Expo Go

1. Install Expo Go di Android/iOS
2. Jalankan:

```bash
npm start
```

3. Scan QR code yang muncul dengan Expo Go

### Jalankan di Emulator

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

### Jalankan di Web

```bash
npm start
# Lalu tekan w untuk buka di browser
```

## Struktur Folder

```
cttnrspkp/
├── src/
│   ├── screens/        # Layar aplikasi (Splash, Login, Register, Home, Form, Detail)
│   ├── components/     # Komponen UI reusable
│   ├── context/        # React Context (AuthContext, RecipeContext)
│   ├── types/          # TypeScript types/interfaces
│   ├── theme/          # Warna & styling global (colors.ts)
│   ├── utils/          # Helper functions
│   └── navigation/     # Navigation setup
├── App.tsx             # Root component
├── package.json
└── README.md
```

## Cara Kerja

1. App start → SplashScreen (2 detik) → cek login → Login/Home
2. User login/register → data tersimpan di AsyncStorage
3. HomeScreen: list resep + search + filter + FAB tambah
4. Tambah/Edit resep → FormScreen → simpan ke AsyncStorage (per user)
5. DetailScreen: lihat detail, toggle favorit/tried, edit, hapus
6. Logout → kembali ke SplashScreen

## Catatan

- Ini adalah aplikasi kelas kuliah → code rapi, mudah dipahami, komentar singkat berbahasa Indonesia
- Data hanya tersimpan lokal (tanpa backend/server)
- Gunakan Expo Go untuk testing cepat di device nyata
