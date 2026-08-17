/**
 * Code.gs — 수학 진단평가 앱의 결과를 Google Sheets에 누적 저장하는 Apps Script 웹앱.
 *
 * 배포 방법 (교사가 최초 1회만 수행):
 * 1) 결과를 저장할 Google 스프레드시트를 새로 만들거나 기존 시트를 엽니다.
 * 2) 메뉴에서 확장 프로그램 > Apps Script 를 클릭합니다.
 * 3) 열린 편집기의 기본 코드를 모두 지우고 이 파일(Code.gs)의 내용을 붙여넣습니다.
 * 4) 저장한 뒤 우측 상단 "배포" > "새 배포"를 클릭합니다.
 * 5) 유형 선택에서 "웹 앱"을 선택합니다.
 *    - 실행 계정: "나(내 계정)"
 *    - 액세스 권한이 있는 사용자: "모든 사용자" (앱에서 로그인 없이 POST하기 위해 필요)
 * 6) "배포"를 클릭하고 나오는 웹앱 URL(.../exec 로 끝남)을 복사합니다.
 * 7) 앱의 [설정] 화면에 그 URL을 붙여넣고 저장합니다.
 *
 * 시트 스키마 (긴 형식, 헤더가 없으면 자동 생성):
 *   학생명 | 날짜 | 영역 | 도달레벨 | 정답률 | 중단사유
 */

var SHEET_NAME = '진단결과';
var HEADERS = ['학생명', '날짜', '영역', '도달레벨', '정답률', '중단사유'];

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  var result = { ok: false };
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('요청 본문이 비어 있습니다.');
    }
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();
    var row = HEADERS.map(function (key) {
      return data[key] !== undefined ? data[key] : '';
    });
    sheet.appendRow(row);
    result.ok = true;
  } catch (err) {
    result.ok = false;
    result.error = String(err);
  }
  // 앱에서는 no-cors 모드로 요청을 보내 이 응답 본문을 실제로 읽지는 않지만,
  // 브라우저에서 직접 테스트할 때를 위해 JSON으로 응답한다.
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 배포 후 브라우저에서 웹앱 URL로 직접 접속했을 때 살아있는지 확인용
function doGet(e) {
  return ContentService.createTextOutput('수학 진단평가 결과 수집 웹앱이 정상 동작 중입니다.');
}
