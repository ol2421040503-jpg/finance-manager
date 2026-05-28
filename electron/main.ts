import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: '销售专属理财管理器',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 加载 app:// 协议的首页
  mainWindow.loadURL('app://salesfinance/index.html');
}

// 注册自定义协议，将 app://salesfinance/xxx 映射到本地 out/xxx
app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    // request.url 格式: app://salesfinance/_next/static/xxx 或 app://salesfinance/index.html
    const url = new URL(request.url);
    // 提取路径部分（去掉 hostname）
    const filePath = url.pathname;
    // 映射到本地 out 目录
    const absolutePath = path.join(__dirname, '..', 'out', filePath);
    return net.fetch(`file://${absolutePath}`);
  });

  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
