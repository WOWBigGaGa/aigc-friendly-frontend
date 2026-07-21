import { GithubOutlined, LinkOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Tag, Typography } from 'antd';

const { Title, Paragraph } = Typography;

interface BlogProfile {
  name: string;
  avatar: string | null;
  bio: string | null;
  githubUrl: string | null;
  email: string | null;
  websiteUrl: string | null;
  skills: Record<string, string[]>;
}

const profile: BlogProfile = {
  name: 'YYan',
  avatar: null,
  bio: '热爱编程，专注于 Web 开发领域。拥有丰富的全栈开发经验，擅长使用 TypeScript、React、NestJS 等技术栈构建高质量的应用程序。喜欢分享技术心得，希望通过博客记录学习历程，帮助更多开发者成长。',
  githubUrl: 'https://github.com/WOWBigGaGa',
  email: 'Yyan_BigGaGa@outlook.com',
  websiteUrl: null,
  skills: {
    language: ['TypeScript', 'JavaScript', 'Python', 'Go'],
    framework: ['React', 'NestJS', 'Next.js', 'Vue'],
    database: ['PostgreSQL', 'MySQL', 'Redis'],
    tool: ['Docker', 'Git', 'Kubernetes'],
  },
};

const skillCategoryColors: Record<string, string> = {
  language: 'blue',
  framework: 'purple',
  database: 'green',
  tool: 'orange',
};

const skillCategoryLabels: Record<string, string> = {
  language: '语言',
  framework: '框架',
  database: '数据库',
  tool: '工具',
};

export function BlogAboutPage() {
  return (
    <div className="blog-about">
      <Card className="about-card">
        <div className="about-header">
          <Avatar
            size={120}
            icon={profile.avatar ? undefined : <UserOutlined />}
            src={profile.avatar || undefined}
            className="about-avatar"
          />
          <div className="about-info">
            <Title level={2}>{profile.name}</Title>
            <Paragraph className="about-title">全栈开发者 / 技术博主</Paragraph>
            <div className="social-links">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <GithubOutlined />
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="social-link">
                  <MailOutlined />
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <LinkOutlined />
                </a>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="about-section">
            <Title level={3}>关于我</Title>
            <Paragraph>{profile.bio}</Paragraph>
          </div>
        )}

        {profile.skills && Object.keys(profile.skills).length > 0 && (
          <div className="about-section">
            <Title level={3}>技能栈</Title>
            <div className="skills-container">
              {Object.entries(skillCategoryLabels).map(([category, label]) => {
                const categorySkills = profile.skills[category];
                if (!categorySkills || categorySkills.length === 0) {
                  return null;
                }
                return (
                  <div key={category} className="skill-category">
                    <div className="skill-category-label">{label}</div>
                    <div className="skill-tags">
                      {categorySkills.map((skill) => (
                        <Tag key={skill} color={skillCategoryColors[category] || 'default'}>
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="about-section">
          <Title level={3}>联系方式</Title>
          {profile.email && (
            <Paragraph>
              <strong>邮箱：</strong> {profile.email}
            </Paragraph>
          )}
          {profile.githubUrl && (
            <Paragraph>
              <strong>GitHub：</strong>{' '}
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                {profile.githubUrl}
              </a>
            </Paragraph>
          )}
        </div>
      </Card>
    </div>
  );
}
