# otel-rezervasyon





Bu proje, Next.js + Express.js + MongoDB kullanılarak geliştirilmiş tam entegre bir otel rezervasyon sistemidir. Kullanıcılar otel odalarını rezerve edebilir, yöneticiler ise oda ve kategori yönetimi yapabilir. Proje Docker ile çalıştırılabilir yapıdadır.



\-



\### 🎯 Kullanıcı Paneli

\- Kullanıcı kaydı ve girişi (JWT ile)

\- Oda arama ve rezervasyon yapma

\- Geçmiş rezervasyonları görme

\- Profil bilgilerini güncelleme



\### 🔧 Admin Paneli

\- Oda ve kategori ekleme/düzenleme/silme

\- Kullanıcı rezervasyonlarını listeleme ve yönetme

\- Aylık ve kategori bazlı analiz grafikleri



---



\## 🛠️ Kullanılan Teknolojiler



| Teknoloji | Açıklama |

|----------|----------|

| \*\*Next.js 15\*\* | Frontend (React + App Router) |

| \*\*Tailwind / Shadcn UI\*\* | Arayüz tasarımı |

| \*\*TanStack Query\*\* | API istekleri |

| \*\*Zod + React Hook Form\*\* | Form doğrulama |

| \*\*Zustand\*\* | Global state yönetimi |

| \*\*Node.js (Express)\*\* | Backend API |

| \*\*MongoDB  | Veritabanı |

| \*\*Redis\*\* | Cache (opsiyonel) |

| \*\*Docker\*\* | Servisleri container içinde çalıştırma |



---


Olceklenebilirlik

- MongoDB ile esnek veri modeli
- Redis ile verimli onbellekleme
- Sayfalanmis listeleme
- Mikroservis mimarisine kolay gecis
- Docker ile kolay dagitim


\## 📁 Proje Yapısı



```bash

elit/

│

├── hotel-booking/         # Frontend (Next.js)

├── hotel-booking-api/     # Backend (Express.js)

├── docker-compose.yml     # Tüm sistemi ayağa kaldıran yapılandırma

└── README.md              # Bu dosya









💻 Başlangıç (Yerel Kurulum)



1\. Depoyu Klonla



git clone https://github.com/ethemkurtt/elit-test.git

cd elit-test





2\. Gerekli Ortam Dosyalarını Oluştur (.env)



hotel-booking-api/.env



PORT=5000

MONGODB\_URI=mongodb://host.docker.internal:27017/hotel-booking

JWT\_SECRET=super-secret-key

REDIS\_URL=redis://redis:6379

REDIS\_HOST=redis

REDIS\_PORT=6379







hotel-booking/.env.local





NEXT\_PUBLIC\_API\_URL=http://localhost:5000/api





3\. Docker ile Başlat (Tek Komut)



docker-compose up --build





🧪 Geliştirici Modunda Manuel Çalıştırma





Backend



cd hotel-booking-api

npm install

npm run dev





Frontend



cd hotel-booking

npm install

npm run dev





📊 Örnek Admin Girişi



Öncesinde postman yada terminalde şu komutu çalıştırın 

curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Demo Admin",
    "email": "admin@otel.com",
    "phone": "05550000000",
    "birthDate": "1990-01-01",
    "password": "123456",
    "role": "admin"
  }'

Sonrasında şu bilgiler ile giriş yapabilirsiniz : 

Email: admin@otel.com

Şifre: 123456



