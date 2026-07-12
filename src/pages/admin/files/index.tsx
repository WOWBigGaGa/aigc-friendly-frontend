// src/pages/admin/files/index.tsx

import { Button, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export function AdminFilesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>文件管理</h2>
        <Upload>
          <Button icon={<PlusOutlined />}>上传文件</Button>
        </Upload>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ aspectRatio: '1/1', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusOutlined style={{ fontSize: '32px', color: '#999' }} />
        </div>
      </div>
    </div>
  );
}