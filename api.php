<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Passkey');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$pdo = get_db_connection();

// IP Rate Limiting helper via database
function check_api_rate_limit($pdo, $action, $max_requests = 15, $window_seconds = 300) {
    $ip = substr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', 0, 45);
    $now = time();
    $cutoff = $now - $window_seconds;

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            action_name VARCHAR(50) NOT NULL,
            request_count INT DEFAULT 1,
            window_start INT NOT NULL,
            INDEX idx_ip_action (ip, action_name),
            INDEX idx_window (window_start)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $stmt = $pdo->prepare("SELECT id, request_count, window_start FROM rate_limits WHERE ip = :ip AND action_name = :action AND window_start >= :cutoff ORDER BY id DESC LIMIT 1");
        $stmt->execute([':ip' => $ip, ':action' => $action, ':cutoff' => $cutoff]);
        $row = $stmt->fetch();

        if ($row) {
            if ($row['request_count'] >= $max_requests) {
                return false;
            }
            $upd = $pdo->prepare("UPDATE rate_limits SET request_count = request_count + 1 WHERE id = :id");
            $upd->execute([':id' => $row['id']]);
        } else {
            $ins = $pdo->prepare("INSERT INTO rate_limits (ip, action_name, request_count, window_start) VALUES (:ip, :action, 1, :now)");
            $ins->execute([':ip' => $ip, ':action' => $action, ':now' => $now]);
        }
    } catch (Exception $e) {
        return true;
    }
    return true;
}

function ensure_users_table($pdo) {
    static $created = false;
    if ($created) return;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            no_hp VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            level INT DEFAULT 1,
            bab INT DEFAULT 1,
            bintang_bab1 INT DEFAULT 0,
            bintang_bab2 INT DEFAULT 0,
            bintang_bab3 INT DEFAULT 0,
            bintang_bab4 INT DEFAULT 0,
            bintang_bab5 INT DEFAULT 0,
            total_bintang INT DEFAULT 0,
            last_active DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_no_hp (no_hp),
            INDEX idx_bab (bab)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        $created = true;
    } catch (Exception $e) {
        error_log("Failed to ensure users table: " . $e->getMessage());
    }
}

$action = $_GET['action'] ?? '';
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? $_POST;

switch ($action) {
    case 'ping':
    case 'analytics':
        handle_ping($pdo, $data);
        break;

    case 'register':
        if (!check_api_rate_limit($pdo, 'register', 12, 300)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Terlalu banyak permintaan pendaftaran. Silakan coba lagi beberapa menit lagi.']);
            exit;
        }
        handle_register($pdo, $data);
        break;
        
    case 'login':
        if (!check_api_rate_limit($pdo, 'login', 15, 300)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Terlalu banyak percobaan login gagal/berulang. Silakan coba 5 menit lagi.']);
            exit;
        }
        handle_login($pdo, $data);
        break;
        
    case 'progress':
        if (!check_api_rate_limit($pdo, 'progress', 60, 300)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Sinkronisasi progres terlalu sering.']);
            exit;
        }
        handle_progress($pdo, $data);
        break;
        
    case 'feedback':
        if (!check_api_rate_limit($pdo, 'feedback', 5, 300)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Terlalu banyak masukan yang dikirim dalam waktu singkat. Mohon tunggu beberapa saat.']);
            exit;
        }
        handle_save_feedback($pdo, $data);
        break;
        
    case 'feedbacks':
        handle_get_feedbacks($pdo);
        break;
        
    case 'students':
        handle_get_students($pdo);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Aksi tidak valid atau tidak ditemukan.']);
        break;
}

