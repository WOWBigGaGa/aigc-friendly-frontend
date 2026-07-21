import { useEffect, useState } from 'react';
import {
  BookOutlined,
  CalendarOutlined,
  MessageOutlined,
  TagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Avatar, Card, Tag } from 'antd';
import { useNavigate } from 'react-router';

import { GET_ARCHIVES, GET_CATEGORIES, GET_TAGS } from '@/features/blog';

import { executeGraphQL } from '@/shared/graphql';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Archive {
  year: number;
  month: number;
  count: number;
}

type CategoriesQueryVariables = object;

interface CategoriesQueryResult {
  categories: Category[];
}

type TagsQueryVariables = object;

interface TagsQueryResult {
  tags: Tag[];
}

type ArchivesQueryVariables = object;

interface ArchivesQueryResult {
  archives: Archive[];
}

interface BlogSidebarProps {
  isOpen?: boolean;
}

const blogOwner = {
  name: '博主昵称',
  bio: '热爱技术，分享生活。这里记录我的技术心得和生活感悟。',
};

const announcement = {
  title: '公告',
  content: '欢迎访问我的博客！感谢大家的支持与关注。',
};

export function BlogSidebar({ isOpen }: BlogSidebarProps = {}) {
  const navigate = useNavigate();

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<Error | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  const [archivesLoading, setArchivesLoading] = useState(true);
  const [archivesError, setArchivesError] = useState<Error | null>(null);
  const [archives, setArchives] = useState<Archive[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const queryBody = GET_CATEGORIES.loc?.source?.body ?? '';
        const result = await executeGraphQL<CategoriesQueryResult, CategoriesQueryVariables>(
          queryBody,
          {},
        );
        setCategories(result.categories);
      } catch (err) {
        setCategoriesError(err as Error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    const fetchTags = async () => {
      setTagsLoading(true);
      setTagsError(null);

      try {
        const queryBody = GET_TAGS.loc?.source?.body ?? '';
        const result = await executeGraphQL<TagsQueryResult, TagsQueryVariables>(queryBody, {});
        setTags(result.tags);
      } catch (err) {
        setTagsError(err as Error);
      } finally {
        setTagsLoading(false);
      }
    };

    const fetchArchives = async () => {
      setArchivesLoading(true);
      setArchivesError(null);

      try {
        const queryBody = GET_ARCHIVES.loc?.source?.body ?? '';
        const result = await executeGraphQL<ArchivesQueryResult, ArchivesQueryVariables>(
          queryBody,
          {},
        );
        setArchives(result.archives);
      } catch (err) {
        setArchivesError(err as Error);
      } finally {
        setArchivesLoading(false);
      }
    };

    fetchCategories();
    fetchTags();
    fetchArchives();
  }, []);

  const formatArchiveDate = (year: number, month: number) => {
    return `${year}年${month}月`;
  };

  const getRandomTagColor = (index: number) => {
    const colors = [
      'blue',
      'cyan',
      'green',
      'magenta',
      'orange',
      'purple',
      'red',
      'pink',
      'gold',
      'lime',
    ];
    return colors[index % colors.length];
  };

  return (
    <aside className={`blog-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-section">
        <Card variant="borderless">
          <div style={{ textAlign: 'center' }}>
            <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              {blogOwner.name}
            </h3>
            <p
              style={{
                margin: '0',
                fontSize: '13px',
                color: 'var(--ant-color-text-secondary)',
                lineHeight: '1.6',
              }}
            >
              {blogOwner.bio}
            </p>
          </div>
        </Card>
      </div>

      <div className="sidebar-section">
        <Card variant="borderless">
          <Alert
            title={announcement.title}
            description={announcement.content}
            type="info"
            showIcon
            icon={<MessageOutlined />}
            style={{ margin: '0' }}
          />
        </Card>
      </div>

      <div className="sidebar-section">
        <Card variant="borderless">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOutlined style={{ fontSize: '16px', color: 'var(--ant-color-primary)' }} />
            <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '600' }}>分类</h3>
          </div>
          {categoriesLoading ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              加载中...
            </p>
          ) : categoriesError ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-error)',
                fontSize: '13px',
              }}
            >
              加载失败
            </p>
          ) : categories.length === 0 ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              暂无分类
            </p>
          ) : (
            <ul style={{ margin: '0', padding: '0', listStyle: 'none' }}>
              {categories.map((category: Category) => (
                <li key={category.id} style={{ marginBottom: '8px' }}>
                  <span
                    onClick={() => navigate(`/blog/category/${category.slug}`)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--ant-color-text)',
                      display: 'block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'var(--ant-color-bg-hover)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {category.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="sidebar-section">
        <Card variant="borderless">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TagOutlined style={{ fontSize: '16px', color: 'var(--ant-color-primary)' }} />
            <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '600' }}>标签云</h3>
          </div>
          {tagsLoading ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              加载中...
            </p>
          ) : tagsError ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-error)',
                fontSize: '13px',
              }}
            >
              加载失败
            </p>
          ) : tags.length === 0 ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              暂无标签
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tags.map((tag: Tag, index: number) => (
                <Tag
                  key={tag.id}
                  color={getRandomTagColor(index)}
                  onClick={() => navigate(`/blog/tag/${tag.slug}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="sidebar-section">
        <Card variant="borderless">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CalendarOutlined style={{ fontSize: '16px', color: 'var(--ant-color-primary)' }} />
            <h3 style={{ margin: '0', fontSize: '15px', fontWeight: '600' }}>归档</h3>
          </div>
          {archivesLoading ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              加载中...
            </p>
          ) : archivesError ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-error)',
                fontSize: '13px',
              }}
            >
              加载失败
            </p>
          ) : archives.length === 0 ? (
            <p
              style={{
                margin: '0',
                textAlign: 'center',
                color: 'var(--ant-color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              暂无归档
            </p>
          ) : (
            <ul style={{ margin: '0', padding: '0', listStyle: 'none' }}>
              {archives.map((archive: Archive) => (
                <li key={`${archive.year}-${archive.month}`} style={{ marginBottom: '8px' }}>
                  <span
                    onClick={() => navigate(`/blog/archive/${archive.year}/${archive.month}`)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--ant-color-text)',
                      display: 'block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'var(--ant-color-bg-hover)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {formatArchiveDate(archive.year, archive.month)}
                    <span
                      style={{
                        marginLeft: '8px',
                        color: 'var(--ant-color-text-tertiary)',
                        fontSize: '12px',
                      }}
                    >
                      ({archive.count})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </aside>
  );
}
