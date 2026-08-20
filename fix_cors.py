import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
s = paramiko.SSHClient()
s.set_missing_host_key_policy(paramiko.AutoAddPolicy())
s.connect('153.75.247.105', username='root', password='Snapbucks@Billion', timeout=10)

# Append ALLOWED_ORIGINS to .env
cmd = """echo 'ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://frontend-kappa-sepia-39.vercel.app' >> /root/review-hub/backend/.env"""
s.exec_command(cmd)

# Verify
_, out, _ = s.exec_command('grep ALLOWED_ORIGINS /root/review-hub/backend/.env')
print("ALLOWED_ORIGINS:", out.read().decode().strip())

# Restart backend
s.exec_command('pm2 restart reviewhub-api')
import time; time.sleep(3)

_, out2, _ = s.exec_command('pm2 logs reviewhub-api --lines 5 --nostream 2>&1')
print("\nBackend logs:")
print(out2.read().decode())

s.close()
print("\n[OK] Done!")
