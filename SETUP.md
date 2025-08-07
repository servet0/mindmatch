# MindMatch Kurulum Rehberi

## Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

## Kurulum Adımları

### 1. Bağımlılıkları Kurun

```bash
npm install
```

### 2. Supabase Projesini Kurun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından API URL ve anon key'i alın

### 3. Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Supabase yapılandırması
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Veritabanı Şemasını Kurun

1. Supabase dashboard'a gidin
2. SQL Editor'ı açın
3. `supabase_schema.sql` dosyasının içeriğini kopyalayıp çalıştırın

### 5. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Oyun Özellikleri

- ✅ İki oyuncu gerçek zamanlı oyun
- ✅ Oda oluşturma ve katılma sistemi
- ✅ 10 farklı kategori
- ✅ 10 saniye süre limiti
- ✅ Skor sistemi (aynı kelime 2 puan, farklı kelime 1 puan)
- ✅ Gerçek zamanlı senkronizasyon
- ✅ Responsive tasarım

## Oyun Kuralları

1. Bir oyuncu oda oluşturur, diğeri oda kodu ile katılır
2. Her round'da aynı kategori gösterilir
3. Oyuncular 10 saniye içinde kategori ile ilgili kelime yazar
4. Aynı kelime yazarlarsa her ikisi 2 puan, farklı yazarlarsa 1 puan alır
5. 5 round sonunda en yüksek skorlu oyuncu kazanır

## Teknik Detaylar

- **Frontend**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Realtime**: Supabase Realtime
- **State Management**: React Context API
- **UI Components**: Custom components with Radix UI patterns
