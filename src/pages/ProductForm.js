import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, InputNumber, Switch, 
  Upload, Card, Typography, message, Spin, Row, Col
} from 'antd';
import { 
  UploadOutlined, SaveOutlined, RollbackOutlined, PlusOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      const productData = response.data;
      setInitialValues(productData);
      form.setFieldsValue({
        snackName: productData.snackName,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        categoryId: productData.categoryId,
        discount: productData.discount,
        images: productData.images
      });
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      if (id) {
        // Update existing product
        await productService.updateProduct(id, values);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        // Create new product
        await productService.createProduct(values);
        message.success('Thêm sản phẩm thành công');
      }
      navigate('/products');
    } catch (error) {
      message.error(id ? 'Cập nhật sản phẩm thất bại' : 'Thêm sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info) => {
    if (info.file.status === 'done') {
      // When using actual API
      // setImageUrl(info.file.response.url);
      
      // Mock implementation
      getBase64(info.file.originFileObj, url => {
        setImageUrl(url);
      });
      message.success('Tải ảnh lên thành công');
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh lên thất bại');
    }
  };

  // Helper function to convert file to base64
  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(file);
  };

  // Mock implementation for file upload
  const customUploadRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Spin spinning={loading}>
      <Card>
        <Title level={2}>
          {isEditing ? t('edit_product') : t('add_product')}
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            discount: 0,
            ...initialValues
          }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="snackName"
                label="Tên sản phẩm"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên sản phẩm' }
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả sản phẩm' }
                ]}
              >
                <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Giá (VNĐ)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá sản phẩm' },
                      { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                    ]}
                  >
                    <InputNumber 
                      min={0}
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="VNĐ"
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[
                      { required: true, message: 'Vui lòng chọn danh mục' }
                    ]}
                  >
                    <Select placeholder="Chọn danh mục">
                      <Option value="banh">Bánh</Option>
                      <Option value="keo">Kẹo</Option>
                      <Option value="do_kho">Đồ khô</Option>
                      <Option value="mut">Mứt</Option>
                      <Option value="hat">Hạt</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="stock"
                    label="Tồn kho"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số lượng' },
                      { type: 'number', min: 0, message: 'Số lượng phải lớn hơn hoặc bằng 0' }
                    ]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="discount"
                label="Giảm giá (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Giảm giá phải từ 0-100%' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập phần trăm giảm giá"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Hình ảnh sản phẩm"
                name="images"
                rules={[
                  { required: true, message: 'Vui lòng nhập URL hình ảnh' }
                ]}
              >
                <div style={{ textAlign: 'center' }}>
                  {imageUrl && <img src={imageUrl} alt="Product" style={{ width: '100%', marginBottom: 8 }} />}
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                    multiple
                  >
                    {fileList.length >= 8 ? null : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button onClick={handleCancel} icon={<RollbackOutlined />}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};

export default ProductForm;