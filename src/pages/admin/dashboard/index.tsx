// src/pages/admin/dashboard/index.tsx

import { Card, Row, Col, Statistic } from 'antd';
import { FileTextOutlined, MessageOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';

export function AdminDashboardPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>仪表盘</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="文章总数" value={42} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="评论总数" value={128} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总阅读量" value={15680} prefix={<EyeOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总点赞量" value={3240} prefix={<HeartOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}