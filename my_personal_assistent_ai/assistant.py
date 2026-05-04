import os
import sys
import shutil
import datetime
import platform
import subprocess
import time
import random

# ─────────────────────────────────────────────
#  COLOUR HELPERS (works on Windows + Linux)
# ─────────────────────────────────────────────
class C:
    CYAN   = "\033[96m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    BOLD   = "\033[1m"
    RESET  = "\033[0m"
    MAGENTA= "\033[95m"
    BLUE   = "\033[94m"

# Enable ANSI on Windows
if platform.system() == "Windows":
    os.system("color")

# ─────────────────────────────────────────────
#  MOTIVATIONAL QUOTES  (Audi 2030 theme 🚗)
# ─────────────────────────────────────────────
MOTIVATIONS = [
    "Bhai, rona band karo! 2030 mein Audi ki chaabi haath mein hogi — ab uthho aur kaam karo! 🚗",
    "Sad hona theek hai, par yaad raho — Audi khud chal ke nahi aayegi! Mehnat karo! 💪",
    "Ek din aayega jab tu Audi mein baith ke yeh din yaad karega aur muskurayega! 😎",
    "Bhai log sad hote hain, champions motivated rehte hain! Tu champion hai! 🏆",
    "Life mein ups and downs aate hain — par Audi ka steering seedha rakho! 🔥",
    "Agar aaj ruk gaye toh 2030 mein Audi ki jagah cycle milegi! Chalte raho! 🚴",
    "Har mushkil ek seedhi hai — chadh jaao, Audi upar hai! 🌟",
    "Bhai, zindagi short hai. Ya sadness mein guzaaro ya Audi ki taraf race karo. Tu kya choose karta hai? 💥",
    "2030 abhi door nahi! Par agar aaj nahi utha toh woh door ho jaayega. Uth bhai! ⚡",
    "Sad vibes out, grind mode on. Audi 2030 — yeh sirf ek sapna nahi, yeh tera goal hai! 🎯",
]

GREETINGS_MORNING   = ["Good Morning bhai! ☀️", "Suba bakhair! ☕", "Rise and shine! 🌅"]
GREETINGS_AFTERNOON = ["Salam! 👋 Dopahar mubarak!", "Good Afternoon bhai! 🌤️"]
GREETINGS_EVENING   = ["Good Evening! 🌙", "Shaam bakhair bhai! ✨"]
GREETINGS_NIGHT     = ["Raat mubarak bhai! 🌃", "Good Night vibes! 🌙"]

HAALS = [
    "Aaj kaisa hua? Sab theek?",
    "Bhai kya haal hai aaj ka?",
    "Kaisi rahi aaj ki life?",
    "Kya scene hai bhai?",
]

# ─────────────────────────────────────────────
#  GREETING ON STARTUP
# ─────────────────────────────────────────────
def greet_user():
    hour = datetime.datetime.now().hour
    if 5 <= hour < 12:
        g = random.choice(GREETINGS_MORNING)
    elif 12 <= hour < 17:
        g = random.choice(GREETINGS_AFTERNOON)
    elif 17 <= hour < 21:
        g = random.choice(GREETINGS_EVENING)
    else:
        g = random.choice(GREETINGS_NIGHT)

    print(f"\n{C.CYAN}{C.BOLD}{'='*55}{C.RESET}")
    print(f"{C.YELLOW}{C.BOLD}   🤖  ZAIN KA PERSONAL ASSISTANT  v1.0{C.RESET}")
    print(f"{C.CYAN}{C.BOLD}{'='*55}{C.RESET}\n")
    print(f"{C.GREEN}  {g}{C.RESET}")
    print(f"{C.MAGENTA}  {random.choice(HAALS)}{C.RESET}")
    print(f"\n{C.CYAN}  Type 'help' for all commands | 'exit' to quit{C.RESET}")
    print(f"{C.CYAN}{'='*55}{C.RESET}\n")

# ─────────────────────────────────────────────
#  SPEAK (optional TTS — skipped if not available)
# ─────────────────────────────────────────────
def speak(text):
    try:
        if platform.system() == "Windows":
            subprocess.Popen(
                ["powershell", "-Command",
                 f'Add-Type -AssemblyName System.Speech; '
                 f'$s=New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak("{text}")'],
                creationflags=subprocess.CREATE_NO_WINDOW
            )
        elif platform.system() == "Darwin":
            subprocess.Popen(["say", text])
        else:
            subprocess.Popen(["espeak", text], stderr=subprocess.DEVNULL)
    except Exception:
        pass  # TTS not available — silent mode

# ─────────────────────────────────────────────
#  FOLDER COMMANDS
# ─────────────────────────────────────────────
def create_folder(path):
    try:
        os.makedirs(path, exist_ok=True)
        print(f"{C.GREEN}  ✅ Folder bana diya: {path}{C.RESET}")
        speak(f"Folder bana diya")
    except Exception as e:
        print(f"{C.RED}  ❌ Error: {e}{C.RESET}")

def delete_folder(path):
    if not os.path.exists(path):
        print(f"{C.RED}  ❌ Yeh folder exist nahi karta: {path}{C.RESET}")
        return
    confirm = input(f"{C.YELLOW}  ⚠️  '{path}' folder delete karna chahte ho? (haan/nahi): {C.RESET}").strip().lower()
    if confirm in ["haan", "yes", "ha", "han", "y"]:
        try:
            shutil.rmtree(path)
            print(f"{C.GREEN}  ✅ Folder delete ho gaya: {path}{C.RESET}")
            speak("Folder delete ho gaya")
        except Exception as e:
            print(f"{C.RED}  ❌ Error: {e}{C.RESET}")
    else:
        print(f"{C.CYAN}  ↩️  Cancel kar diya.{C.RESET}")

def list_folder(path="."):
    if not os.path.exists(path):
        print(f"{C.RED}  ❌ Path nahi mili: {path}{C.RESET}")
        return
    items = os.listdir(path)
    if not items:
        print(f"{C.YELLOW}  📂 Folder khali hai.{C.RESET}")
        return
    print(f"{C.CYAN}  📂 Items in '{path}':{C.RESET}")
    for i, item in enumerate(items, 1):
        full = os.path.join(path, item)
        icon = "📁" if os.path.isdir(full) else "📄"
        print(f"     {i}. {icon} {item}")

# ─────────────────────────────────────────────
#  FILE COMMANDS
# ─────────────────────────────────────────────
def delete_file(path):
    if not os.path.exists(path):
        print(f"{C.RED}  ❌ File nahi mili: {path}{C.RESET}")
        return
    confirm = input(f"{C.YELLOW}  ⚠️  '{path}' file delete karna chahte ho? (haan/nahi): {C.RESET}").strip().lower()
    if confirm in ["haan", "yes", "ha", "han", "y"]:
        try:
            os.remove(path)
            print(f"{C.GREEN}  ✅ File delete ho gayi: {path}{C.RESET}")
            speak("File delete ho gayi")
        except Exception as e:
            print(f"{C.RED}  ❌ Error: {e}{C.RESET}")
    else:
        print(f"{C.CYAN}  ↩️  Cancel kar diya.{C.RESET}")

def delete_all_files_in_folder(path):
    if not os.path.exists(path):
        print(f"{C.RED}  ❌ Folder nahi mila: {path}{C.RESET}")
        return
    files = [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))]
    if not files:
        print(f"{C.YELLOW}  📂 Folder mein koi file nahi.{C.RESET}")
        return
    print(f"{C.YELLOW}  Yeh files milein:{C.RESET}")
    for f in files:
        print(f"     - {f}")
    confirm = input(f"{C.YELLOW}  ⚠️  Saari files delete karo? (haan/nahi): {C.RESET}").strip().lower()
    if confirm in ["haan", "yes", "ha", "han", "y"]:
        for f in files:
            os.remove(os.path.join(path, f))
        print(f"{C.GREEN}  ✅ Saari files delete ho gayin!{C.RESET}")
        speak("Saari files delete ho gayin")
    else:
        print(f"{C.CYAN}  ↩️  Cancel kar diya.{C.RESET}")

