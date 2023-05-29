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
- [x] 群文件列表

## 待完善功能

- [ ] 表情显示
- [ ] 历史消息
    - 似乎需要动用到数据库，暂时就先不做了

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
    - 在此步骤中，WebSocket 的链接可能是 `ws://0.0.0.0:5700`，也可以是其他的地址和端口
- 重新使用 `./go-cqhttp -faststart` 启动，可以看到 go-cqhttp 的日志

### 客户端

- 进入 `https://cq.widcard.win`，点击左下角齿轮，修改链接为刚才填入的链接，在这种方式中，链接最好是使用 `http://127.0.0.1:<端口号>`
- 点击左下角回形针按钮，当图标变为蓝色，且右下角弹出消息，显示 **已连接**，那么就可以点击点击左上角的 **人物图标** 或 **群组图标** 来查找相应的人并聊天了

在初始化以后，启动就是两步

- 在 go-cq 可执行文件路径下执行 `./go-cqhttp -faststart` 启动后端
- 打开 `https://cq.widcard.win` 连接本地的 WebSocket 进程
