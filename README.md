

## Bài Tập 06

### 1. Giỏ Hàng Hiệu Năng Cao (API + UI)
- **Lưu trữ bằng Redis**: Thông tin giỏ hàng được lưu trữ tạm thời trong bộ nhớ cache **Redis** (`cart:<userId>`) giúp tối ưu hóa tốc độ đọc ghi, giảm tải tối đa cho MongoDB.
- **Đồng bộ hóa dữ liệu thời gian thực**: Khi lấy giỏ hàng, hệ thống tự động đối chiếu thông tin sản phẩm (tên, ảnh, giá) từ MongoDB để đảm bảo giá bán luôn chính xác và tự động hạ số lượng/xóa sản phẩm nếu vượt quá số lượng tồn kho thực tế.
- **UI Giỏ Hàng Mượt Mà**: Giao diện giỏ hàng hỗ trợ tăng/giảm số lượng trực quan, xóa từng phần tử, làm trống giỏ hàng kèm theo các hiệu ứng chuyển động mịn màng của `framer-motion`.

### 2. Thanh Toán Đơn Hàng (Checkout)
- **Phương thức bắt buộc COD**: Khách hàng điền địa chỉ giao hàng và số điện thoại để đặt hàng theo hình thức COD (Thanh toán tiền mặt khi nhận hàng).
- **Cổng thanh toán MoMo Giả Lập**: Tích hợp thêm phương thức quét mã QR qua ví điện tử **MoMo**. Khách hàng quét mã QR giả lập hiển thị trên màn hình và bấm xác nhận thanh toán trực tuyến thành công ngay lập tức để hoàn tất đặt hàng.
- **Bảo toàn tồn kho**: Khi đặt hàng thành công, số lượng tồn kho (`stock`) của sản phẩm lập tức bị trừ tương ứng và số lượng đã bán (`sold`) tự động tăng lên.

### 3. Lịch Sử Mua Hàng & Theo Dõi Trạng Thái Vận Chuyển Thời Gian Thực
- **Theo dõi hành trình 5 bước**: Hiển thị thanh tiến trình (progress bar) trực quan mô tả 5 bước trạng thái đơn hàng:
  1. **Đơn hàng mới** (`New`)
  2. **Đã xác nhận đơn hàng** (`Confirmed`) - *Tự động xác nhận sau 30 phút đặt hàng thành công nếu không được duyệt thủ công.*
  3. **Shop đang chuẩn bị hàng** (`Preparing`)
  4. **Đang giao hàng** (`Shipping`)
  5. **Đã giao thành công** (`Delivered`)
- **Chính sách hủy đơn nghiêm ngặt**:
  - Khách hàng chỉ được phép hủy đơn hàng **trong vòng 30 phút** kể từ thời điểm đặt hàng thành công.
  - Nếu đơn hàng ở trạng thái **Đơn hàng mới** (`New`) hoặc **Đã xác nhận** (`Confirmed`), đơn hàng sẽ được hủy trực tiếp (`Cancelled`), đồng thời hoàn trả lại hàng vào kho lưu trữ.
  - Nếu đơn hàng đang ở bước **Shop đang chuẩn bị hàng** (`Preparing`), nút hủy sẽ tự động chuyển sang **Gửi yêu cầu hủy đơn** (`CancelRequested`) chờ shop phê duyệt.
  - Nếu đơn hàng đã chuyển sang **Đang giao** (`Shipping`) hoặc **Đã giao** (`Delivered`), nút hủy đơn sẽ bị khóa.
- **🛠️ Bảng Điều Khiển Kiểm Thử (Testing Console)**: 
  - Ngay trong giao diện chi tiết từng đơn hàng tại trang `/orders`, chúng tôi tích hợp sẵn bảng điều khiển giả lập để giảng viên/người dùng có thể tự bấm dịch chuyển nhanh trạng thái đơn hàng (Đơn mới -> Xác nhận -> Chuẩn bị -> Giao hàng -> Đã giao) để kiểm nghiệm tức thì sự thay đổi của thanh đồ họa vận chuyển, nút hủy đơn cũng như số lượng kho hàng!

---


## 🛠️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống:
* **Node.js** (phiên bản 16+)
* **MongoDB Server** đang chạy (mặc định cổng `27017`)
* **Redis Server** đang chạy (mặc định cổng `6379`)

---

### Bước 1: Cấu hình & Chạy Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Đảm bảo cấu hình file `.env` inside `backend/` như sau:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/CNPMM_Buoi6
   JWT_SECRET=23110315_LeNgoNhutTan
   REDIS_URL=redis://localhost:6379
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-password
   ```

4. Nạp dữ liệu sản phẩm mẫu phong phú vào cơ sở dữ liệu:
   ```bash
   node seed.js
   ```

5. Khởi động server backend:
   ```bash
   npm start
   ```
   *Backend sẽ chạy tại cổng `5000`*

---

### Bước 2: Cấu hình & Chạy Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../frontend
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy giao diện:
   ```bash
   npm run dev
   ```
   *Mở trình duyệt truy cập: `http://localhost:5173`*

---

## 📌 Danh Sách API Endpoints 

### 🛒 Giỏ Hàng (Redis Cache)
* **GET** `/api/cart` — Lấy giỏ hàng hiện tại (Yêu cầu đăng nhập)
* **POST** `/api/cart/add` — Thêm sản phẩm vào giỏ hàng (Body: `{ productId, quantity }`)
* **PUT** `/api/cart/update` — Cập nhật số lượng (Body: `{ productId, quantity }`)
* **DELETE** `/api/cart/remove/:productId` — Xóa sản phẩm khỏi giỏ hàng
* **DELETE** `/api/cart/clear` — Làm trống giỏ hàng

### 📦 Đơn Hàng & Vận Chuyển
* **POST** `/api/orders` — Đặt hàng / Thanh toán (Body: `{ shippingAddress, phoneNumber, paymentMethod }`)
* **GET** `/api/orders` — Danh sách lịch sử mua hàng của user (Có tính năng tự động chuyển Confirmed sau 30 phút)
* **GET** `/api/orders/:id` — Xem chi tiết trạng thái 1 đơn hàng
* **POST** `/api/orders/:id/cancel` — Hủy đơn hàng hoặc gửi yêu cầu hủy (Tùy thuộc trạng thái & thời gian 30 phút)
* **PUT** `/api/orders/:id/status` — (Kiểm thử) Ép trạng thái đơn hàng sang mốc chỉ định (Body: `{ status, paymentStatus }`)
