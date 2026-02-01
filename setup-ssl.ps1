$password = "eh5gRDe4yCsK"
$server = "root@144.31.212.184"

$commands = @"
cd /var/www/popugai-market
apt update
apt install -y certbot python3-certbot-nginx
certbot --nginx -d zolotoykakadushop.sbs -d www.zolotoykakadushop.sbs --email admin@zolotoykakadushop.sbs --agree-tos --non-interactive --redirect
systemctl enable certbot.timer
systemctl start certbot.timer
systemctl restart nginx
echo '✅ SSL НАСТРОЕН! Сайт: https://zolotoykakadushop.sbs'
"@

Write-Host "🔒 Настройка SSL для zolotoykakadushop.sbs" -ForegroundColor Yellow
Write-Host "Пароль: $password" -ForegroundColor Green
Write-Host ""
Write-Host "Выполни эту команду в PowerShell:" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh $server" -ForegroundColor White
Write-Host ""
Write-Host "Потом скопируй и вставь:" -ForegroundColor Cyan
Write-Host $commands -ForegroundColor White
