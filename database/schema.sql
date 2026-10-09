CREATE DATABASE IF NOT EXISTS islami_app;
USE islami_app;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    default_location VARCHAR(100),
    calculation_method VARCHAR(50) DEFAULT 'Muslim World League',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prayer schedules table
CREATE TABLE prayer_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    schedule_date DATE NOT NULL,
    fajr TIME,
    dhuhr TIME,
    asr TIME,
    maghrib TIME,
    isha TIME,
    latitude FLOAT,
    longitude FLOAT,
    method VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Surah table
CREATE TABLE surah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_arabic VARCHAR(100) NOT NULL,
    name_latin VARCHAR(100) NOT NULL,
    total_ayah INT NOT NULL
);

-- Ayah table
CREATE TABLE ayah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    surah_id INT NOT NULL,
    number INT NOT NULL,
    text_arabic TEXT,
    translation TEXT,
    audio_url VARCHAR(500),
    FOREIGN KEY (surah_id) REFERENCES surah(id)
);

-- Bookmark table
CREATE TABLE bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ayah_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ayah_id) REFERENCES ayah(id)
);

-- Doa category table
CREATE TABLE doa_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Doa table
CREATE TABLE doa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    text_arabic TEXT NOT NULL,
    latin TEXT,
    translation TEXT,
    FOREIGN KEY (category_id) REFERENCES doa_category(id)
);

-- Mission table
CREATE TABLE missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    target_count INT NOT NULL,
    reward_points INT NOT NULL DEFAULT 10,
    is_daily BOOLEAN DEFAULT TRUE
);

-- User mission progress table
CREATE TABLE user_mission_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_id INT NOT NULL,
    current_count INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    progress_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mission_id) REFERENCES missions(id),
    UNIQUE KEY uq_user_mission_day (user_id, mission_id, progress_date)
);

-- Last-read Quran and dua position for each account
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

-- Streak table
CREATE TABLE streak (
    user_id INT PRIMARY KEY,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Article table
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    author_id INT,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_prayer_schedules_user_date ON prayer_schedules(user_id, schedule_date);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_user_mission_progress_user ON user_mission_progress(user_id);
CREATE INDEX idx_articles_status ON articles(status);

INSERT INTO missions (code, title, type, target_count, reward_points, is_daily) VALUES
    ('login_daily', 'Login harian', 'login', 1, 5, TRUE),
    ('read_quran', 'Baca satu surah', 'quran', 1, 10, TRUE),
    ('read_dua', 'Baca satu doa', 'dua', 1, 5, TRUE);