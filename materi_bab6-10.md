# 📘 BLUEPRINT PERENCANAAN MATERI & BANK SOAL BAB 6 - 10
## Modul Gamifikasi Nahwu: Matan Al-Ajurrumiyyah (JurumiPlay v3.4+)

Dokumen ini disusun sebagai spesifikasi teknis dan perancangan kurikulum 5 bab lanjutan (*Bab 6 s/d Bab 10*) untuk aplikasi **JurumiPlay**. Seluruh struktur data, kaidah pesantren, dan format soal dirancang 100% konsisten dengan skema produksi yang berjalan saat ini (`app.js`, `sw.js`, `api.php`, dan `panel.php`).

---

## 📑 DAFTAR ISI
1. [Peta Besar Kurikulum & Kluster Marfu'atil Asma'](#1-peta-besar-kurikulum--kluster-marfuatil-asma)
2. [Spesifikasi Teknis Skema Data JSON (Production Standard)](#2-spesifikasi-teknis-skema-data-json-production-standard)
3. [Rincian Silabus & Blueprint Level Bab 6 - 10](#3-rincian-silabus--blueprint-level-bab-6---10)
   - [Bab 6: Marfu'atil Asma' (بَابُ مَرْفُوعَاتِ الْأَسْمَاءِ)](#bab-6-marfuatil-asma-بَابُ-مَرْفُوعَاتِ-الْأَسْمَاءِ)
   - [Bab 7: Al-Fa'il (بَابُ الْفَاعِلِ)](#bab-7-al-fail-بَابُ-الْفَاعِلِ)
   - [Bab 8: Na'ibul Fa'il (بَابُ الْمَفْعُولِ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ)](#bab-8-naibul-fail-بَابُ-الْمَفْعُولِ-الَّذِي-لَمْ-يُسَمَّ-فَاعِلُهُ)
   - [Bab 9: Al-Mubtada' wal Khabar (بَابُ الْمُبْتَدَإِ وَالْخَبَرِ)](#bab-9-al-mubtada-wal-khabar-بَابُ-الْمُبْتَدَإِ-وَالْخَبَرِ)
   - [Bab 10: Al-'Awamil Ad-Dakhilah (بَابُ الْعَوَامِلِ الدَّاخِلَةِ عَلَى الْمُبْتَدَإِ وَالْخَبَرِ)](#bab-10-al-awamil-ad-dakhilah-بَابُ-الْعَوَامِلِ-الدَّاخِلَةِ-عَلَى-الْمُبْتَدَإِ-وَالْخَبَرِ)
4. [Bank Soal Komprehensif (Pertanyaan, Opsi, Kunci & Syarah)](#4-bank-soal-komprehensif-pertanyaan-opsi-kunci--syarah)
5. [Rencana Sinkronisasi & Migrasi Teknis Produksi](#5-rencana-sinkronisasi--migrasi-teknis-produksi)

---

## 1. PETA BESAR KURIKULUM & KLUSTER MARFU'ATIL ASMA'

Kelima bab ini (Bab 6 sampai 10) merupakan **Gerbang Utama Pembahasan Isim dalam Matan Al-Ajurrumiyyah**. Setelah santri memahami pondasi kalimat (*Al-Kalam*), konsep i'rab (*Al-I'rab*), tanda-tanda i'rab (*'Alamatul I'rab*), klasifikasi kata mu'rab (*Al-Mu'rabat*), dan kata kerja (*Al-Af'al*), santri kini melangkah ke **Hukum Kedudukan Kata Benda (Isim)**:

```
                      [ PETA BESAR MARFU'ATIL ASMA' ]
                                     │
      ┌──────────────────────────────┴──────────────────────────────┐
      │                                                             │
[ Bab 6: Pengantar 7 Isim ]                                  [ 7 Pilar Marfu' ]
      │                                                             │
      ├─────────────────────────────────────────────────────────────┤
      │  1. Bab 7  : Al-Fa'il (الْفَاعِلُ)                           │
      │  2. Bab 8  : Na'ibul Fa'il (نَائِبُ الْفَاعِلِ)               │
      │  3. Bab 9  : Al-Mubtada' (الْمُبْتَدَأُ)                      │
      │  4. Bab 9  : Al-Khabar (الْخَبَرُ)                          │
      │  5. Bab 10 : Isim Kaana & Saudaranya (اسْمُ كَانَ)          │
      │  6. Bab 10 : Khabar Inna & Saudaranya (خَبَرُ إِنَّ)         │
      │  7. Bab 11-14: Tawabi' lil Marfu' (Na'at, 'Athaf, dll)      │
      └─────────────────────────────────────────────────────────────┘
```

---

## 2. SPESIFIKASI TEKNIS SKEMA DATA JSON (PRODUCTION STANDARD)

Agar kompatibel penuh dengan engine game pada `app.js`, setiap file kurikulum baru (`./data/curriculum_bab6.json` s/d `./data/curriculum_bab10.json`) wajib mematuhi skema JSON berikut:

### Struktur File:
```json
{
  "chapter": {
    "id": "bab_06",
    "number": 6,
    "title_ar": "بَابُ مَرْفُوعَاتِ الْأَسْمَاءِ",
    "title_id": "Bab 6: Marfu'atil Asma'",
    "description": "Pengantar 7 posisi jabatan isim yang wajib dibaca rafa' (marfu').",
    "matan_full": "Teks Arab matan lengkap berharakat...",
    "qawaidCard": {
      "title": "Kaidah Bab Marfu'atil Asma'",
      "matanSnippet": "الْمَرْفُوعَاتُ سَبْعَةٌ...",
      "formula": "Isim Marfu' = 7 Jabatan Pokok Bahasa Arab",
      "keyTakeaways": [
        "Isim marfu' adalah kelompok isim dengan kedudukan paling terhormat dalam tata bahasa Arab.",
        "Terdapat 7 isim marfu': Fa'il, Na'ibul Fa'il, Mubtada', Khabar, Isim Kaana, Khabar Inna, dan Tawabi'."
      ]
    },
    "levels": [
      {
        "id": "level_6_1",
        "code": "6.1",
        "title": "Pengantar 7 Isim Marfu'",
        "subtitle": "Mengenal Kelompok Isim yang Wajib Rofa'",
        "titleArabic": "الْمَرْفُوعَاتُ سَبْعَةٌ",
        "type": "mcq",
        "xp": 70,
        "unlocked": true,
        "is_boss": false,
        "theory": {
          "title": "7 Isim yang Wajib Rofa'",
          "matan": "الْمَرْفُوعَاتُ سَبْعَةٌ...",
          "translation": "Isim-isim yang dirafa'kan itu ada tujuh...",
          "points": [
            {
              "label": "Definisi Isim Marfu'",
              "arabic": "الِاسْمُ الْمَرْفُوعُ",
              "desc": "Isim yang menempati jabatan gramatikal yang mengharuskannya bertanda rafa' (dhammah, alif, wawu, atau nun tetap)."
            }
          ]
        },
        "questions": [
          {
            "id": "q6_1_1",
            "type": "mcq",
            "question": "Ada berapakah jumlah isim yang wajib dibaca rafa' menurut Matan Al-Ajurrumiyyah?",
            "text_ar": "الْمَرْفُوعَاتُ سَبْعَةٌ",
            "translation": "Isim-isim yang dirafa'kan itu ada tujuh",
            "options": ["5 Isim", "7 Isim", "10 Isim", "15 Isim"],
            "correct_answer": 1,
            "explanation": "Matan Al-Ajurrumiyyah secara tegas menyebutkan: 'الْمَرْفُوعَاتُ سَبْعَةٌ' (Isim-isim yang dirafa'kan ada 7)."
          }
        ]
      }
    ]
  }
}
```

---

## 3. RINCIAN SILABUS & BLUEPRINT LEVEL BAB 6 - 10

### Bab 6: Marfu'atil Asma' (بَابُ مَرْفُوعَاتِ الْأَسْمَاءِ)
* **Teks Matan Asli**:
  > «الْمَرْفُوعَاتُ سَبْعَةٌ، وَهِيَ: الْفَاعِلُ، وَالْمَفْعُولُ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ، وَالْمُبْتَدَأُ، وَخَبَرُهُ، وَاسْمُ كَانَ وَأَخَوَاتِهَا، وَخَبَرُ إِنَّ وَأَخَوَاتِهَا، وَالتَّابِعُ لِلْمَرْفُوعِ، وَهُوَ أَرْبَعَةُ أَشْيَاءَ: النَّعْتُ، وَالْعَطْفُ، وَالتَّوْكِيدُ، وَالْبَدَلُ.»
* **Peta Level Gamifikasi**:
  * **Level 6.1 (Kode 6.1)**: *7 Pilar Kemuliaan Isim* — Menguasai daftar 7 isim marfu'.
  * **Level 6.2 (Kode 6.2)**: *Mengenal Isim Mandiri vs Isim Pengikut (Tawabi')* — Membedakan marfu' karena jabatan asli vs marfu' karena ikut kata sebelumnya (*Na'at, 'Athaf, Taukid, Badal*).
  * **Level 6.3 (Kode 6.3)**: *Deteksi Cepat Harakat Akhir* — Mengidentifikasi tanda rafa' (Dhammah, Alif, Wawu) pada masing-masing posisi marfu'.
  * **Level 6.4 (Kode 6.4 — Boss Battle)**: *Ujian Gerbang Marfu'at* — 10 soal komprehensif menguji pemilahan isim marfu' dalam ayat dan kalimat fushha (Syarat lulus: minimal 7/10 bintang).

---

### Bab 7: Al-Fa'il (بَابُ الْفَاعِلِ)
* **Teks Matan Asli**:
  > «الْفَاعِلُ هُوَ: الِاسْمُ الْمَرْفُوعُ الْمَذْكُورُ قَبْلَهُ فِعْلُهُ. وَهُوَ عَلَى قِسْمَيْنِ: ظَاهِرٍ، وَمُضْمَرٍ. فَالظَّاهِرُ نَحْوُ قَوْلِكَ: قَامَ زَيْدٌ، وَيَقُومُ زَيْدٌ، وَقَامَ الزَّيْدَانِ، وَيَقُومُ الزَّيْدَانِ، وَقَامَ الزَّيْدُونَ، وَيَقُومُ الزَّيْدُونَ، وَقَامَ الرِّجَالُ، وَيَقُومُ الرِّجَالُ، وَقَامَتْ هِنْدٌ، وَتَقُومُ هِنْدٌ... وَالْمُضْمَرُ اثْنَا عَشَرَ، نَحْوُ قَوْلِكَ: ضَرَبْتُ، وَضَرَبْنَا، وَضَرَبْتَ، وَضَرَبْتِ، وَضَرَبْتُمَا، وَضَرَبْتُمْ، وَضَرَبْتُنَّ، وَضَرَبَ، وَضَرَبَتْ، وَضَرَبَا، وَضَرَبُوا، وَضَرَبْنَ.»
* **Kaidah Utama Pesantren**:
  1. Fa'il **wajib marfu'**.
  2. Fa'il **wajib jatuh setelah fi'il ma'lum** (kata kerja aktif). Jika isim diletakkan di depan fi'il (contoh: *Zaidun qama*), maka *Zaidun* berkedudukan sebagai **Mubtada'**, sedangkan fa'ilnya adalah dhamir mustatir (*huwa*).
  3. Fi'il **tetap mufrad** meskipun fa'ilnya mutsanna atau jamak (*Qama az-zaidani*, bukan *Qamaa az-zaidani*).
* **Peta Level Gamifikasi**:
  * **Level 7.1 (Kode 7.1)**: *Rukun Fa'il: Pelaku di Balik Perbuatan* — Definisi dan syarat mutlak fi'il mendahului fa'il.
  * **Level 7.2 (Kode 7.2)**: *Fa'il Isim Zhahir (12 Variasi Bentuk)* — Mufrad, Mutsanna, Jamak Mudzakkar/Muannats Salim, Jamak Taksir, Asma'ul Khamsah.
  * **Level 7.3 (Kode 7.3)**: *Kaidah Ketetapan Fi'il* — Mengapa fi'il tidak boleh dijamakkan ketika fa'ilnya jamak? (*Lughat Fushha*).
  * **Level 7.4 (Kode 7.4)**: *Fa'il Isim Dhamir (12 Dhamir Muttashil)* — Ta' Fa'il, Naa, Wawu Jama'ah, Alif Itsnain, Nun Inats.
  * **Level 7.5 (Kode 7.5)**: *Fa'il Dhamir Mustatir (Terselubung)* — Membedakan dhamir mustatir wujuban (pada fi'il amr/mudhari' ana-nahnu) vs jawazan (huwa/hiya).
  * **Level 7.6 (Kode 7.6 — Boss Battle)**: *Tantangan Sang Pelaku (Boss Al-Fa'il)* — Analisis i'rab mendalam tarkib Fi'il + Fa'il.

---

### Bab 8: Na'ibul Fa'il (بَابُ الْمَفْعُولِ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ)
* **Teks Matan Asli**:
  > «وَهُوَ الِاسْمُ الْمَرْفُوعُ الَّذِي لَمْ يُذْكَرْ مَعَهُ فَاعِلُهُ. فَإِنْ كَانَ الْفِعْلُ مَاضِيًا ضُمَّ أَوَّلُهُ وَكُسِرَ مَا قَبْلَ آخِرِهِ، وَإِنْ كَانَ مُضَارِعًا ضُمَّ أَوَّلُهُ وَفُتِحَ مَا قَبْلَ آخِرِهِ. وَهُوَ عَلَى قِسْمَيْنِ: ظَاهِرٍ، وَمُضْمَرٍ...»
* **Kaidah Utama Pesantren**:
  1. Fa'il asli dibuang karena: tujuan meringkas, sudah maklum (*khalqan*), memuliakan/menjaga fa'il, atau karena tidak diketahui pelakunya.
  2. **Maf'ul bih diangkat statusnya menggantikan fa'il**: dari asalnya berharakat fathah (manshub) menjadi berharakat dhammah (marfu').
  3. **Rumus Pasif (Bina' Majhul)**:
     - **Fi'il Madhi**: Huruf pertama didhommahkan, satu huruf sebelum akhir dikasrahkan ($\text{Madhi} \rightarrow \text{Dhumma awwaluhu wa kusira ma qabla akhirih}$, contoh: ضَرَبَ $\rightarrow$ ضُرِبَ).
     - **Fi'il Mudhari'**: Huruf pertama didhommahkan, satu huruf sebelum akhir difathahkan ($\text{Mudhari'} \rightarrow \text{Dhumma awwaluhu wa futiha ma qabla akhirih}$, contoh: يَضْرِبُ $\rightarrow$ يُضْرَبُ).
* **Peta Level Gamifikasi**:
  * **Level 8.1 (Kode 8.1)**: *Konsep Na'ibul Fa'il: Dari Korban Menjadi Wakil* — Pengertian objek penderita yang naik jabatan.
  * **Level 8.2 (Kode 8.2)**: *Rumus Merubah Fi'il Madhi Majhul* — Latihan transformasi wazan kata kerja lampau aktif ke pasif.
  * **Level 8.3 (Kode 8.3)**: *Rumus Merubah Fi'il Mudhari' Majhul* — Latihan transformasi wazan kata kerja sekarang/akan datang ke pasif.
  * **Level 8.4 (Kode 8.4)**: *Na'ibul Fa'il Zhahir vs Mudhmar* — 12 bentuk dhamir na'ibul fa'il (*duribtu, duribna, dst.*).
  * **Level 8.5 (Kode 8.5 — Boss Battle)**: *Tantangan Kalimat Pasif (Boss Na'ibul Fa'il)* — Uji coba membedakan fa'il vs na'ibul fa'il secara instan.

---

### Bab 9: Al-Mubtada' wal Khabar (بَابُ الْمُبْتَدَإِ وَالْخَبَرِ)
* **Teks Matan Asli**:
  > «الْمُبْتَدَأُ: هُوَ الِاسْمُ الْمَرْفُوعُ الْعَارِي عَنِ الْعَوَامِلِ اللَّفْظِيَّةِ. وَالْخَبَرُ: هُوَ الِاسْمُ الْمَرْفُوعُ الْمُسْنَدُ إِلَيْهِ، نَحْوُ قَوْلِكَ: «زَيْدٌ قَائِمٌ» وَ«الزَّيْدَانِ قَائِمَانِ» وَ«الزَّيْدُونَ قَائِمُونَ». وَالْمُبْتَدَأُ قِسْمَانِ: ظَاهِرٌ، وَمُضْمَرٌ... وَالْخَبَرُ قِسْمَانِ: مُفْرَدٌ، وَغَيْرُ مُفْرَدٍ. فَالْمُفْرَدُ نَحْوُ: «زَيْدٌ قَائِمٌ». وَغَيْرُ الْمُفْرَدِ أَرْبَعَةُ أَشْيَاءَ: الْجَارُّ وَالْمَجْرُورُ، وَالظَّرْفُ، وَالْفِعْلُ مَعَ فَاعِلِهِ، وَالْمُبْتَدَأُ مَعَ خَبَرِهِ...»
* **Kaidah Utama Pesantren**:
  1. **Mubtada'**: Isim marfu' yang sunyi dari amil lafzhi (di-rafa'kan oleh amil ma'nawi: *al-Ibtida'*).
  2. **Khabar**: Isim marfu' yang melengkapi makna mubtada' (menjadikan kalimat sempurna / berfaedah).
  3. **Khabar Mufrad dalam Bab Ini**: Bukan berarti kata tunggal lawannya dual/jamak, melainkan kata yang **bukan berupa jumlah (kalimat) dan bukan syibhul jumlah (serupa kalimat)**. (*Az-Zaiduna Qaimuna* tetap khabar mufrad!).
  4. **Khabar Ghairu Mufrad (4 Macam)**:
     - *Syibhul Jumlah*: Jar-Majrur (زَيْدٌ فِي الدَّارِ) & Zhorof (زَيْدٌ عِنْدَكَ).
     - *Jumlah*: Fi'liyyah (زَيْدٌ قَامَ أَبُوهُ) & Ismiyyah (زَيْدٌ جَارِيَتُهُ ذَاهِبَةٌ).
* **Peta Level Gamifikasi**:
  * **Level 9.1 (Kode 9.1)**: *Mubtada': Subjek Pembuka Tanpa Amil Lafzhi* — Konsep amil ma'nawi ibtida'.
  * **Level 9.2 (Kode 9.2)**: *Khabar: Sang Penyempurna Faedah* — Kaidah kecocokan gender (*mudzakkar/muannats*) dan bilangan (*mufrad/tatsniyah/jamak*).
  * **Level 9.3 (Kode 9.3)**: *Mubtada' Dhamir Munfashil (12 Dhamir Mandiri)* — *Ana, Nahnu, Anta, Anti, Huwa, Hiya, dst.*
  * **Level 9.4 (Kode 9.4)**: *Khabar Mufrad: Bedah Definisi Unik* — Memahami makna 'mufrad' khusus dalam bab mubtada'-khabar.
  * **Level 9.5 (Kode 9.5)**: *Khabar Syibhul Jumlah (Jar-Majrur & Zhorof)* — Kalimat nominal dengan keterangan tempat/kondisi.
  * **Level 9.6 (Kode 9.6)**: *Khabar Jumlah (Jumlah Fi'liyyah & Ismiyyah)* — Kalimat di dalam kalimat (*Nested Sentence*).
  * **Level 9.7 (Kode 9.7 — Boss Battle)**: *Arsitektur Jumlah Ismiyyah (Boss Mubtada' Khabar)* — Bongkar pasang struktur kalimat nominal Arab.

---

### Bab 10: Al-'Awamil Ad-Dakhilah (بَابُ الْعَوَامِلِ الدَّاخِلَةِ عَلَى الْمُبْتَدَإِ وَالْخَبَرِ)
* **Teks Matan Asli**:
  > «وَهِيَ ثَلَاثَةُ أَشْيَاءَ: كَانَ وَأَخَوَاتُهَا، وَإِنَّ وَأَخَوَاتُهَا، وَظَنَنْتُ وَأَخَوَاتُهَا. فَأَمَّا كَانَ وَأَخَوَاتُهَا: فَإِنَّهَا تَرْفَعُ الِاسْمَ، وَتَنْصِبُ الْخَبَرَ... وَأَمَّا إِنَّ وَأَخَوَاتُهَا: فَإِنَّهَا تَنْصِبُ الِاسْمَ وَتَرْفَعُ الْخَبَرَ... وَأَمَّا ظَنَنْتُ وَأَخَوَاتُهَا: فَإِنَّهَا تَنْصِبُ الْمُبْتَدَأَ وَالْخَبَرَ عَلَى أَنَّهُمَا مَفْعُولَانِ لَهَا...»
* **Kaidah Utama Pesantren (Tiga Pasukan Nawasikh)**:
  1. **Nawasikh** artinya perusak/pengubah hukum asal mubtada' dan khabar.
  2. **Kelompok 1: Kaana wa Akhawatuha (كَانَ وَأَخَوَاتُهَا)**:
     - Rumus: $\text{Tarfa'ul Isma wa Tanshibul Khabar}$ (Merofa'kan Isim, Menashabkan Khabar).
     - Contoh: كَانَ زَيْدٌ قَائِمًا (*Kaana Zaidun Qaa'iman*).
     - Saudara Kaana: *Kaana, Amsaa, Ashbaha, Adh-haa, Zhalla, Baata, Shaara, Laisa, Ma Zaala, Ma Infakka, Ma Fati'a, Ma Bariha, Ma Daama*.
  3. **Kelompok 2: Inna wa Akhawatuha (إِنَّ وَأَخَوَاتُهَا)**:
     - Rumus: $\text{Tanshibul Isma wa Tarfa'ul Khabar}$ (Menashabkan Isim, Merofa'kan Khabar — kebalikan Kaana).
     - Contoh: إِنَّ زَيْدًا قَائِمٌ (*Inna Zaidan Qaa'imun*).
     - Saudara Inna: *Inna, Anna* (Taukid), *Lakinna* (Istidrak), *Ka'anna* (Tasybih), *Laita* (Tamanni), *La'alla* (Taraji/Tawaqqu').
  4. **Kelompok 3: Zhanna wa Akhawatuha (ظَنَنْتُ وَأَخَوَاتُهَا)**:
     - Rumus: $\text{Tanshibul Mubtada'a wal Khabara 'ala annahuma maf'ulani laha}$ (Menashabkan kedua-duanya sebagai 2 Maf'ul Bih).
     - Contoh: ظَنَنْتُ زَيْدًا قَائِمًا (*Zhanantu Zaidan Qaa'iman*).
* **Peta Level Gamifikasi**:
  * **Level 10.1 (Kode 10.1)**: *Tiga Pasukan Nawasikh: Sang Pengubah Takdir Kalimat* — Peta perbandingan Kaana vs Inna vs Zhanna.
  * **Level 10.2 (Kode 10.2)**: *Kaana wa Akhawatuha: Merofa'kan Isim, Menashabkan Khabar* — Latihan i'rab isim kaana & khabar kaana.
  * **Level 10.3 (Kode 10.3)**: *Arti & Karakteristik Saudara-saudara Kaana* — Waktu pagi (*ashbaha*), sore (*amsaa*), peniadaan (*laisa*), perubahan (*shaara*), kontinuitas (*ma zaala*).
  * **Level 10.4 (Kode 10.4)**: *Inna wa Akhawatuha: Menashabkan Isim, Merofa'kan Khabar* — Hukum dan faedah makna (Taukid, Tasybih, Tamanni, dll).
  * **Level 10.5 (Kode 10.5)**: *Zhanna wa Akhawatuha: Menguasai Dua Objek Sekaligus* — Af'alul Qulub & Tahwil.
  * **Level 10.6 (Kode 10.6 — Boss Battle)**: *Khatam Marfu'atil Asma' (Boss Nawasikh)* — Tantangan pamungkas menganalisis teks Arab gundul dengan amil perubah.

---

## 4. BANK SOAL KOMPREHENSIF (PERTANYAAN, OPSI, KUNCI & SYARAH)

Berikut adalah kurasi bank soal siap pakai untuk setiap bab, lengkap dengan transliterasi, opsi jawaban, indeks jawaban benar (0-indexed), dan syarah penjelasan mendalam:

### [BANK SOAL BAB 6: MARFU'ATIL ASMA']
```json
[
  {
    "id": "q6_1_1",
    "type": "mcq",
    "question": "Berapakah jumlah isim yang masuk ke dalam kelompok Marfu'atil Asma' (isim-isim yang wajib dibaca rafa')?",
    "text_ar": "الْمَرْفُوعَاتُ سَبْعَةٌ",
    "translation": "Isim-isim yang dirafa'kan itu ada tujuh",
    "options": ["5 Posisi", "7 Posisi", "10 Posisi", "15 Posisi"],
    "correct_answer": 1,
    "explanation": "Teks Matan Al-Ajurrumiyyah menyatakan dengan gamblang: 'الْمَرْفُوعَاتُ سَبْعَةٌ' (Isim-isim yang wajib rafa' ada 7 macam)."
  },
  {
    "id": "q6_1_2",
    "type": "mcq",
    "question": "Manakah di bawah ini yang BUKAN termasuk salah satu dari 7 isim marfu'?",
    "text_ar": "الْفَاعِلُ، الْمَفْعُولُ بِهِ، الْمُبْتَدَأُ، اسْمُ كَانَ",
    "translation": "Fa'il, Maf'ul Bih, Mubtada', Isim Kaana",
    "options": ["Al-Fa'il (الْفَاعِلُ)", "Al-Maf'ul Bih (الْمَفْعُولُ بِهِ)", "Al-Mubtada' (الْمُبْتَدَأُ)", "Isim Kaana (اسْمُ كَانَ)"],
    "correct_answer": 1,
    "explanation": "Al-Maf'ul Bih termasuk kelompok Manshubatil Asma' (wajib fathah/nashab sebagai objek penderita), bukan isim marfu'."
  },
  {
    "id": "q6_2_1",
    "type": "mcq",
    "question": "Kelompok kata pengikut yang ikut dibaca rafa' jika kata sebelumnya berharakat rafa' disebut...",
    "text_ar": "وَالتَّابِعُ لِلْمَرْفُوعِ، وَهُوَ أَرْبَعَةُ أَشْيَاءَ",
    "translation": "Dan kata yang mengikuti isim marfu', yaitu ada empat perkara",
    "options": ["Al-Manshubat", "At-Tawabi' lil Marfu'", "Al-Majrurat", "Al-Af'alul Khamsah"],
    "correct_answer": 1,
    "explanation": "At-Tabi' (jamaknya At-Tawabi') adalah kata yang i'rabnya mengekor pada matbu' (kata yang diikutinya). Ada 4: Na'at (sifat), 'Athaf (sambung), Taukid (penegas), dan Badal (pengganti)."
  }
]
```

### [BANK SOAL BAB 7: AL-FA'IL]
```json
[
  {
    "id": "q7_1_1",
    "type": "mcq",
    "question": "Apakah definisi Fa'il menurut kaidah Matan Al-Ajurrumiyyah?",
    "text_ar": "الْفَاعِلُ هُوَ: الِاسْمُ الْمَرْفُوعُ الْمَذْكُورُ قَبْلَهُ فِعْلُهُ",
    "translation": "Fa'il adalah isim marfu' yang disebutkan fi'il sebelum dirinya",
    "options": [
      "Isim manshub yang menjadi sasaran perbuatan",
      "Isim marfu' yang disebutkan kata kerjanya (fi'il) sebelum dirinya",
      "Kata kerja yang terjadi di masa lampau",
      "Isim pembuka kalimat yang sunyi dari amil lafzhi"
    ],
    "correct_answer": 1,
    "explanation": "Syarat mutlak Fa'il menurut Ibnu Ajurrum: harus berupa isim, berstatus marfu', dan letaknya jatuh setelah kata kerjanya (fi'il ma'lum)."
  },
  {
    "id": "q7_1_2",
    "type": "mcq",
    "question": "Pada kalimat 'جَاءَ زَيْدٌ' (Zaid telah datang), apakah kedudukan i'rab dari kata 'زَيْدٌ'?",
    "text_ar": "جَاءَ زَيْدٌ",
    "translation": "Zaid telah datang",
    "options": [
      "Maf'ul Bih berharakat fathah",
      "Fa'il marfu' dengan tanda rafa' dhammah zhahirah",
      "Mubtada' marfu' dengan tanda rafa' alif",
      "Khabar marfu' dengan tanda rafa' wawu"
    ],
    "correct_answer": 1,
    "explanation": "'زَيْدٌ' adalah Fa'il (pelaku kedatangan) dari fi'il 'جَاءَ', berstatus marfu' bertanda dhammah zhahirah di huruf dal karena berupa Isim Mufrad."
  },
  {
    "id": "q7_2_1",
    "type": "mcq",
    "question": "Perhatikan kalimat: 'حَضَرَ الْمُسْلِمُونَ'. Apakah tanda rafa' pada fa'il 'الْمُسْلِمُونَ'?",
    "text_ar": "حَضَرَ الْمُسْلِمُونَ",
    "translation": "Orang-orang muslim itu telah hadir",
    "options": ["Dhammah", "Alif", "Wawu", "Nun"],
    "correct_answer": 2,
    "explanation": "'الْمُسْلِمُونَ' adalah fa'il marfu'. Karena bentuk katanya adalah Jamak Mudzakkar Salim, maka tanda rafa' pengganti dhammah adalah huruf Wawu (و)."
  },
  {
    "id": "q7_3_1",
    "type": "mcq",
    "question": "Bagaimanakah kaidah bentuk fi'il yang benar jika fa'il isim zhahirnya berbentuk jamak menurut bahasa fushha?",
    "text_ar": "قَامَ الرِّجَالُ أَمْ قَامُوا الرِّجَالُ؟",
    "translation": "Qama ar-rijalu atau Qamu ar-rijalu?",
    "options": [
      "Fi'il wajib ikut berharakat dan berwazan jamak (قَامُوا الرِّجَالُ)",
      "Fi'il tetap harus berbentuk mufrad (قَامَ الرِّجَالُ)",
      "Boleh memilih bebas tanpa aturan",
      "Fi'il wajib berubah menjadi isim"
    ],
    "correct_answer": 1,
    "explanation": "Kaidah nahwu fushha (jumhur ulama): Jika fa'ilnya isim zhahir (baik mufrad, mutsanna, maupun jamak), maka fi'il di depannya wajib selalu berstatus mufrad: 'قَامَ الرِّجَالُ'."
  },
  {
    "id": "q7_4_1",
    "type": "mcq",
    "question": "Pada kata kerja 'كَتَبْتُ' (aku telah menulis), di manakah letak fa'ilnya?",
    "text_ar": "كَتَبْتُ الدَّرْسَ",
    "translation": "Aku telah menulis pelajaran itu",
    "options": [
      "Fa'ilnya adalah kata ad-darsa",
      "Fa'ilnya adalah huruf Ta' (تُ) dhamir muttashil mabni dhammah",
      "Fa'ilnya tersembunyi bersembunyi (mustatir)",
      "Tidak ada fa'ilnya sama sekali"
    ],
    "correct_answer": 1,
    "explanation": "Huruf Ta' berharakat dhommah (تُ) adalah Ta' Fa'il (dhamir bariz muttashil) yang menduduki posisi rafa' sebagai pelaku (mutakallim wahdah / saya)."
  }
]
```

### [BANK SOAL BAB 8: NA'IBUL FA'IL]
```json
[
  {
    "id": "q8_1_1",
    "type": "mcq",
    "question": "Apa yang dimaksud dengan 'Na'ibul Fa'il' (atau Al-Maf'ul alladzi lam yusamma fa'iluh)?",
    "text_ar": "الِاسْمُ الْمَرْفُوعُ الَّذِي لَمْ يُذْكَرْ مَعَهُ فَاعِلُهُ",
    "translation": "Isim marfu' yang tidak disebutkan bersamanya fa'il aslinya",
    "options": [
      "Objek penderita yang dibaca fathah",
      "Isim marfu' pengganti fa'il yang dihapus dalam kalimat pasif",
      "Kata kerja bantu pengubah makna",
      "Huruf sambung penjelas sebab akibat"
    ],
    "correct_answer": 1,
    "explanation": "Na'ibul fa'il asalnya adalah Maf'ul Bih (objek). Ketika fa'il aslinya dihapus dari susunan kalimat, maf'ul bih diangkat menggantikan posisi fa'il sehingga hukum i'rabnya berubah menjadi marfu'."
  },
  {
    "id": "q8_2_1",
    "type": "mcq",
    "question": "Bagaimanakah rumus merubah Fi'il Madhi aktif (ma'lum) menjadi pasif (majhul)?",
    "text_ar": "فَإِنْ كَانَ الْفِعْلُ مَاضِيًا ضُمَّ أَوَّلُهُ وَكُسِرَ مَا قَبْلَ آخِرِهِ",
    "translation": "Jika fi'il madhi, maka didhommahkan awalnya dan dikasrahkan huruf sebelum akhirnya",
    "options": [
      "Difathahkan awalnya dan didhommahkan akhirnya",
      "Didhommahkan huruf pertama dan dikasrahkan huruf sebelum akhir",
      "Disukunkan huruf pertama dan difathahkan akhirnya",
      "Ditambahkan huruf sin dan hamzah di depan"
    ],
    "correct_answer": 1,
    "explanation": "Rumus fi'il madhi majhul menurut matan: 'ضُمَّ أَوَّلُهُ وَكُسِرَ مَا قَبْلَ آخِرِهِ' (huruf awal didhommah, huruf sebelum akhir dikasrah), seperti: كَتَبَ menjadi كُتِبَ."
  },
  {
    "id": "q8_2_2",
    "type": "mcq",
    "question": "Bila kalimat aktif 'فَتَحَ عَلِيٌّ الْبَابَ' (Ali membuka pintu) dirubah menjadi kalimat pasif (majhul), bagaimanakah susunan yang benar?",
    "text_ar": "فَتَحَ عَلِيٌّ الْبَابَ ➔ ...",
    "translation": "Fataha 'Aliyyun al-baaba ➔ ...",
    "options": [
      "فُتِحَ الْبَابَ (Futiha al-baaba)",
      "فُتِحَ الْبَابُ (Futiha al-baabu)",
      "يَفْتَحُ الْبَابُ (Yaftahu al-baabu)",
      "فَتَحَ الْبَابُ (Fataha al-baabu)"
    ],
    "correct_answer": 1,
    "explanation": "Fa'il (عَلِيٌّ) dihapus, kata kerja madhi diubah ke majhul menjadi 'فُتِحَ' (dhommah awal, kasrah sebelum akhir), dan objek 'الْبَابَ' naik pangkat menjadi na'ibul fa'il marfu' 'الْبَابُ'."
  },
  {
    "id": "q8_3_1",
    "type": "mcq",
    "question": "Bagaimanakah rumus merubah Fi'il Mudhari' aktif menjadi majhul (pasif)?",
    "text_ar": "وَإِنْ كَانَ مُضَارِعًا ضُمَّ أَوَّلُهُ وَفُتِحَ مَا قَبْلَ آخِرِهِ",
    "translation": "Jika fi'il mudhari', didhommahkan awalnya dan difathahkan sebelum akhirnya",
    "options": [
      "Didhommahkan awalnya dan difathahkan huruf sebelum akhirnya",
      "Dikasrahkan awalnya dan didhommahkan sebelum akhirnya",
      "Disukunkan huruf mudhara'ahnya",
      "Dihapus huruf terakhirnya"
    ],
    "correct_answer": 0,
    "explanation": "Kaidah matan untuk mudhari' majhul: 'ضُمَّ أَوَّلُهُ وَفُتِحَ مَا قَبْلَ آخِرِهِ' (dhommah huruf awal, fathah huruf sebelum akhir), seperti: يَضْرِبُ menjadi يُضْرَبُ."
  }
]
```

### [BANK SOAL BAB 9: AL-MUBTADA' WAL KHABAR]
```json
[
  {
    "id": "q9_1_1",
    "type": "mcq",
    "question": "Apakah yang dimaksud dengan Al-Mubtada' menurut Matan Al-Ajurrumiyyah?",
    "text_ar": "الْمُبْتَدَأُ هُوَ: الِاسْمُ الْمَرْفُوعُ الْعَارِي عَنِ الْعَوَامِلِ اللَّفْظِيَّةِ",
    "translation": "Mubtada' adalah isim marfu' yang sunyi dari amil-amil lafzhi",
    "options": [
      "Isim marfu' yang didahului oleh kata kerja aktif",
      "Isim marfu' yang sunyi/bebas dari amil-amil lafzhi",
      "Isim manshub yang menjelaskan tempat terjadinya peristiwa",
      "Kata sambung penjelas syarat dan ketentuan"
    ],
    "correct_answer": 1,
    "explanation": "Mubtada' adalah isim marfu' pembuka kalimat yang tidak dimasuki amil yang berwujud ucapan lafazh (amil lafzhi). Ia dirafa'kan oleh amil ma'nawi bernama 'Ibtida'."
  },
  {
    "id": "q9_1_2",
    "type": "mcq",
    "question": "Pada kalimat 'الْعِلْمُ نُورٌ' (Ilmu itu adalah cahaya), apakah jabatan kata 'نُورٌ'?",
    "text_ar": "الْعِلْمُ نُورٌ",
    "translation": "Ilmu itu adalah cahaya",
    "options": [
      "Fa'il dari kata al-'ilmu",
      "Khabar marfu' yang menyempurnakan makna mubtada'",
      "Maf'ul bih penjelas objek",
      "Na'at penyifatan"
    ],
    "correct_answer": 1,
    "explanation": "'نُورٌ' adalah Khabar marfu' bertanda dhammah yang bersandar pada mubtada' 'الْعِلْمُ' sehingga membentuk kalimat utuh dan berfaedah tuntas."
  },
  {
    "id": "q9_4_1",
    "type": "mcq",
    "question": "Pada kalimat 'الْمُعَلِّمُونَ حَاضِرُونَ' (Para guru itu hadir), apakah jenis khabar dari kata 'حَاضِرُونَ'?",
    "text_ar": "الْمُعَلِّمُونَ حَاضِرُونَ",
    "translation": "Para guru itu hadir",
    "options": [
      "Khabar Jumlah Fi'liyyah",
      "Khabar Mufrad",
      "Khabar Syibhul Jumlah",
      "Khabar Jumlah Ismiyyah"
    ],
    "correct_answer": 1,
    "explanation": "Meskipun kata 'حَاضِرُونَ' berbentuk jamak mudzakkar salim, dalam bab ini ia tetap disebut 'Khabar Mufrad' karena bukan berupa kalimat (jumlah) dan bukan serupa kalimat (syibhul jumlah)."
  },
  {
    "id": "q9_5_1",
    "type": "mcq",
    "question": "Pada kalimat 'الْأُسْتَاذُ فِي الْفَصْلِ' (Guru itu di dalam kelas), jenis khabarnya adalah...",
    "text_ar": "الْأُسْتَاذُ فِي الْفَصْلِ",
    "translation": "Guru itu di dalam kelas",
    "options": [
      "Khabar Mufrad",
      "Khabar Syibhul Jumlah (Jar dan Majrur)",
      "Khabar Jumlah Fi'liyyah",
      "Khabar Zharaf Zaman"
    ],
    "correct_answer": 1,
    "explanation": "'فِي الْفَصْلِ' tersusun dari huruf jar (فِي) dan isim majrur (الْفَصْلِ). Susunan ini dinamakan Syibhul Jumlah (Jar-Majrur) yang menempati posisi rafa' sebagai khabar."
  },
  {
    "id": "q9_6_1",
    "type": "mcq",
    "question": "Manakah contoh kalimat yang khabarnya berupa 'Jumlah Fi'liyyah' (kata kerja beserta pelakunya)?",
    "text_ar": "مِثَالُ الْخَبَرِ جُمْلَةً فِعْلِيَّةً",
    "translation": "Contoh khabar jumlah fi'liyyah",
    "options": [
      "زَيْدٌ قَائِمٌ (Zaid berdiri)",
      "زَيْدٌ عِنْدَكَ (Zaid di sisimu)",
      "زَيْدٌ يَقْرَأُ الْقُرْآنَ (Zaid sedang membaca Al-Qur'an)",
      "زَيْدٌ فِي الْمَسْجِدِ (Zaid di dalam masjid)"
    ],
    "correct_answer": 2,
    "explanation": "Pada kalimat 'زَيْدٌ يَقْرَأُ الْقُرْآنَ', kata 'يَقْرَأُ' adalah fi'il mudhari' yang mengandung fa'il dhamir mustatir (huwa). Gabungan fi'il + fa'il ini membentuk Jumlah Fi'liyyah yang menjadi khabar bagi 'زَيْدٌ'."
  }
]
```

### [BANK SOAL BAB 10: AL-'AWAMIL AD-DAKHILAH (NAWASIKH)]
```json
[
  {
    "id": "q10_1_1",
    "type": "mcq",
    "question": "Apakah tugas/fungsi amil dari kelompok 'كَانَ وَأَخَوَاتُهَا' terhadap Mubtada' dan Khabar?",
    "text_ar": "فَإِنَّهَا تَرْفَعُ الِاسْمَ وَتَنْصِبُ الْخَبَرَ",
    "translation": "Maka sesungguhnya ia merafa'kan isim dan menashabkan khabar",
    "options": [
      "Menashabkan isim dan merafa'kan khabar",
      "Merafa'kan isim dan menashabkan khabar",
      "Menashabkan kedua-duanya sekaligus",
      "Menjazamkan kedua-duanya sekaligus"
    ],
    "correct_answer": 1,
    "explanation": "Kaidah paten Kaana wa akhawatuha: 'تَرْفَعُ الِاسْمَ وَتَنْصِبُ الْخَبَرَ' (Merafa'kan isimnya, dan menashabkan khabarnya), contoh: كَانَ زَيْدٌ قَائِمًا."
  },
  {
    "id": "q10_1_2",
    "type": "mcq",
    "question": "Jika kalimat 'الْجَوُّ بَارِدٌ' (Udara itu dingin) dimasuki kata 'كَانَ', bagaimanakah harakat akhirnya yang benar?",
    "text_ar": "الْجَوُّ بَارِدٌ ➔ كَانَ ...",
    "translation": "Al-jawwu baaridun ➔ Kaana ...",
    "options": [
      "كَانَ الْجَوَّ بَارِدٌ (Kaana al-jawwa baaridun)",
      "كَانَ الْجَوُّ بَارِدًا (Kaana al-jawwu baaridan)",
      "كَانَ الْجَوَّ بَارِدًا (Kaana al-jawwa baaridan)",
      "كَانَ الْجَوُّ بَارِدٌ (Kaana al-jawwu baaridun)"
    ],
    "correct_answer": 1,
    "explanation": "'كَانَ' menjadikan mubtada' tetap marfu' sebagai Isim Kaana ('الْجَوُّ'), dan mengubah khabar menjadi manshub berharakat fathatain sebagai Khabar Kaana ('بَارِدًا')."
  },
  {
    "id": "q10_2_1",
    "type": "mcq",
    "question": "Manakah di antara kata berikut yang merupakan salah satu saudara 'كَانَ' yang bermakna peniadaan (negasi)?",
    "text_ar": "أَخَوَاتُ كَانَ لِلنَّفْيِ",
    "translation": "Saudara kaana untuk negasi",
    "options": ["أَصْبَحَ (Ashbaha)", "صَارَ (Shaara)", "لَيْسَ (Laisa)", "ظَلَّ (Zhalla)"],
    "correct_answer": 2,
    "explanation": "'لَيْسَ' adalah fi'il jamid dari saudara Kaana yang berfungsi menunjukkan makna nafi (peniadaan / bukan / tidak), contoh: 'لَيْسَ زَيْدٌ كَاذِبًا' (Zaid bukanlah seorang pembohong)."
  },
  {
    "id": "q10_3_1",
    "type": "mcq",
    "question": "Apakah tugas/fungsi amil dari kelompok 'إِنَّ وَأَخَوَاتُهَا' terhadap kalimat isim?",
    "text_ar": "فَإِنَّهَا تَنْصِبُ الِاسْمَ وَتَرْفَعُ الْخَبَرَ",
    "translation": "Maka sesungguhnya ia menashabkan isim dan merafa'kan khabar",
    "options": [
      "Merafa'kan isim dan menashabkan khabar",
      "Menashabkan isim dan merafa'kan khabar",
      "Menjazamkan isim dan khabar",
      "Menjadikan keduanya dibaca kasrah"
    ],
    "correct_answer": 1,
    "explanation": "Inna wa akhawatuha bekerja berkebalikan persis dengan Kaana: 'تَنْصِبُ الِاسْمَ وَتَرْفَعُ الْخَبَرَ' (Menashabkan isim dan merafa'kan khabar), contoh: 'إِنَّ اللَّهَ غَفُورٌ'."
  },
  {
    "id": "q10_3_2",
    "type": "mcq",
    "question": "Apakah fungsi makna (faedah balaghah) dari huruf 'كَأَنَّ' (Ka-anna) dari saudara Inna?",
    "text_ar": "وَمَعْنَى كَأَنَّ ...",
    "translation": "Dan makna ka-anna adalah ...",
    "options": [
      "Lit-Taukid (penguat pernyataan)",
      "Lit-Tasybih (penyerupaan / bagaikan)",
      "Lil-Istidrak (memperbaiki pemahaman / tetapi)",
      "Lit-Tamanni (mengharap hal mustahil)"
    ],
    "correct_answer": 1,
    "explanation": "Matan Al-Ajurrumiyyah merinci: 'وَكَأَنَّ لِلتَّشْبِيهِ' (dan Ka'anna bermakna penyerupaan / tasybih), contoh: 'كَأَنَّ الْعِلْمَ نُورٌ' (Bagaikan ilmu itu adalah cahaya)."
  },
  {
    "id": "q10_4_1",
    "type": "mcq",
    "question": "Apakah amalan yang dilakukan oleh kelompok 'ظَنَنْتُ وَأَخَوَاتُهَا' (Zhanna dan saudaranya)?",
    "text_ar": "تَنْصِبُ الْمُبْتَدَأَ وَالْخَبَرَ عَلَى أَنَّهُمَا مَفْعُولَانِ لَهَا",
    "translation": "Menashabkan mubtada' dan khabar sebagai dua maf'ul baginya",
    "options": [
      "Merafa'kan mubtada' dan menashabkan khabar",
      "Menashabkan mubtada' dan merafa'kan khabar",
      "Menashabkan Mubtada' dan Khabar kedua-duanya sekaligus sebagai 2 Maf'ul",
      "Menjadikan salah satunya berharakat sukun"
    ],
    "correct_answer": 2,
    "explanation": "Zhanna wa akhawatuha (Af'alul Qulub / kata kerja keyakinan & dugaan) menashabkan mubtada' sebagai Maf'ul Pertama dan menashabkan khabar sebagai Maf'ul Kedua: 'ظَنَنْتُ زَيْدًا صَادِقًا'."
  }
]
```

---

## 5. RENCANA SINKRONISASI & MIGRASI TEKNIS PRODUKSI

Ketika Bos ADz Wira memberikan instruksi eksekusi, berikut adalah protokol perubahan terpadu pada file produksi agar sinkronisasi berjalan mulus tanpa merusak fungsionalitas yang ada (*zero regression*):

### Langkah 1: Penyediaan Data JSON Kurikulum Baru
* Buat 5 file JSON mandiri di folder `/opt/data/jurumiplay/data/`:
  - `curriculum_bab6.json`
  - `curriculum_bab7.json`
  - `curriculum_bab8.json`
  - `curriculum_bab9.json`
  - `curriculum_bab10.json`

### Langkah 2: Pendaftaran Modul di Engine Frontend (`app.js`)
* Buka array `this.chapters` pada `app.js` (sekitar baris 722) dan tambahkan referensi Bab 6-10:
  ```javascript
  this.chapters = [
    { id: 'bab_01', number: 1, title: 'Bab 1: Al-Kalam', titleAr: 'بَابُ الْكَلَامِ', file: './data/curriculum_bab1.json', data: null },
    { id: 'bab_02', number: 2, title: "Bab 2: Al-I'rab", titleAr: 'بَابُ الْإِعْرَابِ', file: './data/curriculum_bab2.json', data: null },
    { id: 'bab_03', number: 3, title: "Bab 3: Tanda I'rab", titleAr: 'بَابُ عَلَامَاتِ الْإِعْرَابِ', file: './data/curriculum_bab3.json', data: null },
    { id: 'bab_04', number: 4, title: "Bab 4: Al-Mu'rab", titleAr: 'بَابُ الْمُعْرَبِ', file: './data/curriculum_bab4.json', data: null },
    { id: 'bab_05', number: 5, title: 'Bab 5: Al-Af\'al', titleAr: 'بَابُ الْأَفْعَالِ', file: './data/curriculum_bab5.json', data: null },
    // TAMBAHAN BAB 6 - 10:
    { id: 'bab_06', number: 6, title: "Bab 6: Marfu'at", titleAr: 'بَابُ مَرْفُوعَاتِ الْأَسْمَاءِ', file: './data/curriculum_bab6.json', data: null },
    { id: 'bab_07', number: 7, title: "Bab 7: Al-Fa'il", titleAr: 'بَابُ الْفَاعِلِ', file: './data/curriculum_bab7.json', data: null },
    { id: 'bab_08', number: 8, title: "Bab 8: Na'ibul Fa'il", titleAr: 'بَابُ نَائِبِ الْفَاعِلِ', file: './data/curriculum_bab8.json', data: null },
    { id: 'bab_09', number: 9, title: "Bab 9: Mubtada' Khabar", titleAr: 'بَابُ الْمُبْتَدَإِ وَالْخَبَرِ', file: './data/curriculum_bab9.json', data: null },
    { id: 'bab_10', number: 10, title: "Bab 10: Nawasikh", titleAr: 'بَابُ الْعَوَامِلِ الدَّاخِلَةِ', file: './data/curriculum_bab10.json', data: null }
  ];
  ```

### Langkah 3: Pembaruan Cache PWA Offline (`sw.js`)
* Daftarkan kelima berkas kurikulum baru ke dalam array `ASSETS` di `sw.js` agar santri tetap bisa belajar secara offline tanpa kuota:
  ```javascript
  const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './data/curriculum_bab1.json',
    './data/curriculum_bab2.json',
    './data/curriculum_bab3.json',
    './data/curriculum_bab4.json',
    './data/curriculum_bab5.json',
    './data/curriculum_bab6.json',
    './data/curriculum_bab7.json',
    './data/curriculum_bab8.json',
    './data/curriculum_bab9.json',
    './data/curriculum_bab10.json'
  ];
  ```
* Naikkan nama versi cache: `CACHE_NAME = 'jurumiplay-v3.5'`.

### Langkah 4: Migrasi Skema Basis Data MySQL cPanel
* Jalankan query migrasi penambahan kolom perolehan bintang untuk santri pada tabel `users`:
  ```sql
  ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS bintang_bab6 INT DEFAULT 0 AFTER bintang_bab5,
    ADD COLUMN IF NOT EXISTS bintang_bab7 INT DEFAULT 0 AFTER bintang_bab6,
    ADD COLUMN IF NOT EXISTS bintang_bab8 INT DEFAULT 0 AFTER bintang_bab7,
    ADD COLUMN IF NOT EXISTS bintang_bab9 INT DEFAULT 0 AFTER bintang_bab8,
    ADD COLUMN IF NOT EXISTS bintang_bab10 INT DEFAULT 0 AFTER bintang_bab9;
  ```

### Langkah 5: Sinkronisasi Backend (`api.php`) & Dasbor Admin (`panel.php`)
* Pada fungsi `calculate_stars` di `api.php`:
  - Hitung akumulasi `b6` s/d `b10` dari `level_scores` santri.
  - Perbarui formula `$total = $b1 + $b2 + $b3 + $b4 + $b5 + $b6 + $b7 + $b8 + $b9 + $b10;`.
* Pada `panel.php`:
  - Tambahkan kolom indikator bintang Bab 6-10 pada tabel rapor santri di dasbor guru/admin.

---
*Dokumen ini siap dieksekusi bertahap kapan pun Bos ADz Wira menghendaki penambahan live ke server produksi!*