def rename_item(old, new):
    try:
        os.rename(old, new)
        print(f"{C.GREEN}  ✅ Rename ho gaya: {old} → {new}{C.RESET}")
    except Exception as e:
        print(f"{C.RED}  ❌ Error: {e}{C.RESET}")

# ─────────────────────────────────────────────
#  SYSTEM COMMANDS
# ─────────────────────────────────────────────
def shutdown_computer():
    confirm = input(f"{C.RED}  ⚠️  PC band karna chahte ho? (haan/nahi): {C.RESET}").strip().lower()
    if confirm in ["haan", "yes", "ha", "han", "y"]:
        print(f"{C.RED}  💻 PC band ho raha hai...{C.RESET}")
        speak("PC band ho raha hai")
        time.sleep(2)
        if platform.system() == "Windows":
            os.system("shutdown /s /t 5")
        else:
            os.system("shutdown -h now")
    else:
        print(f"{C.CYAN}  ↩️  Cancel kar diya.{C.RESET}")

def restart_computer():
    confirm = input(f"{C.YELLOW}  ⚠️  PC restart karna chahte ho? (haan/nahi): {C.RESET}").strip().lower()
    if confirm in ["haan", "yes", "ha", "han", "y"]:
        print(f"{C.YELLOW}  🔄 PC restart ho raha hai...{C.RESET}")
        speak("Restart ho raha hai")
        time.sleep(2)
        if platform.system() == "Windows":
            os.system("shutdown /r /t 5")
        else:
            os.system("reboot")
    else:
        print(f"{C.CYAN}  ↩️  Cancel kar diya.{C.RESET}")

