-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

-- 2. 사용자(회원) 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- 3. 할 일(To-do List) 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
    todo_id INT AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    todo_date DATE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    classify varchar(50) NOT NULL,
    content TEXT NOT NULL,
    is_completed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    classify VARCHAR(50) NOT NULL,
    PRIMARY KEY (todo_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

USE todo_db;
ALTER TABLE todos ADD COLUMN classify VARCHAR(50) NOT NULL AFTER subject;