function handle_ping($pdo, $data) {
    if (!check_api_rate_limit($pdo, 'ping', 120, 60)) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Rate limit exceeded']);
        return;
    }

    $sessionToken = trim($data['session_token'] ?? '');
    if (empty($sessionToken) || strlen($sessionToken) < 8 || strlen($sessionToken) > 64) {
        $sessionToken = bin2hex(random_bytes(16));
    }
    $sessionToken = preg_replace('/[^a-zA-Z0-9_\-]/', '', $sessionToken);

    $userId = !empty($data['user_id']) ? intval($data['user_id']) : null;
    $studentName = !empty($data['student_name']) ? mb_substr(trim($data['student_name']), 0, 100) : null;
    $view = !empty($data['view']) ? mb_substr(trim($data['view']), 0, 50) : 'home';

    $ip = substr($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', 0, 45);
    $salt = defined('ADMIN_PASSKEY') ? ADMIN_PASSKEY : 'jurumiplay_salt';
    $ipHash = hash('sha256', $ip . $salt);
    $visitorHash = hash('sha256', $ip . $sessionToken . $salt);

    $userAgent = mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250);
    $now = date('Y-m-d H:i:s');
    $curDate = date('Y-m-d');
    $curTime = date('H:i:s');

    try {
        static $tablesCreated = false;
        if (!$tablesCreated) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS analytics_sessions (
                session_id VARCHAR(64) PRIMARY KEY,
                user_id INT NULL,
                student_name VARCHAR(100) NULL,
                ip_hash VARCHAR(64) NOT NULL,
                user_agent VARCHAR(255) NULL,
                current_view VARCHAR(50) DEFAULT 'home',
                first_seen DATETIME NOT NULL,
                last_active DATETIME NOT NULL,
                hits INT DEFAULT 1,
                INDEX idx_last_active (last_active),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $pdo->exec("CREATE TABLE IF NOT EXISTS analytics_daily_visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                visit_date DATE NOT NULL,
                visitor_hash VARCHAR(64) NOT NULL,
                user_id INT NULL,
                hits INT DEFAULT 1,
                first_seen TIME NOT NULL,
                last_seen TIME NOT NULL,
                UNIQUE KEY uniq_date_visitor (visit_date, visitor_hash),
                INDEX idx_visit_date (visit_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $tablesCreated = true;
        }

        // Upsert analytics_sessions
        $stmtSession = $pdo->prepare("INSERT INTO analytics_sessions 
            (session_id, user_id, student_name, ip_hash, user_agent, current_view, first_seen, last_active, hits)
            VALUES (:sid, :uid, :name, :ip_hash, :ua, :view, :now1, :now2, 1)
            ON DUPLICATE KEY UPDATE 
                user_id = COALESCE(:uid_up, user_id),
                student_name = COALESCE(:name_up, student_name),
                current_view = :view_up,
                last_active = :now_up,
                hits = hits + 1
        ");
        $stmtSession->execute([
            ':sid' => $sessionToken,
            ':uid' => $userId,
            ':name' => $studentName,
            ':ip_hash' => $ipHash,
            ':ua' => $userAgent,
            ':view' => $view,
            ':now1' => $now,
            ':now2' => $now,
            ':uid_up' => $userId,
            ':name_up' => $studentName,
            ':view_up' => $view,
            ':now_up' => $now
        ]);

        // Upsert analytics_daily_visitors
        $stmtDaily = $pdo->prepare("INSERT INTO analytics_daily_visitors
            (visit_date, visitor_hash, user_id, hits, first_seen, last_seen)
            VALUES (:vdate, :vhash, :uid, 1, :vtime1, :vtime2)
            ON DUPLICATE KEY UPDATE
                hits = hits + 1,
                last_seen = :vtime_up,
                user_id = COALESCE(:uid_up, user_id)
        ");
        $stmtDaily->execute([
            ':vdate' => $curDate,
            ':vhash' => $visitorHash,
            ':uid' => $userId,
            ':vtime1' => $curTime,
            ':vtime2' => $curTime,
            ':vtime_up' => $curTime,
            ':uid_up' => $userId
        ]);

        // Probabilistic cleanup (1%)
        if (mt_rand(1, 100) === 1) {
            $pdo->exec("DELETE FROM analytics_sessions WHERE last_active < NOW() - INTERVAL 48 HOUR");
        }

        // Online count in last 5 minutes
        $stmtOnline = $pdo->query("SELECT COUNT(DISTINCT session_id) FROM analytics_sessions WHERE last_active >= NOW() - INTERVAL 5 MINUTE");
        $onlineCount = (int)($stmtOnline->fetchColumn() ?: 1);

        echo json_encode([
            'success' => true,
            'session_token' => $sessionToken,
            'online' => $onlineCount
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error recording ping: ' . $e->getMessage()]);
    }
}

function handle_save_feedback($pdo, $data) {
    $nama = mb_substr(trim($data['nama'] ?? $data['sender'] ?? 'Santri'), 0, 100);
    $email = mb_substr(trim($data['email'] ?? ''), 0, 150);
    $no_hp = mb_substr(trim($data['no_hp'] ?? $data['kontak'] ?? $data['phone'] ?? ''), 0, 35);
    $pesan = mb_substr(trim($data['pesan'] ?? $data['message'] ?? $data['saran'] ?? ''), 0, 2000);
    $user_id = !empty($data['user_id']) ? intval($data['user_id']) : null;
    
    if (empty($pesan) || mb_strlen($pesan) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Pesan masukan atau ide tidak boleh kosong (minimal 3 karakter).']);
        return;
    }
    
    try {
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
        
        $stmt = $pdo->prepare("INSERT INTO feedbacks (user_id, nama, email, no_hp, pesan, status, created_at) VALUES (:user_id, :nama, :email, :no_hp, :pesan, 'unread', NOW())");
        $stmt->execute([
            ':user_id' => $user_id,
            ':nama' => $nama,
            ':email' => $email,
            ':no_hp' => $no_hp,
            ':pesan' => $pesan
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Masukan atau ide aplikasi berhasil dikirim. Terima kasih banyak!'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Terjadi kesalahan basis data: ' . $e->getMessage()]);
    }
}

function handle_get_feedbacks($pdo) {
    $passkey = $_GET['passkey'] ?? $_SERVER['HTTP_X_PASSKEY'] ?? '';
    if (!hash_equals(ADMIN_PASSKEY, (string)$passkey)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Akses ditolak: Passkey admin tidak valid.']);
        return;
    }
    
    try {
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

        $stmt = $pdo->query("SELECT * FROM feedbacks ORDER BY id DESC");
        $feedbacks = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'total' => count($feedbacks),
            'feedbacks' => $feedbacks
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Terjadi kesalahan basis data: ' . $e->getMessage()]);
    }
}

function handle_register($pdo, $data) {
    ensure_users_table($pdo);
    $nama = mb_substr(trim($data['nama'] ?? $data['student_name'] ?? ''), 0, 100);
    $email = mb_substr(trim(strtolower($data['email'] ?? '')), 0, 150);
    $no_hp = mb_substr(trim($data['no_hp'] ?? $data['phone'] ?? ''), 0, 35);
    $password = (string)($data['password'] ?? '');
    
    if (empty($nama) || empty($email) || empty($no_hp) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Semua kolom (nama, email, no handphone, password) wajib diisi.']);
        return;
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Kata sandi minimal 6 karakter.']);
        return;
    }
    
    if (strlen($password) > 128) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Kata sandi terlalu panjang (maksimal 128 karakter).']);
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Format email tidak valid.']);
        return;
    }
    
    try {
        // Check existing email
        $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $check->execute([':email' => $email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Email ini sudah terdaftar. Silakan masuk dengan akun Anda.']);
            return;
        }
        
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Calculate star breakdowns if provided
        $stars = calculate_stars($data);
        $level = intval($data['level'] ?? 1);
        $bab = intval($data['bab'] ?? 1);
        
        $stmt = $pdo->prepare("INSERT INTO users 
            (nama, email, no_hp, password, level, bab, bintang_bab1, bintang_bab2, bintang_bab3, bintang_bab4, bintang_bab5, total_bintang)
            VALUES (:nama, :email, :no_hp, :password, :level, :bab, :b1, :b2, :b3, :b4, :b5, :total)");
            
        $stmt->execute([
            ':nama' => $nama,
            ':email' => $email,
            ':no_hp' => $no_hp,
            ':password' => $hash,
            ':level' => $level,
            ':bab' => $bab,
            ':b1' => $stars['b1'],
            ':b2' => $stars['b2'],
            ':b3' => $stars['b3'],
            ':b4' => $stars['b4'],
            ':b5' => $stars['b5'],
            ':total' => $stars['total']
        ]);
        
        $userId = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Pendaftaran santri berhasil.',
            'user' => [
                'id' => $userId,
                'nama' => $nama,
                'email' => $email,
                'no_hp' => $no_hp,
                'level' => $level,
                'bab' => $bab,
                'bintang_bab1' => $stars['b1'],
                'bintang_bab2' => $stars['b2'],
                'bintang_bab3' => $stars['b3'],
                'bintang_bab4' => $stars['b4'],
                'bintang_bab5' => $stars['b5'],
                'total_bintang' => $stars['total']
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Terjadi kesalahan basis data: ' . $e->getMessage()]);
    }
}

function handle_login($pdo, $data) {
    ensure_users_table($pdo);
    $identifier = mb_substr(trim($data['identifier'] ?? $data['email'] ?? ''), 0, 150);
    $password = (string)($data['password'] ?? '');
    
    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email/No HP dan password wajib diisi.']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :id1 OR no_hp = :id2 LIMIT 1");
        $stmt->execute([':id1' => $identifier, ':id2' => $identifier]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            usleep(300000); // 300ms timing attack defense
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Email/No HP atau password salah.']);
            return;
        }
        
        unset($user['password']);
        echo json_encode([
            'success' => true,
            'message' => 'Login berhasil.',
            'user' => $user
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Terjadi kesalahan basis data: ' . $e->getMessage()]);
    }
}

function handle_progress($pdo, $data) {
    ensure_users_table($pdo);
    $userId = intval($data['user_id'] ?? 0);
    $email = trim($data['email'] ?? '');
    $studentName = trim($data['student_name'] ?? '');
    
    try {
        $user = null;
        if ($userId > 0) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch();
        } elseif (!empty($email)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();
        } elseif (!empty($studentName)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE nama = :nama ORDER BY id DESC LIMIT 1");
            $stmt->execute([':nama' => $studentName]);
            $user = $stmt->fetch();
        }
        
        if (!$user) {
            echo json_encode(['success' => true, 'notice' => 'Santri bermain sebagai tamu (belum login).']);
            return;
        }
        
        // Parse Chapter / Level
        $bab = $user['bab'];
        $level = $user['level'];
        
        if (isset($data['bab'])) {
            $bab = intval($data['bab']);
        } elseif (isset($data['current_chapter'])) {
            if (preg_match('/bab_0?([0-9]+)/', $data['current_chapter'], $m)) {
                $bab = intval($m[1]);
            }
        }
        
        if (isset($data['level'])) {
            $level = intval($data['level']);
        } elseif (isset($data['current_level'])) {
            if (preg_match('/level_[0-9]+_([0-9]+)/', $data['current_level'], $m)) {
                $level = intval($m[1]);
            }
        }
        
        $stars = calculate_stars($data, $user);
        
        $update = $pdo->prepare("UPDATE users SET 
            level = :level, 
            bab = :bab, 
            bintang_bab1 = :b1, 
            bintang_bab2 = :b2, 
            bintang_bab3 = :b3, 
            bintang_bab4 = :b4, 
            bintang_bab5 = :b5, 
            total_bintang = :total,
            last_active = NOW()
            WHERE id = :id");
            
        $update->execute([
            ':level' => $level,
            ':bab' => $bab,
            ':b1' => $stars['b1'],
            ':b2' => $stars['b2'],
            ':b3' => $stars['b3'],
            ':b4' => $stars['b4'],
            ':b5' => $stars['b5'],
            ':total' => $stars['total'],
            ':id' => $user['id']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Progres santri berhasil disimpan.',
            'progress' => [
                'level' => $level,
                'bab' => $bab,
                'bintang_bab1' => $stars['b1'],
                'bintang_bab2' => $stars['b2'],
                'bintang_bab3' => $stars['b3'],
                'bintang_bab4' => $stars['b4'],
                'bintang_bab5' => $stars['b5'],
                'total_bintang' => $stars['total']
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Terjadi kesalahan basis data: ' . $e->getMessage()]);
    }
}

function calculate_stars($data, $existing = null) {
    $b1 = $existing ? $existing['bintang_bab1'] : 0;
    $b2 = $existing ? $existing['bintang_bab2'] : 0;
    $b3 = $existing ? $existing['bintang_bab3'] : 0;
    $b4 = $existing ? $existing['bintang_bab4'] : 0;
    $b5 = $existing ? $existing['bintang_bab5'] : 0;
    
    if (isset($data['bintang_bab1'])) $b1 = intval($data['bintang_bab1']);
    if (isset($data['bintang_bab2'])) $b2 = intval($data['bintang_bab2']);
    if (isset($data['bintang_bab3'])) $b3 = intval($data['bintang_bab3']);
    if (isset($data['bintang_bab4'])) $b4 = intval($data['bintang_bab4']);
    if (isset($data['bintang_bab5'])) $b5 = intval($data['bintang_bab5']);
    
    if (!empty($data['level_scores']) && is_array($data['level_scores'])) {
        $sumB1 = 0; $sumB2 = 0; $sumB3 = 0; $sumB4 = 0; $sumB5 = 0;
        foreach ($data['level_scores'] as $lvlId => $val) {
            $starCount = is_array($val) ? intval($val['stars'] ?? 3) : intval($val);
            if (strpos($lvlId, 'level_1_') === 0) $sumB1 += $starCount;
            elseif (strpos($lvlId, 'level_2_') === 0) $sumB2 += $starCount;
            elseif (strpos($lvlId, 'level_3_') === 0) $sumB3 += $starCount;
            elseif (strpos($lvlId, 'level_4_') === 0) $sumB4 += $starCount;
            elseif (strpos($lvlId, 'level_5_') === 0) $sumB5 += $starCount;
        }
        if ($sumB1 > 0) $b1 = max($b1, $sumB1);
        if ($sumB2 > 0) $b2 = max($b2, $sumB2);
        if ($sumB3 > 0) $b3 = max($sumB3, $b3);
        if ($sumB4 > 0) $b4 = max($b4, $sumB4);
        if ($sumB5 > 0) $b5 = max($b5, $sumB5);
    }
    
    $total = $b1 + $b2 + $b3 + $b4 + $b5;
    return ['b1' => $b1, 'b2' => $b2, 'b3' => $b3, 'b4' => $b4, 'b5' => $b5, 'total' => $total];
}

function handle_get_students($pdo) {
    ensure_users_table($pdo);
    $passkey = $_GET['passkey'] ?? $_SERVER['HTTP_X_PASSKEY'] ?? '';
    if (!hash_equals(ADMIN_PASSKEY, (string)$passkey)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Akses ditolak: Passkey admin tidak valid.']);
        return;
    }
    
    try {
        $stmt = $pdo->query("SELECT id, nama, email, no_hp, level, bab, bintang_bab1, bintang_bab2, bintang_bab3, bintang_bab4, bintang_bab5, total_bintang, last_active, created_at FROM users ORDER BY id DESC");
        $students = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'total' => count($students),
            'students' => $students
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Terjadi kesalahan basis data: ' . $e->getMessage()]);
    }
}
