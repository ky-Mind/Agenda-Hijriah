# Islamic Calendar Icon Integration Guide

## Ringkasan Implementasi

Saya telah mengintegrasikan Islamic Calendar Icon Component ke dalam aplikasi Kisah Lillah Anda dengan konversi dari React ke Vanilla JavaScript.

## File-file yang Dibuat/Dimodifikasi

### 1. **js/islamic-calendar-icon.js** (BARU)
   - Komponen JavaScript untuk Islamic Calendar Icon
   - Fitur:
     - SVG inline yang di-embed langsung (tidak perlu file eksternal)
     - Animasi floating lambat (idle animation)
     - Hover effects dengan scale up
     - Tap/active effects dengan scale down
     - Keyboard accessibility support (Enter/Space keys)
     - Responsive sizing (sm, md, lg, custom)
   - Metode:
     - `render()` - Generate element HTML
     - `mount(selector)` - Mount icon ke elemen yang sudah ada
     - `replace(selector)` - Replace elemen dengan icon
   - Constructor options:
     ```javascript
     {
       size: 'md',        // 'sm' (2.5rem), 'md' (5rem), 'lg' (9rem), 'custom'
       className: '',     // Additional CSS classes
       onClick: null      // Callback function on click
     }
     ```

### 2. **css/islamic-calendar-icon.css** (BARU)
   - Stylesheet lengkap untuk icon component
   - Animasi:
     - Floating Idle: Melayang halus y[-4 to 4] rotate[-1 to 1] selama 3 detik
     - Hover Scale: Scale up 1.08x
     - Tap/Active Scale: Scale down 0.92x dengan rotate -3deg
     - Glow Background: Blur effect dengan gradient amber
   - Responsive design
   - Dark mode support
   - Reduced motion support untuk accessibility

### 3. **index.html** (DIMODIFIKASI)
   - Menambahkan link CSS: `<link rel="stylesheet" href="css/islamic-calendar-icon.css">`
   - Mengganti icon SVG dengan container div:
     - `#splashIconContainer` - Splash screen icon (size: md)
     - `#sidebarIconContainer` - Sidebar brand icon (size: md)
     - `#mobileIconContainer` - Mobile header icon (size: sm)
   - Menambahkan script tag: `<script src="js/islamic-calendar-icon.js"></script>`
   - Menambahkan initialization code yang merender icon ke container

### 4. **assets/ramadan_calendar_icon.svg** (BARU)
   - SVG fallback icon (untuk backup jika perlu external reference)
   - Design: Kalender Islam dengan gradient warna amber/gold

## Cara Menggunakan Icon di File Lain

### Contoh 1: Menambahkan icon di halaman baru
```html
<div id="myIconContainer"></div>

<script>
  const icon = new IslamicCalendarIcon({ size: 'lg' });
  icon.mount('#myIconContainer');
</script>
```

### Contoh 2: Menambahkan dengan callback
```javascript
const icon = new IslamicCalendarIcon({ 
  size: 'md',
  onClick: () => {
    console.log('Icon clicked!');
    // Tambahkan logic di sini
  }
});
icon.mount('#myIconContainer');
```

### Contoh 3: Mengganti icon yang sudah ada
```javascript
const icon = new IslamicCalendarIcon({ size: 'lg' });
icon.replace('.kl-splash-icon'); // Replace elemen yang ada
```

## Fitur Animasi

### 1. Idle Animation (Default)
- Rotasi halus: -1° → 1° → -1°
- Floating vertical: -4px → 4px → -4px
- Duration: 3 detik
- Loop infinit
- Ease: ease-in-out

### 2. Hover Effects
- Scale: 1 → 1.08
- Duration: 0.3 detik
- Glow background meningkat opacity

### 3. Active/Tap Effects
- Scale: 1.08 → 0.92
- Rotate: -3°
- Duration: 0.15 detik

### 4. Glow Background
- Background color: `rgba(217, 119, 6, 0.25)` (amber-500/25)
- Blur: 18px
- Border radius: 24px
- Hover glow: opacity meningkat jadi 0.4 dengan blur 20px

## Konfigurasi Warna

Icon menggunakan color palette:
- **Primary Gold**: `#D97706` (amber-600)
- **Light Gold**: `#F59E0B` (amber-400) & `#FBBF24` (amber-300)
- **Light Text**: `#F7F1DC` (cream/off-white)
- **Dark Background**: `#021f18` (dari theme app)

Warna-warna ini sesuai dengan existing design Kisah Lillah.

## Browser Support

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- Mobile browsers: ✅ Full support (responsive)

## Accessibility Features

- ✅ Role button dan aria-label
- ✅ Keyboard accessible (Enter/Space)
- ✅ Focus-visible outline
- ✅ Tabindex support
- ✅ Reduced motion preferences respected
- ✅ High contrast mode support

## Troubleshooting

### Icon tidak muncul
1. Pastikan `islamic-calendar-icon.js` sudah di-load sebelum initialization
2. Pastikan `islamic-calendar-icon.css` sudah di-load
3. Cek console browser untuk error messages
4. Pastikan container element ada saat initialization

### Animasi tidak jalan
1. Cek browser support untuk CSS animations
2. Cek apakah ada conflicting CSS di page
3. Cek `prefers-reduced-motion` setting di browser

### Icon terlalu besar/kecil
1. Gunakan `size` option yang berbeda (sm, md, lg)
2. Atau gunakan `custom` dan pass custom className dengan width/height

## Performance Notes

- Inline SVG: Tidak perlu HTTP request tambahan ✅
- CSS animations: Menggunakan GPU acceleration ✅
- No dependencies: Tidak perlu library eksternal ✅
- Bundle size: < 15KB untuk JS + CSS ✅

## Next Steps (Opsional)

Jika ingin enhancement lebih lanjut:
1. Tambahkan more size variants
2. Tambahkan more animation options
3. Integrate dengan state management app
4. Tambahkan ripple effect pada click
5. Tambahkan tooltip support
