// src/pages/admin/tags/index.tsx

import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: 'Slug', dataIndex: 'slug', key: 'slug' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action', render: () => <Button size="small">编辑</Button> },
];

const data = [
  { key: '1', name: 'React', slug: 'react', createdAt: '2024-01-01' },
  { key: '2', name: 'TypeScript', slug: 'typescript', createdAt: '2024-01-01' },
];

export function AdminTagsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>标签管理</h2>
        <Button icon={<PlusOutlined />}>新建标签</Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}