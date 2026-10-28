# Kế hoạch mỹ thuật — The Last Beacon

Trạng thái: người dùng đã chọn **fantasy vẽ tay 2D, nhìn từ trên chéo**.
Người dùng đã duyệt plan ngày 28/10/2026, sau đó duyệt tiếp tục từ bộ review M16
sang M17 và duyệt bước atlas metadata cho Goblin. Nghiệm thu từng mốc trước khi
chuyển bước kế. [M17 đã tích hợp ba enemy, chờ nghiệm thu](art/m17/README.md).
Ảnh concept, mockup và trạng thái M16 nằm tại [bộ review M16](art/m16/README.md)
và [trang xem 960x640](art/m16/review.html). Hướng mỹ thuật được dùng làm chuẩn;
sai lệch hình học của concept được giữ trong ghi chú M16. Map runtime tiếp tục
lấy tọa độ source, dựng lại từ asset rời ở M19.

## 1. Mục tiêu hình ảnh

Chuyển từ hình khối pixel hiện tại sang nhân vật và công trình có chất liệu,
trang phục, vũ khí và bản sắc của từng phe. Giữ hình rõ ở kích thước chơi thực tế
trên canvas 960x640, lưới 12x8, ô 64px. Góc nhìn 3/4 thể hiện trong nét vẽ;
tọa độ lưới và đường đi vẫn trực giao.

- Nét vẽ fantasy có mảng sáng/tối rõ, viền mềm nhưng silhouette dứt khoát.
- Ánh sáng thống nhất từ trên trái; gỗ, đá, da và kim loại phân biệt được.
- Phe Dawn Guard: đá sáng, gỗ sồi, thép xanh, cờ xanh/vàng, ánh beacon ấm.
- Phe Hollow Host: da xanh rêu, đồ da sờn, sắt tối, biểu tượng tím và cờ rách.
- Màu nền dịu hơn nhân vật; đường, đạn, thanh HP và preview có độ tương phản rõ.
- Sprite nhân vật/props dùng PNG nền trong suốt; bóng nền tách riêng để dùng
  lớp shadow hiện tại. Tiles đất/đường có nền kín và khớp mép.

Chi tiết nhỏ phải đọc được sau khi thu về game. Bản concept lớn được duyệt cùng
một bản crop ở kích thước sử dụng, gồm cảnh nhiều enemy đứng gần nhau.

## 2. Gắn tạo hình với cốt truyện

Hollow Host đánh tắt các đèn biên giới để cắt đường tiếp viện. Goblin cướp phá
dẫn đầu; trinh sát truy đuổi đoàn tị nạn trong rừng; ogre mang giáp tiến về ngọn
beacon cuối cùng. Dawn Guard dựng các tháp phòng thủ dọc đường rút lui về thành.

Tên dưới đây là tên mỹ thuật dự kiến. Các ID `basic`, `runner`, `guard` tiếp tục
quyết định combat; đây là ba tạo hình cho ba vai trò hiện có.

| Vai trò hiện tại | Tạo hình đề xuất | Chi tiết nhận diện | Chỉ số giữ nguyên |
| --- | --- | --- | --- |
| Basic | Goblin lính cướp | Tai nhọn, lưng khom, dao mẻ, áo/tấm vải tím, túi chiến lợi phẩm | 3 HP, 95px/s |
| Runner | Goblin trinh sát | Dáng gầy, chân dài, áo choàng cam ngắn, khăn/mũ da, hai dao nhỏ | 2 HP, 140px/s |
| Guard | Ogre bọc giáp | Thân nặng, vai rộng, nanh, giáp thép tối, khiên gỗ gia cố và huy hiệu Hollow | 7 HP, 65px/s |

Goblin lính xuất hiện trong cả ba wave Border Watch. Whispering Grove đưa
trinh sát vào wave 1 và ogre vào wave 2. Dawn Keep kết hợp cả ba như đội hình
hiện tại. Mô tả chapter và help sẽ được chỉnh để tên hình ảnh khớp vai trò.

