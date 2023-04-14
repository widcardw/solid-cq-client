# 基于 go-cqhttp 和 Solidjs 的 CQ 客户端

> 该客户端只会实现一些基本的功能，不会实现过于复杂的功能

> 本项目仅供学习参考，禁止以任何目的售卖、推销

## 基本功能

- [x] 发送类
    - [x] 信息发送
    - [x] 图片发送
    - [x] 粘贴图片并发送
    - [x] 文件发送
- [x] 显示类
    - [x] 好友显示和搜索
    - [x] 群组显示和搜索
    - [x] 在本窗格的最近聊天
    - [x] 图片显示
    - [x] JSON 卡片的展开收起
    - [x] 文件接收
- [x] 图片的保存
    - 使用 a 标签的 download 属性，再加上 `no-referrer` 属性就可以下载了

## 待完善功能

- [ ] 表情显示
- [ ] 显示群文件列表
    - 烦内，ws 监听消息只能通过一个渠道来判断，然后根路径和非根路径的响应数据格式是一样的，根本没法判断呜呜，我也不想再开一个 http 的端口了

## dev 方式

- 克隆本仓库，并使用 pnpm 安装依赖
- 在 `go-cq` 目录下存放 [Mrs4s/go-cqhttp](https://github.com/Mrs4s/go-cqhttp) 的可执行文件，将 `config.yml` 中 `report-self-message` 字段设置为 `true`，将 `post-format` 字段设置为 `array`
- `pnpm run dev`

## build 方式

- `pnpm run build`

## 不克隆本仓库 如何使用

### 后端

- 至 [Mrs4s/go-cqhttp](https://github.com/Mrs4s/go-cqhttp) 的 release 页面下载对应版本的 go-cq-http 可执行文件
- 在一个目录中运行 `./go-cqhttp`，选择**正向 WebSocket**，可生成 `config.yml` 文件，此时退出该进程，在 `config.yml` 中填写账号和密码，并将 `report-self-message` 字段设置为 `true`，将 `post-format` 字段设置为 `array`
    - 在此步骤中，WebSocket 的链接可能是 `ws://0.0.0.0:5700`，也可以是其他的端口
- 重新使用 `./go-cqhttp -faststart` 启动，可以看到 go-cqhttp 的日志

### 客户端

- 至本仓库的 release 页面下载最新版本的 `solid-cq-client-dist.zip`，本地解压，在解压后的目录中使用 `python -m http.server 3174` 或其他可以开启一个服务的命令启动，打开 http://localhost:3174 即可使用
- 点击页面左下角的第一个回形针按钮，当图标变为蓝色，并且右下角提示**已连接**，那么就可以点击左上角的**人物图标**或**群组图标**来查找相应的人并聊天了
    - 如果你在上面更改了 WebSocket 链接，那么请先点击左下角的**齿轮图标**，将 ws 链接修改为你之前修改过的链接，然后点击 OK 即可自动连接

> **Warning**: Safari 浏览器不允许使用地址为 0.0.0.0 的连接，如果需要，可以使用 127.0.0.1 作为地址

在初始化以后，启动就是两步

- 在 go-cq 可执行文件路径下执行 `./go-cqhttp -faststart` 启动后端
- 在该库的 dist 路径下执行 `python -m http.server 3174` 启动 Web 客户端
