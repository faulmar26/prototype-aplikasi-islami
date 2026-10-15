USE islami_app;

ALTER TABLE users
    MODIFY email VARCHAR(255) NULL,
    ADD COLUMN username VARCHAR(32) NULL AFTER id,
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER name;

ALTER TABLE users DROP COLUMN password;

UPDATE users
SET username = CONCAT('pengguna_', id)
WHERE username IS NULL;

ALTER TABLE users
    MODIFY username VARCHAR(32) NOT NULL,
    ADD UNIQUE KEY uq_users_username (username);

ALTER TABLE missions ADD COLUMN code VARCHAR(50) NULL AFTER id;
UPDATE missions SET code = CONCAT('legacy_', id) WHERE code IS NULL;
ALTER TABLE missions
    MODIFY code VARCHAR(50) NOT NULL,
    ADD UNIQUE KEY uq_missions_code (code);

DELETE older FROM user_mission_progress older
JOIN user_mission_progress newer
  ON older.user_id = newer.user_id
 AND older.mission_id = newer.mission_id
 AND older.progress_date = newer.progress_date
 AND older.id > newer.id;

ALTER TABLE user_mission_progress
    ADD UNIQUE KEY uq_user_mission_day (user_id, mission_id, progress_date);

CREATE TABLE user_reading_progress (
    user_id INT PRIMARY KEY,
    last_surah_number INT NULL,
    last_surah_name VARCHAR(100) NULL,
    last_ayah_number INT NULL,
    last_dua_id INT NULL,
    last_dua_title VARCHAR(100) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO missions (code, title, type, target_count, reward_points, is_daily) VALUES
    ('login_daily', 'Login harian', 'login', 1, 5, TRUE),
    ('read_quran', 'Baca satu surah', 'quran', 1, 10, TRUE),
    ('read_dua', 'Baca satu doa', 'dua', 1, 5, TRUE);
