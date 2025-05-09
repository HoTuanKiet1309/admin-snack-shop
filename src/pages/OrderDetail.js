import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Table, Tag, Button, Steps, Divider,
  Typography, Row, Col, Statistic, Space, message, Modal, Select, Popconfirm
} from 'antd';
import {
  ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, RollbackOutlined, PrinterOutlined,
  ArrowLeftOutlined, UserOutlined, EnvironmentOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/format';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      console.log('Fetching order details for ID:', id);
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(id);
      console.log('Order details response:', response);
      
      if (response && response.data) {
        setOrder(response.data);
        setNewStatus(response.data.orderStatus);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      message.error(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/orders');
  };

  const handlePrint = () => {
    message.success('Đang in đơn hàng...');
  };

  const showStatusModal = () => {
    setNewStatus(order.orderStatus);
    setIsStatusModalVisible(true);
  };

  const handleStatusChange = (value) => {
    setNewStatus(value);
  };

  const handleStatusUpdate = async () => {
    try {
      console.log('Updating order status:', { orderId: id, newStatus });
      const response = await orderService.updateOrderStatus(id, newStatus);
      if (response.data.success) {
        message.success(response.data.message || 'Cập nhật trạng thái thành công');
        setIsStatusModalVisible(false);
        setOrder(response.data.data);
      } else {
        throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      const response = await orderService.sendOrderEmail(id);
      if (response.data.success) {
        message.success('Đã gửi email thông báo cho khách hàng');
      } else {
        throw new Error(response.data.message || 'Không thể gửi email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      message.error(error.response?.data?.message || 'Không thể gửi email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'gold';
      case 'confirmed':
        return 'purple';
      case 'processing':
        return 'blue';
      case 'shipping':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusTag = (status) => {
    let color = 'green';
    let text = 'Hoàn thành';
    let icon = <CheckCircleOutlined />;
    
    if (status === 'pending') {
      color = 'gold';
      text = 'Chờ xử lý';
      icon = <ClockCircleOutlined />;
    } else if (status === 'processing') {
      color = 'blue';
      text = 'Đang xử lý';
      icon = <ShoppingOutlined />;
    } else if (status === 'shipping') {
      color = 'cyan';
      text = 'Đang giao hàng';
      icon = <ShoppingOutlined />;
    } else if (status === 'cancelled') {
      color = 'red';
      text = 'Đã hủy';
      icon = <CloseCircleOutlined />;
    } else if (status === 'completed') {
      color = 'success';
      text = 'Đã hoàn thành';
      icon = <CheckCircleOutlined />;
    }
    
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: ['snackId'],
      key: 'snack',
      render: (snack) => (
        <Space>
          <img 
            src={snack.images} 
            alt={snack.snackName} 
            style={{ width: 50, height: 50, objectFit: 'cover' }} 
          />
          <Text>{snack.snackName}</Text>
        </Space>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatPrice(price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Tổng',
      key: 'total',
      render: (_, record) => formatPrice(record.price * record.quantity),
    },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Steps.Step status="loading" title="Đang tải thông tin đơn hàng..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Title level={4} type="danger">{error}</Title>
          <Button type="primary" onClick={() => navigate('/orders')} style={{ marginTop: 16 }}>
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Title level={4}>Không tìm thấy thông tin đơn hàng</Title>
          <Button type="primary" onClick={() => navigate('/orders')} style={{ marginTop: 16 }}>
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          Quay lại
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          Chi tiết đơn hàng #{order._id}
        </Title>
      </Space>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Thông tin đơn hàng">
            <Descriptions column={2}>
              <Descriptions.Item label="Mã đơn hàng">
                {order._id}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {moment(order.orderDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Space>
                  <Tag color={getStatusColor(order.orderStatus)}>
                    {getStatusText(order.orderStatus)}
                  </Tag>
                  <Button 
                    type="link" 
                    onClick={() => setIsStatusModalVisible(true)}
                  >
                    Cập nhật
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row justify="space-between" align="middle">
              <Col>
                <Title level={5}>
                  <UserOutlined /> Thông tin khách hàng
                </Title>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  loading={sendingEmail}
                  onClick={handleSendEmail}
                >
                  Gửi email thông báo
                </Button>
              </Col>
            </Row>
            
            <Descriptions column={2}>
              <Descriptions.Item label="Tên khách hàng">
                {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : 'Khách vãng lai'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.userId?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {order.userId?.phone || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>
              <EnvironmentOutlined /> Địa chỉ giao hàng
            </Title>
            {order.addressId && (
              <Descriptions column={1}>
                <Descriptions.Item label="Địa chỉ">
                  {`${order.addressId.specificAddress}, ${order.addressId.ward}, ${order.addressId.district}`}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {order.addressId.phone}
                </Descriptions.Item>
                {order.note && (
                  <Descriptions.Item label="Ghi chú">
                    {order.note}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng giá trị đơn hàng"
              value={order.totalAmount}
              formatter={(value) => formatPrice(value)}
            />
            <Divider />
            <Descriptions column={1}>
              <Descriptions.Item label="Tạm tính">
              <span>
                    {order.items
                      .reduce((total, item) => total + (item.price * item.quantity), 0)
                      .toLocaleString('vi-VN')}đ
                  </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
              <span>
                    {order.addressId?.ward?.toLowerCase().includes('linh') ? 'Miễn phí' :
                     (order.addressId?.ward?.toLowerCase().includes('hiep') || 
                      order.addressId?.ward?.toLowerCase().includes('long') || 
                      order.addressId?.ward?.toLowerCase().includes('phuoc') || 
                      order.addressId?.ward?.toLowerCase().includes('phước')) ? '20,000đ' :
                     '30,000đ'}
                  </span>
              </Descriptions.Item>
              {order.discount > 0 && (
                <Descriptions.Item label="Giảm giá">
                  -{formatPrice(order.discount)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tổng cộng">
                <Text strong type="danger">
                  {formatPrice(order.totalAmount || 0)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Chi tiết sản phẩm" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={order.items}
          pagination={false}
          rowKey={(record) => record.snackId._id}
        />
      </Card>

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        visible={isStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setIsStatusModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Select
          style={{ width: '100%' }}
          value={newStatus}
          onChange={handleStatusChange}
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="confirmed">Đã xác nhận</Option>
          <Option value="processing">Đang xử lý</Option>
          <Option value="shipping">Đang giao hàng</Option>
          <Option value="delivered">Đã hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default OrderDetail;