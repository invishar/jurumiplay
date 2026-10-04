// ==========================================
// JurumiPlay - Game Engine & Logic (Multi-Chapter & Modular Mechanics Edition)
// ==========================================

// Sound Engine using Web Audio API (Zero external assets)
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + (i * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    });
  }
}

const sound = new SoundSynth();

// ==========================================
// App State & Local Storage Management
// ==========================================
class UserState {
  constructor() {
    this.storageKey = 'jurumiplay_user_v3';
    this.data = this.load();
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse state:', e);
      }
    }
    return {
      stars: 0,
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0],
      unlockedLevels: ['level_1_1'], // Hanya level 1.1 yang terbuka awal mula
      completedLevels: {},
      selectedChapter: 'bab_01',
      mistakes: []
    };
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    this.updateStatsUI();
    this.syncToServer();
  }

  addStars(amount) {
    this.data.stars = (this.data.stars || 0) + amount;
    this.save();
  }

  // Cek apakah sebuah bab sudah terbuka
  isChapterUnlocked(chapterId) {
    if (chapterId === 'bab_01') return true;
    
    // Bab 2 butuh Ujian Bab 1 lulus (level_1_5) — standar ID: bab_02
    if (chapterId === 'bab_02') {
      return !!this.data.completedLevels['level_1_5'];
    }
    
    // Bab 3 butuh Ujian Bab 2 lulus (level_2_4) — standar ID: bab_03
    if (chapterId === 'bab_03') {
      return !!this.data.completedLevels['level_2_4'];
    }

    // Bab 4 butuh Ujian Bab 3 lulus (level_3_5) — standar ID: bab_04
    if (chapterId === 'bab_04') {
      return !!this.data.completedLevels['level_3_5'];
    }

    // Bab 5 butuh Ujian Bab 4 lulus (level_4_5) — standar ID: bab_05
    if (chapterId === 'bab_05') {
      return !!this.data.completedLevels['level_4_5'];
    }

    return false;
  }

  // Syarat ujian bab sebelumnya untuk membuka bab ini
  getChapterRequirement(chapterId) {
    if (chapterId === 'bab_02') {
      return {
        requiredExamLevel: 'level_1_5',
        prevChapterName: 'Bab Al-Kalam',
        examName: 'Ujian Boss Stage: Scanner Surat Al-Ikhlas & An-Nas (Level 1.5)'
      };
    }
    if (chapterId === 'bab_03') {
      return {
        requiredExamLevel: 'level_2_4',
        prevChapterName: 'Bab Al-I\'rab',
        examName: 'Ujian Boss Stage: Scanner I\'rab Al-Falaq & An-Nasr (Level 2.4)'
      };
    }
    if (chapterId === 'bab_04') {
      return {
        requiredExamLevel: 'level_3_5',
        prevChapterName: 'Bab Tanda I\'rab',
        examName: 'Ujian Boss Stage: Ujian Komprehensif Tanda I\'rab (Level 3.5)'
      };
    }
    if (chapterId === 'bab_05') {
      return {
        requiredExamLevel: 'level_4_5',
        prevChapterName: 'Bab Al-Mu\'rab',
        examName: 'Ujian Boss Stage: Ujian Isim Mu\'rab (Level 4.5)'
      };
    }
    return null;
  }

  completeLevel(levelId, score) {
    this.data.completedLevels[levelId] = {
      score,
      date: new Date().toISOString()
    };

    // Otomatis buka bab selanjutnya dan level pertamanya jika ujian boss bab lulus!
    // level_1_5 selesai → bab_02 terbuka (level_2_1 di-unlock)
    if (levelId === 'level_1_5') {
      if (!this.data.unlockedLevels.includes('level_2_1')) {
        this.data.unlockedLevels.push('level_2_1');
      }
    }
    // level_2_4 selesai → bab_03 terbuka (level_3_1 di-unlock)
    if (levelId === 'level_2_4') {
      if (!this.data.unlockedLevels.includes('level_3_1')) {
        this.data.unlockedLevels.push('level_3_1');
      }
    }
    // level_3_5 selesai → bab_04 terbuka (level_4_1 di-unlock)
    if (levelId === 'level_3_5') {
      if (!this.data.unlockedLevels.includes('level_4_1')) {
        this.data.unlockedLevels.push('level_4_1');
      }
    }
    // level_4_5 selesai → bab_05 terbuka (level_5_1 di-unlock)
    if (levelId === 'level_4_5') {
      if (!this.data.unlockedLevels.includes('level_5_1')) {
        this.data.unlockedLevels.push('level_5_1');
      }
    }

    // Simpan state setelah semua perubahan
    this.save();
  }

  async syncRemote() {
    try {
      const santri = typeof getLoggedInSantri === 'function' ? getLoggedInSantri() : null;
      const studentName = santri ? santri.nama : (localStorage.getItem('jurumi_student_name') || 'Santri Baru');
      const payload = {
        user_id: santri ? santri.id : null,
        email: santri ? santri.email : null,
        student_name: studentName,
        current_chapter: this.data.selectedChapter || 'bab_01',
        current_level: (this.data.unlockedLevels && this.data.unlockedLevels.length) ? this.data.unlockedLevels[this.data.unlockedLevels.length - 1] : 'level_1_1',
        total_xp: this.data.xp || 0,
        completed_levels: Object.keys(this.data.completedLevels || {}),
        level_scores: this.data.completedLevels || {},
        boss_passed: !!(this.data.completedLevels && (this.data.completedLevels['level_1_5'] || this.data.completedLevels['level_2_4'] || this.data.completedLevels['level_3_5'] || this.data.completedLevels['level_4_5'] || this.data.completedLevels['level_5_5'])),
        hearts: this.data.hearts || 5,
        streak: this.data.streak || 1
      };
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Graceful offline fallback
    }
  }

  unlockLevel(levelId) {
    if (!this.data.unlockedLevels.includes(levelId)) {
      this.data.unlockedLevels.push(levelId);
      this.save();
    }
  }

  updateStatsUI() {
    const elStreak = document.getElementById('stat-streak');
    const elStars = document.getElementById('stat-stars');

    if (elStreak) elStreak.textContent = this.data.streak || 1;
    if (elStars) elStars.textContent = this.data.stars || 0;
  }

  reset() {
    localStorage.removeItem(this.storageKey);
    this.data = {
      stars: 0,
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0],
      unlockedLevels: ['level_1_1'],
      completedLevels: {},
      selectedChapter: 'bab_01',
      mistakes: []
    };
    this.save();
  }
}

const state = new UserState();

