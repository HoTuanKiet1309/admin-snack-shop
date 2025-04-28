import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tag, Image, Popconfirm, 
  Typography, message, Select, Tooltip
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, FilterOutlined, PictureOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../services/productService';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const categoriesList = [
    { id: 'all', name: 'Tất cả' },
    { id: 'banh', name: 'Bánh' },
    { id: 'keo', name: 'Kẹo' },
    { id: 'do_kho', name: 'Đồ khô' },
    { id: 'mut', name: 'Mứt' },
    { id: 'hat', name: 'Hạt' }
  ];

  useEffect(() => {
    fetchProducts();
    
    // Kiểm tra tham số refresh trong URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('refresh') === 'true') {
      // Xóa tham số refresh khỏi URL
      navigate('/products', { replace: true });
    }
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      
      if (Array.isArray(response.data)) {
        // Log dữ liệu để debug
        console.log('Products data:', response.data);
        setProducts(response.data);
        setPagination(prev => ({ ...prev, total: response.data.length }));
      } else {
        setProducts([]);
        message.error('Dữ liệu không đúng định dạng');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!Array.isArray(products)) return { data: [], total: 0 };

    let filtered = [...products];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(product => 
        product.snackName.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Calculate pagination
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length
    };
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      message.error('Không thể xóa sản phẩm');
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const { data: paginatedData, total } = getFilteredData();

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => (
        images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt="product"
            style={{ width: 50, height: 50, objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PictureOutlined />
          </div>
        )
      )
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'snackName',
      key: 'snackName',
      sorter: (a, b) => a.snackName.localeCompare(b.snackName)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Giá gốc',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount) => discount ? `${discount}%` : '0%'
    },
    {
      title: 'Giá thực',
      dataIndex: 'realPrice',
      key: 'realPrice',
      render: (realPrice) => `${realPrice.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : 'red'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      filters: categoriesList.map(category => ({ text: category.name, value: category.id })),
      onFilter: (value, record) => record.categoryId === value,
      render: (categoryId) => {
        const categoryMap = {
          'banh': 'Bánh',
          'keo': 'Kẹo',
          'do_kho': 'Đồ khô',
          'mut': 'Mứt',
          'hat': 'Hạt'
        };
        return categoryMap[categoryId] || categoryId;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record._id)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc mô tả"
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={{ width: 150 }}
          >
            {categoriesList.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={resetFilters}
          >
            Đặt lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            Thêm sản phẩm
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
          onChange={handleTableChange}
        />
      </Space>
    </Card>
  );
};

export default Products;