@echo off
echo Starting Node.js and React.js applications...

:: Start Node.js backend 1
start cmd /c "cd /d .\server && node server.js"

:: Start Node.js backend 2
start cmd /c "cd /d .\rents && npm start"

:: Start React frontend 1
start cmd /c "cd /d .\hotelandrestarunts\ && npm start "


echo All applications are running!
exit