-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE todo_db;
USE todo_db;

-- 2. 사용자(회원) 테이블 생성
CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL,          -- 사용자 ID (중복 불가)
    password VARCHAR(255) NOT NULL,        -- 비밀번호 (암호화 저장을 위해 길게 설정)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 가입 일자
    PRIMARY KEY (user_id)                  -- user_id를 기본키로 지정
);

-- 3. 할 일(To-do List) 테이블 생성
CREATE TABLE todos (
    todo_id INT AUTO_INCREMENT,            -- 할 일 고유 번호 (자동 증가)
    user_id VARCHAR(50) NOT NULL,          -- 작성자 ID (users 테이블과 연결)
    todo_date DATE NOT NULL,               -- 캘린더에 넣을 날짜 (연-월-일)
    subject VARCHAR(100) NOT NULL,         -- 과목
    content TEXT NOT NULL,                 -- 사용자가 할 일 (글자 수 제한이 적은 TEXT 타입)
    is_completed TINYINT(1) DEFAULT 0,    -- 완료 여부 (0: 미완료, 1: 완료 - 추가해두면 유용합니다)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 등록 일자
    PRIMARY KEY (todo_id),
    -- 외래키 설정: 존재하는 회원만 할 일을 등록할 수 있도록 연결
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);