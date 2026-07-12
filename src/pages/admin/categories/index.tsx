// src/pages/admin/categories/index.tsx

import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: 'Slug', dataIndex: 'slug', key: 'slug' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '排序', dataIndex: 'sort', key: 'sort' },
  { title: '操作', key: 'action', render: () => <Button size="small">编辑</Button> },
];

const data = [
  { key: '1', name: '技术', slug: 'technology', description: '技术文章', sort: 1 },
  { key: '2', name: '生活', slug: 'life', description: '生活随笔', sort: 2 },
];

export function AdminCategoriesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>分类管理</h2>
        <Button icon={<PlusOutlined />}>新建分类</Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}