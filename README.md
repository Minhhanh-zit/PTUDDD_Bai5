# Bài 5: Ứng dụng Quản lý khóa học

Ứng dụng di động bằng **React Native + Expo SDK 57**, JavaScript và MockAPI REST API. Giao diện pastel.

## Chức năng
- Hiển thị khóa học, tìm kiếm không dấu, lọc danh mục từ API.
- Xem chi tiết, ảnh bìa URL, học phí, giảng viên, mô tả, thời lượng.
- Thêm / sửa / xóa khóa học qua API; xác nhận xóa và kiểm tra dữ liệu.
- CRUD danh mục từ API; kiểm tra phía ứng dụng để không xóa danh mục đang có khóa học.
- Trailer YouTube phát trong WebView; trạng thái loading, lỗi kết nối và danh sách rỗng.

## Cài đặt
Yêu cầu Node.js, npm và Expo Go tương thích với SDK.

~~~bash
npm install
npx expo start --lan
~~~

Dùng iPhone kết nối cùng mạng với máy Mac và quét mã QR bằng Expo Go.

## Đường dẫn MockAPI
https://6ad61022f71f154ac4866450.mockapi.io

| Phương thức | Endpoint | Chức năng |
| --- | --- | --- |
| GET, POST | /categories | Danh sách / thêm danh mục |
| PUT, DELETE | /categories/:id | Sửa / xóa danh mục |
| GET, POST | /courses | Danh sách / thêm khóa học |
| GET | /courses/:id | Chi tiết khóa học |
| PUT, DELETE | /courses/:id | Sửa / xóa khóa học |

Liên kết 1–N qua courses.categoryId = categories.id. Tên danh mục lấy từ API, không hardcode.

## Cấu trúc source
~~~text
App.js                 Stack Navigator và nút hành động
src/
  screens/             Danh sách, chi tiết, form, danh mục, trailer
  components/          CourseCard
  services/            Axios, courseService, categoryService
  config/              mockapi.json
assets/                Ảnh ứng dụng
~~~

## Video demo
[Video quay và minh chứng trên GitHub Releases](https://github.com/Minhhanh-zit/PTUDDD_Bai5/releases).

## Kiểm thử trước khi nộp
1. Thêm / sửa / xóa khóa học, xác nhận dữ liệu trên MockAPI.
2. Tìm kiếm, lọc, xem chi tiết và phát trailer.
3. Thêm danh mục thử, thêm khóa học vào danh mục đó rồi thử xóa: phải báo không thể xóa.
4. Chuyển/xóa khóa học thử, sau đó xóa danh mục thử thành công.
5. Kiểm tra kết nối lỗi, dữ liệu rỗng.

> Chỉ thử xóa dữ liệu mới tạo, không xóa 10 khóa học mẫu.


<!-- SHOWCASE_START -->

## 🎬 Video thuyết trình

[![Xem video thuyết trình](assets/icon.png)](https://github.com/Minhhanh-zit/PTUDDD_Bai5/releases/download/v1.0-demo/ScreenRecording_10-20-2026.00-12-22_1.mov)

**[▶ Xem hoặc tải video thuyết trình Bài 5](https://github.com/Minhhanh-zit/PTUDDD_Bai5/releases/download/v1.0-demo/ScreenRecording_10-20-2026.00-12-22_1.mov)**

Video được lưu trên GitHub Releases.

## 📱 Hình ảnh minh chứng

Ảnh minh chứng đang được bổ sung.

<details>
<summary>Xem tất cả 0 ảnh minh chứng</summary>



</details>

<!-- SHOWCASE_END -->
