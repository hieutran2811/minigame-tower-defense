# M17 — Enemy vẽ tay, bản sửa bước chân

Goblin Raider (Basic), Goblin Scout (Runner), Armored Ogre (Guard) đã dùng sprite
vẽ tay trong game. Theo phản hồi của người dùng, bản hiện tại tăng từ 4 lên
**8 pose đi cho mỗi hướng** và chọn pose theo quãng đường.
**Chờ test/build local và nghiệm thu browser.** Chưa bắt đầu M18; chưa stage/commit.

Mở [preview v1/v2](walk-v2/review.html) để chạy chậm, xem từng pose, đổi hướng và
so sánh ở cỡ thật. [Ghi chú bản sửa](walk-v2/README.md) và
[phép đo](walk-v2/measurements.json) có chi tiết. Các trang
[atlas v1](atlas-review.html), [cắt đều ban đầu](review.html) giữ để đối chiếu.
Preview dùng SVG với PNG gốc, chưa phải screenshot runtime.

## Kế hoạch và thực hiện

| Phần | Tệp | Kết quả |
| --- | --- | --- |
| Ảnh | `walk-v2/goblin.png`, `scout-spaced.png`, `ogre-spaced.png`; `armored-ogre.png` v1 | 116 pose mới + 4 death Ogre cũ; PNG nguyên bản do người dùng chép |
| Metadata | `src/data/art/walk-v2/*.atlas.json` | Crop riêng, khung logic 320×320, pivot chung (160,256); không sửa pixel |
| Manifest | `src/data/artAssets.ts` | Display size 68/60/78px, stride 48/56/52px; death Ogre riêng size 70px |
| Loader | `src/entities/enemyArt.ts` | Nạp bốn PNG, kiểm tra mọi frame cần dùng; giữ texture/key qua Restart, fallback procedural khi thiếu ảnh/metadata |
| Entity/scene | `src/entities/Enemy.ts`, `src/scenes/GameScene.ts` | Chọn hướng/pose từ progress; HP, shadow, combat giữ tọa độ; corpse scene-owned tự hủy |
| Story/help | `src/data/levels.ts`, `src/scenes/createHelpPanel.ts` | Tên Goblin/Scout/Ogre khớp hình; giữ ID/chỉ số |
| Tests | `src/tests/EnemyAtlas.test.ts`, `EnemyPresentation.test.ts` | PNG thật/SHA/alpha/crop, chu kỳ 8 pose, góc/idle/frame dài, fallback, death sheet riêng, lifecycle và combat |
| Review | README, roadmap, art-plan, tài liệu/preview M17 | Phạm vi, nguồn, phép đo, giới hạn và nghiệm thu |

Không đổi HP/speed, targeting, damage, lives, placement, path, count/thứ tự wave
hoặc thắng/thua. Không sửa `src/systems`, thêm dependency hay đổi renderer toàn game.

## Quyết định và sai khác

- Người dùng đã duyệt atlas metadata thay cho ô PNG đều. Nguồn v2 1586×992,
  khung logic 320px thay cho ước tính export 128px ban đầu. Import `?url` của Vite
  dùng trực tiếp một bản PNG trong docs, không thêm bản sao ở public.
- Tám pose đi lấy theo distance/stride, giữ pha qua góc và frame dài. Idle và
  death dùng animation Phaser; không tạo timer riêng cho từng enemy.
- Root metadata dựa trên đầu và hai pose tiếp đất mỗi hướng; dùng mặt đất chung
  để giữ phần nhấc chân/thân tự nhiên trong ảnh. Hai crop Scout thu một hàng đệm
  trống để hết giao nhau; root và pixel nguyên vẹn.
- Đã dừng chỉnh death Ogre sau ba lần thử vì hai hình mới còn chồng nhau. Dùng
  bốn frame death v1 đã kiểm tra; không dùng death mới trong runtime.
