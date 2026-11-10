@echo off
chcp 65001 >nul
title Crop Coop Git Workflow Helper
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0git-flow.ps1" %*

