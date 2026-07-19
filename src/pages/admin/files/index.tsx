import { useCallback, useEffect, useState } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Image, message, Modal, Popconfirm, Typography, Upload } from 'antd';
import dayjs from 'dayjs';

import { ADMIN_DELETE_FILE, ADMIN_FILES, ADMIN_UPLOAD_FILE, type FileItem } from '@/features/admin';

import { isGraphQLIngressError } from '@/shared/graphql/errors';
import { executeGraphQL } from '@/shared/graphql/request';

const { Title, Text } = Typography;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await executeGraphQL<{ files: FileItem[] }, { page: number; limit: number }>(
        ADMIN_FILES,
        { page: 1, limit: 100 },
      );
      setFiles(result.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      const errorMessage = isGraphQLIngressError(error)
        ? error.userMessage
        : '加载文件失败，请稍后重试';
      message.error(errorMessage);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = useCallback(
    async (options: any) => {
      const { file } = options;
      if (!file.originFileObj || !file.name || !file.type) {
        message.error('文件信息不完整');
        return;
      }
      setUploading(true);
      try {
        const reader = new FileReader();
        const result = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file.originFileObj);
        });

        await executeGraphQL<
          { uploadFile: FileItem },
          { filename: string; content: string; mimeType: string }
        >(ADMIN_UPLOAD_FILE, {
          filename: file.name,
          content: result,
          mimeType: file.type,
        });

        message.success('文件上传成功');
        fetchFiles();
      } catch (error) {
        console.error('Failed to upload file:', error);
        const errorMessage = isGraphQLIngressError(error)
          ? error.userMessage
          : '文件上传失败，请稍后重试';
        message.error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [fetchFiles],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await executeGraphQL<{ deleteFile: boolean }, { id: string }>(ADMIN_DELETE_FILE, { id });
        message.success('文件删除成功');
        fetchFiles();
      } catch (error) {
        console.error('Failed to delete file:', error);
        const errorMessage = isGraphQLIngressError(error)
          ? error.userMessage
          : '删除失败，请稍后重试';
        message.error(errorMessage);
      }
    },
    [fetchFiles],
  );

  const handlePreview = useCallback((url: string) => {
    setPreviewImage(url);
  }, []);

  const uploadProps = {
    beforeUpload: () => false,
    showUploadList: false,
    accept: 'image/*',
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Title level={2}>文件管理</Title>
        <Upload {...uploadProps} customRequest={handleUpload}>
          <Button loading={uploading} type="primary">
            上传文件
          </Button>
        </Upload>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">加载中...</Text>
        </div>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">暂无文件，请上传</Text>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative' }}>
                <Image
                  src={file.url}
                  alt={file.originalName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  preview={false}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'space-around',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '8px',
                  }}
                >
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handlePreview(file.url)}
                    style={{ color: '#fff', borderColor: '#fff' }}
                  >
                    预览
                  </Button>
                  <Popconfirm
                    title="确定删除该文件？"
                    onConfirm={() => handleDelete(file.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      style={{ color: '#fff', borderColor: '#fff' }}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
              <div style={{ padding: '12px' }}>
                <Text ellipsis style={{ display: 'block', fontSize: '12px' }}>
                  {file.originalName}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {formatFileSize(file.size)} · {dayjs(file.createdAt).format('YYYY-MM-DD')}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title="图片预览"
        visible={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={600}
      >
        <Image
          src={previewImage || undefined}
          alt="预览"
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>
    </div>
  );
}
