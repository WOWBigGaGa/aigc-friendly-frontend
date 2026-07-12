// src/pages/admin/articles/index.tsx

import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '分类', dataIndex: 'category', key: 'category' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '发布时间', dataIndex: 'publishedAt', key: 'publishedAt' },
  { title: '操作', key: 'action', render: () => <Button size="small">编辑</Button> },
];

const data = [
  {
    key: '1',
    title: 'React 18 新特性详解',
    category: '技术',
    status: '已发布',
    publishedAt: '2024-01-15',
  },
  {
    key: '2',
    title: 'TypeScript 最佳实践',
    category: '技术',
    status: '已发布',
    publishedAt: '2024-01-10',
  },
];

export function AdminArticlesPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>文章管理</h2>
        <Button icon={<PlusOutlined />} onClick={() => navigate('/admin/articles/new')}>
          新建文章
        </Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}