def open_app(app_name):
    try:
        if platform.system() == "Windows":
            os.startfile(app_name)
        elif platform.system() == "Darwin":
            subprocess.Popen(["open", "-a", app_name])
        else:
            subprocess.Popen([app_name])
        print(f"{C.GREEN}  ✅ '{app_name}' khul raha hai...{C.RESET}")
    except Exception as e:
        print(f"{C.RED}  ❌ Error: {e}{C.RESET}")

def show_time():
    now = datetime.datetime.now()
    print(f"{C.CYAN}  🕐 Abhi ka waqt: {now.strftime('%I:%M %p')}  |  Tarikh: {now.strftime('%d %B %Y')}{C.RESET}")

def show_disk():
    total, used, free = shutil.disk_usage("/")
    print(f"{C.CYAN}  💾 Disk Info:")
    print(f"     Total : {total // (2**30)} GB")
    print(f"     Used  : {used  // (2**30)} GB")
    print(f"     Free  : {free  // (2**30)} GB{C.RESET}")

# ─────────────────────────────────────────────
#  MOOD / MOTIVATION
# ─────────────────────────────────────────────
def handle_mood(user_input):
    sad_keywords   = ["sad", "udaas", "bura", "depression", "dukhi", "tension", "stressed", "rona", "pareshan", "thaka", "thak"]
    happy_keywords = ["khush", "happy", "maza", "acha", "great", "fantastic", "alhamdulilah", "mast"]

    inp = user_input.lower()
    if any(k in inp for k in sad_keywords):
        quote = random.choice(MOTIVATIONS)
        print(f"\n{C.MAGENTA}  💪 MOTIVATION TIME:{C.RESET}")
        print(f"{C.YELLOW}  {quote}{C.RESET}\n")
        speak("Bhai lagy raho, Audi 2030 mein milegi!")
        return True
    if any(k in inp for k in happy_keywords):
        print(f"\n{C.GREEN}  😄 Wah bhai! Khushi mein bhi mehnat karo — Audi 2030 pakki! 🚗🔥{C.RESET}\n")
        return True
    return False

# ─────────────────────────────────────────────
#  HELP MENU
# ─────────────────────────────────────────────
def show_help():
    print(f"""
{C.CYAN}{C.BOLD}{'='*55}
   📋  SAARE COMMANDS
{'='*55}{C.RESET}

{C.YELLOW}📁 FOLDER COMMANDS:{C.RESET}
  folder bana <path>          → Naya folder banao
  folder kholo <path>         → Folder ki files dekho
  folder delete <path>        → Folder delete karo

{C.YELLOW}📄 FILE COMMANDS:{C.RESET}
  file delete <path>          → Ek file delete karo
  files delete <folder>       → Folder ki saari files delete
  rename <purana> <naya>      → File/folder rename karo

{C.YELLOW}💻 SYSTEM COMMANDS:{C.RESET}
  pc off                      → Computer band karo
  pc restart                  → Computer restart karo
  open <app>                  → Koi app kholo (e.g. notepad)
  time                        → Abhi ka waqt dekho
  disk                        → Disk space dekho

{C.YELLOW}😊 MOOD:{C.RESET}
  "main sad hoon" ya koi bhi udaas baat → Motivation milegi!
  "main khush hoon"                     → Double khushi!

{C.YELLOW}🔧 OTHER:{C.RESET}
  help                        → Yeh menu
  exit / quit / band          → Assistant band karo

{C.CYAN}{'='*55}{C.RESET}
    """)