- Death là VFX: target được giải quyết ngay; corpse dưới enemy sống, tự hủy sau
  bốn frame ở 10fps. Escape/result cleanup không tạo corpse.
- LINEAR chỉ đặt riêng trên texture, đã đối chiếu source Phaser. WebGL/Canvas
  thực tế vẫn cần nghiệm thu.

## Phép đo và kiểm tra

Bốn PNG runtime: **9.142.407 byte (~8,72 MiB)**, vượt mục tiêu gợi ý 8MB ban đầu.
Ảnh RGBA giải nén ước tính ~24MiB, chưa phải số bộ nhớ browser/GPU đo được.
Chiều cao silhouette đi ở scale hiện tại: Goblin 35,7–40,59px; Scout
29,44–37,88px; Ogre 40,71–43,63px. Review cả cỡ thật và cụm đông.

Đã đối chiếu ba PNG mới trong repo với đầu ra được chọn: byte giống hệt.
Đã đọc RGBA và kiểm tra trực tiếp 116 crop mới: hình học/trim/pivot hợp lệ,
không chồng crop, đủ hình và đệm; alpha trên biên tối đa 6/255.
Bốn crop death Ogre khớp nguyên bản v1 đã kiểm tra ở bước trước.
Đây là kiểm tra dữ liệu thực tế, **không phải Vitest pass**.

- `npm run test`: đã chạy, exit 1 trước Vitest do Node
  `EPERM: lstat C:\Users\Admin`.
- `npm run build`: đã chạy, exit 1 trước TypeScript/Vite vì cùng lỗi.
- Đã tự rà patch, source, JSON, URL và tham chiếu preview. Lệnh đọc Git diff
  theo tệp đã bị auto-review từ chối ở bước trước; không retry lệnh đó.
  Chưa kiểm tra toàn bộ diff Git bằng lệnh bị chặn.
- Chưa chạy game/preview bằng browser trong phiên: chưa xác nhận độ mượt,
  console, scaling, production/base URL, FPS/bộ nhớ hoặc Restart lặp.
- Prompt/đầu ra cũ ở `generation-log.json`, `atlas-generation-log.json`;
  bản sửa có đủ chín lần tạo/chỉnh trong `walk-v2/generation-log.json`.
  Dùng imagegen built-in; không có CLI/API fallback hay script sửa pixel.

## Nghiệm thu của người dùng

1. Chạy `npm run test`, `npm run build`; gửi lỗi nếu có.
2. Xem `walk-v2/review.html` ở zoom 100%: cỡ 1×/3×, chậm/từng pose và đổi hướng.
   Chú ý vòng bước chân cuối→đầu, Scout nhấc chân và khiên Ogre hướng Tây.
3. Chơi cả ba chapter ở dev/production: hình rõ trong cụm đông, HP/damage/mép
   map; góc không đổi tọa độ combat; kill/escape/wave và targeting giữ nguyên.
4. Xem chuyển Ogre v2 sang death v1, rồi Restart/chuyển chapter 20 lần khi
   hit/death chạy. Kiểm tra console, input/audio, FPS và bộ nhớ, cả WebGL/Canvas.
5. Review toàn bộ source kể trên và ngân sách PNG; xác nhận M17 trước M18.

## Git và phạm vi review

Index đang rỗng; toàn bộ M16/M17 còn uncommitted so với HEAD M15.
Lần kiểm tra cuối: 10 tệp tracked thay đổi, +576/-101 dòng, bao gồm cả hook và
lockfile có sẵn của người dùng; các tệp mới không nằm trong số dòng này.
`git diff --stat` chỉ tính tệp tracked; PNG, atlas, manifest, loader, test atlas
và tài liệu mới chưa tracked cần được review thêm.
Các thay đổi có sẵn của người dùng trong lockfile, hook và thư mục commit cũ
được giữ nguyên. Agent không sửa hook/policy/lockfile, không stage hay commit.
