// src/sandbox/playground/page.tsx

import { useState } from 'react';
import { Card, Segmented, Tag } from 'antd';

import { PageHeader } from '@/shared/ui/page-header';

const DENSITY_OPTIONS = [
  { label: '紧凑', value: 'compact' },
  { label: '均衡', value: 'balanced' },
  { label: '宽松', value: 'roomy' },
];

export function SandboxPlaygroundPage() {
  const [density, setDensity] = useState('balanced');
  const densityLabel = DENSITY_OPTIONS.find((option) => option.value === density)?.label ?? density;

  return (
    <div className="page-stack">
      <PageHeader
        description="这里用于一次性交互验证。只有确认值得观察后，才会重建为 labs 或整理进 stable。"
        extra={<Tag>沙盒</Tag>}
        title="沙盒试验场"
      />

      <Card title="密度试验">
        <div className="flex flex-col gap-4">
          <Segmented
            onChange={(value) => setDensity(String(value))}
            options={DENSITY_OPTIONS}
            value={density}
          />
          <div className="route-suggestion">
            <div className="route-suggestion-title">当前密度：{densityLabel}</div>
            <div className="route-suggestion-description">
              沙盒状态只在本地保留，默认可以随时丢弃。
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