# ─────────────────────────────────────────────
#  COMMAND PARSER
# ─────────────────────────────────────────────
def parse_command(user_input):
    raw   = user_input.strip()
    lower = raw.lower()
    parts = raw.split()

    # Exit
    if lower in ["exit", "quit", "band", "bye", "close"]:
        print(f"{C.CYAN}  👋 Allah Hafiz bhai! Mehnat karte raho — Audi 2030! 🚗{C.RESET}\n")
        speak("Allah hafiz! Audi 2030 pakki hai!")
        sys.exit(0)

    # Help
    if lower == "help":
        show_help()
        return

    # Time
    if lower in ["time", "waqt", "time dekho"]:
        show_time()
        return

    # Disk
    if lower in ["disk", "storage", "disk dekho"]:
        show_disk()
        return

    # PC off
    if any(x in lower for x in ["pc off", "computer off", "shutdown", "band karo pc", "computer band"]):
        shutdown_computer()
        return

    # PC restart
    if any(x in lower for x in ["pc restart", "restart", "reboot"]):
        restart_computer()
        return

    # Open app
    if lower.startswith("open "):
        app = raw[5:].strip()
        open_app(app)
        return

    # Folder bana
    if lower.startswith("folder bana") or lower.startswith("bana folder"):
        idx = lower.find("bana") + 4
        path = raw[idx:].strip().strip("<>")
        if path:
            create_folder(path)
        else:
            print(f"{C.RED}  ❌ Path dena hoga. Jaise: folder bana C:\\Test{C.RESET}")
        return

    # Folder kholo / list
    if lower.startswith("folder kholo") or lower.startswith("folder list"):
        idx = 12
        path = raw[idx:].strip() or "."
        list_folder(path)
        return

    # Folder delete
    if lower.startswith("folder delete"):
        path = raw[13:].strip()
        if path:
            delete_folder(path)
        else:
            print(f"{C.RED}  ❌ Path dena hoga.{C.RESET}")
        return

    # Files delete (all files in folder)
    if lower.startswith("files delete"):
        path = raw[12:].strip()
        if path:
            delete_all_files_in_folder(path)
        else:
            print(f"{C.RED}  ❌ Folder path dena hoga.{C.RESET}")
        return

    # File delete (single)
    if lower.startswith("file delete"):
        path = raw[11:].strip()
        if path:
            delete_file(path)
        else:
            print(f"{C.RED}  ❌ File path dena hoga.{C.RESET}")
        return

    # Rename
    if lower.startswith("rename "):
        rest = raw[7:].strip().split()
        if len(rest) >= 2:
            rename_item(rest[0], rest[1])
        else:
            print(f"{C.RED}  ❌ Purana aur naya naam dono dena hoga. Jaise: rename old.txt new.txt{C.RESET}")
        return

    # Mood check
    if handle_mood(lower):
        return

    # Unknown
    print(f"{C.YELLOW}  🤔 Yeh command samajh nahi aaya. 'help' type karo saari commands dekhne ke liye.{C.RESET}")

# ─────────────────────────────────────────────
#  MAIN LOOP
# ─────────────────────────────────────────────
def main():
    greet_user()
    speak("Good morning bhai! Kya haal hai?")

    while True:
        try:
            user_input = input(f"{C.GREEN}  🤖 Zain> {C.RESET}").strip()
            if not user_input:
                continue
            parse_command(user_input)
            print()
        except KeyboardInterrupt:
            print(f"\n{C.CYAN}  👋 Allah Hafiz! Audi 2030 pakki hai! 🚗{C.RESET}\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
