# M17 — Chu kỳ bước chân v2

Đã nối bộ mới vào game theo yêu cầu chia nhỏ chuyển động chân: **8 pose/hướng**
cho Goblin Raider, Goblin Scout và Armored Ogre. Chờ test/build local và nghiệm
thu chuyển động trong browser; chưa chuyển M18, chưa stage/commit.

Mở [review.html](review.html) ở zoom browser 100%. Có chạy/tạm dừng, từng pose,
tốc độ 1×/0,5×/0,25×, bốn hướng và cỡ thật/phóng 3×. So sánh v1 bốn pose với v2
tám pose trên cùng điểm neo. Preview SVG dùng PNG gốc, chưa được render bằng
browser trong phiên agent và không phải screenshot runtime.

## Asset đang dùng

| Vai trò | PNG | Frame dùng | Display size / stride |
| --- | --- | ---: | --- |
| Basic | [goblin.png](goblin.png) | 32 walk + 4 idle + 4 death | 68px / 48px |
| Runner | [scout-spaced.png](scout-spaced.png) | 32 walk + 4 idle + 4 death | 60px / 56px |
| Guard | [ogre-spaced.png](ogre-spaced.png) | 32 walk + 4 idle | 78px / 52px |
| Guard death | [Ogre v1](../armored-ogre.png) | 4 death cũ | 70px / không áp dụng |

Ba PNG v2 đều 1586×992 RGBA. Khung logic vẫn 320×320, pivot (160,256).
Tổng 120 frame dùng trong game, gồm 116 frame mới và 4 frame chết Ogre cũ.

Người dùng đã chép đủ năm ảnh; **không cần chạy lại lệnh copy**. `scout.png` và
`ogre.png` là bản trung gian giữ để đối chiếu, không được import vào runtime.
Bộ v1 trong thư mục cha cũng được giữ nguyên.

## Chuyển động và vùng cắt

- `Enemy.ts` chọn walk frame theo quãng đường đã đi chia cho stride; không dùng
  đồng hồ walk animation. Tốc độ riêng từng loại tự quyết định nhịp. Qua góc,
  idle hoặc frame dài vẫn giữ pha dựa trên progress.
- Metadata đăng ký vị trí đầu tương đối với trung điểm hai chân ở hai tư thế
  tiếp đất 0/4, dùng chung mặt đất cho mỗi hướng. Không kéo đáy từng pose về
  một đường, để giữ phần nhấc chân/thân người có sẵn trong ảnh.
- Hai crop Scout 5/22 thu một hàng đệm trống phía dưới để bỏ phần giao giữa
  các hình chữ nhật. Không đổi pixel nguồn, root hay vùng hình nhìn thấy.
- Death Ogre mới còn chồng hình sau ba lần tạo/chỉnh; đã dừng theo stop-loss.
  Loader dùng riêng PNG/atlas death v1 đã kiểm tra. Kill/exit/wave không chờ VFX.

Không đổi HP, speed, damage, path, targeting, placement, wave hay lives.
Không thêm dependency, timer cho từng enemy hoặc cấu hình renderer toàn game.

## Kiểm tra đã làm và giới hạn

Ba file cuối trong repo khớp byte với đầu ra được chọn. Kiểm tra trực tiếp RGBA
và hình học của 116 frame mới: crop không chồng, trim trong khung, pivot khớp,
hơn 5.000 pixel hiện rõ mỗi frame và alpha trên biên tối đa 6/255. Bốn frame chết
Ogre khớp metadata v1 nguyên bản. SHA-256, dung lượng và phép đo từng frame nằm
trong [measurements.json](measurements.json). Đây là kiểm tra dữ liệu trong bộ nhớ,
**không phải kết quả chạy Vitest**.

PNG runtime tổng **9.142.407 byte (~8,72 MiB)**, vượt mục tiêu gợi ý 8MB ban đầu.
Bốn ảnh giải nén RGBA ước tính ~24MiB; chưa đo browser/GPU memory, FPS hoặc tải
thực tế. Giữ death Ogre cũ làm tăng thêm 2.696.177 byte; cần review tradeoff này.

Đã cập nhật test SHA/PNG/atlas, 8 pose/chu kỳ, pha qua góc và idle, update dài so
với nhiều update ngắn, thiếu frame/death texture, Restart và corpse lifecycle.
`npm run test` và `npm run build` đã chạy lại: cùng exit 1 trước script do
`EPERM: lstat C:\Users\Admin`. Chưa xác nhận test pass hoặc compile thành công.

Prompt và cả chín lần tạo/chỉnh bằng **imagegen built-in** được ghi trong
[generation-log.json](generation-log.json). Không dùng CLI/API fallback hoặc
script thay pixel ảnh. Việc chép đầu ra ngoài repo do người dùng thực hiện.

## Nghiệm thu

1. Chạy `npm run test`, `npm run build` trên local và gửi kết quả/lỗi.
2. Xem preview 1×, rồi 3×/0,25×: chân trái/phải luân phiên, chuyển cuối→đầu không
   giật, thân không trượt hoặc nhảy khi đổi hướng. Xem kỹ Scout ở pha bay và
   Ogre hướng Tây với khiên.
3. Chơi cả ba chapter: rẽ góc, cụm đông, HP/damage, mép map và tốc độ từng loại.
   Kill/escape vẫn giải quyết ngay; xem chuyển từ Ogre sống v2 sang corpse v1.
4. Kiểm tra dev/production, console, WebGL/Canvas, resize, base URL, FPS/bộ nhớ
   và 20 lần Restart/chuyển chapter khi hit/death đang chạy.
5. Xác nhận M17 trước khi bắt đầu M18.

Xem [ghi chú M17](../README.md) để review toàn bộ source cùng trạng thái Git.
