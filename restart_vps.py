import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

VPS_HOST = "153.75.247.105"
VPS_USER = "root"
VPS_PASS = "Snapbucks@Billion"

def run_command(ssh, cmd):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out)
    if err:
        print(err)
    return out, err

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"Connecting to {VPS_HOST}...")
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=10)
        print("Connected!")

        # Check current status
        run_command(ssh, "pm2 list")

        # Pull latest code
        print("\n--- Pulling latest code ---")
        run_command(ssh, "cd /root/review-hub && git pull origin master")

        # Install backend dependencies if needed
        print("\n--- Checking backend dependencies ---")
        run_command(ssh, "cd /root/review-hub/backend && pip install -r requirements.txt -q 2>&1 || true")

        # Run migration
        print("\n--- Running database migration ---")
        run_command(ssh, "cd /root/review-hub/backend && alembic upgrade head 2>&1 || true")

        # Install bot dependencies if needed
        print("\n--- Checking bot dependencies ---")
        run_command(ssh, "cd /root/review-hub/bot && pip install -r requirements.txt -q 2>&1 || true")

        # Restart bot
        print("\n--- Restarting bot ---")
        run_command(ssh, "pm2 restart taskhub-bot 2>&1 || pm2 start /root/review-hub/bot/bot.py --name taskhub-bot --interpreter python3 2>&1")

        # Restart backend
        print("\n--- Restarting backend ---")
        run_command(ssh, "pm2 restart reviewhub-api 2>&1 || pm2 start '/root/review-hub/backend/app/main.py' --name reviewhub-api --interpreter uvicorn -- --host 0.0.0.0 --port 8000 2>&1")

        # Final status
        print("\n--- Final PM2 Status ---")
        run_command(ssh, "pm2 list")

        print("\n[OK] All done!")

    except paramiko.AuthenticationException:
        print("[FAIL] Authentication failed - wrong password")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"[FAIL] SSH error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
