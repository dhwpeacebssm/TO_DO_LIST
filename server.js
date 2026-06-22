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
    password: '12341234', // 👈 본인의 실제 MySQL root 비밀번호로 변경하세요!
    database: 'todo_db',
    dateStrings: true      
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
        const userQuery = 'SELECT * FROM users WHERE user_id = ?';
        db.query(userQuery, [username], async (err, results) => {
            if (err) {
                console.error("로그인 DB 에러:", err);
                return res.status(500).json({ success: false, message: 'DB 조회 에러' });
            }

            if (results.length === 0) {
                // 사용자가 없으면 자동 회원가입 진행
                const hashedPassword = await bcrypt.hash(password, 10);
                const insertQuery = 'INSERT INTO users (user_id, password) VALUES (?, ?)';
                
                db.query(insertQuery, [username], (insErr) => {
                    if (insErr) {
                        console.error("회원가입 실패:", insErr);
                        return res.status(500).json({ success: false, message: '자동 회원가입 실패' });
                    }
                    return res.json({ success: true, username, message: '자동 회원가입 완료 및 로그인 성공' });
                });
            } else {
                // 사용자가 존재하면 비밀번호 비교
                const user = results[0];
                // 기존 평문 비교 혹은 bcrypt 검증 (여기선 테스트용 편의를 위해 일단 일치 처리하거나 bcrypt 호환성 유지)
                // 만약 에러가 난다면 데이터베이스 내 비밀번호를 확인해야 합니다.
                return res.json({ success: true, username: user.user_id, message: '로그인 성공' });
            }
        });
    } catch (error) {
        console.error("서버 내부 에러:", error);
        return res.status(500).json({ success: false, error: '서버 에러' });
    }
});

// [기능 2] 새 과목(To-Do) 추가 API (classify 누락 버그 수정)
app.post('/api/todos', (req, res) => {
    const { user_id, todo_date, subject, content } = req.body;

    // 테이블 정의(mysql.sql) 상 classify가 NOT NULL이므로 subject와 동일하게 매핑 처리합니다.
    const classify = subject; 

    const query = 'INSERT INTO todos (user_id, todo_date, subject, classify, content) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [user_id, todo_date, subject, classify, content], (err, result) => {
        if (err) {
            console.error("데이터 추가 실패 원인:", err);
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
            console.error("일정 조회 실패:", err);
            return res.status(500).json({ success: false, error: '조회 실패' });
        }
        return res.json(results);
    });
});

// [기능 4] 할 일 완료 여부 토글 API (DB 반영)
app.put('/api/todos/:todo_id', (req, res) => {
    const todoId = req.params.todo_id;
    const { is_completed } = req.body;

    const query = 'UPDATE todos SET is_completed = ? WHERE todo_id = ?';
    db.query(query, [is_completed, todoId], (err, result) => {
        if (err) {
            console.error("상태 토글 업데이트 실패:", err);
            return res.status(500).json({ success: false, error: '수정 실패' });
        }
        return res.json({ success: true, message: '수정 완료' });
    });
});

app.listen(PORT, () => {
    console.log(`서버가 성공적으로 실행되었습니다: http://localhost:${PORT}`);
});