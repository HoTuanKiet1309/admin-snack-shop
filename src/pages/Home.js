import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Image, Typography, Spin } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/format';

const { Title } = Typography;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalCompletedOrders: 0,
    topProducts: []
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await orderService.getCompletedOrdersStatistics();
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src={Array.isArray(record.image) ? record.image[0] : record.image}
            alt={text}
            style={{ 
              width: 50, 
              height: 50, 
              objectFit: 'cover', 
              borderRadius: '4px' 
            }}
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'totalSold',
      key: 'totalSold',
      render: (value) => `${value} sản phẩm`,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (value) => formatPrice(value),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tổng quan</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={statistics.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatPrice(value)}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đơn hàng đã hoàn thành"
              value={statistics.totalCompletedOrders}
              prefix={<CheckCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sản phẩm bán chạy"
              value={statistics.topProducts.length}
              prefix={<FireOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top sản phẩm bán chạy">
        <Table
          columns={columns}
          dataSource={statistics.topProducts}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Home; 