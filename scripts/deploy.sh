#!/bin/bash

SOURCE_DIR="$HOME/pdfjs"           # 本地 PDF.js 项目根目录
BUILD_DIR="$SOURCE_DIR/build/generic"  # 构建目录
WEB_DIR="/var/www/html/pdfjs"               # Nginx 服务器上的部署目录
NGINX_CONF="/etc/nginx/nginx.conf"  # Nginx 配置文件路径
DEFAULT_PREFS_DIR="$SOURCE_DIR/build/default_preferences"

if [ "$(id -u)" -ne 0 ]; then
  echo "此脚本必须以 root 用户运行"
  exit 1
fi

if ! systemctl is-active --quiet nginx; then
  echo "Nginx 服务没有启动，正在启动 Nginx..."
  systemctl start nginx
fi

echo "清理目标目录..."
rm -rf $WEB_DIR/*

echo "复制构建文件到 Nginx 部署目录..."
cp -r $BUILD_DIR/*  $WEB_DIR/
cp -r $BUILD_DIR/web/* $WEB_DIR/web/
cp -r $DEFAULT_PREFS_DIR/*  $WEB_DIR/default_preferences/

echo "重新加载 Nginx 配置..."
nginx -s reload

echo "PDF.js 部署完成！"

