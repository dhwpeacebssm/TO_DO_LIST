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
    password: '12341234', // 👈 본인의 실제 MySQL root 비밀번호를 입력하세요!
    database: 'todo_db',
    dateStrings: true      
});

db.connect((err) => {
    if (err) {
        console.error('❌ MySQL 연결 실패:', err);
        return;
    }
    console.log('✅ MySQL 데이터베이스 연결 성공!');
});

// 메인 페이지 (website.html 제공)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website.html'));
});

// [기능 1] 로그인 및 회원가입 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: '아이디와 비밀번호를 모두 입력해주세요.' });
    }

    const userQuery = 'SELECT * FROM users WHERE user_id = ?';
    db.query(userQuery, [username], async (err, results) => {
        if (err) {
            console.error("❌ 로그인 DB 조회 에러:", err);
            return res.status(500).json({ success: false, message: '데이터베이스 조회 중 오류가 발생했습니다.' });
        }

        // 1. 사용자가 없으면 자동 회원가입 진행
        if (results.length === 0) {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const insertQuery = 'INSERT INTO users (user_id, password) VALUES (?, ?)';
                
                db.query(insertQuery, [username, hashedPassword], (insErr) => {
                    if (insErr) {
                        console.error("❌ 회원가입 SQL 실행 실패:", insErr);
                        return res.status(500).json({ success: false, message: '회원가입 등록 실패' });
                    }
                    console.log(`✅ 새 유저 자동 회원가입 성공: ${username}`);
                    return res.json({ success: true, username, message: '자동 회원가입 완료 및 로그인 성공!' });
                });
            } catch (hashErr) {
                console.error("❌ 비밀번호 암호화 실패:", hashErr);
                return res.status(500).json({ success: false, message: '비밀번호 암호화 처리 오류' });
            }
        } 
        // 2. 사용자가 존재하면 비밀번호 검증 진행
        else {
            const user = results[0];
            try {
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (!isMatch) {
                    return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
                }
                
                console.log(`✅ 로그인 성공: ${username}`);
                return res.json({ success: true, username: user.user_id, message: '로그인 성공!' });
            } catch (compErr) {
                console.error("❌ 비밀번호 비교 에러:", compErr);
                return res.status(500).json({ success: false, message: '비밀번호 검증 중 오류가 발생했습니다.' });
            }
        }
    });
});

// [기능 2] 새 과목(To-Do) 추가 API
app.post('/api/todos', (req, res) => {
    const { user_id, todo_date, subject, content } = req.body;
    const classify = subject; 

    const query = 'INSERT INTO todos (user_id, todo_date, subject, classify, content) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [user_id, todo_date, subject, classify, content], (err, result) => {
        if (err) {
            console.error("❌ 데이터 추가 실패 원인:", err);
            return res.status(500).json({ success: false, error: '데이터 추가 실패' });
        }
        return res.json({ success: true, message: '일정이 등록되었습니다.' });
    });
});

// [기능 3] 사용자의 일정 목록 가져오기 API
app.get('/api/todos/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const query = 'SELECT todo_id, todo_date, subject, content, is_completed FROM todos WHERE user_id = ? ORDER BY todo_date ASC';
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("❌ 일정 조회 실패:", err);
            return res.status(500).json({ success: false, error: '조회 실패' });
        }
        return res.json(results);
    });
});

// [기능 4] 할 일 완료 여부 토글 API
app.put('/api/todos/:todo_id', (req, res) => {
    const todoId = req.params.todo_id;
    const { is_completed } = req.body;

    const query = 'UPDATE todos SET is_completed = ? WHERE todo_id = ?';
    db.query(query, [is_completed, todoId], (err, result) => {
        if (err) {
            console.error("❌ 상태 토글 업데이트 실패:", err);
            return res.status(500).json({ success: false, error: '수정 실패' });
        }
        return res.json({ success: true, message: '수정 완료' });
    });
});

// 서버 실행 확인용 로그 보완
app.listen(PORT, () => {
    console.log(`🚀 서버 구동 완료! 주소창에 주소를 직접 복사해 붙여넣어 보세요 -> http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 포트 ${PORT}번이 이미 사용 중입니다. 기존 노드 프로세스를 완전히 종료하거나 포트 번호를 변경하세요.`);
    } else {
        console.error('❌ 서버 실행 에러:', err);
    }
});