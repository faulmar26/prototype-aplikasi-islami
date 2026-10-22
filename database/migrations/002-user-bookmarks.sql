CREATE TABLE user_bookmark_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('quran', 'dua', 'custom') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_bookmark_category_name (user_id, name),
    INDEX idx_user_bookmark_categories_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    content_type ENUM('quran', 'dua') NOT NULL,
    surah_number INT NULL,
    ayah_number INT NULL,
    dua_id INT NULL,
    content_key VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_bookmark_category_content (category_id, content_key),
    INDEX idx_user_bookmarks_user_category (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES user_bookmark_categories(id)
);
