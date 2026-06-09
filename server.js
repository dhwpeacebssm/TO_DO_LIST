// 예시: 사용자가 웹 화면에서 새로운 할 일을 등록했을 때 백엔드(server.js)에서 실행할 코드
app.post('/api/todos', (req, res) => {
    const { user_id, todo_date, subject, content } = req.body;
    
    // 작성하신 todos 테이블 구조에 맞게 INSERT 문을 날립니다.
    const query = `INSERT INTO todos (user_id, todo_date, subject, content) VALUES (?, ?, ?, ?)`;
    
    db.query(query, [user_id, todo_date, subject, content], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "할 일 등록 성공!" });
    });
});