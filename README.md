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
  - 접속중인 포트 등
  
### 2. `db_init` 폴더
- 수집된 데이터를 데이터베이스에 저장하는 역할을 합니다.
- 로그 데이터를 관리하여 기간별 통계를 제공할 수 있도록 구성합니다.
- 사용 기술: MySQL

### 3. `src` 폴더
- Express를 이용해 API 라우팅을 구현합니다.
- 클라이언트(프론트엔드)와 통신하여 필요한 데이터를 제공합니다.
- 주요 API 기능:
  - 서버 상태 데이터 조회
  - 기간별 로그 데이터 제공
  - 챗봇과 통신

## 기술 스택
- **백엔드 프레임워크**: Express.js
- **데이터 수집**: Linux 명령어 (예: `top`, `df`, `netstat`, `ifconfig` 등)
- **데이터 저장**: JSON 파일, MySQL
- **기타**: Open AI

## 설치 및 실행 방법
### 1. 프로젝트 클론
```sh
git clone https://github.com/PointToPointNet/Back-End/ [directory]
cd [directory]
```

### 2. 패키지 설치
```sh
npm install
```

### 4. 데이터베이스 초기화
```sh
node db_init/app.js
```

### 5. 서버 실행
```sh
npm start
```

## 사용 방법
1. 클라이언트(프론트엔드)에서 API를 호출하여 서버 상태 데이터를 조회합니다.
2. 수집된 데이터는 JSON 파일로 저장되거나, 필요 시 데이터베이스에서 조회할 수 있습니다.
3. 기간별 로그 데이터를 활용하여 통계를 분석할 수 있습니다.
