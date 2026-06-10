# Todo Plan
## 주제: To_do_list

### 핵심기능
### 1. 사용자 아이디와 비밀번호를 입력받고 회원가입 및 로그인
### 2. 사용자가 원하는 과목과 날짜를 입력받고 캘린더에 보여줌
### 3. today 체크리스트

### 테이블 구성
### 1. users
#### 1. user_id(varchar(50), not null): 사용자의 아이디를 입력받는다. 필수입력, 기본키
#### 2. password(varchar(225), not null): 사용자의 비밀번호를 입력받는다. 보안을 위해 저장장소를 늘렸다. 필수입력
#### 3. created_at (timestamp): 가입날짜를 받음

### 2. todos
#### 1. todo_id(int, auto increament): 자동으로 값 증가, 기본키
#### 2. user_id(varchar(50)): 왜래키
#### 3. todo_date(date, not null): 추가한 과목의 날짜를 입력받음. 팔수입력
#### 4. subject(varchar(100)): 추가한 과목 이름을 입력받음
#### 5. classify varchar(50) NOT NULL: 과목을 분류할 공부, 수행평가, 기타 중 한 개 선택한 것을 입력받음
#### 6. content TEXT NOT NULL: 
#### 7. is_complete TINYINT(1): 체크리스트에서 오늘할 것을 했는지, 참 거짓으로 받기 => TINYINT 사용

