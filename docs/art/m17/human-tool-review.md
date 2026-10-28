# M17 — Human review cho sprite nền trong suốt

Người dùng đã duyệt tiếp tục sau bộ concept M16. Sprite enemy của M17 cần
PNG có alpha thật; rule hiện tại ở `tools/hooks/policy.mjs` chỉ nhận
`transparent_background: false` trước bước review này.

Trạng thái hiện tại: người dùng đã tự áp dụng rule/test và báo chạy xong. Agent
đã đọc lại thấy nhánh alpha M17, sau đó gọi imagegen thành công. Hướng dẫn bên
dưới là lịch sử thay đổi đã được người dùng review; không cần áp dụng lại.
Agent không sửa trực tiếp hook. Kết quả thử asset nằm trong `README.md` cùng thư mục.

Theo AGENTS.md: “Changes to policy, hooks, tool permissions, or their enforcement
— Human review required; the agent must not weaken its own safeguards.”
Người dùng cần tự review và chỉnh hai tệp bên dưới; đồng ý triển khai M17 không
tự thay đổi rule đang chạy. Đây là mở rộng cụ thể cho ảnh enemy M17, không mở
đọc tệp ngoài repo, không cho CLI hay thêm tham số đầu ra.

## 1. Rule cần review

Trong nhánh `name === 'image_genimagegen'` của `tools/hooks/policy.mjs`, thay
**chỉ điều kiện**:

```js
args.transparent_background !== false ||
```

bằng:

```js
!(
  args.transparent_background === false ||
  (
    args.transparent_background === true &&
    args.prompt.startsWith('M17 enemy sprite sheet\n')
  )
) ||
```

Giữ mọi kiểm tra khác: prompt không rỗng/tối đa 12000 ký tự, danh sách khóa,
không có `referenced_image_paths`, và tối đa một ảnh hội thoại gần nhất. Prefix
chỉ giới hạn loại request, không phải bằng chứng người dùng đã duyệt nội dung ảnh.

## 2. Test cần review

Trong test image generation cuối `tools/hooks/policy.check.mjs`, ngay sau
`const decision = ...`, thêm các assertion này. Giữ nguyên toàn bộ case từ chối
hiện tại, kể cả request M16 có `transparent_background: true`.

```js
const sprite = {
  prompt: 'M17 enemy sprite sheet\nGoblin Raider, 24 frames',
  transparent_background: true,
};
assert.equal(decision(sprite), 'allow');
assert.equal(decision({ ...sprite, num_last_images_to_include: 1 }), 'allow');
assert.equal(decision({ ...sprite, prompt: 'M17 enemy sprite sheet' }), 'confirm');
assert.equal(decision({ ...sprite, transparent_background: null }), 'confirm');
assert.equal(decision({ ...sprite, referenced_image_paths: ['outside.png'] }), 'confirm');
assert.equal(decision({ ...sprite, output_path: 'outside.png' }), 'confirm');
assert.equal(runHook(imageEvent(sprite)).status, 0);
```

## 3. Người dùng chạy

Lưu hai tệp, chạy trong terminal của chính bạn:

```powershell
node --test tools/hooks/policy.check.mjs
```

Lệnh chỉ rõ tệp để tránh glob `*.check.mjs` không được mở rộng trên Windows.
Báo kết quả test sau khi lưu; agent sẽ đọc lại rule thực tế trước khi gọi công
cụ. Không cần thay sandbox, bỏ hook, cài dependency hay cấu hình API key.

## Request và đầu ra dự kiến

- Built-in imagegen, bắt đầu bằng Goblin Raider để kiểm chứng pipeline.
- Prompt có prefix trên và `transparent_background: true`; không truyền đường
  dẫn ảnh ngoài repo. M16 concept có thể được xem trong hội thoại làm style reference.
- Mỗi sheet 6 cột × 4 hàng: 4 hướng, mỗi hướng idle + 4 walk; cột cuối là
  4 frame death. Kiểm tra alpha, đủ frame, pivot và padding trước khi kích hoạt.
- Chỉ dùng ảnh đã copy vào `public/assets/enemies` và đã kiểm tra. Nếu copy đầu
  ra ngoài repo vẫn cần thao tác người dùng, sẽ cung cấp đúng đường dẫn ảnh cụ thể.
- Chưa có sprite được tạo; không coi M17 hoàn tất khi mới chuẩn bị pipeline.
