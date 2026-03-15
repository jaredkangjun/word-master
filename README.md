# WordMaster 单词大师

基于 SRS 间隔重复算法的单词记忆应用。

## 在线预览

临时预览地址：https://jrgv0b-ip-101-126-150-200.tunnelmole.net

> 注意：临时隧道可能随时失效，建议部署到自己的服务器。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 部署到 GitHub Pages

1. Fork 这个仓库到你的 GitHub 账号
2. 进入仓库 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 点击 Save，自动部署完成后会显示访问链接

或者使用命令行部署：

```bash
# 1. 在 GitHub 创建新仓库（例如 wordmaster）
# 2. 初始化本地仓库
git init
git add .
git commit -m "Initial commit"
git branch -M main

# 3. 关联远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/wordmaster.git
git push -u origin main

# 4. 在 GitHub 仓库 Settings → Pages 中启用 GitHub Actions
```

## 功能特性

- ✅ SRS 间隔重复算法（艾宾浩斯遗忘曲线）
- ✅ 示例词库一键导入（雅思核心 50 词）
- ✅ 数据导入导出（JSON/CSV）
- ✅ 多种学习模式（卡片、测试、拼写）
- ✅ 成就系统

## 技术栈

- React + TypeScript
- Tailwind CSS
- shadcn/ui
- LocalStorage 数据存储
