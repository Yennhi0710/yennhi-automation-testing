## Tên đề tài

Nghiên cứu và triển khai giải pháp kiểm thử tự động tích hợp quy trình CI/CD cho ứng dụng Web sử dụng Playwright và GitHub Actions.

---

## Thành viên nhóm

| Thành viên |
|------------|
| **Đinh Kim Yến Nhi** |

---

## Mô tả chức năng hệ thống

<table width="100%">
<colgroup>
<col width="384">
<col width="576">
</colgroup>
<thead>
<tr>
<th align="left">Hạng mục</th>
<th align="left">Mô tả</th>
</tr>
</thead>
<tbody>
<tr>
<td align="left"><strong>Mục đích</strong></td>
<td>Kiểm thử UI tự động, tích hợp pipeline CI/CD, báo cáo kết quả theo đề cương đồ án.</td>
</tr>
<tr>
<td align="left"><strong>Site mẫu</strong></td>
<td><a href="https://www.saucedemo.com/">Sauce Demo</a> · <a href="https://the-internet.herokuapp.com/">The Internet</a></td>
</tr>
<tr>
<td align="left"><strong>Công nghệ sử dụng</strong></td>
<td>
<ul>
<li>Playwright (kiểm thử tự động)</li>
<li>GitHub Actions (CI/CD)</li>
<li>Allure Report (báo cáo kiểm thử)</li>
<li>GitHub Pages (triển khai báo cáo)</li>
<li>Docker (container hóa)</li>
<li>Node.js (môi trường thực thi)</li>
<li>Sauce Demo</li>
<li>The Internet</li>
</ul>
</td>
</tr>
<tr>
<td align="left"><strong>Nội dung đề</strong></td>
<td>Theo bản mô tả đề tài nộp kèm hồ sơ: nghiên cứu kiểm thử tự động và CI/CD; kịch bản <strong>Sauce Demo</strong> (đăng nhập, mua hàng, thanh toán) và <strong>The Internet</strong> (upload, nội dung động, tương tác phức tạp); <strong>POM</strong>; pipeline <strong>GitHub Actions</strong>; báo cáo <strong>Allure</strong>, <strong>GitHub Pages</strong>; <strong>Docker</strong> cho môi trường test thống nhất.</td>
</tr>
</tbody>
</table>

---

## Hướng dẫn chạy project

**Yêu cầu:** đã cài [Node.js](https://nodejs.org/).

```bash
npm install
npx playwright install chromium
npm test
```

| Lệnh | Ý nghĩa |
|------|---------|
| `npm test` | Chạy toàn bộ test |
| `npm run test:sauce` | Chỉ project Sauce Demo |
| `npm run test:internet` | Chỉ project The Internet |
| `npm run test:report` | Mở báo cáo HTML (`playwright-report/`) |

---

## Link Swagger UI

Chưa có Swagger UI.
