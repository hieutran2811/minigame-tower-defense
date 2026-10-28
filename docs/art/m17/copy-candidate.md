# Lưu bản Goblin để review

Đã hoàn thành: người dùng copy ảnh và agent đã xem lại PNG trong repo. Lệnh
bên dưới được giữ làm lịch sử; không cần chạy lại hay ghi đè bản đã lưu.

Bản này chỉ là **candidate**, chưa đủ điều kiện làm sprite runtime. Agent đã
dừng sửa cùng vấn đề sau ba lần tạo/chỉnh. Chọn bản đầu vì phong cách gần concept
M16; hai lần chỉnh sau chưa giải quyết được lưới/pivot. Không cần lưu các bản bỏ.

Người dùng chạy đúng lệnh copy này trong terminal của mình:

```powershell
Copy-Item -LiteralPath 'C:\Users\Admin\.codex\generated_images\01a18004-04d2-7f11-80ee-e92c3c314be5\exec-8da16130-408f-4b84-afbd-e27d753ff235.png' -Destination 'D:\MyProject\minigame-tower-defense\docs\art\m17\goblin-raider-candidate.png'
```

Thư mục đích đã được tạo cùng tài liệu này. Không thay sandbox, di chuyển hay xóa
ảnh gốc. `review.html` chỉ đọc ảnh trong repo; runtime không tham chiếu candidate.

Sau khi lưu, mở trang review ở zoom 100% và thử các pose trên nền caro. Sheet
có alpha thật, nhưng pose chạm/tràn biên một số ô 256px. Không kích hoạt manifest
cho đến khi từng frame có vùng crop và pivot được kiểm tra.
