// src/pages/admin/comments/index.tsx

import { Button, Table, Tag } from 'antd';

const columns = [
  { title: '文章', dataIndex: 'article', key: 'article' },
  { title: '作者', dataIndex: 'author', key: 'author' },
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '状态', key: 'status', render: (status: string) => (
    <Tag color={status === '待审核' ? 'orange' : status === '已通过' ? 'green' : 'red'}>
      {status}
    </Tag>
  )},
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action', render: () => (
    <>
      <Button size="small">通过</Button>
      <Button size="small" danger>驳回</Button>
    </>
  )},
];

const data = [
  { key: '1', article: 'React 18 新特性详解', author: '张三', content: '很好的文章！', status: '待审核', createdAt: '2024-01-15' },
  { key: '2', article: 'TypeScript 最佳实践', author: '李四', content: '学习了', status: '已通过', createdAt: '2024-01-14' },
];

export function AdminCommentsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>评论管理</h2>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}