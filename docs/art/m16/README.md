# M16 — Concept và mockup để review

Người dùng đã duyệt plan ngày 28/10/2026. Bộ hình M16 đã được tạo bằng
**imagegen built-in** và được người dùng copy vào repo. Runtime vẫn là M15
(`195a8c8`); chưa tích hợp ảnh vào game. Người dùng đã duyệt tiếp tục sang
[M17](../m17/README.md) với hướng mỹ thuật này. Tiêu chí khớp hình học của concept
vẫn chưa đạt; map runtime dùng source và sẽ được dựng từ asset rời ở M19.

## Mở bộ review

Mở [review.html](review.html) trong trình duyệt, ở zoom 100%. Trang không cần
server, JavaScript, dependency hoặc thay đổi game.

| Sản phẩm | Tệp | Trạng thái |
| --- | --- | --- |
| Bảng concept | [art-direction-board.png](art-direction-board.png) | Đã tạo, lưu và xem ảnh gốc 1536x1024 |
| Bản đồ vẽ tay | [border-watch-world.png](border-watch-world.png) | Đã tạo, lưu và xem ảnh gốc 1536x1024; còn lệch so với lưới |
| Mockup có UI | [review.html](review.html) | Viewport 960x640; map 768x512, sidebar 192px, footer 128px |
| Xem cỡ nhỏ | Mục silhouette trong trang review | Sáu crop concept trong khung 56–64 CSS px, còn nền giấy |
| Bố cục chuẩn | [layout-reference.svg](layout-reference.svg) | Lấy 19 ô path và 6 vị trí tháp từ source |
| Prompt và nguồn ảnh | [generation-log.json](generation-log.json), [prompts.md](prompts.md) | Ghi mode, request thực tế, ảnh được chọn và hai bản không chọn |

Ảnh concept không phải atlas, sprite có alpha, hay screenshot runtime mới. Các
khung crop dùng SVG/HTML để xem vùng PNG; PNG gốc không được chỉnh sửa hay thu
nhỏ thành file khác. UI trong mockup là khung tham chiếu bằng HTML, không có
chức năng chơi game.

## Kết quả mỹ thuật đã quan sát

- Goblin áo tím, Scout áo choàng cam và Ogre giáp/khiên lớn có silhouette riêng.
- Gỗ, đá, thép và cờ Dawn Guard dùng cùng phong cách fantasy vẽ tay.
- Tháp Basic một bộ nỏ, Rapid hai nhánh nỏ, Longbow cánh cung dài nhìn khác nhau.
- Ba vignette Border/Grove/Keep có palette và cổng phù hợp diễn biến cốt truyện.
- Màu đất/cỏ và props trong ảnh map còn rậm ở một số chỗ; cần giảm nhiễu khi
  sản xuất tiles. Góc nhìn sprite bốn hướng và alpha/pivot vẫn thuộc M17.

## Bố cục chuẩn để đối chiếu

- Canvas 960x640. Map: `[0,768) x [0,512)`; sidebar:
  `[768,960) x [0,640)`; footer: `[0,768) x [512,640)`.
- Map 12x8, tile 64px; 19 ô path từ `src/data/map.ts`.
- Cổng vào `(0,3)`, tâm `(32,224)`; cổng đích `(11,4)`, tâm `(736,288)`.
- Basic `(1,2)`, `(4,4)`; Rapid `(3,2)`, `(1,4)`;
  Longbow `(4,3)`, `(9,3)`: đây là các vị trí tháp minh họa hợp lệ trên đất.
- Border Watch trong concept chỉ có Goblin lính; Scout/Ogre ở bảng concept.
  Bố trí actor là minh họa, không phải kết quả một trận đã mô phỏng.
- Trang review hiển thị map PNG bằng cùng hệ số 0,5 trên hai trục. Bật overlay
  để đối chiếu đường và footprint. Khung UI chính xác không làm tọa độ trong
  artwork tự khớp với source.

## Stop-loss cho sai lệch hình học

Ba cách tạo mockup đã được thử:

| Lần | Cách tạo | Kết quả quan sát |
| --- | --- | --- |
| A | Sinh cả map và UI | Sai tỷ lệ map/sidebar/footer và thay bố trí control |
| B | Sinh lại với tọa độ và control chi tiết | Hierarchy UI gần hơn; tỷ lệ vùng và footprint vẫn lệch |
| C | Sinh riêng map, ghép UI bằng HTML | Khung viewport có tọa độ đúng; bản thân ảnh map còn lệch lưới/vị trí tháp |

Dừng sinh thêm ảnh để sửa cùng lỗi này theo stop-loss của AGENTS.md. Trong ba
bản này, chỉ dẫn tọa độ chưa được tái tạo chính xác. Lưới/path trong source là
chuẩn; ảnh map chỉ dùng để review art direction, chưa đủ điều kiện làm tilemap.

Cần người dùng review và quyết định bước tiếp theo: nghiệm thu phần mỹ thuật
với hình học tiếp tục được dựng từ asset rời ở M17–M19, hoặc yêu cầu một bước
hiệu chỉnh bố cục riêng. Chưa tự điều chỉnh tiêu chí nghiệm thu M16.

## Kiểm tra đã làm và giới hạn

- Đã xem hai PNG được chọn trong hội thoại và xem lại bản copy trong workspace.
  Header PNG đầu ra ghi 1536x1024; tên tệp và nội dung đúng hai ảnh được chọn.
- Reference đủ 96 ô; path đúng 19 tọa độ; sáu footprint minh họa không trên path.
  Trang HTML đặt cố định các vùng map/sidebar/footer theo source và có overlay.
- Chưa có công cụ browser trong phiên để xác nhận trang HTML được render; cần
  người dùng mở ở zoom 100%, thử overlay, cuộn ngang và xem cỡ nhỏ.
- Không có thay đổi trong `src`, dependency hay chỉ số gameplay. Rule imagegen
  và test hook do người dùng chỉnh; agent giữ nguyên các tệp bảo vệ đó.
- Đã chạy `npm run test` và `npm run build`: cả hai thoát với mã 1 trước khi
  vào script do Node báo `EPERM: lstat 'C:\Users\Admin'`. Chưa xác nhận được
  kết quả test/build trong phiên này.
- Mode: built-in; không dùng CLI/API fallback. Các prompt cuối và đường dẫn
  nguồn đầu ra được ghi trong generation log. Hai bản UI không chọn không
  được dùng làm dependency của bộ review.

## Nghiệm thu M16

- [ ] Người dùng chốt palette, chất liệu và ba enemy/ba tháp.
- [ ] Người dùng xem crop cỡ nhỏ, nhất là vũ khí Longbow và chiều rộng Ogre.
- [ ] Chốt cách xử lý sai lệch hình học trước khi xác nhận M16 hoàn tất.
- [ ] Review PNG/source/reference và trang 960x640; thống nhất phần cần dựng
  thành frame/tiles ở M17–M19.
- [ ] Nghiệm thu M16 trước khi chuyển sang sản xuất sprite M17.

## Ghi chú công cụ

Hook đã được người dùng cập nhật để nhận request imagegen M16; việc tạo ảnh đã
thực thi thành công. [Hướng dẫn skill](imagegen-skill-reference.md) và
[hướng dẫn review hook](human-tool-review.md) được giữ làm tài liệu tham chiếu,
không phải token cấp quyền. Các ảnh nguồn dưới thư mục generated images của
Codex đã được người dùng copy vào repo; bộ review chỉ tham chiếu PNG trong repo.
