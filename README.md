# SnackHub Admin Dashboard

Admin dashboard cho hệ thống bán hàng SnackHub, được xây dựng với React và Ant Design.

## Công nghệ sử dụng

- React 18
- Ant Design cho UI components
- Material UI cho additional components
- Chart.js cho data visualization
- React Router cho routing
- Axios cho API calls
- i18next cho internationalization
- Moment.js cho date handling
- Cloudinary cho image management

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build cho production
npm run build

# Chạy tests
npm test
```

## Cấu trúc thư mục

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── layouts/       # Layout components
├── services/      # API services
├── hooks/         # Custom hooks
├── utils/         # Utility functions
├── assets/        # Static assets
├── locales/       # Translation files
└── styles/        # Global styles
```

## Tính năng chính

### Quản lý sản phẩm
- Thêm/Sửa/Xóa sản phẩm
- Quản lý danh mục
- Upload hình ảnh
- Quản lý tồn kho

### Quản lý đơn hàng
- Xem danh sách đơn hàng
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- In hóa đơn

### Quản lý người dùng
- Xem danh sách người dùng
- Quản lý quyền truy cập
- Xem lịch sử đơn hàng của người dùng

### Thống kê và báo cáo
- Doanh thu theo thời gian
- Sản phẩm bán chạy
- Thống kê người dùng
- Báo cáo tồn kho

### Cài đặt hệ thống
- Cấu hình website
- Quản lý khuyến mãi
- Cài đặt thanh toán
- Quản lý email templates

## Môi trường phát triển

Tạo file `.env` với các biến môi trường sau:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.
