import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tag, Popconfirm, 
  Typography, message, DatePicker, Select, Tooltip
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../services/couponService';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Coupons = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAllCoupons();
      setCoupons(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCoupons = () => {
    let filtered = [...coupons];

    // Lọc theo text
    if (searchText) {
      const lowercasedSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        coupon => 
          coupon.code.toLowerCase().includes(lowercasedSearch) ||
          coupon.description.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Lọc theo ngày
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      
      filtered = filtered.filter(coupon => {
        const couponStartDate = moment(coupon.startDate);
        const couponEndDate = moment(coupon.endDate);
        return (couponStartDate.isSameOrAfter(startDate) && couponStartDate.isSameOrBefore(endDate)) || 
               (couponEndDate.isSameOrAfter(startDate) && couponEndDate.isSameOrBefore(endDate));
      });
    }

    // Lọc theo trạng thái
    if (statusFilter !== null) {
      filtered = filtered.filter(coupon => coupon.isActive === statusFilter);
    }

    return filtered;
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await couponService.deleteCoupon(id);
      message.success('Xóa mã giảm giá thành công');
      fetchCoupons();
    } catch (error) {
      message.error('Không thể xóa mã giảm giá');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code)
    },
    {
      title: 'Loại',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type) => (
        <Tag color={type === 'percentage' ? 'blue' : 'green'}>
          {type === 'percentage' ? 'Phần trăm' : 'Cố định'}
        </Tag>
      ),
      filters: [
        { text: 'Phần trăm', value: 'percentage' },
        { text: 'Cố định', value: 'fixed' }
      ],
      onFilter: (value, record) => record.discountType === value
    },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value, record) => (
        record.discountType === 'percentage' 
          ? `${value}%` 
          : `${value.toLocaleString('vi-VN')}đ`
      ),
      sorter: (a, b) => a.discountValue - b.discountValue
    },
    {
      title: 'Giá trị tối thiểu',
      dataIndex: 'minPurchase',
      key: 'minPurchase',
      render: (value) => `${value.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.minPurchase - b.minPurchase
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix()
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.endDate).unix() - moment(b.endDate).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => {
        const now = moment();
        const startDate = moment(record.startDate);
        const endDate = moment(record.endDate);
        const isExpired = now.isAfter(endDate);
        const isFuture = now.isBefore(startDate);
        
        let status, color;
        if (isExpired) {
          status = 'Đã hết hạn';
          color = 'red';
        } else if (isFuture) {
          status = 'Sắp có hiệu lực';
          color = 'orange';
        } else if (isActive) {
          status = 'Đang kích hoạt';
          color = 'green';
        } else {
          status = 'Không kích hoạt';
          color = 'default';
        }
        
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Đang kích hoạt', value: true },
        { text: 'Không kích hoạt', value: false }
      ],
      onFilter: (value, record) => record.isActive === value
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/coupons/edit/${record._id}`)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã giảm giá này?"
            onConfirm={() => handleDeleteCoupon(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredCoupons = getFilteredCoupons();

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Quản lý mã giảm giá</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/coupons/add')}
        >
          Thêm mã giảm giá
        </Button>
      </div>
      
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <Input
          placeholder="Tìm kiếm theo mã, mô tả"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
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
          <Option value={true}>Đang kích hoạt</Option>
          <Option value={false}>Không kích hoạt</Option>
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
        dataSource={filteredCoupons}
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} mã giảm giá`
        }}
      />
    </Card>
  );
};

export default Coupons; 