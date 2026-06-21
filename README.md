## Tên đề tài

Nghiên cứu và triển khai giải pháp kiểm thử tự động tích hợp quy trình CI/CD cho ứng dụng Web sử dụng Playwright và GitHub Actions.

---

## Thành viên nhóm


| Thành viên           |
| -------------------- |
| **Đinh Kim Yến Nhi** |


---

## Mô tả chức năng hệ thống


| Hạng mục              | Mô tả                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**          | Kiểm thử UI tự động, tích hợp pipeline CI/CD, báo cáo kết quả theo đề cương đồ án.                                                                                                                                                                                                                                           |
| **Site mẫu**          | [Sauce Demo](https://www.saucedemo.com/) · [The Internet](https://the-internet.herokuapp.com/)                                                                                                                                                                                                                               |
| **Công nghệ sử dụng** | - Playwright (kiểm thử tự động) - GitHub Actions (CI/CD) - Allure Report (báo cáo kiểm thử) - GitHub Pages (triển khai báo cáo) - Docker (container hóa) - Node.js (môi trường thực thi) - Sauce Demo - The Internet.                                                                                                        |
| **Nội dung đề**       | Theo bản mô tả đề tài nộp kèm hồ sơ: nghiên cứu kiểm thử tự động và CI/CD; kịch bản **Sauce Demo** (đăng nhập, mua hàng, thanh toán) và **The Internet** (upload, nội dung động, tương tác phức tạp); **POM**; pipeline **GitHub Actions**; báo cáo **Allure**, **GitHub Pages**; **Docker** cho môi trường test thống nhất. |


---

## Hướng dẫn chạy project

**Yêu cầu:** đã cài [Node.js](https://nodejs.org/).

```bash
npm install
npx playwright install chromium
npm test
```


| Lệnh                    | Ý nghĩa                                                |
| ----------------------- | ------------------------------------------------------ |
| `npm test`              | Chạy toàn bộ test                                      |
| `npm run test:sauce`    | Chỉ project Sauce Demo                                 |
| `npm run test:internet` | Chỉ project The Internet                               |
| `npm run docker`        | Chạy toàn bộ test trong Docker                         |
| `npm run test:report`   | Mở báo cáo HTML Playwright (`playwright-report/`)      |
| `npm run report:allure` | Sinh + mở báo cáo Allure trên browser (sau `npm test`) |


**Allure (§2.5):** cần **Java 17+** và `JAVA_HOME` trỏ đúng thư mục JDK (ví dụ `C:\Program Files\Java\jdk-17`). Chạy sau `npm test`:

```bash
npm test
npm run report:allure
```

**Docker:** cần [Docker Desktop](https://www.docker.com/products/docker-desktop/). Chạy test:

```bash
npm run docker
```

Sau đó xem báo cáo: `npm run test:report` hoặc `npm run report:allure` (Allure cần Java 17+).

---

## CI/CD & GitHub Pages

Pipeline: `.github/workflows/playwright.yml`


| Bước                          | Mô tả                                 |
| ----------------------------- | ------------------------------------- |
| Push / PR → `main`, `develop` | Tự chạy `npm test` trên Ubuntu        |
| Sau mỗi lần chạy              | Sinh Allure report, lưu artifact      |
| Push → `main`                 | Tự deploy Allure lên **GitHub Pages** |


**Bật GitHub Pages (lần đầu):**

1. Vào repo trên GitHub → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Push lên nhánh `main` → tab **Actions** → job **Deploy Allure report to GitHub Pages**

**URL báo cáo (sau khi deploy thành công):**

`https://yennhi0710.github.io/yennhi-automation-testing/`.

---

## Link Swagger UI

Chưa có Swagger UI.
