import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, InputNumber, DatePicker, 
  Switch, Card, Typography, message, Spin, Row, Col
} from 'antd';
import { 
  SaveOutlined, RollbackOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { couponService } from '../services/couponService';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CouponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCouponDetails();
    }
  }, [id]);

  const fetchCouponDetails = async () => {
    try {
      setLoading(true);
      const response = await couponService.getCouponById(id);
      const couponData = response.data;
      
      form.setFieldsValue({
        code: couponData.code,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        minPurchase: couponData.minPurchase,
        dateRange: [
          moment(couponData.startDate),
          moment(couponData.endDate)
        ],
        isActive: couponData.isActive,
        description: couponData.description
      });
    } catch (error) {
      message.error('Không thể tải thông tin mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      const couponData = {
        code: values.code.toUpperCase(),
        discountType: values.discountType,
        discountValue: values.discountValue,
        minPurchase: values.minPurchase || 0,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        isActive: values.isActive,
        description: values.description
      };

      if (isEditing) {
        await couponService.updateCoupon(id, couponData);
        message.success('Cập nhật mã giảm giá thành công');
      } else {
        await couponService.createCoupon(couponData);
        message.success('Thêm mã giảm giá thành công');
      }
      
      navigate('/coupons');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Title level={2}>{isEditing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          discountType: 'percentage',
          minPurchase: 0,
          isActive: true
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Mã giảm giá"
              rules={[
                { required: true, message: 'Vui lòng nhập mã giảm giá' },
                { min: 3, message: 'Mã giảm giá phải có ít nhất 3 ký tự' },
                { max: 20, message: 'Mã giảm giá không được vượt quá 20 ký tự' },
                { 
                  pattern: /^[A-Za-z0-9]+$/, 
                  message: 'Mã giảm giá chỉ được chứa chữ cái và số'
                }
              ]}
            >
              <Input placeholder="Nhập mã giảm giá (VD: SUMMER20)" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="discountType"
              label="Loại giảm giá"
              rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
            >
              <Select placeholder="Chọn loại giảm giá">
                <Option value="percentage">Phần trăm (%)</Option>
                <Option value="fixed">Số tiền cố định (VNĐ)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="discountValue"
              label="Giá trị giảm giá"
              rules={[
                { required: true, message: 'Vui lòng nhập giá trị giảm giá' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    
                    if (getFieldValue('discountType') === 'percentage') {
                      return value <= 100 && value > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Giá trị phần trăm phải từ 1-100%'));
                    }
                    
                    return value > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Giá trị phải lớn hơn 0'));
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Nhập giá trị giảm giá"
                formatter={(value) => 
                  form.getFieldValue('discountType') === 'percentage' 
                    ? `${value}%` 
                    : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => 
                  form.getFieldValue('discountType') === 'percentage'
                    ? value.replace('%', '')
                    : value.replace(/\$\s?|(,*)/g, '')
                }
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="minPurchase"
              label="Giá trị đơn hàng tối thiểu"
              rules={[
                { type: 'number', min: 0, message: 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Nhập giá trị đơn hàng tối thiểu"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="dateRange"
          label="Thời gian hiệu lực"
          rules={[
            { required: true, message: 'Vui lòng chọn thời gian hiệu lực' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || value.length !== 2) return Promise.resolve();
                const [start, end] = value;
                if (end.isBefore(start)) {
                  return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            showTime={false}
            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          />
        </Form.Item>
        
        <Form.Item
          name="isActive"
          label="Trạng thái"
          valuePropName="checked"
        >
          <Switch checkedChildren="Đang kích hoạt" unCheckedChildren="Không kích hoạt" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={4} placeholder="Mô tả về mã giảm giá" />
        </Form.Item>
        
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button 
              type="default" 
              icon={<RollbackOutlined />} 
              onClick={() => navigate('/coupons')}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={submitting}
            >
              {isEditing ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CouponForm; 