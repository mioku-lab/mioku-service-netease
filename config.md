---
title: 网易云音乐 服务配置
description: 配置 NetEase Cloud Music 服务的默认参数
fields:
  - key: base.cookie
    label: 默认 Cookie
    type: secret
    description: 网易云 MUSIC_U cookie，无 cookie 仅能搜索；VIP 音质必须配置
    placeholder: MUSIC_U=...; os=pc; appver=8.9.75;

  - key: base.quality
    label: 默认音质
    type: select
    description: 下载音质档位，lossless/hires 需要 VIP cookie
    options:
      - value: standard
        label: 标准 (128k)
      - value: exhigh
        label: 极高 (320k，推荐)
      - value: lossless
        label: 无损 FLAC
      - value: hires
        label: Hi-Res
---
