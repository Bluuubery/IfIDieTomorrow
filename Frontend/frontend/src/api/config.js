//requests 각 프로퍼티의 key는 API 명세서 상 'config.js상 이름'으로 명시
//각 프로퍼티의 key 주석으로 API 이름 명시(API 이름은 전부 대문자로)

const requests = {
  //기본 URL 주소
  base_url: 'https://ifidietomorrow.co.kr/api',
  // base_url: 'https://70.12.246.220:8443/api',
  //카카오 소셜로그인 URL
  KAKAO_LOGIN:
    // 'https://70.12.246.220:8443/api/login/oauth2/code/kakao?redirect_uri=https://ifidietomorrow.co.kr/',
    'https://ifidietomorrow.co.kr/api/oauth2/authorization/kakao?redirect_uri=https://ifidietomorrow.co.kr/',
  // 'https://ifidietomorrow.co.kr/api/oauth2/authorization/kakao?redirect_uri=http://localhost:3000/',
  //구글 소셜로그인 URL
  NAVER_LOGIN:
    // 'https://70.12.246.220:8443/api/login/oauth2/code/naver?redirect_uri=https://ifidietomorrow.co.kr/',
    'https://ifidietomorrow.co.kr/api/oauth2/authorization/naver?redirect_uri=https://ifidietomorrow.co.kr/',
  // 'https://ifidietomorrow.co.kr/api/oauth2/authorization/naver?redirect_uri=http://localhost:3000/',

  //로그아웃
  GET_LOGOUT(userId) {
    return `/api/user/logout/${userId}`;
  },
  GET_USER() {
    return `/api/user`;
  },
  POST_LOGOUT() {
    return `/api/logout`;
  },
  DELETE_USER() {
    return `/api/delete`;
  },
  POST_ALL_PHOTO() {
    return `/api/photo`;
  },
  GET_ALL_PHOTO() {
    return `/api/photo`;
  },
  PATCH_PHOTO() {
    return `/api/photo`;
  },
  DELETE_PHOTO(photoId) {
    return `/api/photo/${photoId}`;
  },
  GET_PHOTO(categoryId) {
    return `/api/photo/${categoryId}`;
  },
  POST_CATEGORY() {
    return `/api/photo/category`;
  },
  PATCH_CATEGORY() {
    return `/api/photo/category`;
  },
  GET_ALL_CATEGORY() {
    return `/api/photo/category`;
  },
  DELETE_CATEGORY(categoryId) {
    return `/api/photo/category/${categoryId}`;
  },
  POST_DIARY() {
    return `/api/diary`;
  },
  GET_INSIGHT() {
    return `/api/insight`;
  },
  GET_USER_DIARY() {
    return `/api/diary`;
  },
  GET_DIARY(diaryId) {
    return `/api/diary/${diaryId}`;
  },
  PUT_DIARY() {
    return `/api/diary`;
  },
  DELETE_DIARY(diaryId) {
    return `/api/diary/${diaryId}`;
  },
  POST_BUCKET() {
    return `/api/bucket`;
  },
  GET_USER_BUCKET() {
    return `/api/bucket`;
  },
  GET_BUCKET(bucketId) {
    return `/api/bucket/${bucketId}`;
  },
  PUT_BUCKET() {
    return `/api/bucket`;
  },
  DELETE_BUCKET(bucketId) {
    return `/api/bucket/${bucketId}`;
  },
  GET_WILL() {
    return `/api/will`;
  },
  PATCH_WILL_SIGN() {
    return `/api/will/sign`;
  },
  PATCH_WILL_TEXT() {
    return `/api/will/text`;
  },
  PATCH_WILL_VIDEO() {
    return `/api/will/video`;
  },
  DELETE_WILL_VIDEO() {
    return `/api/will/video`;
  },
  GET_BUCKET_FEED(pageNo, pageSize) {
    return `/api/board/bucket?page=${pageNo}&size=${pageSize}`;
  },
  GET_DIARY_FEED(pageNo, pageSize) {
    return `/api/board/diary?page=${pageNo}&size=${pageSize}`;
  },
  POST_REPORT_FEED() {
    return `/api/board/report`;
  },
  POST_COMMENT() {
    return `/api/board/comment`;
  },
  DELETE_COMMENT(commentId) {
    return `/api/board/comment/${commentId}`;
  },
  PUT_COMMENT() {
    return `/api/board/comment`;
  },
  GET_REPORTED_FEEDLIST() {
    return `/api/admin/report`;
  },
  GET_REPORTED_FEED(type, typeId) {
    return `/api/admin/report/${type}/${typeId}`;
  },
  PUT_REPORT_COUNT() {
    return `/api/admin/report`;
  },
  POST_RECEIVER() {
    return `/api/receiver`;
  },
  GET_RECEIVER() {
    return `/api/receiver`;
  },
  DELETE_RECEIVER(receiverId) {
    return `/api/receiver/${receiverId}`;
  },
};

export default requests;