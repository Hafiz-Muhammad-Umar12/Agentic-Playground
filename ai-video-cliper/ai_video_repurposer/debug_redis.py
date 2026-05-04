import redis
import sys

def test_redis():
    urls = ["redis://127.0.0.1:6379/0", "redis://localhost:6379/0"]
    for url in urls:
        print(f"Testing {url}...")
        try:
            r = redis.from_url(url, socket_connect_timeout=2)
            r.ping()
            print(f"✅ Success: {url} is reachable.")
        except Exception as e:
            print(f"❌ Failed: {url}. Error: {str(e)}")

if __name__ == "__main__":
    test_redis()
