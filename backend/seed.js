const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
    {
        name: 'Tai nghe Sony WH-1000XM5',
        description: 'Chống ồn đỉnh cao, âm thanh chi tiết.',
        price: 8490000,
        images: [
            '/images/products/sony_headphone.png',
            '/images/products/sony_headphone_2.png',
            '/images/products/sony_headphone_3.png'
        ],
        stock: 15,
        sold: 120,
        views: 1500,
        category: 'Tai nghe',
        isPromotion: true
    },
    {
        name: 'Tai nghe Apple AirPods Pro 2',
        description: 'Âm thanh không gian, khử tiếng ồn chủ động.',
        price: 5990000,
        images: [
            '/images/products/airpods_pro.png',
            '/images/products/airpods_pro_2.png',
            '/images/products/airpods_pro_3.png'
        ],
        stock: 50,
        sold: 500,
        views: 3200,
        category: 'Tai nghe',
        isPromotion: false
    },
    {
        name: 'Chuột Logitech G502 X Plus',
        description: 'Chuột gaming không dây tốc độ cao.',
        price: 3590000,
        images: [
            '/images/products/logitech_mouse.png',
            '/images/products/logitech_mouse_2.png',
            '/images/products/logitech_mouse_3.png'
        ],
        stock: 25,
        sold: 85,
        views: 950,
        category: 'Chuột',
        isPromotion: true
    },
    {
        name: 'Chuột Razer DeathAdder V3 Pro',
        description: 'Siêu nhẹ, cảm biến cực nhạy.',
        price: 3890000,
        images: [
            '/images/products/razer_mouse.png',
            '/images/products/razer_mouse_2.png'
        ],
        stock: 10,
        sold: 45,
        views: 700,
        category: 'Chuột',
        isPromotion: false
    },
    {
        name: 'Bàn phím cơ Keychron Q1 Pro',
        description: 'Nhôm nguyên khối, kết nối không dây.',
        price: 4500000,
        images: [
            '/images/products/keychron_keyboard.png',
            '/images/products/keychron_keyboard_2.png',
            '/images/products/keychron_keyboard_3.png'
        ],
        stock: 5,
        sold: 30,
        views: 850,
        category: 'Bàn phím',
        isPromotion: true
    },
    {
        name: 'Loa Marshall Emberton II',
        description: 'Âm thanh Marshall đặc trưng, pin 30 giờ.',
        price: 4290000,
        images: [
            '/images/products/marshall_speaker.png',
            '/images/products/marshall_speaker_2.png',
            '/images/products/marshall_speaker_3.png'
        ],
        stock: 0,
        sold: 210,
        views: 2100,
        category: 'Loa',
        isPromotion: false
    },
    {
        name: 'Tai nghe Samsung Galaxy Buds3 Pro',
        description: 'Thiết kế độc đáo, âm thanh Hi-Fi 24-bit.',
        price: 5490000,
        images: [
            '/images/products/samsung_buds.png'
        ],
        stock: 100,
        sold: 300,
        views: 2800,
        category: 'Tai nghe',
        isPromotion: true
    },
    {
        name: 'Loa Bluetooth JBL Charge 5',
        description: 'Chống nước IP67, pin 20 giờ, âm thanh mạnh mẽ.',
        price: 3490000,
        images: [
            '/images/products/jbl_charge5.png'
        ],
        stock: 40,
        sold: 150,
        views: 1200,
        category: 'Loa',
        isPromotion: false
    },
    {
        name: 'Bàn phím Corsair K70 RGB Pro',
        description: 'Switch CHERRY MX, khung nhôm, tần số quét 8000Hz.',
        price: 4190000,
        images: [
            '/images/products/corsair_k70.png'
        ],
        stock: 12,
        sold: 60,
        views: 800,
        category: 'Bàn phím',
        isPromotion: false
    },
    {
        name: 'Tai nghe Bose QuietComfort Ultra',
        description: 'Chống ồn hàng đầu, âm thanh đắm chìm.',
        price: 10490000,
        images: [
            '/images/products/bose_qc_ultra.png'
        ],
        stock: 8,
        sold: 20,
        views: 900,
        category: 'Tai nghe',
        isPromotion: true
    },
    {
        name: 'Bàn phím Apple Magic Keyboard',
        description: 'Tích hợp Touch ID, phím gõ êm ái, kết nối tự động.',
        price: 3990000,
        images: [
            '/images/products/apple_keyboard.png'
        ],
        stock: 30,
        sold: 400,
        views: 3100,
        category: 'Bàn phím',
        isPromotion: false
    },
    {
        name: 'Chuột Logitech MX Master 3S',
        description: 'Click siêu êm, cuộn siêu tốc, thiết kế công thái học.',
        price: 2790000,
        images: [
            '/images/products/logitech_mx_master.png'
        ],
        stock: 60,
        sold: 600,
        views: 4000,
        category: 'Chuột',
        isPromotion: true
    },
    {
        name: 'Tai nghe Jabra Elite 8 Active',
        description: 'Bền bỉ tuyệt đối, độ bám hoàn hảo.',
        price: 4990000,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop'],
        stock: 20,
        sold: 10,
        views: 500,
        category: 'Tai nghe',
        isPromotion: false
    },
    {
        name: 'Chuột SteelSeries Aerox 3 Wireless',
        description: 'Siêu nhẹ, thiết kế lỗ tổ ong, chống nước.',
        price: 2490000,
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop'],
        stock: 15,
        sold: 55,
        views: 600,
        category: 'Chuột',
        isPromotion: false
    },
    {
        name: 'Bàn phím Razer BlackWidow V4',
        description: 'Phím cơ clicky, dải LED RGB tùy chỉnh cao.',
        price: 5200000,
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop'],
        stock: 5,
        sold: 15,
        views: 700,
        category: 'Bàn phím',
        isPromotion: true
    },
    {
        name: 'Loa Harman Kardon Aura Studio 3',
        description: 'Thiết kế vòm trong suốt, âm thanh 360 độ.',
        price: 6490000,
        images: ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop'],
        stock: 8,
        sold: 90,
        views: 1800,
        category: 'Loa',
        isPromotion: false
    },
    {
        name: 'Tai nghe Sennheiser Momentum 4 Wireless',
        description: 'Chất âm audiophile, thời lượng pin 60 giờ.',
        price: 8990000,
        images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop'],
        stock: 12,
        sold: 40,
        views: 800,
        category: 'Tai nghe',
        isPromotion: true
    },
    {
        name: 'Chuột Asus ROG Harpe Ace',
        description: 'Form chuẩn eSports, cảm biến 36K DPI.',
        price: 3200000,
        images: ['https://images.unsplash.com/photo-1625842268584-8f329040401c?w=600&auto=format&fit=crop'],
        stock: 18,
        sold: 25,
        views: 400,
        category: 'Chuột',
        isPromotion: false
    },
    // New Mock Data Additions (To make it more diverse)
    {
        name: 'Tai nghe Apple AirPods Max',
        description: 'Thiết kế hoàn hảo, chống ồn thông minh, âm thanh đỉnh cao.',
        price: 13990000,
        images: ['https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600&auto=format&fit=crop'],
        stock: 10,
        sold: 140,
        views: 4200,
        category: 'Tai nghe',
        isPromotion: false
    },
    {
        name: 'Tai nghe Sennheiser HD 600',
        description: 'Tai nghe kiểm âm huyền thoại dành cho audiophile chuyên nghiệp.',
        price: 9900000,
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop'],
        stock: 4,
        sold: 12,
        views: 1100,
        category: 'Tai nghe',
        isPromotion: true
    },
    {
        name: 'Chuột Logitech G Pro X Superlight 2',
        description: 'Trọng lượng siêu nhẹ 60g, switch lai LIGHTFORCE, hiệu năng vượt trội.',
        price: 3890000,
        images: ['https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&auto=format&fit=crop'],
        stock: 30,
        sold: 350,
        views: 5200,
        category: 'Chuột',
        isPromotion: false
    },
    {
        name: 'Chuột Pulsar X2V2 Wireless',
        description: 'Form đối xứng hoàn hảo cho kiểu cầm claw grip, siêu nhẹ 53g.',
        price: 2490000,
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop'],
        stock: 15,
        sold: 70,
        views: 950,
        category: 'Chuột',
        isPromotion: true
    },
    {
        name: 'Bàn phím cơ Wooting 60HE',
        description: 'Bàn phím analog Hall Effect tối thượng cho game thủ FPS chuyên nghiệp.',
        price: 5990000,
        images: ['https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&auto=format&fit=crop'],
        stock: 6,
        sold: 150,
        views: 3800,
        category: 'Bàn phím',
        isPromotion: false
    },
    {
        name: 'Bàn phím cơ Keychron K2 Pro',
        description: 'Bố cục 75% gọn gàng, hỗ trợ QMK/VIA tùy biến sâu, switch cơ gõ êm.',
        price: 2690000,
        images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop'],
        stock: 22,
        sold: 210,
        views: 1900,
        category: 'Bàn phím',
        isPromotion: true
    },
    {
        name: 'Loa Bose SoundLink Flex',
        description: 'Loa di động kháng bụi nước IP67, chất âm ấm, rõ ràng vượt trội.',
        price: 3990000,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop'],
        stock: 15,
        sold: 95,
        views: 1400,
        category: 'Loa',
        isPromotion: false
    },
    {
        name: 'Loa Apple HomePod mini',
        description: 'Chất âm 360 độ đầy đặn, tích hợp trợ lý ảo Siri thông minh.',
        price: 2590000,
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop'],
        stock: 25,
        sold: 180,
        views: 2600,
        category: 'Loa',
        isPromotion: true
    },
    // New Category: Lót chuột (Mousepads)
    {
        name: 'Lót chuột Artisan Hien FX Soft',
        description: 'Bề mặt hybrid cao cấp Nhật Bản, tốc độ tối ưu, độ bền vĩnh cửu.',
        price: 1590000,
        images: ['https://images.unsplash.com/photo-1631009185095-e763f2951435?w=600&auto=format&fit=crop'],
        stock: 12,
        sold: 80,
        views: 1300,
        category: 'Lót chuột',
        isPromotion: false
    },
    {
        name: 'Lót chuột SteelSeries QcK Heavy Large',
        description: 'Đế cao su dày 6mm cực êm ái, bề mặt vải vi dệt mịn màng tối ưu control.',
        price: 490000,
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop'],
        stock: 50,
        sold: 450,
        views: 3100,
        category: 'Lót chuột',
        isPromotion: false
    },
    {
        name: 'Lót chuột Razer Strider Large',
        description: 'Bề mặt hybrid chống nước, độ bo viền tỉ mỉ, trượt chuột siêu tốc.',
        price: 890000,
        images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop'],
        stock: 20,
        sold: 110,
        views: 900,
        category: 'Lót chuột',
        isPromotion: true
    },
    // New Category: Phụ kiện (Accessories)
    {
        name: 'Cáp sạc nhanh Anker Prime 140W',
        description: 'Cáp USB-C sang USB-C bọc dù siêu bền, hỗ trợ sạc siêu nhanh 140W PD 3.1.',
        price: 550000,
        images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop'],
        stock: 40,
        sold: 320,
        views: 2400,
        category: 'Phụ kiện',
        isPromotion: true
    },
    {
        name: 'Bộ chuyển đổi HyperDrive Next 10-Port Hub',
        description: 'Xuất màn hình kép 4K, hỗ trợ truyền dữ liệu 10Gbps tốc độ cực cao.',
        price: 2490000,
        images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop'],
        stock: 15,
        sold: 65,
        views: 850,
        category: 'Phụ kiện',
        isPromotion: false
    },
    {
        name: 'Giá treo tai nghe Razer Base Station V2 Chroma',
        description: 'Tích hợp DAC 7.1, cổng sạc USB 3.1 cùng dải LED RGB lung linh.',
        price: 1890000,
        images: ['https://images.unsplash.com/photo-1601944179066-297cbd374b36?w=600&auto=format&fit=crop'],
        stock: 8,
        sold: 40,
        views: 700,
        category: 'Phụ kiện',
        isPromotion: false
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Đã kết nối MongoDB để seed dữ liệu...');
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log('Seed dữ liệu thành công!');
        process.exit();
    })
    .catch(err => {
        console.error('Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });
