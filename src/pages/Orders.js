import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tag, Typography, 
  DatePicker, Select, message, Popconfirm
} from 'antd';
import { 
  SearchOutlined, EyeOutlined, FileExcelOutlined,
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { orderService } from '../services/orderService';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Orders = () => {
  console.log('Orders component rendered'); // Debug log

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
  });

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...'); // Debug log
      setLoading(true);
      const response = await orderService.getAllOrders();
      console.log('Orders response:', response); // Debug log
      if (response && response.data) {
        setOrders(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.length
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching orders:', error); // Debug log
      message.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'processing':
        return 'blue';
      case 'shipping':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await orderService.exportOrders();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${moment().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất file Excel thành công');
    } catch (error) {
      message.error('Xuất file Excel thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(order => {
        // Tìm theo mã đơn hàng
        const orderIdMatch = order._id.toLowerCase().includes(searchLower);
        
        // Tìm theo thông tin khách hàng
        const user = order.userId;
        if (!user) return orderIdMatch;

        // Tìm theo email
        const emailMatch = user.email?.toLowerCase().includes(searchLower);

        // Tìm theo họ tên đầy đủ
        const fullName = user.firstName && user.lastName 
          ? `${user.lastName} ${user.firstName}`.toLowerCase()
          : '';
        const fullNameMatch = fullName.includes(searchLower);

        // Tìm theo từng phần của tên
        const firstNameMatch = user.firstName?.toLowerCase().includes(searchLower);
        const lastNameMatch = user.lastName?.toLowerCase().includes(searchLower);

        return orderIdMatch || emailMatch || fullNameMatch || firstNameMatch || lastNameMatch;
      });
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(order => {
        const orderDate = moment(order.orderDate);
        return orderDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    return filtered;
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  };

  const getPageData = (data) => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  };

  const columns = [
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
      sorter: (a, b) => {
        const nameA = a.userId?.lastName ? `${a.userId.lastName} ${a.userId.firstName}` : '';
        const nameB = b.userId?.lastName ? `${b.userId.lastName} ${b.userId.firstName}` : '';
        return nameA.localeCompare(nameB);
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status, record) => (
        <Space>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        
            <Select
              defaultValue={status}
              style={{ width: 140 }}
              onChange={(value) => handleStatusUpdate(record._id, value)}
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="shipping">Đang giao hàng</Option>
              <Option value="delivered">Đã giao hàng</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
        </Space>
      ),
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Đang giao hàng', value: 'shipping' },
        { text: 'Đã giao hàng', value: 'delivered' },
        { text: 'Đã hủy', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.orderStatus === value
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.orderDate).unix() - moment(b.orderDate).unix()
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record._id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      )
    }
  ];

  const filteredOrders = getFilteredOrders();
  const currentPageData = getPageData(filteredOrders);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Quản lý đơn hàng</Title>
        <Button 
          type="primary" 
          icon={<FileExcelOutlined />} 
          onClick={handleExportExcel}
          loading={loading}
        >
          Xuất Excel
        </Button>
      </div>
      
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <Input
          placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        <RangePicker 
          value={dateRange}
          onChange={setDateRange}
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
        />
        <Select
          style={{ width: 150 }}
          placeholder="Trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="processing">Đang xử lý</Option>
          <Option value="shipping">Đang giao hàng</Option>
          <Option value="delivered">Đã giao hàng</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => {
            setSearchText('');
            setDateRange(null);
            setStatusFilter(null);
          }}
        >
          Đặt lại
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={currentPageData}
        rowKey="_id"
        pagination={{
          ...pagination,
          total: filteredOrders.length,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: (page, pageSize) => {
            setPagination(prev => ({
              ...prev,
              current: page,
              pageSize: pageSize
            }));
          }
        }}
        onChange={handleTableChange}
        loading={loading}
      />
    </Card>
  );
};

export default Orders;