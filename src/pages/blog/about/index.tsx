import { GithubOutlined, MailOutlined, LinkOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Tag, Typography } from 'antd';

const { Title, Paragraph } = Typography;

interface Skill {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool';
}

const skills: Skill[] = [
  { name: 'TypeScript', category: 'language' },
  { name: 'JavaScript', category: 'language' },
  { name: 'Python', category: 'language' },
  { name: 'Go', category: 'language' },
  { name: 'React', category: 'framework' },
  { name: 'NestJS', category: 'framework' },
  { name: 'Next.js', category: 'framework' },
  { name: 'Vue', category: 'framework' },
  { name: 'PostgreSQL', category: 'database' },
  { name: 'MySQL', category: 'database' },
  { name: 'Redis', category: 'database' },
  { name: 'Docker', category: 'tool' },
  { name: 'Git', category: 'tool' },
  { name: 'Kubernetes', category: 'tool' },
];

const skillCategoryColors: Record<Skill['category'], string> = {
  language: 'blue',
  framework: 'purple',
  database: 'green',
  tool: 'orange',
};

const skillCategoryLabels: Record<Skill['category'], string> = {
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
          <Avatar size={120} icon={<UserOutlined />} className="about-avatar" />
          <div className="about-info">
            <Title level={2}>YYan</Title>
            <Paragraph className="about-title">全栈开发者 / 技术博主</Paragraph>
            <div className="social-links">
              <a
                href="https://github.com/WOWBigGaGa"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <GithubOutlined />
              </a>
              <a
                href="mailto:Yyan_BigGaGa@outlook.com"
                className="social-link"
              >
                <MailOutlined />
              </a>
              <a
                href="#"
                className="social-link"
              >
                <LinkOutlined />
              </a>
            </div>
          </div>
        </div>

        <div className="about-section">
          <Title level={3}>关于我</Title>
          <Paragraph>
            热爱编程，专注于 Web 开发领域。拥有丰富的全栈开发经验，擅长使用 TypeScript、React、NestJS 等技术栈构建高质量的应用程序。
          </Paragraph>
          <Paragraph>
            喜欢分享技术心得，希望通过博客记录学习历程，帮助更多开发者成长。
          </Paragraph>
        </div>

        <div className="about-section">
          <Title level={3}>技能栈</Title>
          <div className="skills-container">
            {Object.entries(skillCategoryLabels).map(([category, label]) => (
              <div key={category} className="skill-category">
                <div className="skill-category-label">{label}</div>
                <div className="skill-tags">
                  {skills
                    .filter((skill) => skill.category === category)
                    .map((skill) => (
                      <Tag key={skill.name} color={skillCategoryColors[skill.category as Skill['category']]}>
                        {skill.name}
                      </Tag>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <Title level={3}>联系方式</Title>
          <Paragraph>
            <strong>邮箱：</strong> Yyan_BigGaGa@outlook.com
          </Paragraph>
          <Paragraph>
            <strong>GitHub：</strong>{' '}
            <a href="https://github.com/WOWBigGaGa" target="_blank" rel="noopener noreferrer">
              https://github.com/WOWBigGaGa
            </a>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}