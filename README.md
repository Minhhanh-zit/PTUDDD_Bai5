# Bài 5 - Ứng dụng Quản lý khóa học

Ứng dụng được xây dựng bằng React Native và Expo,
sử dụng MockAPI.io làm REST API backend.

## Công nghệ

- React Native và Expo SDK 57
- JavaScript
- Axios để gọi REST API
- React Navigation để chuyển màn hình
- React Native WebView để phát trailer
- Ionicons và giao diện pastel

## Chức năng

- Hiển thị danh sách khóa học từ MockAPI
- Tìm kiếm và lọc theo danh mục
- Xem chi tiết và phát trailer
- Thêm, sửa, xóa khóa học
- Kiểm tra dữ liệu nhập và xác nhận xóa
- Quản lý danh mục và kiểm tra ràng buộc khi xóa

## MockAPI

Base URL:

https://6ad61022f71f154ac4866450.mockapi.io

Resources:

- GET, POST /categories
- PUT, DELETE /categories/{id}
- GET, POST /courses
- GET /courses/{id}
- PUT, DELETE /courses/{id}

## Hướng dẫn chạy

Yêu cầu: Node.js, npm và Expo Go.

```bash
npm install
npx expo start --lan
```

Sau đó quét mã QR bằng Expo Go trên iPhone.



<!-- SCREENSHOTS_START -->
## Hình ảnh minh chứng

<!-- SCREENSHOTS_END -->
