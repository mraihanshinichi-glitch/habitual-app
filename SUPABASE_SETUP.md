# Setup Supabase untuk Habitual App

## Langkah 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Sign up atau login
3. Klik "New Project"
4. Isi detail project:
   - Name: `habitual-app`
   - Database Password: (buat password yang kuat)
   - Region: Pilih yang terdekat dengan lokasi Anda
5. Tunggu project selesai dibuat (~2 menit)

## Langkah 1.5: Disable Email Confirmation (Untuk Development)

**PENTING:** Untuk development, disable email confirmation agar bisa langsung login setelah register.

1. Di dashboard Supabase, buka **Authentication** > **Providers**
2. Klik **Email** provider
3. Scroll ke bawah ke bagian **Email Confirmation**
4. **UNCHECK** "Enable email confirmations"
5. Klik **Save**

Sekarang user bisa langsung login setelah register tanpa perlu konfirmasi email.

## Langkah 2: Setup Database

1. Di dashboard Supabase, buka **SQL Editor**
2. Klik "New Query"
3. Copy semua isi file `supabase-setup.sql`
4. Paste ke SQL Editor
5. Klik "Run" untuk execute script
6. Pastikan semua query berhasil (hijau)

**PENTING:** Script ini membuat trigger yang otomatis membuat profile dan settings saat user sign up. Pastikan semua query berhasil dijalankan.

## Langkah 3: Dapatkan API Keys

1. Di dashboard Supabase, buka **Settings** > **API**
2. Copy nilai berikut:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon/public key** (key yang panjang)

## Langkah 4: Setup Environment Variables

1. Di root project, buat file `.env.local`
2. Copy isi dari `.env.local.example`
3. Ganti dengan nilai dari Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Langkah 5: Install Dependencies

```bash
npm install
```

## Langkah 6: Jalankan Aplikasi

```bash
npm run dev
```

## Langkah 7: Test Authentication

1. Buka http://localhost:3000
2. Klik "Daftar di sini"
3. Isi form registrasi dengan email dan password
4. Jika email confirmation disabled: Langsung masuk ke dashboard
5. Jika email confirmation enabled: Cek email untuk verifikasi, lalu login

## Verifikasi Database

Setelah membuat akun dan menambah beberapa habits:

1. Buka Supabase Dashboard
2. Klik **Table Editor**
3. Cek tabel:
   - `profiles` - Harus ada data user Anda
   - `habits` - Harus ada habits yang Anda buat
   - `custom_categories` - Harus ada kategori custom (jika ada)
   - `user_settings` - Harus ada settings tema

## Troubleshooting

### Error: Missing Supabase environment variables
- Pastikan file `.env.local` ada di root project
- Pastikan nama variable benar: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart development server setelah menambah `.env.local`

### Error: Invalid API key
- Pastikan menggunakan **anon/public key**, bukan service_role key
- Copy ulang dari Supabase dashboard

### Error: Row Level Security
- Pastikan semua policies sudah dibuat dengan benar
- Pastikan trigger `handle_new_user` sudah dibuat
- Jalankan ulang `supabase-setup.sql` jika perlu

### Error: User tidak bisa login setelah register
- **Disable email confirmation** di Authentication > Providers > Email
- Atau cek email untuk konfirmasi link
- Pastikan trigger sudah membuat profile

### Data tidak muncul
- Cek di Supabase Table Editor apakah data tersimpan
- Cek browser console untuk error messages
- Pastikan user sudah login
- Pastikan profile sudah dibuat di tabel profiles

## Migrasi dari LocalStorage

Jika Anda sudah punya data di localStorage dan ingin migrasi:

1. Data localStorage akan otomatis hilang setelah logout
2. Buat akun baru di Supabase
3. Tambahkan habits baru (data lama tidak bisa di-migrate otomatis)

## Features yang Menggunakan Supabase

✅ Authentication (Sign up, Login, Logout)
✅ User Profiles
✅ Habits CRUD (Create, Read, Update, Delete)
✅ Custom Categories
✅ User Settings (Theme)
✅ Real-time sync across devices
✅ Row Level Security (RLS)

## Next Steps

Setelah setup berhasil, Anda bisa:
- **Deploy ke Vercel** - Lihat panduan lengkap di `DEPLOYMENT.md`
- Enable email confirmation di Supabase Auth settings (untuk production)
- Setup social login (Google, GitHub, dll)
- Enable real-time subscriptions untuk sync otomatis
- Setup custom domain
