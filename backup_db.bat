@echo off
set PGPASSWORD=postgres

pg_dump -U postgres -h localhost -d printbridge > export_file.sql

echo Backup selesai: export_file.sql
pause