// ==========================================
// Question Type Registry & Renderers (Extensible)
// ==========================================
const QuestionRenderers = {
  // 1. Binary Choice (Kalam vs Bukan Kalam, Mu'rab vs Mabni, dsb.)
  'binary_kalam': {
    render(q, router) {
      const textAr = q.text_ar || q.arabic || q.sentence || '';
      const meaning = q.translation || q.meaning || '';
      const promptText = q.prompt || q.instruction || q.question || 'Apakah frasa di atas memenuhi 4 syarat sebagai <span class="text-emerald-700 font-bold">Kalam</span>?';

      let buttonsHtml = '';
      if (q.options && q.options.length >= 2) {
        buttonsHtml = (q.options || []).map(opt => `
          <button onclick="router.submitBinaryAnswer(${opt.value})" class="py-4 px-4 rounded-2xl ${opt.value ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900 hover:bg-emerald-100' : 'bg-rose-50 border-2 border-rose-300 text-rose-900 hover:bg-rose-100'} font-extrabold text-sm sm:text-base touch-btn flex flex-col items-center justify-center space-y-1.5 transition shadow-xs active:scale-95">
            <i data-lucide="${opt.value ? 'check' : 'x'}" class="w-6 h-6 stroke-[2.5]"></i>
            <span class="text-center leading-tight">${opt.label || ''}</span>
          </button>
        `).join('');
      } else {
        buttonsHtml = `
          <button onclick="router.submitBinaryAnswer(false)" class="py-4 px-4 rounded-2xl bg-rose-50 border-2 border-rose-300 hover:bg-rose-100 text-rose-900 font-extrabold text-sm sm:text-base touch-btn flex flex-col items-center justify-center space-y-1.5 transition shadow-xs active:scale-95">
            <i data-lucide="x" class="w-6 h-6 text-rose-600 stroke-[2.5]"></i>
            <span>BUKAN KALAM</span>
          </button>
          <button onclick="router.submitBinaryAnswer(true)" class="py-4 px-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-extrabold text-sm sm:text-base touch-btn flex flex-col items-center justify-center space-y-1.5 transition shadow-xs active:scale-95">
            <i data-lucide="check" class="w-6 h-6 text-emerald-600 stroke-[2.5]"></i>
            <span>INI KALAM</span>
          </button>
        `;
      }

      return `
        <div class="flex-1 flex flex-col justify-between py-1">
          <div class="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl text-center shadow-xs mb-3">
            <span class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Analisis Kaidah
            </span>
            <div class="my-4">
              <h2 class="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 leading-loose break-words">${textAr}</h2>
              ${meaning ? `<p class="text-xs sm:text-sm text-slate-500 font-medium italic mt-1.5">"${meaning}"</p>` : ''}
            </div>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-2xl border border-slate-100">${promptText}</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-3" id="action-buttons">
            ${buttonsHtml}
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  },

  // 2. Multiple Choice Questions (MCQ Standard)
  'mcq': {
    render(q, router) {
      const optionsHtml = (q.options || []).filter(opt => {
        if (!opt) return false;
        const lbl = opt.text || opt.label || opt.name || '';
        const val = opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : '');
        return String(lbl).trim() || String(val).trim();
      }).map(opt => {
        const optVal = opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : opt.label);
        const optLabel = opt.text || opt.label || opt.name || String(optVal || '');
        return `
          <button 
            onclick="router.submitMcqAnswer('${String(optVal).replace(/'/g, "\\'")}')"
            class="w-full p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800 text-sm sm:text-base font-semibold text-left transition flex items-center justify-between touch-btn shadow-xs active:scale-[0.99]" style="min-height:48px">
            <span class="leading-snug">${optLabel}</span>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 shrink-0 ml-2"></i>
          </button>
        `;
      }).join('');

      return `
        <div class="flex-1 flex flex-col justify-between py-2">
          <div class="bg-white border border-slate-100 p-5 rounded-3xl text-center shadow-xs mb-3">
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Pilihan Ganda
            </span>
            <div class="my-4">
              ${q.arabic || q.question_ar ? `<h2 class="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 leading-loose mb-2 break-words">${q.arabic || q.question_ar}</h2>` : ''}
              <p class="text-sm sm:text-base font-bold text-slate-700">${q.prompt || q.question || ''}</p>
              ${q.translation ? `<p class="text-xs sm:text-sm text-slate-500 italic mt-1 font-medium">"${q.translation}"</p>` : ''}
            </div>
          </div>

          <div class="space-y-2.5 mb-3" id="mcq-options">
            ${optionsHtml}
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  },

  // 3. Feature Detective (Bab 1 Ciri Kata)
  'feature_detective': {
    render(q, router) {
      const optionsHtml = (q.options || []).map(opt => `
        <button 
          id="chip-${opt.id || opt.label}"
          onclick="router.toggleFeature('${opt.id || opt.label}')"
          class="feature-chip p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-300 text-slate-800 text-sm sm:text-base font-bold text-left transition flex items-center justify-between touch-btn shadow-xs active:scale-[0.98]" style="min-height:48px">
          <span class="leading-snug pr-2">${opt.label || ''}</span>
          <span class="check-mark opacity-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">✓</span>
        </button>
      `).join('');

      return `
        <div class="flex-1 flex flex-col justify-between py-1">
          <div class="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl text-center shadow-xs mb-3">
            <span class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Ciri Kata
            </span>
            <div class="my-4">
              <h2 class="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 leading-loose break-words">${q.word_ar || q.arabic || ''}</h2>
              <p class="text-xs sm:text-sm text-slate-500 font-medium italic mt-1.5">"${q.meaning || q.translation || ''}"</p>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 font-semibold bg-slate-50 p-3 rounded-2xl border border-slate-100">Pilih tanda/ciri yang terbukti ada pada kata/frasa di atas:</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-3" id="chip-grid">
            ${optionsHtml}
          </div>

          <div id="action-buttons">
            <button onclick="router.submitFeatureAnswer()" class="w-full py-3.5 sm:py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-sm touch-btn transition active:scale-98" style="min-height:48px">
              Periksa Jawaban
            </button>
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  },

  // 4. Basket Sort (Isim, Fi'il, Huruf / 4 Pilar I'rab)
  'basket_sort': {
    render(q, router) {
      return `
        <div class="flex-1 flex flex-col justify-between py-1">
          <div class="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl text-center shadow-xs mb-3">
            <span class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Klasifikasi Kata
            </span>
            <div class="my-4">
              <h2 class="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 leading-loose break-words">${q.word_ar || q.arabic || ''}</h2>
              <p class="text-xs sm:text-sm text-slate-500 font-medium italic mt-1.5">"${q.meaning || q.translation || ''}"</p>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 font-semibold bg-slate-50 p-3 rounded-2xl border border-slate-100">Masukkan kata di atas ke dalam wadah yang tepat:</p>
          </div>

          <div class="grid grid-cols-3 gap-2.5 sm:gap-3 mb-3" id="action-buttons">
            <button onclick="router.submitBasketAnswer('isim')" class="py-3.5 px-2.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-xs sm:text-sm font-extrabold touch-btn flex flex-col items-center justify-center space-y-1 transition active:scale-95 shadow-2xs">
              <span class="text-2xl">🏷️</span>
              <span class="tracking-wide">ISIM</span>
            </button>
            <button onclick="router.submitBasketAnswer('fiil')" class="py-3.5 px-2.5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-extrabold touch-btn flex flex-col items-center justify-center space-y-1 transition active:scale-95 shadow-2xs">
              <span class="text-2xl">⚡</span>
              <span class="tracking-wide">FI'IL</span>
            </button>
            <button onclick="router.submitBasketAnswer('huruf')" class="py-3.5 px-2.5 rounded-2xl bg-sky-50/90 border-2 border-sky-200 hover:bg-sky-100 text-sky-900 text-xs sm:text-sm font-extrabold touch-btn flex flex-col items-center justify-center space-y-1 transition active:scale-95 shadow-2xs">
              <span class="text-2xl">🔗</span>
              <span class="tracking-wide">HURUF</span>
            </button>
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  },

  // 5. Harakat Switcher (NEW MECHANIC: Pilih Harakat Akhir Kata yang Tepat!)
  'harakat_switcher': {
    render(q, router) {
      let sentenceHtml = '';
      if (q.sentence_template) {
        sentenceHtml = q.sentence_template.replace('___', `<span class="inline-block px-3.5 py-1.5 bg-amber-100/90 text-amber-950 border-2 border-dashed border-amber-500 rounded-2xl font-bold font-arabic mx-1.5 shadow-xs">${q.target_word_base || ''} [ ? ]</span>`);
      } else if (q.sentencePrefix && q.targetWord) {
        sentenceHtml = `<span class="text-slate-800">${q.sentencePrefix}</span> <span class="inline-block px-3.5 py-1.5 bg-amber-100/90 text-amber-950 border-2 border-dashed border-amber-500 rounded-2xl font-bold font-arabic mx-1.5 shadow-xs">${q.targetWord} [ ? ]</span>`;
      } else {
        sentenceHtml = `<span class="inline-block px-3.5 py-1.5 bg-amber-100/90 text-amber-950 border-2 border-dashed border-amber-500 rounded-2xl font-bold font-arabic mx-1.5 shadow-xs">${q.arabic || '...'} [ ? ]</span>`;
      }

      const harakatButtons = (q.options || []).filter(opt => opt && (opt.value || opt.symbol || opt.harakat || opt.label || opt.name)).map(opt => {
        const symbol = opt.symbol || opt.harakat || '';
        const label  = opt.label || opt.text || '';
        const name   = opt.name || '';
        const val    = opt.value || opt.id || symbol || label;
        const sub    = opt.type || '';

        // Jika simbol harakat tersedia, tampilkan besar + nama kecil
        // Jika tidak (soal yang opsinya kata Arab lengkap), tampilkan label/nama sebagai teks utama
        const hasSymbol = symbol.trim().length > 0;
        const displayTop = hasSymbol
          ? `<span class="font-arabic text-2xl sm:text-3xl font-black text-emerald-800 leading-none mb-1">${symbol}</span>
             <span class="text-xs sm:text-sm font-extrabold text-slate-800">${name || label}</span>`
          : `<span class="font-arabic text-base sm:text-lg font-extrabold text-emerald-900 leading-snug text-center">${label || name}</span>`;

        return `
          <button 
            onclick="router.submitHarakatAnswer('${String(val).replace(/'/g,"\\'")}', '${String(name || label).replace(/'/g,"\\'")}', '${String(symbol).replace(/'/g,"\\'")}')"
            class="p-3 sm:p-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 touch-btn flex flex-col items-center justify-center transition shadow-xs active:scale-95" style="min-height:${hasSymbol ? '72' : '56'}px">
            ${displayTop}
            ${sub ? `<span class="text-[10px] text-slate-400 font-semibold mt-0.5">${sub}</span>` : ''}
          </button>
        `;
      }).join('');

      const promptInstr = q.instruction || `Pilih harakat akhir yang tepat untuk kata <span class="font-bold text-emerald-700">${q.target_word_base || q.targetWord || ''}</span> sesuai kedudukannya:`;
      const translation = q.translation || q.meaning || '';

      return `
        <div class="flex-1 flex flex-col justify-between py-1">
          <div class="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl text-center shadow-xs mb-3">
            <span class="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Tentukan Harakat
            </span>
            <div class="my-4">
              <div class="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 leading-loose break-words">${sentenceHtml}</div>
              ${translation ? `<p class="text-xs sm:text-sm text-slate-500 font-medium italic mt-1.5">"${translation}"</p>` : ''}
            </div>
            <p class="text-xs sm:text-sm text-slate-700 font-semibold bg-slate-50 p-3 rounded-2xl border border-slate-100">${promptInstr}</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-3" id="harakat-options">
            ${harakatButtons}
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  },

  // 6. Amil Hunter (NEW MECHANIC: Cari Amil 'Biang Kerok' yang Merubah Harakat!)
  'amil_hunter': {
    render(q, router) {
      const meaning = q.translation || q.meaning || '';
      const tokens = q.tokens || q.words || [];
      if (tokens.length === 0) {
        return `<div class="p-6 text-center text-rose-500 font-bold">Data soal amil_hunter tidak lengkap (tokens kosong).</div>`;
      }
      const tokensHtml = tokens.map((token, idx) => `
        <button 
          onclick="router.submitAmilAnswer(${idx})"
          class="amil-token font-arabic text-2xl sm:text-3xl font-bold py-3 px-5 rounded-2xl border-2 border-slate-200/90 bg-white hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 touch-btn transition shadow-xs active:scale-95" style="min-height:52px">
          ${token.text || token.word || token.arabic || ''}
        </button>
      `).join('');

      return `
        <div class="flex-1 flex flex-col justify-between py-1">
          <div class="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl text-center shadow-xs mb-3">
            <div class="flex items-center justify-center space-x-1 mb-3">
              <span class="text-xs font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
                Analisis Amil
              </span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-slate-700 mb-3">Ketuk kata di bawah yang menjadi <span class="text-amber-700 font-extrabold">AMIL</span> (penyebab harakat kata di depannya berubah):</p>
            
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-center gap-2.5 my-2">
              ${tokensHtml}
            </div>

            ${meaning ? `<p class="text-xs sm:text-sm text-slate-500 font-medium italic mt-2.5">"${meaning}"</p>` : ''}
          </div>

          <div class="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-amber-900 leading-relaxed mb-3">
            💡 <strong>Petunjuk Kaidah:</strong> Amil adalah kata yang masuk dan menuntut kata sesudahnya berharakat tertentu (Rafa', Nashab, Jar, atau Jazm).
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  },

  // 7. Boss Level Ayat Scanner (Tersetruktur & Terpisah per Ayat/Surat)
  'boss_ayat_scanner': {
    render(q, router) {
      const lvl = router.currentLevel;
      const sections = lvl.surah_sections || [];
      if (!sections || sections.length === 0) {
        return `<div class="p-6 text-center text-rose-500 font-bold">Soal Boss Stage belum tersedia.</div>`;
      }
      
      const sIdx = router.bossSectionIndex || 0;
      const currentSection = sections[sIdx] || sections[0];
      const tokens = currentSection.tokens || [];
      const tIdx = router.bossTokenIndex || 0;
      const token = tokens[tIdx] || tokens[0] || {};
      
      const sectionTitle = currentSection.surah_name || `Ayat ${currentSection.ayah_number || 1}`;
      const ayahAr = currentSection.ayah_ar || '';
      const ayahTrans = currentSection.ayah_translation || '';

      // Tampilkan token kata khusus dari ayat ini saja
      const tokensDisplay = tokens.map((t, idx) => {
        const isCurrent = (idx === tIdx);
        const isPast = (idx < tIdx);
        const wordText = t.word || t.token_ar || t.arabic || '';
        let badgeStyle = 'bg-white text-slate-700 border-slate-200 shadow-2xs';
        let statusIcon = '';
        if (isCurrent) {
          badgeStyle = 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-sm font-extrabold scale-105';
        } else if (isPast) {
          badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
          statusIcon = '<span class="text-xs mr-1 text-emerald-600 font-bold">✓</span>';
        }
        return `
          <div class="inline-flex items-center px-3 py-1.5 rounded-xl border text-xl sm:text-2xl font-arabic transition-all duration-200 ${badgeStyle}">
            ${statusIcon}
            <span>${wordText}</span>
          </div>
        `;
      }).join('');

      const activeWord = token.word || token.token_ar || token.arabic || '';
      const grammarRole = token.grammar_role || 'Analisis I\'rab Kata';

      return `
        <div class="flex-1 flex flex-col justify-between py-1">
          <!-- Main Boss Card Container -->
          <div class="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-sm mb-3">
            
            <!-- Section / Ayat Header Info -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                  ${sIdx + 1}
                </span>
                <span class="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
                  ${sectionTitle}
                </span>
              </div>
              <span class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full font-mono">
                Kata ${tIdx + 1}/${tokens.length}
              </span>
            </div>

            <!-- Ayat Utuh & Terjemah Card (Terpisah per ayat, tidak dicampur) -->
            ${ayahAr ? `
              <div class="mb-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100 text-center">
                <p class="font-arabic text-2xl sm:text-3xl text-emerald-950 font-bold leading-loose" dir="rtl">
                  ${ayahAr}
                </p>
                ${ayahTrans ? `<p class="text-xs sm:text-sm text-slate-600 mt-2 font-medium italic border-t border-emerald-100/70 pt-2">${ayahTrans}</p>` : ''}
              </div>
            ` : ''}

            <!-- Token Rangkaian Kata Ayat Ini Saja -->
            <div class="mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Rangkaian Kata Ayat Ini:
              </div>
              <div dir="rtl" class="flex flex-wrap items-center justify-center gap-2" style="direction: rtl;">
                ${tokensDisplay}
              </div>
            </div>

            <!-- Focus Target Card dengan Spasi Ekstra untuk Harakat Arab (Bebas Tabrakan) -->
            <div class="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 text-center relative overflow-hidden">
              <span class="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider bg-white/95 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block shadow-2xs">
                Tentukan Jenis Kata Ini
              </span>
              <div class="pt-3 pb-2">
                <h2 class="font-arabic text-4xl sm:text-5xl font-extrabold text-slate-900 leading-normal" dir="rtl">
                  ${activeWord}
                </h2>
              </div>
              <div class="mt-1 text-xs text-amber-800/80 font-medium">
                Pilih apakah kata di atas termasuk <span class="font-bold text-emerald-700">Isim</span>, <span class="font-bold text-amber-700">Fi'il</span>, atau <span class="font-bold text-sky-700">Huruf</span>:
              </div>
            </div>

          </div>

          <!-- Pilihan Jawaban 3 Pilar: ISIM, FI'IL, HURUF -->
          <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-3" id="action-buttons">
            <button onclick="router.submitBossAnswer('isim')" class="py-3 px-2 rounded-2xl bg-white border-2 border-emerald-400 hover:bg-emerald-50 text-emerald-900 font-extrabold touch-btn flex flex-col items-center justify-center space-y-1 transition active:scale-95 shadow-xs">
              <span class="text-xl sm:text-2xl">🏷️</span>
              <span class="text-xs sm:text-sm tracking-wider">ISIM</span>
            </button>
            <button onclick="router.submitBossAnswer('fiil')" class="py-3 px-2 rounded-2xl bg-white border-2 border-amber-400 hover:bg-amber-50 text-amber-900 font-extrabold touch-btn flex flex-col items-center justify-center space-y-1 transition active:scale-95 shadow-xs">
              <span class="text-xl sm:text-2xl">⚡</span>
              <span class="text-xs sm:text-sm tracking-wider">FI'IL</span>
            </button>
            <button onclick="router.submitBossAnswer('huruf')" class="py-3 px-2 rounded-2xl bg-white border-2 border-sky-400 hover:bg-sky-50 text-sky-900 font-extrabold touch-btn flex flex-col items-center justify-center space-y-1 transition active:scale-95 shadow-xs">
              <span class="text-xl sm:text-2xl">🔗</span>
              <span class="text-xs sm:text-sm tracking-wider">HURUF</span>
            </button>
          </div>

          <div id="feedback-box"></div>
        </div>
      `;
    }
  }
};

// ==========================================
// Master Router & Game Controller
// ==========================================
class JurumiRouter {
  constructor() {
    this.chapters = [
      { id: 'bab_01', number: 1, title: 'Bab 1: Al-Kalam', titleAr: 'بَابُ الْكَلَامِ', file: './data/curriculum_bab1.json', data: null },
      { id: 'bab_02', number: 2, title: "Bab 2: Al-I'rab", titleAr: 'بَابُ الْإِعْرَابِ', file: './data/curriculum_bab2.json', data: null },
      { id: 'bab_03', number: 3, title: "Bab 3: Tanda I'rab", titleAr: 'بَابُ عَلَامَاتِ الْإِعْرَابِ', file: './data/curriculum_bab3.json', data: null },
      { id: 'bab_04', number: 4, title: "Bab 4: Al-Mu'rab", titleAr: 'بَابُ الْمُعْرَبِ', file: './data/curriculum_bab4.json', data: null },
      { id: 'bab_05', number: 5, title: 'Bab 5: Al-Af\'al', titleAr: 'بَابُ الْأَفْعَالِ', file: './data/curriculum_bab5.json', data: null }
    ];
    this.currentChapterId = state.data.selectedChapter || 'bab_01';
    this.curriculum = null;
    this.currentLevel = null;
    this.activeQuestionIndex = 0;
    this.selectedFeatures = new Set();
    this.bossSectionIndex = 0;
    this.bossTokenIndex = 0;
  }

  async init() {
    try {
      // Load all chapters in parallel
      await Promise.all(this.chapters.map(async (ch) => {
        const res = await fetch(ch.file);
        const json = await res.json();
        // Support both schemas: { chapter: { ... } } or root object
        ch.data = json.chapter || json;
      }));

      // Set active curriculum
      const activeCh = this.chapters.find(c => c.id === this.currentChapterId) || this.chapters[0];
      this.currentChapterId = activeCh.id;
      this.curriculum = activeCh.data;

      state.updateStatsUI();
      this.navigate('home');
    } catch (e) {
      console.error('Error loading curriculum:', e);
      document.getElementById('main-view').innerHTML = `
        <div class="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p class="font-bold text-rose-600">Gagal memuat kurikulum.</p>
          <p class="text-xs text-slate-400 mt-2">${e.message}</p>
        </div>
      `;
    }
  }

  switchChapter(chapterId) {
    sound.playClick();
    const isUnlocked = state.isChapterUnlocked(chapterId);
    
    if (!isUnlocked) {
      sound.playWrong();
      const req = state.getChapterRequirement(chapterId);
      this.openLockedChapterModal(chapterId, req);
      return;
    }

    const ch = this.chapters.find(c => c.id === chapterId);
    if (!ch || !ch.data) return;
    this.currentChapterId = ch.id;
    this.curriculum = ch.data;
    state.data.selectedChapter = ch.id;
    state.save();
    this.navigate('home');
  }

  // Modal Peringatan Bab Terkunci
  openLockedChapterModal(chapterId, req) {
    const ch = this.chapters.find(c => c.id === chapterId);
    const title = ch ? ch.title : 'Bab Ini';

    const contentHtml = `
      <div class="text-center py-2">
        <div class="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl shadow-xs">
          🔒
        </div>
        <span class="text-xs font-extrabold text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Bab Masih Terkunci
        </span>
        <h3 class="text-lg font-extrabold text-slate-800 mt-2">${title} Belum Terbuka</h3>
        
        <p class="text-sm text-slate-600 mt-2 leading-relaxed">
          Untuk membuka bab ini, kamu harus membuktikan pemahamanmu dengan <strong class="text-emerald-700">lulus Ujian Akhir (Boss Stage)</strong> di bab sebelumnya terlebih dahulu!
        </p>

        ${req ? `
          <div class="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Syarat Pembuka:</span>
            <p class="text-sm font-extrabold text-slate-800 mt-1">🎯 Lulus ${req.prevChapterName}</p>
            <p class="text-xs text-emerald-700 mt-0.5 font-semibold">${req.examName}</p>
          </div>
        ` : ''}

        <div class="mt-5 flex space-x-2">
          <button onclick="closeModal()" class="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm touch-btn transition" style="min-height:44px">
            Tutup
          </button>
          ${req ? `
            <button onclick="router.jumpToExam('${req.requiredExamLevel}', '${req.prevChapterName}')" class="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm touch-btn transition shadow-xs" style="min-height:44px">
              Ke Ujian Sekarang ➔
            </button>
          ` : ''}
        </div>
      </div>
    `;

    openModal(contentHtml);
    if (window.lucide) window.lucide.createIcons();
  }

  jumpToExam(examLevelId, prevChapterName) {
    closeModal();
    // Beralih ke bab sebelumnya
    let targetChId = 'bab_01';
    if (examLevelId.startsWith('level_2')) targetChId = 'bab_02';
    if (examLevelId.startsWith('level_3')) targetChId = 'bab_03';
    if (examLevelId.startsWith('level_4')) targetChId = 'bab_04';
    if (examLevelId.startsWith('level_5')) targetChId = 'bab_05';
    
    // ID chapter sudah distandardkan ke bab_01/bab_02/bab_03/bab_04/bab_05
    const ch = this.chapters.find(c => c.id === targetChId);
    if (ch && ch.data) {
      this.currentChapterId = ch.id;
      this.curriculum = ch.data;
      state.data.selectedChapter = ch.id;
      state.save();
    }
    
    // Boss stage selalu bisa ditantang kapan saja — langsung navigate ke lesson
    const bossLevels = ['level_1_5', 'level_2_4', 'level_3_5', 'level_4_5', 'level_5_5'];
    if (bossLevels.includes(examLevelId) || state.data.unlockedLevels.includes(examLevelId)) {
      this.navigate('lesson', { levelId: examLevelId });
    } else {
      this.navigate('home');
    }
  }

  navigate(viewName, params = {}) {
    if (viewName === 'dashboard') {
      window.location.href = '/dashboard';
      return;
    }
    closeModal();
    const main = document.getElementById('main-view');
    main.innerHTML = '';

    const bottomNav = document.getElementById('bottom-nav');
    const appHeader = document.querySelector('header');
    if (bottomNav) {
      if (viewName === 'lesson') {
        bottomNav.classList.add('hidden');
        if (appHeader) appHeader.classList.add('hidden');
        main.classList.remove('pb-20');
        main.classList.add('pb-4');
      } else {
        bottomNav.classList.remove('hidden');
        if (appHeader) appHeader.classList.remove('hidden');
        main.classList.add('pb-20');
        main.classList.remove('pb-4');
      }
    }

    // Update bottom nav highlighting dengan style touch-friendly
    ['home', 'qawaid', 'matan'].forEach(tab => {
      const btn = document.getElementById(`nav-btn-${tab}`);
      if (btn) {
        if (tab === viewName) {
          btn.className = "flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-emerald-600 bg-emerald-50/80 font-bold focus:outline-none touch-btn min-w-[64px] min-h-[44px]";
        } else {
          btn.className = "flex flex-col items-center justify-center py-1.5 px-4 rounded-xl hover:text-slate-800 text-slate-500 font-medium transition focus:outline-none touch-btn min-w-[64px] min-h-[44px]";
        }
      }
    });

    if (viewName === 'home') {
      // Jika ada chapterId (misal dari victory screen ke bab berikutnya), switch dulu
      if (params.chapterId) {
        const targetCh = this.chapters.find(c => c.id === params.chapterId);
        if (targetCh) {
          this.currentChapterId = targetCh.id;
          this.curriculum = targetCh.data;
          state.data.selectedChapter = targetCh.id;
          state.save();
        }
      }
      this.renderHome(main);
    } else if (viewName === 'lesson') {
      this.startLesson(params.levelId, main);
    } else if (viewName === 'qawaid') {
      this.renderQawaidPocket(main);
    } else if (viewName === 'matan') {
      this.renderMatanView(main);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderHome(container) {
    const chapter = this.curriculum;
    
    // Chapter Switcher Tabs
    const chapterTabsHtml = this.chapters.map(ch => {
      const isActive = ch.id === this.currentChapterId;
      const isUnlocked = state.isChapterUnlocked(ch.id);
      const countLevels = ch.data?.levels?.length || 0;
      const completedCount = ch.data?.levels?.filter(l => !!state.data.completedLevels[l.id]).length || 0;
      
      let tabStyle = '';
      if (isActive) {
        tabStyle = 'bg-emerald-600 text-white font-bold shadow-xs';
      } else if (!isUnlocked) {
        tabStyle = 'bg-slate-100/80 border border-slate-200/60 text-slate-400 hover:bg-slate-100';
      } else {
        tabStyle = 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50';
      }

      return `
        <button onclick="router.switchChapter('${ch.id}')" class="px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 whitespace-nowrap touch-btn transition ${tabStyle}">
          ${!isUnlocked ? '<i data-lucide="lock" class="w-3 h-3 text-slate-400"></i>' : ''}
          <span>${ch.title}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-700 text-emerald-100' : isUnlocked ? 'bg-slate-100 text-slate-500' : 'bg-slate-200/80 text-slate-400'}">
            ${isUnlocked ? `${completedCount}/${countLevels}` : 'Terkunci'}
          </span>
        </button>
      `;
    }).join('');

    const levelsHtml = chapter.levels.map((lvl, idx) => {
      // Boss stage: level_1_5, level_2_4, level_3_5, level_4_5, level_5_5 selalu bisa diklik (shortcut boss per bab)
      const isBossShortcut = ['level_1_5', 'level_2_4', 'level_3_5', 'level_4_5', 'level_5_5'].includes(lvl.id);
      const isUnlocked = isBossShortcut || state.data.unlockedLevels.includes(lvl.id);
      const isCompleted = !!state.data.completedLevels[lvl.id];

      // Styling Icon Indicator
      const iconBoxCls = isCompleted
        ? 'bg-emerald-500 text-white shadow-xs'
        : isBossShortcut && !state.data.unlockedLevels.includes(lvl.id)
        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm ring-2 ring-amber-300'
        : isUnlocked
        ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 ring-2 ring-amber-200/50 shadow-xs'
        : 'bg-slate-100 text-slate-400 border border-slate-200';

      const iconContent = isCompleted
        ? `<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>`
        : isBossShortcut
        ? `<span class="text-sm font-black">👑</span>`
        : `<span class="text-xs font-black">${String(idx + 1).padStart(2, '0')}</span>`;

      return `
        <div class="bg-white rounded-2xl border ${isBossShortcut && !isCompleted ? 'border-amber-300 shadow-sm ring-1 ring-amber-100' : 'border-slate-200/80 shadow-xs'} hover:border-emerald-300 hover:shadow-sm transition-all duration-200 p-3.5 mb-2.5">
          <!-- Top Row: Icon + Title + Info/Lock Action -->
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBoxCls}">
              ${iconContent}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-1.5 flex-wrap">
                <h3 class="text-sm font-extrabold text-slate-800 leading-tight">${lvl.title}</h3>
                ${isCompleted ? '<span class="text-[9px] font-black tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">SELESAI</span>' : isBossShortcut && !state.data.unlockedLevels.includes(lvl.id) ? '<span class="text-[9px] font-black tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">👑 BOSS</span>' : ''}
              </div>
              <p class="text-xs text-slate-500 font-medium leading-normal mt-0.5 line-clamp-1">${lvl.subtitle || ''}</p>
            </div>

            <div class="shrink-0 flex items-center space-x-1.5">
              ${lvl.theory ? `
                <button onclick="router.openTheoryModal('${lvl.id}')" class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center touch-btn transition shadow-2xs" title="Buka Modul Teori Buku">
                  <i data-lucide="book-open" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Bottom Row: Stars Reward + Action Button (Mulai / Ulas / Terkunci) -->
          <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 stroke-amber-500"></i>
              <span>${isBossShortcut ? '+5 Bintang' : '+3 Bintang'}</span>
            </div>
            <div>
              ${isCompleted ? `
                <button onclick="router.navigate('lesson', { levelId: '${lvl.id}' })" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 font-bold text-xs shadow-2xs touch-btn transition flex items-center space-x-1.5 active:scale-95 min-h-[40px]">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>Ulas Lagi</span>
                </button>
              ` : isUnlocked ? `
                <button onclick="router.navigate('lesson', { levelId: '${lvl.id}' })" class="px-3.5 py-2 rounded-xl ${isBossShortcut && !state.data.unlockedLevels.includes(lvl.id) ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'} font-extrabold text-xs touch-btn transition flex items-center space-x-1.5 active:scale-95 min-h-[40px]">
                  <span>${isBossShortcut && !state.data.unlockedLevels.includes(lvl.id) ? 'Tantang Boss' : 'Mulai'}</span>
                  <i data-lucide="${isBossShortcut && !state.data.unlockedLevels.includes(lvl.id) ? 'swords' : 'arrow-right'}" class="w-3.5 h-3.5"></i>
                </button>
              ` : `
                <div class="px-3 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center space-x-1.5 cursor-not-allowed min-h-[40px]">
                  <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                  <span>Terkunci</span>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="flex flex-col w-full">
        <!-- Horizontal Chapter Switcher (Pill Nav Bersih) -->
        <div class="px-4 pt-2.5 pb-1.5 sm:px-5">
          <div class="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            ${chapterTabsHtml}
          </div>
        </div>

        <!-- Chapter Module Banner (Compact Mobile Card ~60px) -->
        <div class="px-4 pt-0.5 pb-1.5 sm:px-5">
          <div class="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-100 shadow-2xs flex items-center justify-between">
            <div class="min-w-0 pr-2">
              <div class="flex items-center space-x-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                  Modul #${chapter.number || 1}
                </span>
                <span class="text-xs font-bold text-slate-500">${chapter.levels.filter(l => state.data.completedLevels[l.id]).length}/${chapter.levels.length} Selesai</span>
              </div>
              <h2 class="text-sm font-extrabold text-slate-800 truncate mt-0.5">${chapter.title_id || chapter.title}</h2>
            </div>
            <div class="shrink-0 text-right">
              <span class="font-arabic text-xl sm:text-2xl font-bold text-emerald-800 block leading-tight" dir="rtl">${chapter.title_ar || chapter.titleArabic || ''}</span>
            </div>
          </div>
        </div>

        <!-- Level List Container (Smooth Native Flow) -->
        <div class="px-4 pt-1.5 pb-8 sm:px-5">
          <div class="flex items-center justify-between mb-2 px-1">
            <h3 class="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Peta Jalur Belajar</h3>
            <span class="text-xs text-slate-500 font-semibold">${chapter.levels.length} Level</span>
          </div>
          <div class="space-y-1">
            ${levelsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // Render Kartu Saku Qawaid View
  renderQawaidPocket(container) {
    const cardsHtml = this.chapters.map(ch => {
      const card = ch.data?.qawaidCard;
      if (!card) return '';

      const cleanTitle = (card.title || '').replace(/^Kaidah\s+(Bab\s+)?/i, '') || card.title;
      const takeawaysHtml = (card.keyTakeaways || []).map(item => `
        <li class="flex items-start space-x-2 text-xs text-slate-700">
          <span class="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
          <span>${item}</span>
        </li>
      `).join('');

      return `
        <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs mb-1">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div>
              <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">${ch.title}</span>
              <h3 class="text-sm font-extrabold text-slate-800 mt-0.5">${cleanTitle}</h3>
            </div>
            <span class="text-xl">📑</span>
          </div>

          <div class="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 mb-3">
            <p class="font-arabic text-2xl sm:text-3xl font-bold text-emerald-950 text-center leading-loose py-1" dir="rtl">${card.matanSnippet}</p>
          </div>

          <div class="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 mb-3">
            <span class="text-[10px] font-extrabold text-amber-800 uppercase block mb-1">Rumus Cepat:</span>
            <p class="text-xs font-bold text-amber-900">${card.formula}</p>
          </div>

          <div>
            <span class="text-[10px] font-extrabold text-slate-400 uppercase block mb-1.5">Poin Inti yang Wajib Diingat:</span>
            <ul class="space-y-1.5">
              ${takeawaysHtml}
            </ul>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="px-4 pt-4 pb-28 sm:px-6 flex flex-col w-full max-w-[440px] mx-auto space-y-4">
        <div class="pt-1 pb-1">
          <span class="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1.5">
            Rangkuman Kaidah
          </span>
          <h2 class="text-lg font-extrabold text-slate-800 tracking-tight">Kaidah & Rumus Nahwu</h2>
          <p class="text-xs text-slate-500 mt-0.5">Ringkasan rumus cepat dan kaidah inti Nahwu siap muraja'ah kapan saja.</p>
        </div>

        <div class="space-y-4">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  // Render Halaman Teks Matan Lengkap View
  renderMatanView(container) {
    const matanTranslations = {
      'bab_01': 'Kalam adalah lafadz yang tersusun (dari minimal 2 kata), memberikan makna yang sempurna, dan (menggunakan bahasa) Arab secara sengaja (Wadh\'). Bagian-bagiannya ada tiga: Isim, Fi\'il, dan Huruf yang mengandung makna.',
      'bab_02': 'I\'rab adalah perubahan harakat akhir kata-kata karena perbedaan amil (faktor) yang masuk padanya, baik secara lafadz (nyata) maupun taqdiri (tersembunyi). Bagian-bagiannya ada empat: Rafa\', Nashab, Khafadh, dan Jazm. Isim-isim memiliki (hak atas) Rafa\', Nashab, dan Khafadh — tidak ada Jazm bagi isim. Fi\'il-fi\'il memiliki Rafa\', Nashab, dan Jazm — tidak ada Khafadh bagi fi\'il.',
      'bab_03': 'Rafa\' memiliki empat tanda: Dhommah, Wawu, Alif, dan Nun. Adapun Dhommah menjadi tanda Rafa\' di empat tempat: Isim Mufrad, Jama\' Taksir, Jama\' Muannats Salim, dan Fi\'il Mudhari\' yang tidak bersambung di akhirnya sesuatu. Nashab memiliki lima tanda: Fathah, Alif, Kasrah, Ya\', dan Membuang Nun. Khafadh memiliki tiga tanda: Kasrah, Ya\', dan Fathah. Jazm memiliki dua tanda: Sukun dan Membuang (huruf \'illat atau nun).',
      'bab_04': 'Yang di-i\'rab terbagi dua: yang di-i\'rab dengan harakat dan yang di-i\'rab dengan huruf. Yang di-i\'rab dengan harakat ada empat: Isim Mufrad, Jama\' Taksir, Jama\' Muannats Salim, dan Fi\'il Mudhari\' yang tidak bersambung di akhirnya sesuatu. Yang di-i\'rab dengan huruf ada empat: Isim Tastniyah (Mutsanna), Jama\' Mudzakkar Salim, Asmaul Khamsah, dan Af\'alul Khamsah.',
      'bab_05': 'Fi\'il itu ada tiga macam: Madhi, Mudhari\', dan Amr. Contohnya: ضَرَبَ (Madhi), يَضْرِبُ (Mudhari\'), dan اِضْرِبْ (Amr). Madhi difathahkan akhirnya selamanya. Amr disukunkan akhirnya selamanya. Mudhari\' adalah fi\'il yang di awalnya ada salah satu dari empat huruf tambahan: Hamzah, Nun, Ya\', dan Ta\' (أَنَيْتَ).'
    };

    const chaptersMatanHtml = this.chapters.map(ch => {
      const arabicText = ch.data?.matan_full || ch.data?.matanFullText || '';
      const indoText = matanTranslations[ch.data?.id || ch.id] || '';

      return `
        <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs mb-1">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div>
              <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">Naskah Asli</span>
              <h3 class="text-sm font-extrabold text-slate-800 mt-0.5">${ch.title}</h3>
            </div>
            <span class="font-arabic font-bold text-base sm:text-lg text-emerald-700">${ch.data?.title_ar || ch.titleAr || ''}</span>
          </div>

          <div class="p-4 sm:p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 mb-3.5">
            <p class="font-arabic text-2xl sm:text-3xl font-bold text-emerald-950 text-right leading-loose tracking-wide break-words py-1.5" dir="rtl">${arabicText}</p>
          </div>

          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span class="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Terjemahan Indonesia:</span>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${indoText}</p>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="px-4 pt-4 pb-28 sm:px-6 flex flex-col w-full max-w-[440px] mx-auto space-y-4">
        <div class="pt-1 pb-1">
          <span class="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1.5">
            Naskah Kitab
          </span>
          <h2 class="text-lg font-extrabold text-slate-800 tracking-tight">Matan Al-Ajurrumiyyah</h2>
          <p class="text-xs text-slate-500 mt-0.5">Teks asli berharakat lengkap dengan terjemahan bahasa Indonesia.</p>
        </div>

        <div class="space-y-4">
          ${chaptersMatanHtml}
        </div>
      </div>
    `;
  }

  openTheoryModal(levelId) {
    sound.playClick();
    const lvl = this.curriculum.levels.find(l => l.id === levelId);
    if (!lvl || !lvl.theory) return;

    // Normalisasi struktur teori dari curriculum Bab 1, 2, dan 3
    const headline = lvl.theory.headline || lvl.theory.title || lvl.title || 'Modul Teori Kaidah';
    const matanSnippet = lvl.theory.matan_snippet || lvl.theory.matan || lvl.theory.matanSnippet || '';
    const translation = lvl.theory.translation || lvl.theory.desc || '';

    const pointsHtml = (lvl.theory.points || []).map(p => {
      // Normalisasi teks Indonesia dan teks Arab dari berbagai skema JSON
      const termId = p.term_id || p.label || p.term || '';
      const termAr = p.term_ar || p.arabic || p.text_ar || '';
      const descText = p.desc || p.explanation || '';
      // Fallback lengkap untuk field Arab dan Indonesia agar tidak pernah undefined
      const termIdSafe = termId || p.indonesian || p.matan_translation || p.translation || p.description || p.label || '';
      const termArSafe = termAr || p.matan_arabic || p.text_ar || p.term_ar || p.arabic || '';
      const descSafe = descText || p.description || p.note || '';

      return `
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
          <div class="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <span class="text-sm sm:text-base font-extrabold text-slate-800 leading-snug">${termIdSafe}</span>
            ${termArSafe ? `<span class="font-arabic font-bold text-2xl sm:text-3xl text-emerald-700 leading-loose">${termArSafe}</span>` : ''}
          </div>
          ${descSafe ? `<p class="text-sm sm:text-base text-slate-600 leading-relaxed">${descSafe}</p>` : ''}
        </div>
      `;
    }).join('');

    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
      <div>
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <span class="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
              <i data-lucide="book-open" class="w-4 h-4"></i>
              <span>Modul Teori Pelajaran</span>
            </span>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5">${headline}</h3>
          </div>
          <button onclick="closeModal()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 touch-btn">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        ${matanSnippet ? `
          <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4 text-center">
            <span class="text-xs font-bold text-emerald-600 uppercase block mb-1">Kutipan Matan Asli</span>
            <p class="font-arabic text-3xl sm:text-4xl font-bold text-emerald-800 leading-loose">${matanSnippet}</p>
            ${translation ? `<p class="text-xs sm:text-sm text-emerald-700/90 font-medium italic mt-2">"${translation}"</p>` : ''}
          </div>
        ` : ''}

        <div class="space-y-3 mb-5 max-h-[50vh] overflow-y-auto pr-1">
          ${pointsHtml}
        </div>

        <button onclick="closeModal(); router.navigate('lesson', { levelId: '${lvl.id}' })" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-sm sm:text-base shadow-xs touch-btn transition flex items-center justify-center space-x-2">
          <span>Mulai Latihan Level Ini</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    document.getElementById('modal-container').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // Open "Kenapa Begitu?" Instant Explainer Drawer
  openWhyModal(explanation, dalil) {
    sound.playClick();
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
      <div>
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">💡</span>
            <div>
              <span class="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Logika & Dalil Matan</span>
              <h3 class="text-base sm:text-lg font-extrabold text-slate-800">Kenapa Begitu?</h3>
            </div>
          </div>
          <button onclick="closeModal()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 touch-btn">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        ${dalil ? `
          <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4 text-center">
            <span class="text-xs font-bold text-emerald-600 uppercase block mb-1">Kutipan Matan Jurumiyyah</span>
            <p class="font-arabic text-3xl sm:text-4xl font-bold text-emerald-900 leading-loose">${dalil}</p>
          </div>
        ` : ''}

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5 text-sm sm:text-base text-slate-700 leading-relaxed space-y-2">
          <p class="font-bold text-slate-800">Penjelasan Logis:</p>
          <p>${explanation}</p>
        </div>

        <button onclick="closeModal()" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xs touch-btn transition">
          Paham, Tutup Penjelasan
        </button>
      </div>
    `;

    document.getElementById('modal-container').classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  startLesson(levelId, container) {
    this.currentLevel = this.curriculum.levels.find(l => l.id === levelId);
    this.activeQuestionIndex = 0;
    this.bossCorrectCount    = 0;
    this.selectedFeatures.clear();
    this.bossSectionIndex = 0;
    this.bossTokenIndex = 0;
    this.renderQuestion(container);
  }

  renderQuestion(container) {
    if (state.data.hearts <= 0) {
      this.renderGameOver(container);
      return;
    }

    const lvl = this.currentLevel;
    const isBoss = lvl.type === 'boss_ayat_scanner';
    
    let totalQ = 1;
    let currentQNum = 1;
    let currentQ = null;

    if (isBoss) {
      const sections = lvl.surah_sections || [];
      const sIdx = this.bossSectionIndex || 0;
      const curSection = sections[sIdx] || sections[0];
      const tIdx = this.bossTokenIndex || 0;

      // Hitung total token di seluruh ayat
      totalQ = sections.reduce((sum, s) => sum + (s.tokens ? s.tokens.length : 0), 0) || 1;
      
      // Hitung posisi token saat ini di seluruh ayat
      let passedTokens = 0;
      for (let i = 0; i < sIdx; i++) {
        passedTokens += (sections[i].tokens ? sections[i].tokens.length : 0);
      }
      currentQNum = passedTokens + tIdx + 1;
      currentQ = curSection && curSection.tokens ? curSection.tokens[tIdx] : null;
    } else {
      totalQ = lvl.questions ? lvl.questions.length : 1;
      currentQNum = this.activeQuestionIndex + 1;
      currentQ = lvl.questions ? lvl.questions[this.activeQuestionIndex] : null;
    }

    const progressPercent = Math.round(((currentQNum - 1) / totalQ) * 100);

    // Pick renderer based on level type or question type
    let qType = lvl.type;
    if (!qType || !QuestionRenderers[qType]) {
      qType = currentQ?.type || 'mcq';
    }
    if (qType === 'binary') qType = 'binary_kalam';
    const renderer = QuestionRenderers[qType] || QuestionRenderers['mcq'];

    const gameContentHtml = renderer.render(currentQ, this);

    container.innerHTML = `
      <div class="px-4 pt-4 pb-8 sm:px-6 flex flex-col flex-1 w-full max-w-[440px] mx-auto min-h-screen">
        <!-- Progress Bar & Exit Button -->
        <div class="flex items-center space-x-3 mb-4 pt-1">
          <button onclick="router.navigate('home')" class="p-2 -ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition touch-btn" title="Keluar ke Menu">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
          
          <div class="flex-1 bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
            <div class="bg-emerald-500 h-2.5 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
          </div>

          <span class="text-xs font-extrabold text-slate-500 font-mono pr-1">${currentQNum}/${totalQ}</span>
        </div>

        ${gameContentHtml}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 1. Submit Binary Answer
  submitBinaryAnswer(userAnswer) {
    const q = this.currentLevel.questions[this.activeQuestionIndex];
    let isCorrect = false;

    // Normalisasi userAnswer (bisa boolean, number, string)
    const normUser = (userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1');

    if (q.is_kalam !== undefined) {
      const normTarget = (q.is_kalam === true || q.is_kalam === 'true' || q.is_kalam === 1);
      isCorrect = (normUser === normTarget);
    } else if (q.is_correct !== undefined) {
      const normTarget = (q.is_correct === true || q.is_correct === 'true' || q.is_correct === 1);
      isCorrect = (normUser === normTarget);
    } else if (q.correct !== undefined) {
      if (typeof q.correct === 'boolean') {
        isCorrect = (normUser === q.correct);
      } else {
        isCorrect = (String(userAnswer).trim().toLowerCase() === String(q.correct).trim().toLowerCase());
      }
    } else if (q.correct_value !== undefined) {
      isCorrect = (String(userAnswer).trim().toLowerCase() === String(q.correct_value).trim().toLowerCase());
    }

    const dalil = q.whyModal?.matan || q.dalil || null;
    const explanation = q.explanation || (q.whyModal ? q.whyModal.reason : '');
    this.handleAnswerResult(isCorrect, explanation, dalil);
  }

  // 2. Submit MCQ Answer
  submitMcqAnswer(selectedVal) {
    const q = this.currentLevel.questions[this.activeQuestionIndex];
    let isCorrect = false;
    const sUser = String(selectedVal).trim().toLowerCase();

    // Cek kemungkinan properti target jawaban di q
    const targets = [
      q.correct_id,
      q.correct_answer,
      q.correct,
      q.correct_value,
      q.correct_val,
      q.answer,
      q.answer_key
    ].filter(v => v !== undefined && v !== null);

    for (const t of targets) {
      if (String(t).trim().toLowerCase() === sUser) {
        isCorrect = true;
        break;
      }
    }

    // Jika belum ketemu, cek apakah q.options berisi flag is_correct
    if (!isCorrect && q.options) {
      const foundOpt = q.options.find(o => 
        String(o.id || o.value || o.label || o.text || '').trim().toLowerCase() === sUser
      );
      if (foundOpt && (foundOpt.is_correct === true || foundOpt.correct === true)) {
        isCorrect = true;
      }
    }

    const dalil = q.whyModal?.matan || q.dalil || null;
    const explanation = q.explanation || (q.whyModal ? q.whyModal.reason : '');
    this.handleAnswerResult(isCorrect, explanation, dalil);
  }

  // 3. Submit Feature Answer (Detective)
  toggleFeature(optId) {
    sound.playClick();
    const btn = document.getElementById(`chip-${optId}`);
    const check = btn ? btn.querySelector('.check-mark') : null;

    if (this.selectedFeatures.has(optId)) {
      this.selectedFeatures.delete(optId);
      if (btn) {
        btn.classList.remove('bg-emerald-50', 'border-emerald-400', 'text-emerald-900', 'ring-2', 'ring-emerald-200');
        btn.classList.add('bg-slate-50', 'border-slate-200', 'text-slate-700');
      }
      if (check) check.classList.add('opacity-0');
    } else {
      this.selectedFeatures.add(optId);
      if (btn) {
        btn.classList.remove('bg-slate-50', 'border-slate-200', 'text-slate-700');
        btn.classList.add('bg-emerald-50', 'border-emerald-400', 'text-emerald-900', 'ring-2', 'ring-emerald-200');
      }
      if (check) check.classList.remove('opacity-0');
    }
  }

  submitFeatureAnswer() {
    const q = this.currentLevel.questions[this.activeQuestionIndex];
    
    // Support correct_features array ATAU options dengan is_correct
    let correctFeatures = [];
    if (Array.isArray(q.correct_features)) {
      correctFeatures = q.correct_features.map(f => String(f).trim().toLowerCase());
    } else if (Array.isArray(q.options)) {
      correctFeatures = q.options.filter(o => o.is_correct === true).map(o => String(o.id || o.value).trim().toLowerCase());
    }

    const selectedArr = Array.from(this.selectedFeatures).map(f => String(f).trim().toLowerCase());

    const isMatch = (
      correctFeatures.length === selectedArr.length &&
      correctFeatures.every(id => selectedArr.includes(id))
    );

    const dalil = q.whyModal?.matan || q.dalil || null;
    const explanation = q.explanation || (q.whyModal ? q.whyModal.reason : '');
    this.handleAnswerResult(isMatch, explanation, dalil);
  }

  // 4. Submit Basket Answer
  submitBasketAnswer(chosenType) {
    const q = this.currentLevel.questions[this.activeQuestionIndex];
    const sChosen = String(chosenType).trim().toLowerCase();
    
    // Support category, correct_type, correct
    const targetType = String(q.category || q.correct_type || q.correct || '').trim().toLowerCase();
    const isCorrect = (sChosen === targetType);

    const dalil = q.whyModal?.matan || q.dalil || null;
    const explanation = q.explanation || (q.whyModal ? q.whyModal.reason : (q.hint || ''));
    this.handleAnswerResult(isCorrect, explanation, dalil);
  }

  // 5. Submit Harakat Switcher Answer
  submitHarakatAnswer(val, name = '', symbol = '') {
    const q = this.currentLevel.questions[this.activeQuestionIndex];
    const target = String(q.correct || q.correct_value || '').trim().toLowerCase();
    
    const sVal    = String(val).trim().toLowerCase();
    const sName   = String(name).trim().toLowerCase();
    const sSymbol = String(symbol).trim();

    // Multi-jalur matching: value, nama (latin/Arab), simbol, atau label yang mengandung target
    const isCorrect = (
      sVal === target ||
      sName === target ||
      sName.includes(target) ||
      target.includes(sVal) ||
      sSymbol === target ||
      // Juga cek jika target ada di string name (untuk kasus "Fathah" match "fathah")
      sName.split(/[\s\-\/\(]/)[0] === target
    );

    const dalil = q.whyModal?.matan || q.dalil || null;
    const explanation = q.explanation || (q.whyModal ? q.whyModal.reason : '');
    this.handleAnswerResult(isCorrect, explanation, dalil);
  }

  // 6. Submit Amil Hunter Answer
  submitAmilAnswer(tokenIdx) {
    const q = this.currentLevel.questions[this.activeQuestionIndex];
    const token = q.tokens && q.tokens[tokenIdx];
    const isCorrect = Boolean(token && (token.isAmil === true || token.is_amil === true || token.is_correct === true || token.isCorrect === true));
    
    const dalil = q.whyModal?.matan || q.dalil || null;
    const explanation = (token && token.feedback) || q.explanation || (q.whyModal ? (q.whyModal.reason || q.whyModal) : '');
    this.handleAnswerResult(isCorrect, explanation, dalil);
  }

  // 7. Submit Boss Answer (Multi-Ayat Aware)
  submitBossAnswer(chosenType) {
    const lvl = this.currentLevel;
    const sections = lvl.surah_sections || [];
    const sIdx = this.bossSectionIndex || 0;
    const section = sections[sIdx] || sections[0];
    const tIdx = this.bossTokenIndex || 0;
    const token = section && section.tokens ? section.tokens[tIdx] : null;
    
    const target = String(token ? (token.type || token.category || '') : '').trim().toLowerCase();
    const isCorrect = (String(chosenType).trim().toLowerCase() === target);
    
    const dalil = token ? (token.dalil || null) : null;
    const explanation = token ? (token.explanation || '') : '';
    this.handleAnswerResult(isCorrect, explanation, dalil, true);
  }

  handleAnswerResult(isCorrect, explanation, dalil = null, isBoss = false) {
    const feedbackBox = document.getElementById('feedback-box');
    const actionButtons = document.getElementById('action-buttons') || document.getElementById('chip-grid') || document.getElementById('harakat-options') || document.getElementById('mcq-options');

    if (actionButtons) {
      actionButtons.style.pointerEvents = 'none';
      actionButtons.style.opacity = '0.5';
    }

    // Track skor boss level (untuk passing score 7/10)
    const lvl = this.currentLevel;
    const isBossLevel = lvl && (lvl.is_boss || ['level_1_5', 'level_2_4', 'level_3_5', 'level_4_5', 'level_5_5'].includes(lvl.id));
    if (isBossLevel && isCorrect) {
      this.bossCorrectCount = (this.bossCorrectCount || 0) + 1;
    }

    if (isCorrect) {
      sound.playCorrect();
      feedbackBox.innerHTML = `
        <div class="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in shadow-xs">
          <div class="flex items-center justify-between mb-2 font-bold text-sm text-emerald-800">
            <div class="flex items-center space-x-1.5">
              <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>
              <span>Luar Biasa, Tepat Sekali!</span>
            </div>
            ${dalil ? `
              <button onclick="router.openWhyModal(\`${explanation.replace(/"/g, '&quot;')}\`, \`${dalil.replace(/"/g, '&quot;')}\`)" class="text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-full font-bold touch-btn">
                💡 Kenapa begitu?
              </button>
            ` : ''}
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">${explanation}</p>
          <button onclick="router.nextStep(${isBoss})" class="mt-3 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm touch-btn transition" style="min-height:48px">
            Lanjut Soal Berikutnya ➔
          </button>
        </div>
      `;
    } else {
      sound.playWrong();
      feedbackBox.innerHTML = `
        <div class="mt-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-fade-in shadow-xs">
          <div class="flex items-center justify-between mb-2 font-bold text-sm text-rose-800">
            <div class="flex items-center space-x-1.5">
              <i data-lucide="alert-circle" class="w-5 h-5 text-rose-600"></i>
              <span>Kurang Tepat, Coba Pahami Kembali</span>
            </div>
            ${dalil ? `
              <button onclick="router.openWhyModal(\`${explanation.replace(/"/g, '&quot;')}\`, \`${dalil.replace(/"/g, '&quot;')}\`)" class="text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-full font-bold touch-btn">
                💡 Kenapa begitu?
              </button>
            ` : ''}
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">${explanation}</p>
          <button onclick="router.nextStep(${isBoss})" class="mt-3 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm touch-btn transition" style="min-height:48px">
            Mengerti & Lanjut ➔
          </button>
        </div>
      `;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  nextStep(isBoss) {
    sound.playClick();
    this.selectedFeatures.clear();
    const lvl = this.currentLevel;

    if (isBoss) {
      const sections = lvl.surah_sections || [];
      const sIdx = this.bossSectionIndex || 0;
      const curSection = sections[sIdx] || sections[0];
      const curTokens = curSection ? (curSection.tokens || []) : [];

      this.bossTokenIndex++;
      if (this.bossTokenIndex >= curTokens.length) {
        this.bossTokenIndex = 0;
        this.bossSectionIndex = (this.bossSectionIndex || 0) + 1;
        if (this.bossSectionIndex >= sections.length) {
          const correct = this.bossCorrectCount || 0;
          let total = 0;
          sections.forEach(s => { total += (s.tokens || []).length; });
          if (total === 0) total = 10;
          if (correct >= 7) {
            this.renderCelebration(document.getElementById('main-view'));
          } else {
            this.renderBossRetry(document.getElementById('main-view'), correct, total);
          }
          return;
        }
      }
      this.renderQuestion(document.getElementById('main-view'));
    } else {
      this.activeQuestionIndex++;
      const totalQs = lvl.questions ? lvl.questions.length : 1;
      if (this.activeQuestionIndex >= totalQs) {
        // Boss level: cek passing score (min 7/10)
        const isBossLvl = lvl && (lvl.is_boss || ['level_1_5', 'level_2_4', 'level_3_5', 'level_4_5', 'level_5_5'].includes(lvl.id));
        if (isBossLvl) {
          const correct = this.bossCorrectCount || 0;
          const total   = totalQs;
          if (correct >= 7) {
            this.renderCelebration(document.getElementById('main-view'));
          } else {
            this.renderBossRetry(document.getElementById('main-view'), correct, total);
          }
        } else {
          this.renderCelebration(document.getElementById('main-view'));
        }
      } else {
        this.renderQuestion(document.getElementById('main-view'));
      }
    }
  }

  renderBossRetry(container, correct, total) {
    sound.playWrong();
    const lvl = this.currentLevel;
    const needed = 7;
    const kurang = needed - correct;
    container.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-center px-5 py-8 space-y-5 max-w-[440px] mx-auto">
        <div class="w-24 h-24 rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-5xl animate-bounce">
          😓
        </div>
        <div>
          <span class="text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
            🔥 Boss Belum Lulus
          </span>
          <h2 class="text-xl font-extrabold text-slate-800 mt-2">${lvl.title}</h2>
          <p class="text-sm text-slate-500 mt-1">Kamu perlu lebih memahami materi ini</p>
        </div>

        <!-- Skor Card -->
        <div class="grid grid-cols-3 gap-3 w-full max-w-xs">
          <div class="bg-white p-3 rounded-2xl border border-rose-100 shadow-xs text-center">
            <span class="text-xs text-slate-400 uppercase font-bold tracking-wide block">Benar</span>
            <p class="text-2xl font-extrabold text-emerald-600 mt-1">${correct}</p>
          </div>
          <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs text-center">
            <span class="text-xs text-slate-400 uppercase font-bold tracking-wide block">Total</span>
            <p class="text-2xl font-extrabold text-slate-700 mt-1">${total}</p>
          </div>
          <div class="bg-white p-3 rounded-2xl border border-amber-100 shadow-xs text-center">
            <span class="text-xs text-slate-400 uppercase font-bold tracking-wide block">Target</span>
            <p class="text-2xl font-extrabold text-amber-600 mt-1">7/${total}</p>
          </div>
        </div>

        <!-- Pesan -->
        <div class="w-full max-w-xs p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
          <p class="text-sm font-extrabold text-amber-800 mb-1">📚 Kurang ${kurang} jawaban benar</p>
          <p class="text-sm text-amber-700 leading-relaxed">
            Minimal <strong>7 dari 10</strong> soal harus dijawab benar untuk lulus Boss Stage dan membuka Bab berikutnya. Pelajari kembali materinya, kamu pasti bisa!
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="w-full max-w-xs space-y-2.5">
          <button onclick="router.retryBoss()" class="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-extrabold text-sm shadow-sm touch-btn transition flex items-center justify-center space-x-2 active:scale-95" style="min-height:52px">
            <span>🔁 Ulangi Boss Stage</span>
          </button>
          <button onclick="router.navigate('home')" class="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm touch-btn transition" style="min-height:48px">
            Pelajari Materi Dulu
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  retryBoss() {
    sound.playClick();
    this.activeQuestionIndex = 0;
    this.bossCorrectCount    = 0;
    this.bossTokenIndex      = 0;
    this.bossSectionIndex    = 0;
    this.selectedFeatures.clear();
    this.renderQuestion(document.getElementById('main-view'));
  }

  renderCelebration(container) {
    sound.playVictory();
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    const lvl = this.currentLevel;
    const isBossLvl = lvl && (lvl.is_boss || ['level_1_5', 'level_2_4', 'level_3_5', 'level_4_5', 'level_5_5'].includes(lvl.id));
    const starsEarned = isBossLvl ? 5 : 3;
    state.addStars(starsEarned);
    state.completeLevel(lvl.id, 100);

    const currentIndex = this.curriculum.levels.findIndex(l => l.id === lvl.id);
    let nextLvl = null;
    if (currentIndex >= 0 && currentIndex + 1 < this.curriculum.levels.length) {
      nextLvl = this.curriculum.levels[currentIndex + 1];
      state.unlockLevel(nextLvl.id);
    }

    // Periksa apakah ini boss stage terakhir yang membuka bab baru!
    let nextUnlockedChapterName = null;
    if (lvl.id === 'level_1_5') {
      nextUnlockedChapterName = 'Bab 2: Al-I\'rab';
    } else if (lvl.id === 'level_2_4') {
      nextUnlockedChapterName = 'Bab 3: Tanda I\'rab';
    } else if (lvl.id === 'level_3_5') {
      nextUnlockedChapterName = 'Bab 4: Al-Mu\'rab';
    } else if (lvl.id === 'level_4_5') {
      nextUnlockedChapterName = 'Bab 5: Al-Af\'al';
    }

    // Deteksi apakah ini level terakhir dari bab yang sedang aktif (atau seluruh konten)
    const isLastLevelOfChapter = !nextLvl || (nextLvl.id && nextLvl.id.split('_')[1] !== lvl.id.split('_')[1]);
    const isLastLevelEver = !nextLvl; // level terakhir dari seluruh game
    const babSelesaiId = lvl.id.split('_')[1]; // e.g. '1', '2', '3'

    // Periksa apakah masih ada bab berikutnya (untuk dead-end prevention)
    const allChapterIds = this.chapters.map(ch => ch.id);
    const currentChapterIdx = this.chapters.findIndex(ch => ch.data?.levels?.find(l => l.id === lvl.id));
    const nextChapter = currentChapterIdx >= 0 && currentChapterIdx + 1 < this.chapters.length ? this.chapters[currentChapterIdx + 1] : null;

    // Quote motivasi berdasarkan pencapaian
    const motivasiQuotes = [
      '«وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا» — Terus semangat, ilmu adalah cahaya!',
      'الْعِلْمُ نُورٌ — Ilmu itu cahaya. Satu level selesai, satu cahaya menyala!',
      '"Man jadda wajada" — Siapa yang bersungguh-sungguh, ia pasti berhasil.',
      'Nahwu adalah kunci memahami Al-Qur\'an. Kamu makin dekat!',
      'Setiap soal yang kamu jawab adalah langkah menuju pemahaman yang lebih dalam.'
    ];
    const randomQuote = motivasiQuotes[Math.floor(Math.random() * motivasiQuotes.length)];

    container.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center text-center px-5 py-8 space-y-5">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 flex items-center justify-center text-5xl shadow-sm animate-bounce">
          🏆
        </div>
        
        <div>
          <span class="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">${(lvl.is_boss || ['level_1_5', 'level_2_4', 'level_3_5', 'level_4_5', 'level_5_5'].includes(lvl.id)) ? '🔥 UJIAN BAB LULUS! 🔥' : '✅ Level Selesai!'}</span>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2">${lvl.title}</h2>
          <p class="text-sm text-slate-500 mt-1">${lvl.subtitle || ''}</p>
        </div>

        ${isLastLevelOfChapter && !nextUnlockedChapterName ? `
          <div class="w-full max-w-xs p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in shadow-xs text-center">
            <span class="text-2xl">🎉</span>
            <p class="text-sm font-extrabold text-amber-800 mt-1">BAB ${babSelesaiId} SELESAI!</p>
            <p class="text-sm text-amber-700 mt-1 font-medium">Luar biasa! Kamu telah menyelesaikan seluruh level bab ini.</p>
          </div>
        ` : ''}

        ${nextUnlockedChapterName ? `
          <div class="w-full max-w-xs p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in shadow-xs text-center">
            <span class="text-2xl">🔓🎉</span>
            <p class="text-sm font-extrabold text-emerald-800 mt-1">BAB BARU TERBUKA!</p>
            <p class="text-sm text-emerald-700 mt-1 font-medium">Selamat! Kamu berhasil membuka <strong class="underline">${nextUnlockedChapterName}</strong>.</p>
          </div>
        ` : ''}

        <!-- Bintang & Hasil Card -->
        <div class="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div class="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs text-center">
            <span class="text-xs text-slate-400 uppercase font-bold tracking-wide block">Perolehan</span>
            <p class="text-2xl font-extrabold text-amber-500 mt-1">+${starsEarned} ⭐</p>
            <p class="text-xs font-bold text-amber-600">Bintang</p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs text-center">
            <span class="text-xs text-slate-400 uppercase font-bold tracking-wide block">Hasil Belajar</span>
            <p class="text-2xl font-extrabold text-emerald-600 mt-1">Tuntas</p>
            <p class="text-xs font-bold text-emerald-500">Mumtaz 🌟</p>
          </div>
        </div>

        <!-- Quote Motivasi -->
        <div class="w-full max-w-xs p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left">
          <p class="text-sm text-slate-600 leading-relaxed italic font-medium">${randomQuote}</p>
        </div>

        <!-- Action Buttons -->
        <div class="w-full max-w-xs space-y-2.5 pt-1">
          ${nextLvl && !nextUnlockedChapterName ? `
            <button onclick="router.navigate('lesson', { levelId: '${nextLvl.id}' })" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-sm sm:text-base shadow-sm touch-btn transition flex items-center justify-center space-x-2 active:scale-95" style="min-height:52px">
              <span>Lanjut ke Level Berikutnya</span>
              <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
          ` : ''}
          ${nextChapter && (nextUnlockedChapterName || isLastLevelEver) ? `
            <button onclick="router.navigate('home', { chapterId: '${nextChapter.id}' })" class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-sm sm:text-base shadow-sm touch-btn transition flex items-center justify-center space-x-2 active:scale-95" style="min-height:52px">
              <span>Mulai ${nextChapter.title}</span>
              <i data-lucide="book-open" class="w-5 h-5"></i>
            </button>
          ` : ''}
          <button onclick="router.navigate('home')" class="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm touch-btn transition" style="min-height:48px">
            Kembali ke Peta Modul
          </button>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderGameOver(container) {
    this.renderQuestion(container);
  }
}

const router = new JurumiRouter();

// ==========================================
// Modal & Global Controls
// ==========================================
function openModal(contentHtml) {
  const modal = document.getElementById('modal-container');
  const modalContent = document.getElementById('modal-content');
  if (modal && modalContent) {
    modalContent.innerHTML = contentHtml;
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('modal-container');
  if (modal) modal.classList.add('hidden');
}

function openMatanDrawer() {
  sound.playClick();
  const currentChapter = router.curriculum || router.chapters[0].data;
  const modalContent = document.getElementById('modal-content');
  
  // Terjemahan per bab (baris per baris)
  const matanTranslations = {
    'bab_01': 'Kalam adalah lafadz yang tersusun (dari minimal 2 kata), memberikan makna yang sempurna, dan (menggunakan bahasa) Arab secara sengaja (Wadh\'). Bagian-bagiannya ada tiga: Isim, Fi\'il, dan Huruf yang mengandung makna.',
    'bab_02': 'I\'rab adalah perubahan harakat akhir kata-kata karena perbedaan amil (faktor) yang masuk padanya, baik secara lafadz (nyata) maupun taqdiri (tersembunyi). Bagian-bagiannya ada empat: Rafa\', Nashab, Khafadh, dan Jazm. Isim-isim memiliki (hak atas) Rafa\', Nashab, dan Khafadh — tidak ada Jazm bagi isim. Fi\'il-fi\'il memiliki Rafa\', Nashab, dan Jazm — tidak ada Khafadh bagi fi\'il.',
    'bab_03': 'Rafa\' memiliki empat tanda: Dhommah, Wawu, Alif, dan Nun. Adapun Dhommah menjadi tanda Rafa\' di empat tempat: Isim Mufrad, Jama\' Taksir, Jama\' Muannats Salim, dan Fi\'il Mudhari\' yang tidak bersambung di akhirnya sesuatu. Nashab memiliki lima tanda: Fathah, Alif, Kasrah, Ya\', dan Membuang Nun. Khafadh memiliki tiga tanda: Kasrah, Ya\', dan Fathah. Jazm memiliki dua tanda: Sukun dan Membuang (huruf \'illat atau nun).'
  };

  const chaptersMatanHtml = router.chapters.map(ch => `
    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[10px] font-extrabold text-emerald-700 uppercase">${ch.title}</span>
        <span class="font-arabic font-bold text-base text-emerald-800">${ch.titleAr}</span>
      </div>
      ${(ch.data?.matan_full || ch.data?.matanFullText) ? `
        <div class="p-3 bg-white rounded-xl border border-emerald-100 mb-2">
          <p class="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 leading-loose text-right">${ch.data?.matan_full || ch.data?.matanFullText}</p>
        </div>
        ${matanTranslations[ch.data?.id || ch.id] ? `
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed italic border-l-2 border-emerald-300 pl-3 mt-2">${matanTranslations[ch.data?.id || ch.id]}</p>
        ` : ''}
      ` : `<p class="text-xs text-slate-400 italic">Matan belum tersedia untuk bab ini.</p>`}
    </div>
  `).join('');

  modalContent.innerHTML = `
    <div>
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Kitab Rujukan</span>
          <h3 class="text-sm font-extrabold text-slate-800">Matan Al-Ajurrumiyyah</h3>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 touch-btn">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="space-y-3 mb-5 max-h-[60vh] overflow-y-auto pr-1">
        ${chaptersMatanHtml}
      </div>

      <button onclick="closeModal()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-xs touch-btn transition">
        Tutup Teks Matan
      </button>
    </div>
  `;

  document.getElementById('modal-container').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function toggleAudio() {
  sound.enabled = !sound.enabled;
  const icon = document.getElementById('sound-icon');
  const btn = document.getElementById('btn-sound-toggle');
  if (sound.enabled) {
    sound.playClick();
    if (icon) icon.setAttribute('data-lucide', 'volume-2');
    if (btn) {
      btn.className = "flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs touch-btn transition";
      btn.title = "Suara Aktif (Klik untuk Mute)";
    }
  } else {
    if (icon) icon.setAttribute('data-lucide', 'volume-x');
    if (btn) {
      btn.className = "flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs touch-btn transition";
      btn.title = "Suara Bisu (Klik untuk Aktifkan)";
    }
  }
  if (window.lucide) window.lucide.createIcons();
}

function resetUserDataPrompt() {
  sound.playClick();
  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `
    <div class="text-center p-2">
      <div class="w-14 h-14 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3 text-2xl">
        ⚠️
      </div>
      <h3 class="text-sm font-extrabold text-slate-800">Reset Semua Progress?</h3>
      <p class="text-xs text-slate-500 mt-1 mb-5">XP, level kelulusan, dan nyawa akan dikembalikan ke kondisi awal (mulai dari nol).</p>
      
      <div class="grid grid-cols-2 gap-2.5">
        <button onclick="closeModal()" class="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs touch-btn">
          Batal
        </button>
        <button onclick="confirmReset()" class="py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs touch-btn shadow-xs">
          Ya, Reset Data
        </button>
      </div>
    </div>
  `;
  document.getElementById('modal-container').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function confirmReset() {
  state.reset();
  closeModal();
  router.navigate('home');
}

// Bootstrap
function showOnboardingIfNeeded() {
  // Tampilkan onboarding hanya jika pengguna benar-benar baru (XP = 0, belum ada level yang diselesaikan)
  const isNewUser = state.data.xp === 0 && Object.keys(state.data.completedLevels || {}).length === 0;
  if (!isNewUser) return;

  // Tandai sudah ditampilkan agar tidak muncul lagi setelah page refresh
  if (localStorage.getItem('jurumi_onboarding_shown')) return;

  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `
    <div class="text-center">
      <div class="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-3xl">
        🕌
      </div>
      <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Selamat Datang!</span>
      <h2 class="text-base font-extrabold text-slate-800 mt-1">JurumiPlay</h2>
      <p class="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">Game belajar Nahwu berbasis <em>Matan Al-Ajurrumiyyah</em> — kitab tata bahasa Arab klasik yang legendaris.</p>

      <div class="space-y-2.5 text-left mb-5">
        <div class="flex items-start space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-lg shrink-0">🎯</span>
          <div>
            <p class="text-xs font-extrabold text-slate-700">Jawab Soal Interaktif</p>
            <p class="text-[11px] text-slate-500 mt-0.5">Pilihan ganda, sortir kata, temukan ciri — berbagai jenis soal seru!</p>
          </div>
        </div>
        <div class="flex items-start space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-lg shrink-0">⭐</span>
          <div>
            <p class="text-xs font-extrabold text-slate-700">Kumpulkan XP & Buka Level</p>
            <p class="text-[11px] text-slate-500 mt-0.5">Setiap level selesai = XP reward. Level berikutnya terbuka otomatis!</p>
          </div>
        </div>
        <div class="flex items-start space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-lg shrink-0">📖</span>
          <div>
            <p class="text-xs font-extrabold text-slate-700">Baca Kaidah & Matan</p>
            <p class="text-[11px] text-slate-500 mt-0.5">Gunakan tombol "Kaidah Saku" & "Kitab Matan" kapan saja sebagai referensi.</p>
          </div>
        </div>
        <div class="flex items-start space-x-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
          <span class="text-lg shrink-0">💔</span>
          <div>
            <p class="text-xs font-extrabold text-amber-800">Jaga Nyawamu! (5 ❤️)</p>
            <p class="text-[11px] text-amber-700 mt-0.5">Jawaban salah mengurangi nyawa. Habis? Tunggu pemulihan atau mulai ulang.</p>
          </div>
        </div>
      </div>

      <button onclick="closeOnboarding()" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-sm shadow-xs touch-btn transition active:scale-95">
        Mulai Petualangan! 🚀
      </button>
    </div>
  `;

  document.getElementById('modal-container').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeOnboarding() {
  localStorage.setItem('jurumi_onboarding_shown', '1');
  closeModal();
}

window.addEventListener('DOMContentLoaded', () => {
  window.state = state;
  window.router = router;
  router.init();
  // Tampilkan layar sambutan untuk pengguna baru
  showOnboardingIfNeeded();
  updateSantriHeaderUI();
});

// ==========================================
// SANTRI AUTH & DATABASE PROGRESS SYNC
// ==========================================
function getLoggedInSantri() {
  try {
    const raw = localStorage.getItem('jurumiplay_santri');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function updateSantriHeaderUI() {
  const santri = getLoggedInSantri();
  const label = document.getElementById('stat-santri-name');
  if (!label) return;
  if (santri && santri.nama) {
    const firstName = santri.nama.split(' ')[0];
    label.textContent = firstName;
  } else {
    label.textContent = 'Santri';
  }
}

function openSantriAuthModal() {
  const santri = getLoggedInSantri();
  const modal = document.getElementById('santri-auth-modal');
  const viewProfile = document.getElementById('view-santri-profile');
  const viewForms = document.getElementById('view-santri-forms');
  const alertEl = document.getElementById('auth-alert');
  if (alertEl) alertEl.classList.add('hidden');

  if (santri) {
    viewProfile.classList.remove('hidden');
    viewForms.classList.add('hidden');
    document.getElementById('profile-display-name').textContent = santri.nama || 'Santri';
    document.getElementById('profile-display-email').textContent = santri.email || '';
    document.getElementById('profile-display-phone').textContent = santri.no_hp || '';
    
    const currChap = state.data.selectedChapter ? state.data.selectedChapter.replace('bab_0', 'Bab ').replace('bab_', 'Bab ') : 'Bab 1';
    document.getElementById('profile-display-progress').textContent = `${currChap} · Level ${state.data.currentLevel || 1}`;
    document.getElementById('profile-display-stars').textContent = `${state.data.stars || 0} Bintang`;
  } else {
    viewProfile.classList.add('hidden');
    viewForms.classList.remove('hidden');
    switchAuthTab('register');
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeSantriAuthModal() {
  const modal = document.getElementById('santri-auth-modal');
  if (modal) modal.classList.add('hidden');
}

function switchAuthTab(tab) {
  const tabReg = document.getElementById('tab-btn-register');
  const tabLog = document.getElementById('tab-btn-login');
  const formReg = document.getElementById('form-register');
  const formLog = document.getElementById('form-login');
  const alertEl = document.getElementById('auth-alert');
  if (alertEl) alertEl.classList.add('hidden');

  if (tab === 'register') {
    tabReg.className = 'flex-1 py-2 text-emerald-600 border-b-2 border-emerald-600';
    tabLog.className = 'flex-1 py-2 text-slate-400 hover:text-slate-600';
    formReg.classList.remove('hidden');
    formLog.classList.add('hidden');
  } else {
    tabLog.className = 'flex-1 py-2 text-emerald-600 border-b-2 border-emerald-600';
    tabReg.className = 'flex-1 py-2 text-slate-400 hover:text-slate-600';
    formLog.classList.remove('hidden');
    formReg.classList.add('hidden');
  }
}

async function handleSantriRegister(e) {
  e.preventDefault();
  const alertEl = document.getElementById('auth-alert');
  const btn = document.getElementById('btn-submit-reg');
  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';

  const nama = document.getElementById('reg-nama').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const no_hp = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-pass').value;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama,
        email,
        no_hp,
        password,
        current_chapter: state.data.selectedChapter || 'bab_01',
        completed_levels: Object.keys(state.data.completedLevels || {}),
        level_scores: state.data.completedLevels || {}
      })
    });
    const result = await res.json();
    if (result.success && result.user) {
      localStorage.setItem('jurumiplay_santri', JSON.stringify(result.user));
      updateSantriHeaderUI();
      closeSantriAuthModal();
      alert('Alhamdulillah! Akun berhasil didaftarkan. Progres belajarmu tersimpan di database.');
    } else {
      alertEl.textContent = result.error || 'Gagal mendaftar. Silakan coba lagi.';
      alertEl.className = 'mb-3 p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 block';
    }
  } catch (err) {
    alertEl.textContent = 'Gagal menghubungi server database.';
    alertEl.className = 'mb-3 p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Daftar & Simpan Progres';
  }
}

async function handleSantriLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('auth-alert');
  const btn = document.getElementById('btn-submit-login');
  btn.disabled = true;
  btn.textContent = 'Memeriksa...';

  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-pass').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const result = await res.json();
    if (result.success && result.user) {
      localStorage.setItem('jurumiplay_santri', JSON.stringify(result.user));
      updateSantriHeaderUI();
      if (result.user.total_bintang > (state.data.stars || 0)) {
        state.data.stars = result.user.total_bintang;
        state.save();
      }
      closeSantriAuthModal();
      alert('Selamat datang kembali, ' + result.user.nama + '! Progresmu telah dimuat.');
    } else {
      alertEl.textContent = result.error || 'Email/No HP atau password salah.';
      alertEl.className = 'mb-3 p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 block';
    }
  } catch (err) {
    alertEl.textContent = 'Gagal menghubungi server database.';
    alertEl.className = 'mb-3 p-2.5 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Masuk Akun';
  }
}

function logoutSantri() {
  if (confirm('Yakin ingin keluar dari akun santri?')) {
    localStorage.removeItem('jurumiplay_santri');
    updateSantriHeaderUI();
    closeSantriAuthModal();
  }
}