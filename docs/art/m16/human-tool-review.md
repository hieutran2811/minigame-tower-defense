# Review thủ công công cụ tạo ảnh M16

Trạng thái: người dùng đã tự áp dụng rule và test, đồng thời báo kiểm tra hook
xong. Agent đã đọc lại nhánh `image_genimagegen` và case M16, sau đó tạo ảnh
bằng công cụ thành công. Nội dung dưới đây giữ làm lịch sử review; không cần
áp dụng lại. Agent không chỉnh các tệp hook đang hoạt động.

## Phạm vi cần review

- Tạo bảng concept bằng [request đã chuẩn bị](board-request.json), sau đó tạo
  mockup Border Watch theo [brief](README.md) và [prompt](prompts.md).
- Built-in imagegen, ảnh nền kín, prompt dạng text. Mockup có thể dùng đúng một
  ảnh mới nhất trong hội thoại làm reference phong cách.
- Giữ nguyên các quy tắc shell, Git, protected paths, secrets và host permissions.
- Ảnh được sinh thường nằm ngoài repo theo hướng dẫn skill. Khi có đường dẫn
  output cụ thể, người dùng tự copy các ảnh đã chọn vào `docs/art/m16/`; agent
  xem bản trong workspace bằng `view_image`. Đề xuất này không mở quyền copy hay
  đọc tùy ý file ngoài repo.

## Đoạn rule để tự review và áp dụng

Trong `tools/hooks/policy.mjs`, hàm `checkTool`, đặt nhánh sau **trước** dòng
`return confirm('This local/MCP tool is outside the reviewed policy surface; human review is required.');`.
Tên công cụ là tên thực tế hook đã báo trong lần từ chối.

```js
  if (name === 'image_genimagegen') {
    const permittedKeys = [
      'prompt',
      'transparent_background',
      'num_last_images_to_include',
      'referenced_image_paths',
    ];
    if (
      !args || typeof args !== 'object' || Array.isArray(args) ||
      typeof args.prompt !== 'string' || args.prompt.trim().length === 0 ||
      args.prompt.length > 12000 ||
      args.transparent_background !== false ||
      ![undefined, null, 1].includes(args.num_last_images_to_include) ||
      args.referenced_image_paths != null ||
      Object.keys(args).some((key) => !permittedKeys.includes(key))
    ) {
      return confirm('Image generation outside the reviewed M16 input shape requires human review.');
    }
    return allow;
  }
```

Nhánh này chỉ giới hạn hình dạng input; nó không xác nhận nội dung prompt là an
toàn hay tự đếm số lần tạo ảnh. Phạm vi công việc M16 vẫn do người dùng quyết
định. Không dùng tệp request, biến môi trường hay chuỗi xác nhận làm token duyệt.
Mọi phần còn lại của policy và lớp quyền host tiếp tục áp dụng.

## Kiểm thử đề xuất để tự review và bổ sung

Thêm case dưới đây vào cuối `tools/hooks/policy.check.mjs`. Chúng dùng các helper
đã có và chỉ kiểm tra quyết định của hook; không gọi dịch vụ tạo ảnh.

```js
test('M16 image generation accepts only the reviewed input shape', () => {
  const imageEvent = (tool_input) => ({
    hook_event_name: 'PreToolUse',
    tool_name: 'image_genimagegen',
    tool_input,
  });
  const base = { prompt: 'M16 concept board', transparent_background: false };
  const decision = (args) => checkTool(imageEvent(args), root, scripts).decision;

  assert.equal(decision(base), 'allow');
  assert.equal(decision({ ...base, num_last_images_to_include: 1 }), 'allow');
  assert.equal(decision({ ...base, referenced_image_paths: null }), 'allow');
  for (const args of [
    { ...base, prompt: '' },
    { ...base, prompt: 'x'.repeat(12001) },
    { ...base, transparent_background: true },
    { ...base, num_last_images_to_include: 2 },
    { ...base, referenced_image_paths: ['outside.png'] },
    { ...base, output_path: 'outside.png' },
  ]) {
    assert.equal(decision(args), 'confirm');
  }

  const safe = runHook(imageEvent(base));
  assert.equal(safe.status, 0);
  assert.equal(safe.stdout, '');
  const denied = runHook(imageEvent({ ...base, referenced_image_paths: ['outside.png'] }));
  assert.equal(JSON.parse(denied.stdout).hookSpecificOutput.permissionDecision, 'deny');
});
```

Sau khi tự review và áp dụng thay đổi, chạy trong terminal của người dùng:

```powershell
node --test tools/hooks/policy.check.mjs
git diff
```

Repo hiện có một tệp `*.check.mjs`: `tools/hooks/policy.check.mjs`. Lệnh trên
truyền tên tệp cụ thể. npm script hiện dùng `node --test tools/hooks/*.check.mjs`;
trên môi trường Windows/Node của người dùng, mẫu này đã được truyền nguyên cho
Node và báo không tìm thấy file. Vì vậy bước kiểm tra này dùng tên tệp trực tiếp.

Để sửa luôn `npm run test:hooks`, người dùng cần tự review và đồng bộ hai chuỗi:

- Trong `package.json`: `"test:hooks": "node --test tools/hooks/policy.check.mjs"`.
- Trong object `reviewed` của `tools/hooks/policy.mjs`:
  `'test:hooks': 'node --test tools/hooks/policy.check.mjs'`.

Việc đồng bộ giữ kiểm tra khớp chính xác script; chỉ thay cách chỉ định tệp test.
Đây là hướng dẫn để con người áp dụng, chưa sửa hai tệp cấu hình đang hoạt động.

Nếu có lỗi, dừng để xem lại. Không bỏ hoặc sửa các test cũ để làm chúng pass.
Review/trust lại đúng phiên bản hook theo `docs/guardrails.md` nếu môi trường
yêu cầu. Không tắt hook hoặc dùng cờ bỏ qua trust.

Rule đã được đọc lại và các ảnh đã được người dùng copy vào workspace. Các
request thực tế và kết quả được chọn nằm trong `generation-log.json`; bộ review
hiện dùng các PNG trong thư mục này. Rule nền kín M16 vẫn được giữ nguyên.
