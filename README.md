# Gerçek Zamanlı Sohbet Uygulaması — Frontend

Next.js (App Router) ile geliştirilmiş, oda bazlı gerçek zamanlı sohbet arayüzü.
Mesajlaşma Socket.io üzerinden yürür, oturum bilgisi Redux Toolkit ile yönetilir.

**Canlı demo:** https://real-time-chat-app-f.vercel.app
**Sunucu (backend) reposu:** https://github.com/nurullahMencik/realTimeChatAppBackend

## Nasıl çalışır?

1. Giriş ekranında adınızı ve bir **oda adı** yazarsınız.
2. Aynı oda adını yazan herkes aynı sohbete düşer.
3. Mesajlar sunucuya gider, sunucu da sadece o odadaki diğer kişilere iletir.

> Mesajlar veritabanında tutulmaz; sohbet geçmişi sayfa açık kaldığı sürece görünür.

## Kullanılan teknolojiler

| Katman | Teknoloji |
| --- | --- |
| Arayüz | Next.js 15, React 19 |
| Durum yönetimi | Redux Toolkit, React Redux |
| Stil | Tailwind CSS 4 |
| Gerçek zamanlı iletişim | Socket.io Client |

## Kurulum

```bash
npm install
cp .env.example .env.local   # gerekirse sunucu adresini değiştirin
npm run dev
```

Uygulama http://localhost:3000 adresinde açılır.

### Ortam değişkenleri

| Değişken | Açıklama | Varsayılan |
| --- | --- | --- |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io sunucusunun adresi | `https://realtimechatappb.onrender.com` |

Sunucuyu da lokalde çalıştırıyorsanız `.env.local` içine şunu yazın:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Proje yapısı

```
frontend/
├── app/
│   ├── (routes)/
│   │   ├── (home)/
│   │   │   ├── _components/JoinForm.jsx    # Ad + oda girişi, bağlantı durumu
│   │   │   └── page.jsx
│   │   └── chat/
│   │       ├── _components/ChatRoom.jsx    # Sohbet ekranı
│   │       ├── _components/MessageBubble.jsx
│   │       └── page.jsx
│   ├── globals.css
│   └── layout.js
├── components/ReduxProvider.jsx            # Store + oturum geri yükleme
├── hooks/useSocket.js                      # Socket + bağlantı durumu
├── lib/socket.js                           # Tek socket örneği (singleton)
└── redux/
    ├── chatSlice.js
    └── store.js
```

## Notlar

- Sunucu Render'ın ücretsiz planında çalıştığı için bir süre kullanılmayınca uykuya
  geçebilir. Bu durumda "Sohbete Başla" butonu sizi bekletmez: giriş isteği sıraya
  alınır, buton geçen süreyi sayar ("Sunucu uyandırılıyor... 12sn") ve bağlantı
  kurulur kurulmaz odaya otomatik girilir. Sunucuyu uyanık tutmak için backend
  reposunda 10 dakikada bir çalışan bir GitHub Actions işi vardır.
- Kullanıcı adı ve oda bilgisi `sessionStorage`'da tutulur, böylece sayfa
  yenilendiğinde sohbetten düşmezsiniz.

## Hazırlayan

Nurullah Mencik — nurullahmencik42@gmail.com
Portfolyo: http://konyaereglisatis.com/portfolio
