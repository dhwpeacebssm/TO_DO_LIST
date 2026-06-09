const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// JSON 및 Form 데이터 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12341234', // 👈 필수 수정!
    database: 'todo_db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공!');
});

// 메인 페이지 (website.html 제공)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website.html'));
});

// [기능 1] 로그인 및 회원가입 API
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. 기존 유저가 있는지 확인
        const userQuery = 'SELECT * FROM users WHERE user_id = ?';
        db.query(userQuery, [username], async (err, results) => {
            if (err) return res.status(500).json({ error: 'DB 조회 에러' });

            if (results.length > 0) {
                // 유저가 존재하면 -> 비밀번호 검증 (로그인)
                const isMatch = await bcrypt.compare(password, results[0].password);
                if (isMatch) {
                    return res.json({ success: true, message: '로그인 성공', username });
                } else {
                    return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                // 유저가 없으면 -> 신규 가입
                const hashedPassword = await bcrypt.hash(password, 10);
                const registerQuery = 'INSERT INTO users (user_id, password) VALUES (?, ?)';
                db.query(registerQuery, [username, hashedPassword], (err, result) => {
                    if (err) return res.status(500).json({ error: '회원가입 에러' });
                    return res.json({ success: true, message: '자동 회원가입 완료 및 로그인 성공', username });
                });
            }
        });
    } catch (e) {
        res.status(500).json({ error: '서버 에러' });
    }
});

// [기능 2] 새 과목(To-Do) 추가 API
app.post('/api/todos', (req, res) => {
    const { user_id, todo_date, subject, content } = req.body;

    const query = 'INSERT INTO todos (user_id, todo_date, subject, content) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, todo_date, subject, content], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '데이터 추가 실패' });
        }
        res.json({ success: true, message: '일정이 등록되었습니다.' });
    });
});

// [기능 3] 사용자의 이번 주 일정 가져오기 API
app.get('/api/todos/:user_id', (req, res) => {
    const userId = req.params.user_id;
    // 간이 구현을 위해 사용자의 전체 일정을 조회합니다.
    const query = 'SELECT todo_date, subject, content, is_completed FROM todos WHERE user_id = ? ORDER BY todo_date ASC';
    
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: '조회 실패' });
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});