-- 1. TẠO CÁC KIỂU DỮ LIỆU CỐ ĐỊNH (ENUMS)
CREATE TYPE user_role AS ENUM ('Admin', 'Tenant', 'Guest');
CREATE TYPE room_status AS ENUM ('Available', 'Occupied', 'Maintenance');
CREATE TYPE contract_status AS ENUM ('Active', 'Terminated');
CREATE TYPE invoice_status AS ENUM ('Pending', 'Paid', 'Overdue');
CREATE TYPE payment_method AS ENUM ('Bank Transfer', 'Credit Card', 'Cash');
CREATE TYPE request_type AS ENUM ('Repair', 'Installation', 'Maintenance', 'Change Room', 'Other');
CREATE TYPE request_status AS ENUM ('Pending', 'In Progress', 'Completed');
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');

-- 2. TẠO BẢNG USERS (Tài khoản)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Guest',
    full_name VARCHAR(100),
    cccd VARCHAR(20) UNIQUE,
    dob DATE,
    hometown VARCHAR(255),
    gender VARCHAR(10),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẠO BẢNG ROOMS (Phòng trọ)
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL, 
    floor INT,
    price DECIMAL(10,2) NOT NULL,
    status room_status DEFAULT 'Available',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TẠO BẢNG CONTRACTS (Hợp đồng thuê phòng)
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status contract_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TẠO BẢNG INVOICES (Hóa đơn)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_code VARCHAR(20) UNIQUE NOT NULL, 
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'Pending',
    payment_method payment_method,
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TẠO BẢNG REQUESTS (Yêu cầu hỗ trợ)
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type request_type NOT NULL,
    priority priority_level DEFAULT 'Medium',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status request_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 7. TẠO BẢNG OTP_TOKENS (Khôi phục mật khẩu)
CREATE TABLE otp_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO contracts (tenant_id, room_id, start_date, end_date, status) VALUES
(
  (SELECT id FROM users WHERE email = 'tenant1@gmail.com'), 
  (SELECT id FROM rooms WHERE room_number = '202'), 
  '2024-01-01', '2025-01-01', 'Active'
),
(
  (SELECT id FROM users WHERE email = 'tenant2@gmail.com'), 
  (SELECT id FROM rooms WHERE room_number = '401'), 
  '2024-03-15', '2025-03-15', 'Active'
);

--THÊM CỘT is_active VÀO BẢNG USERS ĐỂ QUẢN LÝ TÌNH TRẠNG HOẠT ĐỘNG CỦA NGƯỜI DÙNG
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

--THÊM CỘT refresh_token VÀO BẢNG USERS ĐỂ LƯU TRỮ TOKEN LÀM MỚI CHO XÁC THỰC
ALTER TABLE users ADD COLUMN refresh_token TEXT;

--THÊM CỘT user_id VÀO BẢNG OTP_TOKENS ĐỂ LIÊN KẾT MÃ OTP VỚI NGƯỜI DÙNG CỤ THỂ
ALTER TABLE otp_tokens ADD COLUMN user_id UUID;

--THÊM BẢNG LOGIN_LOGS ĐỂ THEO DÕI LỊCH SỬ ĐĂNG NHẬP CỦA NGƯỜI DÙNG
CREATE TABLE login_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(50)
);


---------------DỮ LIỆU MẪU CHO TESTING----------------

-- Thêm 1 Admin (Mật khẩu mặc định giả định là đã hash)
INSERT INTO users (phone, email, password_hash, role, full_name)
VALUES ('0901234567', 'admin@roomrental.com', 'hashed_pwd_here', 'Admin', 'Boss Landlord');

-- Thêm Phòng trọ
INSERT INTO rooms (room_number, floor, price, status, description) VALUES
('101', 1, 800, 'Available', 'Phòng tầng trệt, có cửa sổ lớn'),
('102', 1, 850, 'Available', 'Phòng góc, thoáng mát'),
('201', 2, 900, 'Available', 'Phòng có ban công riêng');
('103', 1, 3500000, 'Available', 'Phòng trệt giá rẻ, diện tích nhỏ gọn phù hợp 1 người ở, tiện dắt xe ra vào.'),
('202', 2, 4500000, 'Occupied', 'Phòng tiêu chuẩn, khu vực yên tĩnh, dân trí cao, có sẵn giường và tủ quần áo.'),
('301', 3, 6000000, 'Available', 'Phòng mặt tiền, ban công rộng rãi cực chill, ngắm cảnh đường phố về đêm.'),
('302', 3, 5800000, 'Maintenance', 'Đang sơn lại tường và bảo dưỡng máy lạnh. Dự kiến có thể dọn vào đầu tháng sau.'),
('401', 4, 8500000, 'Occupied', 'Phòng Studio cao cấp, nội thất thông minh hiện đại, có khu vực bếp riêng và máy hút mùi.'),
('402', 4, 8000000, 'Available', 'Phòng góc bao mát, 2 mặt cửa sổ đón nắng gió tự nhiên, không gian cực kỳ thoáng đãng.'),
('501', 5, 12000000, 'Available', 'Căn hộ mini tầng thượng (Penthouse), không gian riêng tư, bao trọn khu vực sân vườn và BBQ.');

--Update giá tiền thành VND
UPDATE rooms SET price = 8000000 WHERE room_number = '101';
UPDATE rooms SET price = 8500000 WHERE room_number = '102';
UPDATE rooms SET price = 9000000 WHERE room_number = '201';

--thêm 2 tenant (Mật khẩu mặc định giả định là đã hash)
INSERT INTO users (phone, email, password_hash, role, full_name) VALUES
('0911111111', 'tenant1@gmail.com', '123456', 'Tenant', 'Nguyễn Văn A'),
('0922222222', 'tenant2@gmail.com', '123456', 'Tenant', 'Trần Thị B');