import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Space, 
  Button, 
  Popconfirm, 
  message, 
  Input, 
  Tag, 
  Modal, 
  Form, 
  Select,
  Card,
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  LockOutlined, 
  UnlockOutlined,
  KeyOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { userService } from '../services/userService';

const { Option } = Select;
const { Search } = Input;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchField, setSearchField] = useState('name'); // 'name', 'email', 'phone'
  
  const loggedInUserId = localStorage.getItem('userId');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredUsers(users);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = users.filter(user => {
      switch (searchField) {
        case 'name':
          const fullName = `${user.lastName} ${user.firstName}`.toLowerCase();
          return fullName.includes(searchValue);
        case 'email':
          return user.email.toLowerCase().includes(searchValue);
        case 'phone':
          return user.phone?.toLowerCase().includes(searchValue);
        default:
          return true;
      }
    });
    setFilteredUsers(filtered);
  };

  // Reset tìm kiếm
  const handleReset = () => {
    setSearchText('');
    setSearchField('name');
    setFilteredUsers(users);
  };

  const handleError = (error) => {
    let errorMessage = 'An error occurred';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    message.error(errorMessage);
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await userService.updateUserStatus(id, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
        Modal.confirm({
            title: 'Reset Password',
            content: 'Are you sure you want to reset this user\'s password?',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                const response = await userService.resetPassword(userId);
                Modal.success({
                    title: 'Password Reset Successful',
                    content: (
                        <div>
                            <p>The password has been reset to:</p>
                            <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                {response.data.newPassword}
                            </p>
                            <p>Please inform the user of their new password.</p>
                        </div>
                    ),
                });
            }
        });
    } catch (error) {
        message.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    setEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      await userService.updateUser(editingUser._id, values);
      message.success('Cập nhật thông tin thành công');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      title: 'Họ và tên',
      key: 'name',
      render: (_, record) => `${record.lastName} ${record.firstName}`,
      sorter: (a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
        </Tag>
      ),
      filters: [
        { text: 'Quản trị viên', value: 'admin' },
        { text: 'Người dùng', value: 'user' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Đã khóa', value: 'blocked' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        // Kiểm tra xem có phải admin khác không
        const isOtherAdmin = record.role === 'admin' && record._id !== loggedInUserId;
        
        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              disabled={isOtherAdmin}
            >
              Sửa
            </Button>
            <Button
              type={record.status === 'active' ? 'default' : 'primary'}
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleStatusChange(record._id, record.status)}
              disabled={isOtherAdmin}
            >
              {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record._id)}
              disabled={isOtherAdmin}
            >
              Đặt lại MK
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" danger icon={<DeleteOutlined />} disabled={isOtherAdmin}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Phần tìm kiếm */}
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              value={searchField}
              onChange={setSearchField}
              style={{ width: '100%' }}
            >
              <Option value="name">Tìm theo tên</Option>
              <Option value="email">Tìm theo email</Option>
              <Option value="phone">Tìm theo số điện thoại</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder={
                searchField === 'name' ? "Nhập tên cần tìm" :
                searchField === 'email' ? "Nhập email cần tìm" :
                "Nhập số điện thoại cần tìm"
              }
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4} md={4}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
            >
              Đặt lại
            </Button>
          </Col>
        </Row>

        {/* Bảng danh sách người dùng */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Space>

      {/* Modal chỉnh sửa - giữ nguyên */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        visible={editModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form
          form={form}
          onFinish={handleEdit}
          layout="vertical"
        >
          <Form.Item
            name="firstName"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
          >
            <Select>
              <Option value="user">Người dùng</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Users; 