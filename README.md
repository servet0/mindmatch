# 🧠 MindMatch - Gerçek Zamanlı Kelime Tahmin Oyunu

<div align="center">

![MindMatch](https://img.shields.io/badge/MindMatch-Kelime%20Oyunu-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**İki kişilik gerçek zamanlı kelime tahmin oyunu! Aynı kategori, anlık eşleşme, sonsuz eğlence.**

[🎮 Demo](#) • [📖 Dokümantasyon](#kurulum) • [🚀 Deploy](#deploy)

</div>

---

## ✨ Özellikler

### 🎯 Oyun Mechanics
- **Gerçek Zamanlı Multiplayer**: İki oyuncu anlık olarak oynayabilir
- **Kategori Tabanlı**: 10 farklı kelime kategorisi (Hayvanlar, Yemekler, Şehirler vb.)
- **Akıllı Puanlama**: Aynı kelime 2 puan, farklı kelime 1 puan
- **Instant Feedback**: Karşı taraf yazdığında hemen devam eder
- **5 Round Sistem**: Kısa ve heyecanlı oyun seansları

### 🌐 Teknik Özellikler
- **URL Persistence**: Sayfa yenilense bile oyun devam eder
- **LocalStorage**: Oyuncu bilgileri korunur
- **Real-time Sync**: Supabase Realtime ile anlık senkronizasyon
- **Responsive Design**: Mobil ve masaüstü uyumlu
- **Modern UI**: Glassmorphism tasarım ve gradient arka planlar

### 🛠️ Teknolojiler
- **Frontend**: Next.js 15, TypeScript, React 19
- **Styling**: Tailwind CSS, Custom CSS Animations
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

---

## 🎮 Nasıl Oynanır?

### 1. Oda Oluştur veya Katıl
- **Oda Oluştur**: Nickname gir ve "Oda Oluştur" butonuna tıkla
- **Odaya Katıl**: Nickname ve 6 haneli oda kodunu gir

### 2. Oyun Başlar
- Her round'da aynı kategori gösterilir
- İki oyuncu da kategori ile ilgili bir kelime yazar
- Kelimeni yazıp "Cevabı Gönder" butonuna tıkla

### 3. Puanlama
- **Aynı kelime**: Her iki oyuncu 2 puan alır 🎉
- **Farklı kelime**: Her iki oyuncu 1 puan alır ⚡
- 5 round sonunda en yüksek skor kazanır! 🏆

---

## 🚀 Kurulum

### Ön Koşullar
- **Node.js** 18+ (Next.js çalıştırmak için gerekli)
- **npm** veya **yarn** (paket yöneticisi)
- **Supabase** hesabı (veritabanı için)

### 1. Projeyi Klonla
```bash
git clone https://github.com/yourusername/mindmatch.git
cd mindmatch
```

### 2. Bağımlılıkları Kur
```bash
npm install
```

### 3. Supabase Kurulumu

#### Supabase Projesi Oluştur
1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur
3. Region olarak **Europe West (eu-west-1)** seç (Türkiye için optimal)

#### Veritabanı Şemasını Kur
1. Supabase Dashboard → **SQL Editor**
2. `supabase_schema.sql` dosyasının içeriğini kopyala ve çalıştır

#### API Anahtarlarını Al
1. Supabase Dashboard → **Settings** → **API**
2. **Project URL** ve **anon public key**'i kopyala

### 4. Environment Variables
`.env.local` dosyası oluştur:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Uygulamayı Çalıştır
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacak! 🎉

---

## 📁 Proje Yapısı

```
mindmatch/
├── src/
│   ├── app/
│   │   ├── room/[roomId]/       # Dinamik oda sayfaları
│   │   ├── page.tsx             # Ana sayfa
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global stiller
│   ├── components/
│   │   ├── HomePage.tsx         # Ana sayfa bileşeni
│   │   ├── GameRoom.tsx         # Oyun odası bileşeni
│   │   └── ui/                  # UI bileşenleri
│   ├── contexts/
│   │   └── GameContext.tsx      # Oyun state yönetimi
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── game-utils.ts        # Oyun fonksiyonları
│   │   └── utils.ts             # Yardımcı fonksiyonlar
├── supabase_schema.sql          # Veritabanı şeması
├── SETUP.md                     # Detaylı kurulum rehberi
└── README.md                    # Bu dosya
```

---

## 🗄️ Veritabanı Şeması

### Tablolar
- **players**: Oyuncu bilgileri ve istatistikleri
- **rooms**: Oyun odaları ve durumları
- **room_players**: Oyuncu-oda ilişkileri ve skorlar
- **categories**: Kelime kategorileri
- **game_rounds**: Oyun round'ları ve kategoriler
- **player_answers**: Oyuncu cevapları ve puanları

### Özellikler
- **Row Level Security (RLS)**: Güvenli veri erişimi
- **Real-time Subscriptions**: Anlık veri senkronizasyonu
- **Optimized Indexes**: Hızlı sorgular

---

## 🚀 Deploy

### Vercel Deploy
```bash
# Vercel CLI kur
npm i -g vercel

# Deploy et
vercel

# Environment variables ekle
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Production deploy
vercel --prod
```

### Environment Variables (Production)
Vercel Dashboard'da şu değişkenleri ekle:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key

---

## 🎨 UI/UX Özellikleri

### Tasarım Sistemi
- **Gradient Backgrounds**: Modern gradient arka planlar
- **Glassmorphism**: Şeffaf cam efektli kartlar
- **Responsive Layout**: Mobil-first tasarım
- **Smooth Animations**: CSS transitions ve animations
- **Dark Theme**: Göz yormayan karanlık tema

### İnteraktif Elementler
- **Real-time Status**: Canlı oyuncu durumları
- **Loading States**: Akıllı yükleme göstergeleri
- **Error Handling**: Kullanıcı dostu hata mesajları
- **Success Feedback**: Başarı animasyonları

---

## 🧪 Geliştirme

### Scripts
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm run lint         # ESLint kontrolü
```

### Kod Kalitesi
- **TypeScript**: Tip güvenliği
- **ESLint**: Kod standartları
- **Prettier**: Kod formatlaması
- **React Hooks**: Modern React patterns

---

## 🤝 Katkıda Bulunma

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

---

## 👥 Yaratıcı

**MindMatch Team**
- 🌐 Website: [mindmatch.vercel.app](#)
- 📧 Email: [contact@mindmatch.com](#)
- 🐦 Twitter: [@mindmatch](#)

---

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ for word game lovers

</div>
