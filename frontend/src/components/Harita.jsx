// ============================================================
// Harita.jsx
// Bu komponent Google Maps xəritəsini iframe vasitəsilə
// səhifəyə yerləşdirir. Tailwind CSS ilə responsiv ölçülər
// tətbiq edilir: mobil → tablet → desktop.
// ============================================================

import React from 'react'

const Harita = () => {
  return (
    // Bölmənin üst-alt padding-i: mobil 8, sm+ 12
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── XƏRİTƏ KONTEYNERİ ── */}
        {/* relative: içindəki absolute iframe-in mövqeyini bu div-ə nisbətən hesablayır */}
        {/* Hündürlük responsiv: mobil h-60 (240px), tablet h-80 (320px), desktop h-96 (384px) */}
        {/* overflow-hidden: iframe küncləri rounded-xl xaricə çıxmasın deyə kəsilir */}
        <div className="relative w-full h-60 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-md">

          {/* ── GOOGLE MAPS İFRAME ── */}
          {/* src: Google Maps Embed API URL-i — xəritənin hansı ərazini göstərəcəyini müəyyən edir */}
          {/* absolute inset-0: konteynerin tam içini doldurur (top:0, left:0, right:0, bottom:0) */}
          {/* w-full h-full: genişlik və hündürlük 100% — konteyneri tam doldurur */}
          {/* border-0: iframe-in default border-ini sıfırlayır */}
          {/* loading="lazy": yalnız görünüş sahəsinə girəndə yüklənir — performans üçün */}
          {/* referrerPolicy="no-referrer-when-downgrade": HTTPS → HTTP keçidlərində referrer göndərilmir */}
          {/* allowFullScreen: istifadəçi xəritəni tam ekrana keçirə bilər */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2381.5876577116253!2d-6.26025728439952!3d53.34277547997762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48670e9d0a53b15d%3A0x59ad3f2fa79b8f8e!2sGrafton%20Street%2C%20Dublin%2C%20Ireland!5e0!3m2!1str!2str!4v1677326000000!5m2!1str!2str"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Xəritə"   // ekran oxuyucular (accessibility) üçün vacib atribu
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default Harita