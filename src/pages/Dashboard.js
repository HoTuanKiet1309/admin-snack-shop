import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, message, Select, Space, DatePicker } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarOutlined, ShoppingCartOutlined, CalendarOutlined } from '@ant-design/icons';
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import moment from 'moment';

const { Option } = Select;
const { MonthPicker } = DatePicker;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'year', 'custom'
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Tạo tham số thời gian
      const timeParams = {};
      
      if (timeRange === 'month' && selectedMonth) {
        // Đảm bảo ngày bắt đầu là ngày đầu tiên của tháng ở múi giờ UTC+7
        const startOfMonth = moment(selectedMonth).startOf('month').utcOffset(7);
        const endOfMonth = moment(selectedMonth).endOf('month').utcOffset(7);
        
        // Format ngày theo ISO string
        timeParams.startDate = startOfMonth.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        timeParams.endDate = endOfMonth.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        
        console.log('Lọc theo tháng:', {
          selectedMonth: selectedMonth.format('MM/YYYY'),
          startDate: timeParams.startDate,
          endDate: timeParams.endDate,
          startLocal: startOfMonth.format('YYYY-MM-DD HH:mm:ss'),
          endLocal: endOfMonth.format('YYYY-MM-DD HH:mm:ss'),
          startUTC: startOfMonth.utc().format('YYYY-MM-DD HH:mm:ss'),
          endUTC: endOfMonth.utc().format('YYYY-MM-DD HH:mm:ss')
        });
      } else if (timeRange === 'year' && selectedYear) {
        const startOfYear = moment(selectedYear).startOf('year').utcOffset(7);
        const endOfYear = moment(selectedYear).endOf('year').utcOffset(7);
        timeParams.startDate = startOfYear.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        timeParams.endDate = endOfYear.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        console.log('Lọc theo năm:', {
          selectedYear: selectedYear.format('YYYY'),
          startDate: timeParams.startDate,
          endDate: timeParams.endDate,
          startLocal: startOfYear.format('YYYY-MM-DD HH:mm:ss'),
          endLocal: endOfYear.format('YYYY-MM-DD HH:mm:ss')
        });
      } else if (timeRange === 'current-month') {
        const now = moment().utcOffset(7);
        const startOfMonth = now.clone().startOf('month');
        const endOfMonth = now.clone().endOf('month');
        timeParams.startDate = startOfMonth.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        timeParams.endDate = endOfMonth.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        console.log('Lọc theo tháng hiện tại:', {
          startDate: timeParams.startDate,
          endDate: timeParams.endDate,
          startLocal: startOfMonth.format('YYYY-MM-DD HH:mm:ss'),
          endLocal: endOfMonth.format('YYYY-MM-DD HH:mm:ss')
        });
      } else if (timeRange === 'current-year') {
        const now = moment().utcOffset(7);
        const startOfYear = now.clone().startOf('year');
        const endOfYear = now.clone().endOf('year');
        timeParams.startDate = startOfYear.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        timeParams.endDate = endOfYear.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        console.log('Lọc theo năm hiện tại:', {
          startDate: timeParams.startDate,
          endDate: timeParams.endDate,
          startLocal: startOfYear.format('YYYY-MM-DD HH:mm:ss'),
          endLocal: endOfYear.format('YYYY-MM-DD HH:mm:ss')
        });
      }

      // Fetch products
      const productsResponse = await productService.getAllProducts();
      
      // Fetch top selling products from completed orders with time range
      const completedStatsResponse = await orderService.getCompletedOrdersStatistics(timeParams);
      console.log('API response completed stats:', completedStatsResponse);
      
      // Fetch orders with time range - chỉ sử dụng để hiển thị đơn hàng gần đây
      const ordersResponse = await orderService.getAllOrders({
        limit: 10,
        ...timeParams
      });
      console.log('API response orders:', ordersResponse);
      console.log('API time params:', timeParams);

      // Tính toán thống kê
      const products = productsResponse.data || [];
      const orders = ordersResponse.data || [];
      
      // Lấy dữ liệu thống kê từ API
      if (completedStatsResponse?.data?.success) {
        const { totalRevenue, totalCompletedOrders, topProducts: topSellingProducts } = completedStatsResponse.data.data;
        
        setStats({
          totalRevenue: totalRevenue || 0,
          totalOrders: totalCompletedOrders || 0,
          totalProducts: products.length,
          totalCustomers: 0 // Sẽ cập nhật khi có API users
        });
        
        // Lấy top sản phẩm bán chạy từ API
        setTopProducts(topSellingProducts || []);
      } else {
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: products.length,
          totalCustomers: 0
        });
        setTopProducts([]);
      }

      setRecentOrders(orders);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    
    // Reset selected month/year if changing time range type
    if (value === 'all') {
      setSelectedMonth(null);
      setSelectedYear(null);
    }
  };
  
  const handleMonthChange = (date) => {
    console.log('Tháng được chọn:', date.format('MM/YYYY'));
    
    // Kiểm tra chi tiết về ngày tháng
    console.log('Chi tiết ngày tháng:');
    console.log('- Ngày đầy đủ (ISO):', date.toISOString());
    console.log('- Format MM/YYYY:', date.format('MM/YYYY'));
    console.log('- Ngày trong tháng:', date.date());
    console.log('- Tháng (0-11):', date.month());
    console.log('- Tháng hiển thị (1-12):', date.month() + 1);
    console.log('- Năm:', date.year());
    
    // Debug thời gian thực tế
    const startOfMonth = moment(date).startOf('month');
    const endOfMonth = moment(date).endOf('month');
    console.log('Ngày bắt đầu:', startOfMonth.format('YYYY-MM-DD'));
    console.log('Ngày kết thúc:', endOfMonth.format('YYYY-MM-DD'));
    
    setSelectedMonth(date);
    setTimeRange('month');
  };
  
  const handleYearChange = (date) => {
    setSelectedYear(date);
    setTimeRange('year');
  };

  const topProductColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.image && (
            <img 
              src={record.image} 
              alt={name} 
              style={{ width: 40, height: 40, marginRight: 10, objectFit: 'cover' }} 
            />
          )}
          {name || 'Sản phẩm không tên'}
        </div>
      )
    },
    {
      title: 'Đã bán',
      dataIndex: 'totalSold',
      key: 'totalSold',
      render: (totalSold) => totalSold || 0
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (totalRevenue) => `${(totalRevenue || 0).toLocaleString('vi-VN')}đ`
    }
  ];

  const recentOrderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (id) => `#${id.slice(-6).toUpperCase()}`
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (user, record) => {
        if (!user) return 'Khách vãng lai';
        
        // Kiểm tra nếu user là string (ID) thay vì object
        if (typeof user === 'string') {
          return 'Đang tải...';
        }
        
        // Hiển thị họ tên đầy đủ nếu có
        if (user.firstName && user.lastName) {
          return `${user.lastName} ${user.firstName}`;
        }
        
        // Fallback to email if no name
        if (user.email) {
          return user.email;
        }
        
        return 'Khách vãng lai';
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${(amount || 0).toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => {
        const statusMap = {
          'pending': { color: 'gold', text: 'Chờ xử lý' },
          'processing': { color: 'blue', text: 'Đang xử lý' },
          'shipping': { color: 'purple', text: 'Đang giao hàng' },
          'delivered': { color: 'green', text: 'Hoàn thành' },
          'cancelled': { color: 'red', text: 'Đã hủy' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  // Hiển thị tiêu đề phù hợp với khoảng thời gian đã chọn
  const getTimeRangeTitle = () => {
    if (timeRange === 'month' && selectedMonth) {
      // Đảm bảo hiển thị đúng tháng đã chọn
      const monthFormat = moment(selectedMonth).format('MM/YYYY');
      console.log("Định dạng tiêu đề tháng:", monthFormat);
      return `Tháng ${monthFormat}`;
    } else if (timeRange === 'year' && selectedYear) {
      return `Năm ${moment(selectedYear).format('YYYY')}`;
    } else if (timeRange === 'current-month') {
      return `Tháng ${moment().format('MM/YYYY')}`;
    } else if (timeRange === 'current-year') {
      return `Năm ${moment().format('YYYY')}`;
    } else {
      return 'Tất cả thời gian';
    }
  };

  // Tạo danh sách năm để select (10 năm gần đây)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <Space>
              <span><CalendarOutlined /> Khoảng thời gian:</span>
              <Select 
                style={{ width: 150 }} 
                onChange={handleTimeRangeChange}
                value={timeRange}
              >
                <Option value="all">Tất cả</Option>
                <Option value="current-month">Tháng này</Option>
                <Option value="current-year">Năm nay</Option>
                <Option value="month">Tháng cụ thể</Option>
                <Option value="year">Năm cụ thể</Option>
              </Select>
              
              {timeRange === 'month' && (
                <DatePicker
                  picker="month"
                  placeholder="Chọn tháng"
                  format="MM/YYYY"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  allowClear={false}
                />
              )}
              
              {timeRange === 'year' && (
                <DatePicker
                  picker="year"
                  placeholder="Chọn năm"
                  format="YYYY"
                  value={selectedYear}
                  onChange={handleYearChange}
                  allowClear={false}
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title={`Doanh thu (${getTimeRangeTitle()})`}
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="đ"
              formatter={(value) => `${value.toLocaleString('vi-VN')}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={`Đơn hoàn thành (${getTimeRangeTitle()})`}
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={`Top sản phẩm bán chạy (${getTimeRangeTitle()})`}>
            <Table
              columns={topProductColumns}
              dataSource={topProducts}
              rowKey="_id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={`Đơn hàng gần đây (${getTimeRangeTitle()})`}>
            <Table
              columns={recentOrderColumns}
              dataSource={recentOrders.slice(0, 5)}
              rowKey="_id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;