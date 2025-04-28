import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, InputNumber, Switch, 
  Upload, Card, Typography, message, Spin, Row, Col
} from 'antd';
import { 
  UploadOutlined, SaveOutlined, RollbackOutlined, PlusOutlined,
  DeleteOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Cloudinary } from 'cloudinary-react';

// Cloudinary configuration
const cloudName = 'dbyquwzjy';
const uploadPreset = 'snack_shop_preset'; // Thay thế bằng tên preset mới bạn vừa tạo

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
      
      // Set imageUrl từ images của sản phẩm nếu có
      if (productData.images && productData.images.length > 0) {
        setImageUrl(productData.images[0]);
      }
      
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
      
      if (!imageUrl) {
        message.error('Vui lòng upload ảnh sản phẩm');
        return;
      }

      // Tạo object dữ liệu sản phẩm
      const productData = {
        ...values,
        images: [imageUrl] // Luôn sử dụng imageUrl hiện tại
      };

      console.log('Product data to submit:', productData); // Thêm log để debug

      if (id) {
        await productService.updateProduct(id, productData);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.createProduct(productData);
        message.success('Thêm sản phẩm thành công');
      }
      
      // Chuyển trang với tham số refresh=true
      navigate('/products?refresh=true');
    } catch (error) {
      message.error(id ? 'Cập nhật sản phẩm thất bại' : 'Thêm sản phẩm thất bại');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (info) => {
    try {
      const { status, originFileObj } = info.file;
      
      if (status === 'uploading') {
        return;
      }

      if (status === 'error') {
        message.error('Tải ảnh lên thất bại');
        return;
      }

      if (status === 'done' || originFileObj) {
        const formData = new FormData();
        formData.append('file', originFileObj);
        formData.append('upload_preset', uploadPreset);

        setLoading(true);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        if (data.secure_url) {
          setImageUrl(data.secure_url);
          form.setFieldsValue({
            images: [data.secure_url]
          });
          message.success('Tải ảnh lên thành công');
        } else {
          throw new Error('Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Tải ảnh lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Thêm hàm normFile
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleDeleteImage = () => {
    setImageUrl('');
    form.setFieldsValue({
      images: []
    });
    message.success('Đã xóa ảnh');
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
                label="Ảnh sản phẩm"
                name="image"
                rules={[{ required: true, message: 'Vui lòng upload ảnh sản phẩm' }]}
              >
                <Upload
                  name="file"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action={`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`}
                  data={{
                    upload_preset: uploadPreset
                  }}
                  onChange={handleImageUpload}
                >
                  {imageUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={imageUrl} 
                        alt="product" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0, 0, 0, 0.5)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                          cursor: 'pointer',
                          ':hover': {
                            opacity: 1
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage();
                        }}
                      >
                        <DeleteOutlined style={{ color: '#fff', fontSize: '20px' }} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
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

// Thêm CSS cho hover effect
const style = document.createElement('style');
style.innerHTML = `
  .avatar-uploader .ant-upload:hover .delete-overlay {
    opacity: 1 !important;
  }
`;
document.head.appendChild(style);

export default ProductForm;