Animation dự kiến cho mỗi loại: 4 hướng Bắc/Đông/Nam/Tây, mỗi hướng có 1 idle
và 4 frame đi; thêm 4 frame chết dùng chung hướng. Tổng khởi điểm **24 frame/loại,
72 frame cho ba loại**. Hit dùng hiệu ứng sáng ngắn hiện có. Nhân vật đổi hướng
animation theo đường đi, giữ cơ thể thẳng đứng trên màn hình.

Sau review bản đầu M17, người dùng yêu cầu chia nhỏ bước chân. Bản hiện tại dùng
8 frame đi/hướng và chọn pha theo quãng đường; 116 frame mới cùng 4 frame chết
Ogre v1. Đây là điều chỉnh trong M17, chưa chuyển sang mỹ thuật tháp của M18.

Frame chết chỉ là hình ảnh sau khi target đã được giải quyết; HP, kill, lives
và thời điểm kết thúc wave tiếp tục cập nhật ngay như hiện tại.

## 3. Tháp của Dawn Guard

| ID | Hình ảnh đề xuất | Cấu trúc và chất liệu | Combat giữ nguyên |
| --- | --- | --- | --- |
| Basic | Tháp nỏ biên phòng | Bệ đá thấp, lan can gỗ, một bộ nỏ thép xanh, cờ Dawn Guard | 128px / 1s / 1 damage |
| Rapid | Tháp nỏ liên châu | Khung gỗ nhẹ, hai nhánh nỏ, ổ tên cơ khí, vải xanh lá | 96px / 0.4s / 1 damage |
| Longbow | Tháp cung trường | Bệ đá/gỗ gia cố, cánh cung dài, dây kéo và vật liệu vàng nâu | 192px / 1.5s / 2 damage |

Mỗi tháp có một bệ cố định và 8 hướng phần ngắm được vẽ cùng hướng sáng.
Dự kiến 9 frame/phần ảnh cho mỗi loại, 27 cho ba tháp; portrait UI lấy từ tạo
hình đã duyệt. Hướng ngắm hiển thị được chọn gần hướng target, còn chọn mục tiêu,
range và cooldown tiếp tục dùng logic hiện có.

Bệ và vật trang trí nằm trong footprint một ô. Phần ngắm, điểm lóe sáng và
đạn có tâm vẽ thống nhất; số projectile mỗi shot và dữ liệu damage giữ nguyên.
Arrow/bolt dùng hình vẽ phù hợp vật liệu của từng tháp và tiếp tục bay theo
`ProjectileMotion`.

## 4. Map, cổng vào và thành trì

| Chapter | Nền và đường | Cổng vào | Cổng thành/đích |
| --- | --- | --- | --- |
| Border Watch | Cỏ ấm, đường đất có vết bánh xe, bụi cỏ, mảnh gỗ và đèn biên giới | Cổng trại goblin bằng gỗ thô, cọc nhọn và cờ rách | Đồn gác đá/gỗ, cửa sắt, cờ xanh, beacon nhỏ |
| Whispering Grove | Đất rừng, rễ thấp, rêu, lá và hoa; mảng sáng xuyên tán cây | Vòm rễ cổ và totem Hollow | Cổng phòng tuyến phủ rêu, đèn dẫn đoàn tị nạn |
| Dawn Keep | Đường đá nứt, cỏ xám, mảnh tường cũ, dấu chiến sự | Cổng đá đổ với cờ Hollow | Mặt tiền thành Dawn: cửa vòm, tháp canh, cờ, huy hiệu và beacon vàng |

Mỗi biome khởi điểm có 3 biến thể nền, bộ đường gồm 2 đoạn thẳng/4 góc/4 đầu
đường và 4 props thấp. Chốt danh sách sau bản mẫu M16. Đường ghép từ hướng vào/ra
trong **thứ tự path**, để các đoạn đường nằm sát nhau vẫn đọc đúng tuyến di chuyển.

