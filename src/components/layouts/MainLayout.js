"use client"

import { useState } from "react"
import { Layout, Menu, Button, theme, Avatar, Typography, Dropdown, Space } from "antd"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  DownOutlined,
} from "@ant-design/icons"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, colorPrimary, borderRadiusLG },
  } = theme.useToken()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Sản phẩm",
    },
    {
      key: "/orders",
      icon: <OrderedListOutlined />,
      label: "Đơn hàng",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Người dùng",
    },
  ]

  const userMenuItems = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  // Get current page title based on path
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find((item) => item.key === location.pathname)
    return currentItem ? currentItem.label : "Dashboard"
  }

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <div
          className="logo"
          style={{
            height: 64,
            margin: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: colorPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            A
          </div>
          {!collapsed && (
            <Title level={4} style={{ margin: "0 0 0 12px", color: "#fff" }}>
              Admin Panel
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
  
      <Layout style={{ marginLeft: collapsed ? 80 : 200, minHeight: "100vh" }}>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
            position: "sticky",
            top: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 48,
                height: 48,
              }}
            />
            <Title level={4} style={{ margin: "0 0 0 12px" }}>
              {getCurrentPageTitle()}
            </Title>
          </div>
  
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button type="text" icon={<BellOutlined />} style={{ fontSize: "16px" }} shape="circle" />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center" }}>
                <Space>
                  <Avatar style={{ backgroundColor: colorPrimary }} icon={<UserOutlined />}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Text strong>{user?.name || "Admin"}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {user?.role || "Administrator"}
                    </Text>
                  </div>
                  <DownOutlined style={{ fontSize: "12px" }} />
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
  
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}  

export default MainLayout
