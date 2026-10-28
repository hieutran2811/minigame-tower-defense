# Lưu Scout và Ogre của M17

Đã hoàn thành: người dùng đã copy hai PNG, agent đã xem lại trong repo và đối
chiếu bytes với đầu ra được chọn. Không cần chạy lại các lệnh bên dưới.

Đã chọn ảnh sau khi kiểm tra tạo hình: Scout có hai dao, Ogre đã bỏ phần khiên
thừa ở hướng Tây. Metadata sẽ dùng vùng cắt riêng; PNG giữ nguyên từ đầu ra.
Chưa cần đổi hook hay quyền thư mục. Người dùng chạy đúng hai lệnh sau trong
terminal của mình để lưu ảnh ngoài repo vào workspace:

```powershell
Copy-Item -LiteralPath 'C:\Users\Admin\.codex\generated_images\01a18004-04d2-7f11-80ee-e92c3c314be5\exec-1b81a964-d27a-43ed-a01d-d392a5feac64.png' -Destination 'D:\MyProject\minigame-tower-defense\docs\art\m17\goblin-scout.png'
Copy-Item -LiteralPath 'C:\Users\Admin\.codex\generated_images\01a18004-04d2-7f11-80ee-e92c3c314be5\exec-035cceb0-8dce-4518-aa14-723911c25af4.png' -Destination 'D:\MyProject\minigame-tower-defense\docs\art\m17\armored-ogre.png'
```

Không xóa hay di chuyển ảnh gốc. Các bản không chọn không được dùng trong game.
Trạng thái: đã lưu đủ và bật cả ba entry trong manifest M17.