Cổng vào và cổng thành trong trận giữ footprint ô đầu/ô cuối. Artwork được vẽ
chi tiết ở nguồn lớn rồi thu về kích thước dùng thật. Toàn cảnh thành lớn dùng
cho minh họa chapter/giới thiệu ở M20; cổng đích là phần công trình hiện trên map.

Props trên đất là lớp nền, giảm rõ hoặc được che khi có preview/tháp. Mọi ô đất
trống tiếp tục xây được. Tán cây lớn và toàn cảnh thành được dùng trong minh họa
chapter, giúp giữ tầm nhìn cho path và vùng placement trong trận.

## 5. Quy cách asset và tích hợp

- Nguồn frame nhân vật/tháp dự kiến 128x128 RGBA, có khoảng trống đồng nhất.
  Enemy hiển thị khoảng 36–48px chiều cao tùy loại; chốt bbox sau thử scale M16.
  Tile nguồn 128x128 hiển thị 64x64; cổng và bệ tháp khớp footprint ô.
- Điểm tiếp đất/pivot nhất quán giữa các frame; vũ khí, tai và cape có padding.
  Atlas có khoảng đệm 2–4px để kiểm tra viền khi thu nhỏ. HP bar và số damage
  đặt theo phần UI của entity, tách khỏi animation và bounds của hình.
- Ảnh concept dùng để duyệt phong cách; bộ frame sản xuất được xuất và kiểm tra
  riêng về alpha, lưới frame, tỷ lệ và pivot trước khi đưa vào game.
- Lưu asset chạy game tại các thư mục dự kiến `public/assets/enemies`, `towers`,
  `terrain`, `gates`, `ui`. Giữ file nguồn/concept và ghi nguồn gốc riêng; chỉ
  tải các bản xuất cần cho game.
  M17 hiện dùng một bản PNG nguồn duy nhất trong `docs/art/m17` qua Vite `?url`,
  cùng atlas JSON trong `src/data/art`; không sao chép PNG hoặc đổi pixel nguồn.
  Khung logic 320px và crop riêng thay cho ước tính export PNG 128px ban đầu.
- Thêm manifest nhỏ trong `src/data/artAssets.ts` để ánh xạ ID hiện tại đến
  texture/atlas/animation. Dùng loader và animation của Phaser trong scene/entity;
  `src/systems` tiếp tục là TypeScript thuần. Chưa cần dependency mới.
- Đường dẫn asset hỗ trợ base URL của Vite. Texture/animation dùng lại qua
  Restart/chuyển chapter, kiểm tra key trùng và tài nguyên được dọn đúng.
- `src/main.ts` hiện bật `pixelArt`, `roundPixels` và tắt antialias. M17 sẽ thử
  lọc ảnh phù hợp nét vẽ tay ở scale thật trên WebGL và Canvas, rồi đưa thay đổi
  cấu hình cần thiết vào diff review. Canvas, grid và phép đổi tọa độ giữ nguyên.

Ngân sách khởi điểm đề xuất: atlas enemy khoảng 1024x384 cho 24 ô 128px; tổng
asset xuất cho game hướng tới dưới 8MB. Đây là mục tiêu cần đo sau khi có ảnh,
không phải số liệu hiện tại. Ghi dung lượng tải, FPS và hành vi bộ nhớ trên cùng
máy/cảnh trước và sau khi tích hợp.

## 6. Các milestone đã duyệt trong plan

Triển khai lần lượt; hoàn thành và review kết quả một bước trước bước kế.

