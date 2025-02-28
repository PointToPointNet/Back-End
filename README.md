# 네트워크 대시보드 백엔드

## 개요
네트워크 대시보드의 백엔드는 서버들의 네트워크 상태 데이터를 수집, 저장 및 제공하는 역할을 합니다. Linux 명령어를 활용하여 데이터를 수집하고, 이를 가공하여 JSON 형식으로 저장한 후, Express를 이용해 클라이언트와 통신합니다. 또한, 데이터베이스를 활용하여 로그를 저장하고 관리합니다.

## 폴더 구조
### 1. `server` 폴더
- Linux 명령어를 사용하여 네트워크 및 시스템 정보를 수집합니다.
- 수집된 데이터를 사용하기 쉽게 가공하여 JSON 파일로 저장합니다.
- 주요 수집 데이터:
  - CPU 및 메모리 사용량
  - 네트워크 전송 속도 (bps)
  - 디스크 사용량
  - 현재 접속 중인 사용자 수
  
### 2. `db_init` 폴더
- 수집된 데이터를 데이터베이스에 저장하는 역할을 합니다.
- 로그 데이터를 관리하여 기간별 통계를 제공할 수 있도록 구성합니다.
- 사용 기술: MySQL 또는 PostgreSQL (필요에 따라 변경 가능)

### 3. `src` 폴더
- Express를 이용해 API 라우팅을 구현합니다.
- 클라이언트(프론트엔드)와 통신하여 필요한 데이터를 제공합니다.
- 주요 API 기능:
  - 서버 상태 데이터 조회
  - 기간별 로그 데이터 제공
  - 특정 서버의 상세 정보 요청 처리

## 기술 스택
- **백엔드 프레임워크**: Express.js
- **데이터 수집**: Linux 명령어 (예: `top`, `df`, `netstat` 등)
- **데이터 저장**: JSON 파일, MySQL/PostgreSQL
- **API 통신**: RESTful API

## 설치 및 실행 방법
### 1. 프로젝트 클론
```sh
git clone https://github.com/your-repo/network-dashboard-backend.git
cd network-dashboard-backend
```

### 2. 패키지 설치
```sh
yarn install  # 또는 npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 필요한 값을 설정합니다.
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=network_dashboard
```

### 4. 데이터베이스 초기화
```sh
yarn run db:init  # 또는 npm run db:init
```

### 5. 서버 실행
```sh
yarn start  # 또는 npm start
```

## 사용 방법
1. 클라이언트(프론트엔드)에서 API를 호출하여 서버 상태 데이터를 조회합니다.
2. 수집된 데이터는 JSON 파일로 저장되거나, 필요 시 데이터베이스에서 조회할 수 있습니다.
3. 기간별 로그 데이터를 활용하여 통계를 분석할 수 있습니다.

## 기여 방법
1. **이슈를 생성하여 버그 또는 기능 요청을 제안**합니다.
2. **프로젝트를 포크한 후 새로운 브랜치를 생성**합니다.
3. **기능을 추가하거나 버그를 수정한 후 PR을 제출**합니다.

## 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.

