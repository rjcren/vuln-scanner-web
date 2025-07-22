# 在线自动化网络漏洞扫描系统 - 前端

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.13-brightgreen.svg)](https://vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.9.5-blue.svg)](https://element-plus.org/)

> 毕业设计配套前端：简洁高效的安全扫描管理界面

## 核心特性
- 响应式管理控制台
- 扫描任务实时监控
- 漏洞数据可视化
- 交互式报告查看器

## 技术栈
- **Vue 3**：组合式API开发
- **Vite**：前端构建工具
- **Element Plus**：UI组件库
- **ECharts**：数据可视化
- **Axios**：HTTP请求处理

## 功能模块

### 仪表盘
- 系统状态概览
- 漏洞风险分布图
- 扫描任务统计

### 扫描管理
```mermaid
flowchart LR
    A[新建任务] --> B[配置参数]
    B --> C[实时监控]
    C --> D[结果分析]
```

### 用户管理
- 用户列表：查看用户信息（用户名、邮箱、角色等）。
- 添加用户：支持管理员添加新用户。
- 修改用户：编辑用户信息。
- 删除用户：移除不需要的用户。

### 漏洞管理
- 漏洞列表：展示漏洞详情（类型、严重等级、来源等）。
- 筛选与排序：支持按任务、来源、严重等级筛选漏洞。
- 漏洞详情：查看漏洞的详细信息及解决方案。

### 报告管理
- 报告列表：查看生成的扫描报告。
- 下载报告：支持 PDF 和 HTML 格式的报告下载。
- 删除报告：移除不需要的报告。

### 用户反馈
- 查看反馈：展示用户提交的反馈内容。
- 更新状态：标记反馈为已解决或已拒绝。
- 发送回执：向用户发送反馈处理结果。

## 项目结构

```
vuln-scanner-web/
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── assets/            # 静态资源（图片、样式等）
│   ├── components/        # 公共组件
│   ├── router/            # 路由配置
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   └── App.vue            # 根组件
├── .env.development       # 开发环境配置
├── package.json           # 项目依赖和脚本
├── vite.config.js         # Vite 配置
└── README.md              # 项目说明
```

## 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产环境
```bash
npm run build
```

### 预览生产环境
```bash
npm run preview
```

## 许可证
本项目仅用于学习和研究目的，禁止用于商业用途。