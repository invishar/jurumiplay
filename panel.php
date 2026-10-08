<?php
session_start();
require_once __DIR__ . '/config.php';

// Handle passkey login
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['passkey'])) {
    if ($_POST['passkey'] === ADMIN_PASSKEY) {
        $_SESSION['panel_auth'] = true;
        header('Location: /panel');
        exit;
    } else {
        $error = 'Passkey tidak cocok. Silakan coba lagi.';
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    unset($_SESSION['panel_auth']);
    header('Location: /panel');
    exit;
}

$is_authenticated = !empty($_SESSION['panel_auth']);

$pdo = get_db_connection();
$students = [];
$feedbacks = [];
$studentFeedbackMap = [];
$stats = [
    'total_students' => 0,
    'total_stars' => 0,
    'bab5_completed' => 0,
    'avg_stars' => 0,
    'total_feedbacks' => 0
];

if ($is_authenticated) {
    // Ensure feedbacks table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        nama VARCHAR(150) NOT NULL,
        email VARCHAR(150) NULL,
        no_hp VARCHAR(50) NULL,
        pesan TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
    $students = $stmt->fetchAll();
    
    $stats['total_students'] = count($students);
    foreach ($students as $s) {
        $stats['total_stars'] += $s['total_bintang'];
        if ($s['bab'] >= 5) {
            $stats['bab5_completed']++;
        }
    }
    if ($stats['total_students'] > 0) {
        $stats['avg_stars'] = round($stats['total_stars'] / $stats['total_students'], 1);
    }

    // Fetch feedbacks with linked student info
    $stmtF = $pdo->query("SELECT f.*, u.nama as santri_reg_nama, u.email as santri_reg_email, u.bab as santri_bab, u.level as santri_level 
        FROM feedbacks f 
        LEFT JOIN users u ON f.user_id = u.id 
        ORDER BY f.id DESC");
    $feedbacks = $stmtF->fetchAll();
    $stats['total_feedbacks'] = count($feedbacks);

    // Map latest message per student for the column in the student table
    foreach ($feedbacks as $fb) {
        if (!empty($fb['user_id']) && !isset($studentFeedbackMap['id_' . $fb['user_id']])) {
            $studentFeedbackMap['id_' . $fb['user_id']] = $fb['pesan'];
        }
        if (!empty($fb['email']) && !isset($studentFeedbackMap['email_' . strtolower(trim($fb['email']))])) {
            $studentFeedbackMap['email_' . strtolower(trim($fb['email']))] = $fb['pesan'];
        }
        if (!empty($fb['no_hp'])) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $fb['no_hp']);
            if (!empty($cleanPhone) && !isset($studentFeedbackMap['phone_' . $cleanPhone])) {
                $studentFeedbackMap['phone_' . $cleanPhone] = $fb['pesan'];
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-50">
<head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Panel Data & Masukan Santri — JurumiPlay</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-arabic { font-family: 'Amiri', serif; }
  </style>
</head>
<body class="min-h-full flex flex-col text-slate-800">

<?php if (!$is_authenticated): ?>
  <!-- Login Gate Screen -->
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
      <div class="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
      
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 text-2xl font-bold mb-3 shadow-inner">
          📖
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">JurumiPlay Panel</h1>
        <p class="text-sm text-slate-500 mt-1">Masukkan Passkey Administrator untuk memantau data & saran santri</p>
      </div>

      <?php if ($error): ?>
        <div class="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
          <span>⚠️</span> <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <form method="POST" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Security Passkey</label>
          <input type="password" name="passkey" required autofocus placeholder="••••••••••••" 
                 class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm transition-all" />
        </div>
        <button type="submit" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
          <span>Masuk ke Dashboard</span>
          <span>→</span>
        </button>
      </form>
      
      <div class="mt-8 text-center text-xs text-slate-400">
        JurumiPlay &copy; <?= date('Y') ?> &middot; Monitoring Progres & Suara Santri
      </div>
    </div>
  </div>

<?php else: ?>
  <!-- Authenticated Admin Dashboard -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl shadow-md shadow-emerald-500/20">
          📖
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-black text-slate-900 tracking-tight">JurumiPlay Panel</h1>
            <span class="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full">v3.4 Live</span>
          </div>
          <p class="text-xs text-slate-500">Sistem Monitoring Progres & Suara Masukan Santri</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <a href="/" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors">
          <span>Buka Aplikasi</span>
          <span>↗</span>
        </a>
        <a href="/panel?logout=1" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1">
          <span>Keluar</span>
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
    <!-- Metric Stat Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Santri</div>
        <div class="text-3xl font-extrabold text-slate-900"><?= number_format($stats['total_students']) ?></div>
        <div class="text-xs text-emerald-600 font-semibold mt-1">Santri Terdaftar</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Bintang ⭐</div>
        <div class="text-3xl font-extrabold text-amber-500"><?= number_format($stats['total_stars']) ?></div>
        <div class="text-xs text-slate-500 font-medium mt-1">Perolehan Seluruh Santri</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mencapai Bab 5</div>
        <div class="text-3xl font-extrabold text-indigo-600"><?= number_format($stats['bab5_completed']) ?></div>
        <div class="text-xs text-indigo-500 font-medium mt-1">Level Lanjutan/Khatam</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Rata-rata Bintang</div>
        <div class="text-3xl font-extrabold text-teal-600"><?= $stats['avg_stars'] ?></div>
        <div class="text-xs text-teal-500 font-medium mt-1">Bintang per Santri</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm col-span-2 sm:col-span-1">
        <div class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Masukan & Ide User ✉️</div>
        <div class="text-3xl font-extrabold text-emerald-700"><?= number_format($stats['total_feedbacks']) ?></div>
        <div class="text-xs text-emerald-600 font-semibold mt-1">Saran / Ide Aplikasi</div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- SECTION 1: KOTAK MASUKAN & IDE APLIKASI USER -->
    <!-- ========================================== -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
            ✉️
          </div>
          <div>
            <h2 class="text-base font-extrabold text-slate-900 leading-tight">Kotak Masukan, Saran & Ide Aplikasi (Chat User)</h2>
            <p class="text-xs text-slate-500">Pesan dari tombol surat: masukan perbaikan dan ide aplikasi baru dari santri & pengguna</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="exportFeedbackCSV()" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5">
            <span>📥</span> Export Saran CSV
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse" id="feedbackTable">
            <thead>
              <tr class="bg-emerald-50/60 border-b border-emerald-100 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                <th class="py-3 px-4 w-12">#</th>
                <th class="py-3 px-4 w-48">Pengirim</th>
                <th class="py-3 px-4 w-44">Kontak (WA / Email)</th>
                <th class="py-3 px-4">Isi Pesan Masukan / Usulan Ide Aplikasi</th>
                <th class="py-3 px-4 text-right w-36">Waktu Masuk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-normal">
              <?php if (empty($feedbacks)): ?>
                <tr>
                  <td colspan="5" class="py-10 text-center text-slate-400 font-medium">
                    Belum ada masukan atau saran yang dikirimkan oleh pengguna.
                  </td>
                </tr>
              <?php else: ?>
                <?php foreach ($feedbacks as $fIdx => $fb): ?>
                  <?php 
                    $cleanFbPhone = preg_replace('/[^0-9]/', '', $fb['no_hp']);
                    if (substr($cleanFbPhone, 0, 1) === '0') {
                        $waFb = '62' . substr($cleanFbPhone, 1);
                    } elseif (substr($cleanFbPhone, 0, 2) === '62') {
                        $waFb = $cleanFbPhone;
                    } else {
                        $waFb = '62' . $cleanFbPhone;
                    }
                    $isRegSantri = !empty($fb['user_id']) || !empty($fb['santri_reg_nama']);
                  ?>
                  <tr class="hover:bg-emerald-50/30 transition-colors">
                    <td class="py-3.5 px-4 text-slate-400 font-mono text-xs"><?= $fIdx + 1 ?></td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900"><?= htmlspecialchars($fb['nama']) ?></div>
                      <?php if ($isRegSantri): ?>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 mt-0.5">
                          Santri Bab <?= $fb['santri_bab'] ?? 1 ?>
                        </span>
                      <?php else: ?>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 mt-0.5">
                          Pengguna / Tamu
                        </span>
                      <?php endif; ?>
                    </td>
                    <td class="py-3.5 px-4">
                      <?php if (!empty($cleanFbPhone)): ?>
                        <div class="flex items-center gap-1.5 mb-1">
                          <span class="font-mono text-xs text-slate-800"><?= htmlspecialchars($fb['no_hp']) ?></span>
                          <a href="https://wa.me/<?= $waFb ?>?text=Halo%20<?= urlencode($fb['nama']) ?>%2C%20terima%20kasih%20atas%20masukan%20dan%20idenya%20di%20JurumiPlay%21" target="_blank" title="Balas via WhatsApp" class="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 text-[11px] px-1.5 py-0.5 rounded font-bold">
                            WA ↗
                          </a>
                        </div>
                      <?php endif; ?>
                      <?php if (!empty($fb['email'])): ?>
                        <div class="text-xs text-slate-500 font-mono"><?= htmlspecialchars($fb['email']) ?></div>
                      <?php endif; ?>
                      <?php if (empty($cleanFbPhone) && empty($fb['email'])): ?>
                        <span class="text-xs text-slate-400 italic">Tanpa kontak</span>
                      <?php endif; ?>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-slate-800 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line select-text">
                        <?= nl2br(htmlspecialchars($fb['pesan'])) ?>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-right text-xs text-slate-400 font-mono">
                      <?= date('d M Y H:i', strtotime($fb['created_at'])) ?>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- SECTION 2: DATA MONITORING SANTRI -->
    <!-- ========================================== -->
    <div class="space-y-4 pt-4 border-t border-slate-200">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-extrabold text-slate-900 leading-tight">Data & Progres Belajar Santri</h2>
          <p class="text-xs text-slate-500">Daftar santri terdaftar, progres bab, total bintang, serta masukan/chat terakhir</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-[240px]">
            <input type="text" id="searchInput" onkeyup="filterTable()" placeholder="Cari nama, email, hp..." 
                   class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          <select id="babFilter" onchange="filterTable()" class="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
            <option value="all">Semua Bab</option>
            <option value="1">Bab 1: Al-Kalam</option>
            <option value="2">Bab 2: Al-I'rab</option>
            <option value="3">Bab 3: Tanda I'rab</option>
            <option value="4">Bab 4: Fi'il</option>
            <option value="5">Bab 5: Isim Marfu'</option>
          </select>

          <button onclick="exportCSV()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5">
            <span>📥</span> Export Santri CSV
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse" id="studentsTable">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th class="py-3.5 px-4">#</th>
                <th class="py-3.5 px-4">Nama & Email</th>
                <th class="py-3.5 px-4">No Handphone</th>
                <th class="py-3.5 px-4 text-center">Progres (Bab / Lvl)</th>
                <th class="py-3.5 px-4 text-center">Bab 1</th>
                <th class="py-3.5 px-4 text-center">Bab 2</th>
                <th class="py-3.5 px-4 text-center">Bab 3</th>
                <th class="py-3.5 px-4 text-center">Bab 4</th>
                <th class="py-3.5 px-4 text-center">Bab 5</th>
                <th class="py-3.5 px-4 text-center">Total ⭐</th>
                <th class="py-3.5 px-4">Chat / Masukan User</th>
                <th class="py-3.5 px-4 text-right">Terakhir Aktif</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-normal">
              <?php if (empty($students)): ?>
                <tr>
                  <td colspan="12" class="py-12 text-center text-slate-400 font-medium">
                    Belum ada data santri yang tercatat.
                  </td>
                </tr>
              <?php else: ?>
                <?php foreach ($students as $idx => $s): ?>
                  <?php 
                    // Normalize Indonesian phone for WhatsApp link
                    $rawPhone = preg_replace('/[^0-9]/', '', $s['no_hp']);
                    if (substr($rawPhone, 0, 1) === '0') {
                        $waPhone = '62' . substr($rawPhone, 1);
                    } elseif (substr($rawPhone, 0, 2) === '62') {
                        $waPhone = $rawPhone;
                    } else {
                        $waPhone = '62' . $rawPhone;
                    }

                    // Check if this student sent feedback
                    $cleanPhone = preg_replace('/[^0-9]/', '', $s['no_hp']);
                    $latestMsg = $studentFeedbackMap['id_' . $s['id']] 
                      ?? $studentFeedbackMap['email_' . strtolower(trim($s['email']))] 
                      ?? (!empty($cleanPhone) && isset($studentFeedbackMap['phone_' . $cleanPhone]) ? $studentFeedbackMap['phone_' . $cleanPhone] : null);
                  ?>
                  <tr class="hover:bg-slate-50/80 transition-colors student-row" data-bab="<?= $s['bab'] ?>">
                    <td class="py-3.5 px-4 text-slate-400 font-mono text-xs"><?= $idx + 1 ?></td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900 student-name"><?= htmlspecialchars($s['nama']) ?></div>
                      <div class="text-xs text-slate-400 student-email"><?= htmlspecialchars($s['email']) ?></div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs text-slate-700 student-phone"><?= htmlspecialchars($s['no_hp']) ?></span>
                        <?php if (!empty($rawPhone)): ?>
                          <a href="https://wa.me/<?= $waPhone ?>" target="_blank" title="Chat via WhatsApp" class="text-emerald-600 hover:text-emerald-700 text-xs px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 font-semibold">
                            WA ↗
                          </a>
                        <?php endif; ?>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        Bab <?= $s['bab'] ?> &middot; Lvl <?= $s['level'] ?>
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-center font-semibold text-xs <?= $s['bintang_bab1'] > 0 ? 'text-amber-600 font-bold' : 'text-slate-300' ?>"><?= $s['bintang_bab1'] ?> ⭐</td>
                    <td class="py-3.5 px-4 text-center font-semibold text-xs <?= $s['bintang_bab2'] > 0 ? 'text-amber-600 font-bold' : 'text-slate-300' ?>"><?= $s['bintang_bab2'] ?> ⭐</td>
                    <td class="py-3.5 px-4 text-center font-semibold text-xs <?= $s['bintang_bab3'] > 0 ? 'text-amber-600 font-bold' : 'text-slate-300' ?>"><?= $s['bintang_bab3'] ?> ⭐</td>
                    <td class="py-3.5 px-4 text-center font-semibold text-xs <?= $s['bintang_bab4'] > 0 ? 'text-amber-600 font-bold' : 'text-slate-300' ?>"><?= $s['bintang_bab4'] ?> ⭐</td>
                    <td class="py-3.5 px-4 text-center font-semibold text-xs <?= $s['bintang_bab5'] > 0 ? 'text-amber-600 font-bold' : 'text-slate-300' ?>"><?= $s['bintang_bab5'] ?> ⭐</td>
                    <td class="py-3.5 px-4 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-amber-50 text-amber-700 border border-amber-200/60">
                        <?= $s['total_bintang'] ?>
                      </span>
                    </td>
                    <td class="py-3.5 px-4">
                      <?php if ($latestMsg): ?>
                        <div class="inline-flex items-center gap-1.5 max-w-[200px] bg-emerald-50 border border-emerald-200 text-emerald-900 px-2 py-1 rounded-lg text-xs" title="<?= htmlspecialchars($latestMsg) ?>">
                          <span class="shrink-0">💬</span>
                          <span class="truncate font-medium"><?= htmlspecialchars($latestMsg) ?></span>
                        </div>
                      <?php else: ?>
                        <span class="text-xs text-slate-300 italic">- belum ada -</span>
                      <?php endif; ?>
                    </td>
                    <td class="py-3.5 px-4 text-right text-xs text-slate-400 font-mono">
                      <?= date('d M Y H:i', strtotime($s['last_active'])) ?>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-4 mt-auto">
    <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
      JurumiPlay &copy; <?= date('Y') ?> &middot; Dibangun dengan cinta untuk santri Nahwu Al-Jurumiyyah &middot; invishar.com
    </div>
  </footer>

  <script>
    function filterTable() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const bab = document.getElementById('babFilter').value;
      const rows = document.querySelectorAll('.student-row');

      rows.forEach(row => {
        const name = row.querySelector('.student-name').innerText.toLowerCase();
        const email = row.querySelector('.student-email').innerText.toLowerCase();
        const phone = row.querySelector('.student-phone').innerText.toLowerCase();
        const rowBab = row.getAttribute('data-bab');

        const matchQuery = name.includes(q) || email.includes(q) || phone.includes(q);
        const matchBab = (bab === 'all') || (rowBab === bab);

        if (matchQuery && matchBab) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    function exportCSV() {
      let csv = [];
      const rows = document.querySelectorAll("#studentsTable tr");
      for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++) {
          let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
          row.push('"' + text.replace(/"/g, '""') + '"');
        }
        csv.push(row.join(","));
      }
      downloadBlob(csv.join("\n"), "santri_jurumiplay_" + new Date().toISOString().slice(0, 10) + ".csv");
    }

    function exportFeedbackCSV() {
      let csv = [];
      const rows = document.querySelectorAll("#feedbackTable tr");
      for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++) {
          let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
          row.push('"' + text.replace(/"/g, '""') + '"');
        }
        csv.push(row.join(","));
      }
      downloadBlob(csv.join("\n"), "masukan_saran_jurumiplay_" + new Date().toISOString().slice(0, 10) + ".csv");
    }

    function downloadBlob(content, filename) {
      const blob = new Blob([content], {type: "text/csv;charset=utf-8;"});
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  </script>
<?php endif; ?>

</body>
</html>