| Milestone | Phạm vi | Sản phẩm để duyệt | Nhóm tệp dự kiến |
| --- | --- | --- | --- |
| M16 — Chốt mẫu mỹ thuật | Palette, tỷ lệ, silhouette ba enemy/ba tháp, cổng và ba biome | Một bảng concept đồng bộ và một mockup Border Watch 960x640; kèm crop kích thước game và mô tả asset | `docs/art-plan.md`, thư mục concept mới; chưa sửa runtime |
| M17 — Enemy có sprite | Làm Goblin trước để kiểm chứng pipeline; hoàn thiện Scout/Ogre và animation bốn hướng | Ba enemy chạy đúng path, HP/VFX rõ, chết/escape/restart đúng; xem gần và trong nhóm đông | Asset enemy, `artAssets.ts`, `Enemy.ts`, preload ở `GameScene.ts`, cấu hình lọc ảnh nếu cần, test entity |
| M18 — Tháp và đạn | Bệ/đầu ngắm tám hướng cho ba tháp, portrait, arrow/bolt cùng style | Xây, đổi loại, inspect, xoay ngắm và damage đúng; bệ/preview khớp ô | Asset tower/projectile, `Tower.ts`, `Projectile.ts`, mapping art, help/selection và test liên quan |
| M19 — Thế giới trong trận | Tiles/props/cổng đầu và cổng thành cho cả ba chapter | Ba map hoàn chỉnh, đường nối đúng tuyến, mọi ô xây được như cũ, endpoint rõ | Asset terrain/gate, `drawTerrain.ts`, `drawPathGuides.ts`, metadata hình ảnh trong `levels.ts`, kiểm tra map/placement |
| M20 — Minh họa và nghiệm thu | Toàn cảnh thành/chapter, portrait, khung UI đồng bộ; kiểm tra toàn bộ asset | Menu/chapter cùng style với trận; báo cáo tải/FPS/Restart và chơi thử cả ba màn | Asset UI/chapter, `createLevelPanel.ts`, `createHelpPanel.ts`, playtest và tài liệu |

Sau mỗi bước có ảnh so sánh cùng map/tọa độ, diff nhỏ, kết quả test/build thực
tế và danh sách kiểm tra thủ công. Thay đổi cân bằng cần kế hoạch/duyệt riêng.

## 7. Tiêu chí nghiệm thu

- Phân biệt được goblin thường, trinh sát và ogre bằng hình dáng khi chơi ở
  scale thật; phân biệt được cả ba tháp và hướng bắn.
- Palette, độ sáng, chất liệu và tỷ lệ thống nhất từ nhân vật đến map/cổng/thành.
- Đủ hướng/frame, bước chân liền mạch, pivot không nhảy; alpha sạch, tiles không
  có khe/viền và asset không cắt mất vũ khí/đầu/tai.
- HP bar, số damage, đường đi, arrow và preview luôn đọc được, kể cả mép map và
  cụm enemy. Công trình không gây nhầm lẫn về ô đang xây được.
- Combat giữ đúng HP/speed/range/cadence/damage hiện tại; targeting theo progress,
  projectile theo target gốc; 5/8/12 enemy, start thủ công và 10 lives như M15.
- Không phải chờ animation chết/banner để giải quyết wave. Restart/chuyển chapter
  dọn đối tượng và callback; âm thanh và input không nhân đôi.
- Test/build chạy thành công; kiểm tra development/production, resize, URL asset,
  WebGL/Canvas và console trên browser. FPS/nhãn development chỉ có ở development.
- Tải ảnh/bộ nhớ/FPS được ghi từ đo thực tế; rà soát lại sau 20 lần Restart và
  chơi cả ba chapter với tháp hỗn hợp theo phiếu playtest.

## Điểm nghiệm thu tiếp theo

Hiện tại là **nghiệm thu M17**, gồm bản sửa bước chân theo phản hồi người dùng:
8 pose đi/hướng với phase theo quãng đường. Tổng 120 pose sử dụng gồm 116 pose
mới và 4 death Ogre v1; death Ogre mới còn chồng hình sau ba lần thử nên đã dừng.
Bốn PNG runtime chiếm 9.142.407 byte, vượt mục tiêu gợi ý 8MB ban đầu; cần review
ngân sách tải cùng chất lượng chuyển động. Xem [preview v1/v2](art/m17/walk-v2/review.html)
và phép đo trong bộ review M17. Pixel nguồn không bị thay đổi.
Test/build trong phiên vẫn dừng trước script do Node EPERM; browser/FPS/bộ nhớ
còn chờ kiểm tra. Chưa chuyển M18 hay tích hợp concept map làm tilemap.
