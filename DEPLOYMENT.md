# Panduan Deploy Habitual ke Vercel

## Persiapan Sebelum Deploy

### ✅ Checklist
- [x] Aplikasi berjalan dengan baik di localhost
- [x] Supabase sudah dikonfigurasi dan berfungsi dengan benar
- [x] File `.env.local` sudah diisi dengan benar
- [x] Git repository sudah dibuat

## Langkah 1: Push ke GitHub

1. **Inisialisasi Git** (jika belum)
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Habitual App"
   ```

2. **Buat Repository di GitHub**
   - Buka [github.com](https://github.com)
   - Klik "New Repository"
   - Nama: `habitual-app`
   - Visibility: Public atau Private
   - Jangan centang "Initialize with README" (karena sudah ada)
   - Klik "Create Repository"

3. **Push ke GitHub**
   ```bash
   git remote add origin https://github.com/USERNAME/habitual-app.git
   git branch -M main
   git push -u origin main
   ```
   
   Ganti `USERNAME` dengan username GitHub Anda.

## Langkah 2: Deploy ke Vercel

### A. Melalui Dashboard Vercel (Recommended)

1. **Login ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Import Project**
   - Klik "Add New..." > "Project"
   - Pilih repository `habitual-app`
   - Klik "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Environment Variables**
   Klik "Environment Variables" dan tambahkan:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase Anda |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase Anda |

   **PENTING:** Copy dari file `.env.local` Anda!

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai (~2-3 menit)
   - Aplikasi akan live di URL seperti: `habitual-app.vercel.app`

### B. Melalui Vercel CLI (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Ikuti prompt:
   - Set up and deploy? **Y**
   - Which scope? Pilih account Anda
   - Link to existing project? **N**
   - Project name? **habitual-app**
   - Directory? **./** (enter)
   - Override settings? **N**

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   
   Paste nilai dari `.env.local` Anda.

5. **Deploy Production**
   ```bash
   vercel --prod
   ```

## Langkah 3: Konfigurasi Supabase untuk Production

1. **Update Redirect URLs**
   - Buka Supabase Dashboard
   - Pergi ke **Authentication** > **URL Configuration**
   - Tambahkan URL Vercel Anda ke **Site URL**:
     ```
     https://habitual-app.vercel.app
     ```
   - Tambahkan ke **Redirect URLs**:
     ```
     https://habitual-app.vercel.app/**
     ```

2. **Test Authentication**
   - Buka aplikasi di URL Vercel
   - Coba register dan login
   - Pastikan semuanya berfungsi

## Langkah 4: Custom Domain (Opsional)

1. **Beli Domain** (jika belum punya)
   - Dari provider seperti Namecheap, GoDaddy, dll

2. **Tambahkan di Vercel**
   - Di Vercel Dashboard, buka project Anda
   - Klik "Settings" > "Domains"
   - Klik "Add"
   - Masukkan domain Anda (contoh: `habitual.com`)
   - Ikuti instruksi untuk update DNS

3. **Update Supabase URLs**
   - Update Site URL dan Redirect URLs dengan domain baru

## Troubleshooting

### Build Failed
- Cek error message di Vercel logs
- Pastikan semua dependencies ada di `package.json`
- Coba build lokal: `npm run build`

### Environment Variables Not Working
- Pastikan nama variable benar (case-sensitive)
- Pastikan ada prefix `NEXT_PUBLIC_` untuk client-side variables
- Redeploy setelah menambah environment variables

### Authentication Error
- Pastikan Redirect URLs sudah ditambahkan di Supabase
- Pastikan environment variables sudah di-set di Vercel
- Cek browser console untuk error messages

### Database Connection Error
- Pastikan Supabase URL dan Key benar
- Cek apakah Supabase project masih aktif
- Pastikan RLS policies sudah dibuat

## Auto-Deploy

Setelah setup awal, setiap push ke GitHub akan otomatis trigger deploy baru:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel akan otomatis build dan deploy perubahan Anda!

## Monitoring

1. **Analytics**
   - Vercel Dashboard > Analytics
   - Lihat traffic, performance, dll

2. **Logs**
   - Vercel Dashboard > Deployments > [pilih deployment] > Logs
   - Debug errors di production

3. **Supabase Dashboard**
   - Monitor database usage
   - Lihat active users
   - Check API requests

## Tips Production

1. **Enable Email Confirmation**
   - Untuk production, sebaiknya enable email confirmation
   - Supabase > Authentication > Providers > Email
   - Check "Enable email confirmations"

2. **Setup Email Templates**
   - Customize email templates di Supabase
   - Authentication > Email Templates

3. **Monitor Usage**
   - Cek Supabase usage di Dashboard
   - Free tier: 500MB database, 50K MAU

4. **Backup Database**
   - Supabase otomatis backup daily
   - Bisa manual backup di Database > Backups

## Next Steps

Setelah deploy berhasil:
- ✅ Share URL dengan teman/user
- ✅ Monitor performance dan errors
- ✅ Collect feedback
- ✅ Iterate dan improve!

## Support

Jika ada masalah:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
