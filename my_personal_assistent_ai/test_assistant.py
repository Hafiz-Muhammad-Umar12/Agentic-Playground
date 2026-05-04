"""
Quick test — run this to check everything is working
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from assistant import (
    create_folder, list_folder, delete_folder,
    show_time, show_disk, handle_mood, MOTIVATIONS
)
import tempfile, shutil

print("Testing assistant...")

# Test folder creation
tmp = tempfile.mkdtemp()
test_path = os.path.join(tmp, "ZainTestFolder")
create_folder(test_path)
assert os.path.exists(test_path), "Folder nahi bana!"

# Test list
list_folder(tmp)

# Test mood
result = handle_mood("main bahut sad hoon aaj")
assert result == True, "Mood detection fail!"

# Test time & disk
show_time()
show_disk()

# Clean up
shutil.rmtree(tmp)

print("\n✅ Saare tests pass ho gaye! Assistant ready hai!")
print(f"📊 {len(MOTIVATIONS)} motivational quotes loaded.")
print("🚗 Audi 2030 — chalte raho bhai!")
