const { createClient } = require('redis');

let useMemoryFallback = false;
const memoryStore = new Map();

// Trình giả lập Redis trong bộ nhớ (In-Memory Fallback)
const mockRedisClient = {
    async get(key) {
        const data = memoryStore.get(key);
        if (!data) return null;
        // Kiểm tra thời gian sống (TTL)
        if (data.expiry && Date.now() > data.expiry) {
            memoryStore.delete(key);
            return null;
        }
        return data.value;
    },
    async set(key, value, options) {
        let expiry = null;
        if (options && options.EX) {
            expiry = Date.now() + options.EX * 1000;
        }
        memoryStore.set(key, { value, expiry });
        return 'OK';
    },
    async del(key) {
        memoryStore.delete(key);
        return 1;
    }
};

// Cấu hình Client Redis chính
const client = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        connectTimeout: 2000, // Hết hạn nhanh sau 2 giây để tránh treo ứng dụng
        reconnectStrategy: (retries) => {
            if (retries > 2) {
                console.warn('⚠️ [Tech Audio Warning] Không thể kết nối tới Redis Server sau 3 lần thử. Đã tự động kích hoạt chế độ In-Memory Fallback để ứng dụng hoạt động ổn định!');
                useMemoryFallback = true;
                return false; // Ngừng thử lại
            }
            return 1000;
        }
    }
});

client.on('error', (err) => {
    // Chỉ in cảnh báo thay vì làm sập ứng dụng
    console.warn('⚠️ [Redis Connection Error]:', err.message);
    useMemoryFallback = true;
});

client.on('connect', () => {
    console.log('⚡ [Redis Server]: Đã kết nối thành công tới Redis Server.');
    useMemoryFallback = false;
});

// Đối tượng bao bọc (Wrapper) để tự động chuyển đổi giữa Redis thực và Giả lập bộ nhớ
const redisWrapper = {
    async get(key) {
        if (useMemoryFallback) {
            return mockRedisClient.get(key);
        }
        try {
            return await client.get(key);
        } catch (e) {
            console.warn('⚠️ Lỗi Redis GET, chuyển sang bộ nhớ đệm:', e.message);
            return mockRedisClient.get(key);
        }
    },
    async set(key, value, options) {
        if (useMemoryFallback) {
            return mockRedisClient.set(key, value, options);
        }
        try {
            if (options && options.EX) {
                return await client.set(key, value, { EX: options.EX });
            }
            return await client.set(key, value);
        } catch (e) {
            console.warn('⚠️ Lỗi Redis SET, chuyển sang bộ nhớ đệm:', e.message);
            return mockRedisClient.set(key, value, options);
        }
    },
    async setEx(key, seconds, value) {
        if (useMemoryFallback) {
            return mockRedisClient.set(key, value, { EX: seconds });
        }
        try {
            return await client.setEx(key, seconds, value);
        } catch (e) {
            console.warn('⚠️ Lỗi Redis setEx, chuyển sang bộ nhớ đệm:', e.message);
            return mockRedisClient.set(key, value, { EX: seconds });
        }
    },
    async del(key) {
        if (useMemoryFallback) {
            return mockRedisClient.del(key);
        }
        try {
            return await client.del(key);
        } catch (e) {
            console.warn('⚠️ Lỗi Redis DEL, chuyển sang bộ nhớ đệm:', e.message);
            return mockRedisClient.del(key);
        }
    },
    // Giữ nguyên phương thức on của client nguyên bản để tránh lỗi cú pháp bên ngoài
    on(event, handler) {
        client.on(event, handler);
    }
};

// Khởi chạy kết nối bất đồng bộ không gây nghẽn luồng
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.warn('⚠️ Kết nối Redis Server thất bại lúc khởi chạy. Đã chuyển sang chế độ dự phòng In-Memory Fallback!');
        useMemoryFallback = true;
    }
})();

module.exports = redisWrapper;
