import paramiko, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
s = paramiko.SSHClient()
s.set_missing_host_key_policy(paramiko.AutoAddPolicy())
s.connect('153.75.247.105', username='root', password='Snapbucks@Billion', timeout=10)

# Check latest backend logs for auth errors
_, out, _ = s.exec_command("pm2 logs reviewhub-api --lines 30 --nostream 2>&1")
print("=== Backend logs ===")
print(out.read().decode('utf-8', errors='replace'))

# Also check if the settings module actually loaded the token
_, out2, _ = s.exec_command("""cd /root/review-hub/backend && python3 -c "
import os
os.chdir('/root/review-hub/backend')

# Simulate what Settings does
from dotenv import load_dotenv
load_dotenv('.env')
token = os.getenv('BOT_TOKEN', '')

# Now test validation
import sys
sys.path.insert(0, '.')
from app.utils.telegram import validate_telegram_init_data, AuthError

# Test with a dummy initData
test_data = 'user=%7B%22id%22%3A123%7D&auth_date=1234567890&hash=abc123'
result = validate_telegram_init_data(test_data, token)
print('Test result success:', result.success)
print('Test result error_code:', result.error_code)
print('Token used prefix:', token[:15])
" """)
print("=== Validation test ===")
print(out2.read().decode('utf-8', errors='replace'))

s.close()
