# UniDb 在线更新系统

## 概述

基于 Electron 的自动更新功能，使用 electron-updater 实现跨平台更新机制。

## 更新流程

### 1. 检查更新

应用启动时或手动触发检查更新：
1. 向更新服务器发送当前版本信息
2. 服务器返回最新版本信息
3. 客户端比较版本号
4. 如有新版本，提示用户

### 2. 下载更新

用户确认后：
1. 后台下载更新包
2. 显示下载进度
3. 下载完成后通知用户

### 3. 安装更新

退出应用时：
1. 替换应用文件
2. 重新启动应用

## 版本比较策略

```typescript
// 语义化版本比较
function compareVersions(current: string, latest: string): 'major' | 'minor' | 'patch' | 'none' {
  const [cMajor, cMinor, cPatch] = current.split('.').map(Number)
  const [lMajor, lMinor, lPatch] = latest.split('.').map(Number)

  if (lMajor > cMajor) return 'major'
  if (lMinor > cMinor) return 'minor'
  if (lPatch > cPatch) return 'patch'
  return 'none'
}
```

## 更新通道

### Stable (稳定版)
- 经过充分测试的稳定版本
- 推荐大多数用户使用
- 更新频率：每月一次

### Beta (测试版)
- 包含新功能的预览版本
- 可能存在小问题
- 更新频率：每周一次

### Dev (开发版)
- 最新开发中的版本
- 可能存在较多问题
- 仅供开发者测试

## 配置文件

### electron-builder.yml

```yaml
appId: com.unidb.app
productName: UniDb
copyright: Copyright © 2024 UniDb Team

publish:
  provider: generic
  url: https://update.unidb.com/
  channel: '{{ channel }}'
```

### latest.yml (服务端)

```yaml
version: 0.2.0
releaseDate: '2024-02-01'
files:
  - url: UniDb-0.2.0.dmg
    sha512: ...
  - url: UniDb-0.2.0.exe
    sha512: ...
  - url: UniDb-0.2.0.AppImage
    sha512: ...
channels:
  stable: 0.2.0
  beta: 0.3.0-beta.1
  dev: 0.4.0-dev.123
```

## 更新服务器

### 方案一：自建更新服务器

```typescript
// server/routes/update.ts
const express = require('express')
const router = express.Router()
const { version } = require('../../package.json')

// 内网部署使用此方案
router.get('/latest', (req, res) => {
  const channel = req.query.channel || 'stable'
  // 返回最新版本信息
  res.json({
    version: latestVersions[channel],
    releaseNotes: getReleaseNotes(channel),
    downloadUrl: getDownloadUrl(channel)
  })
})

module.exports = router
```

### 方案二：使用 GitHub Releases

利用 GitHub 的 Release 系统作为更新源：
1. 每次发布创建 GitHub Release
2. 生成 SHA512 校验和
3. 发布到 GitHub
4. 使用 electron-updater 的 GitHub 提供者

### 方案三：使用云服务商

- **AWS S3 + CloudFront**: 高可用、成本低
- **阿里云 OSS**: 国内访问速度快
- **七牛云**: CDN 加速、免费额度大

## 安全机制

### 1. 签名验证
- 使用代码签名证书签名安装包
- 更新时验证签名
- 防止恶意更新

### 2. 校验和验证
- 提供 SHA512 校验和
- 下载后验证完整性
- 确保文件未被篡改

### 3. HTTPS 传输
- 所有更新请求使用 HTTPS
- 验证服务器证书
- 防止中间人攻击

### 4. 回滚机制
- 保留上一版本安装包
- 更新失败时自动回滚
- 用户可手动回滚

## 实现代码

### Electron 主进程

```typescript
// electron/main.ts
import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'

// 配置自动更新器
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = logger

// 检查更新
ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return result?.updateInfo
  } catch (error) {
    console.error('Update check failed:', error)
    return null
  }
})

// 下载更新
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate()
    return true
  } catch (error) {
    console.error('Update download failed:', error)
    return false
  }
})

// 安装更新
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

// 监听更新事件
autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-available', info)
})

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('download-progress', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('update-downloaded', info)
})

autoUpdater.on('error', (error) => {
  console.error('Update error:', error)
})
```

### 渲染进程

```typescript
// stores/update.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUpdateStore = defineStore('update', () => {
  const updateAvailable = ref(false)
  const updateInfo = ref<UpdateInfo | null>(null)
  const downloadProgress = ref(0)
  const isDownloading = ref(false)

  const checkForUpdates = async () => {
    // @ts-ignore
    const info = await window.electronAPI?.checkForUpdates()
    if (info) {
      updateInfo.value = info
      updateAvailable.value = true
    }
  }

  const downloadUpdate = async () => {
    isDownloading.value = true
    // @ts-ignore
    await window.electronAPI?.downloadUpdate()
  }

  const installUpdate = () => {
    // @ts-ignore
    window.electronAPI?.installUpdate()
  }

  return {
    updateAvailable,
    updateInfo,
    downloadProgress,
    isDownloading,
    checkForUpdates,
    downloadUpdate,
    installUpdate
  }
})
```

## 用户界面

### 更新提示对话框
- 显示新版本号和发布日期
- 展示更新内容
- 提供"立即下载"、"稍后"、"不再提醒"选项

### 下载进度条
- 显示下载速度和剩余时间
- 支持取消下载

### 更新完成提示
- 提示用户退出应用完成安装
- 提供"立即重启"按钮

## 配置选项

- **自动检查更新**: 启动时自动检查
- **自动下载**: 发现新版本自动下载
- **自动安装**: 下载完成后自动安装
- **更新通道**: Stable / Beta / Dev
- **代理设置**: 支持企业代理

## 测试

### 本地测试

```bash
# 使用 electron-updater-local 作为测试服务器
npx electron-updater-local
```

### CI/CD 集成

```yaml
# .github/workflows/release.yml
- name: Create Release
  run: |
    electron-builder --publish always
  env:
    GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

## 常见问题

### Q: 更新检查失败怎么办？
A: 检查网络连接、更新服务器状态、代理设置

### Q: 下载中断怎么办？
A: 自动断点续传，重新打开应用继续下载

### Q: 更新后应用无法启动怎么办？
A: 使用回滚功能恢复到上一版本

### Q: 如何跳过某个版本？
A: 在设置中禁用自动检查，手动选择更新
