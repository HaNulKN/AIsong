# 수학 진단평가 앱 (발달장애 학생용)

발달장애 학생을 대상으로 교사·치료사가 태블릿에서 함께 진행하는 수학 진단평가 안드로이드 앱입니다.
브라우저 접속이 아닌, APK를 태블릿에 직접 설치(사이드로드)하는 완전한 독립 앱입니다.

## 진단 영역 (7개 트랙)

수감각(4레벨) · 수세기(6레벨) · 덧셈(5레벨) · 뺄셈(5레벨) · 곱셈(5레벨) · 시계(6레벨) · 화폐(11레벨)

모든 문항은 인라인 SVG로 직접 그린 그림단서를 포함하고, 모든 한글 텍스트는 음성으로도 들을 수 있습니다.

## 진단 규칙 (공통 엔진)

- 레벨 내 연속 3문항 정답 → 즉시 다음 레벨로 승급
- 연속 3정답 없이 레벨 문항 소진 → 정답률 50% 이상이면 승급, 미만이면 그 레벨이 "최종 도달 레벨"
- 전체 문항 스트림에서 3연속 오답 → 즉시 해당 영역 진단 종료
- 교사용 컨트롤: 문항 건너뛰기 / 레벨 건너뛰기(강제 이동) / 진단 즉시 종료("미도달" 판정)

## 폴더 구조

```
math-app/
  www/                       웹앱 소스(순수 HTML/CSS/JS, 바닐라 JS)
    index.html
    css/style.css
    js/icons.js              공용 SVG 아이콘 라이브러리
    js/engine.js             공용 진단 엔진
    js/domains/*.js           7개 영역별 레벨/문항 생성 함수
    js/speech.js              TTS 헬퍼 (기존 index.html의 speak() 패턴 재사용)
    js/sound.js               Web Audio API 효과음
    js/sync.js                Google Sheets 동기화 큐
    js/print.js               인쇄 리포트
    js/app.js                 화면 전환/컨트롤러
  google-apps-script/Code.gs  Google Sheets 연동용 Apps Script
  android/                    Capacitor로 생성한 네이티브 안드로이드 프로젝트
  package.json, capacitor.config.json
```

## 1. 개발 중 웹앱만 확인하기

APK 빌드 없이 로직/화면만 빠르게 확인하려면 `www/index.html`을 브라우저(Chrome 권장, 음성합성 지원)로 직접 열면 됩니다.
단, 실제 태블릿 배포는 반드시 아래 APK 빌드 과정을 거쳐야 완전한 독립 앱으로 동작합니다.

## 2. APK 빌드 (GitHub Actions)

이 샌드박스에는 Android SDK가 없어 로컬에서 APK를 빌드할 수 없습니다. 대신 저장소에 포함된
`.github/workflows/build-math-app-apk.yml` 워크플로우가 push 시 자동으로 APK를 빌드합니다.

1. `math-app/**` 경로에 변경사항을 push 합니다(또는 GitHub Actions 탭에서 워크플로우를 수동 실행합니다).
2. GitHub 저장소의 **Actions** 탭 → **Build Math Diagnostic App APK** 워크플로우 실행 결과를 엽니다.
3. 빌드가 끝나면 **Artifacts** 영역에 `math-diagnostic-app-debug-apk`가 생성됩니다. 이를 다운로드하면
   `app-debug.apk` 파일을 얻을 수 있습니다.

로컬에 Android Studio / Android SDK가 설치되어 있다면 다음과 같이 직접 빌드할 수도 있습니다.

```bash
cd math-app
npm install
npx cap sync android
cd android
./gradlew assembleDebug
# 결과: android/app/build/outputs/apk/debug/app-debug.apk
```

## 3. 태블릿에 사이드로드 설치하기

1. 위에서 받은 `app-debug.apk` 파일을 태블릿으로 전송합니다(USB 케이블, 이메일, 클라우드 드라이브 등).
2. 태블릿 설정에서 **출처를 알 수 없는 앱 설치**(또는 "이 출처 허용")를 사용하는 앱(파일 관리자, 브라우저 등)에 대해 허용합니다.
   - 안드로이드 8 이상: 설정 > 앱 > 특별한 접근 > 알 수 없는 앱 설치에서 파일을 연 앱에 권한 부여
3. 파일 관리자에서 `app-debug.apk`를 눌러 설치를 진행합니다.
4. 설치가 끝나면 "수학 진단평가" 앱 아이콘이 생성됩니다. 앱스토어 등록 없이 완전히 독립적으로 실행됩니다.

## 4. Google Sheets 연동 설정 (선택 사항)

진단 결과를 회차마다 누적해 진도 추이를 보고 싶다면 Google Sheets 연동을 설정하세요. 인터넷이 없어도
진단 자체는 항상 완결되며, 시트 동기화는 부가 기능으로만 동작합니다(실패 시 로컬 큐에 저장 후 재시도).

1. `google-apps-script/Code.gs`의 안내 주석을 따라 Google Apps Script를 웹앱으로 배포합니다.
2. 배포 후 발급되는 웹앱 URL(`.../exec`로 끝남)을 앱의 **설정** 화면에 입력하고 저장합니다.
3. 이후 진단이 끝날 때마다 결과가 자동으로 스프레드시트에 한 줄씩(학생명·날짜·영역·도달레벨·정답률·중단사유) 추가됩니다.
4. 오프라인 상태였거나 URL이 없던 동안 쌓인 결과는 설정 화면의 **지금 동기화** 버튼 또는 앱 재실행 시 자동 재전송됩니다.

## 알려진 제약 사항 / TODO

- 인쇄 리포트는 `window.print()`를 기본으로 사용합니다. 안드로이드 네이티브 인쇄 다이얼로그(프린터 직접 출력)를
  더 확실하게 붙이려면 `js/print.js`의 TODO 주석대로 커스텀 Capacitor 플러그인을 추가로 개발해야 합니다.
- Google Sheets 전송은 Apps Script 웹앱의 CORS 제약을 피하기 위해 `no-cors` 모드로 전송합니다. 이 때문에
  앱은 전송 성공 여부를 응답으로 확인할 수 없고, 네트워크 오류가 없으면 성공으로 간주합니다(일반적으로 안정적입니다).
- 로컬 저장은 `localStorage`를 사용합니다. Capacitor Preferences 플러그인을 추가하면 더 견고한 네이티브
  저장소로 손쉽게 교체할 수 있도록 `js/sync.js`에 TODO 주석을 남겨두었습니다.
