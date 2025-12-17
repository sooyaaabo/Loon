import os
import re
import json
import urllib.parse

# ---------------- 配置区域 ----------------
GITHUB_USER = "sooyaaabo"
GITHUB_REPO = "Loon"
BRANCH = "main"     
PLUGIN_DIR = "Plugin"  # 插件文件所在的文件夹名称
# ----------------------------------------

# 正则预编译
RE_NAME = re.compile(r'#!\s*name\s*=\s*(.+)', re.IGNORECASE)
RE_DESC = re.compile(r'#!\s*desc\s*=\s*(.+)', re.IGNORECASE)
RE_ICON = re.compile(r'#!\s*icon\s*=\s*(.+)', re.IGNORECASE)
RE_DATE = re.compile(r'#!\s*date\s*=\s*(.+)', re.IGNORECASE)
RE_TAG = re.compile(r'#!\s*tag\s*=\s*(.+)', re.IGNORECASE)
RE_AUTHOR = re.compile(r'#!\s*author\s*=\s*(.+)', re.IGNORECASE)

def parse_authors(author_str):
    if not author_str:
        return []
    authors = []
    parts = author_str.split(',')
    for part in parts:
        part = part.strip()
        match = re.match(r'([^\[]+)\[(.+)\]', part)
        if match:
            name = match.group(1).strip()
            url = match.group(2).strip()
            avatar = url if not url.startswith('http') or url.endswith(('.png', '.jpg')) else ""
            if 'github.com' in url and not avatar:
                user_match = re.search(r'github\.com\/([^\/]+)', url)
                if user_match:
                    avatar = f"https://github.com/{user_match.group(1)}.png"
            authors.append({"name": name, "url": url, "avatar": avatar})
        else:
            authors.append({
                "name": part,
                "url": f"https://github.com/{urllib.parse.quote(part)}",
                "avatar": f"https://github.com/{urllib.parse.quote(part)}.png"
            })
    return authors

def main():
    root_path = os.getcwd()
    # 定位到 Plugin 目录
    plugin_path = os.path.join(root_path, PLUGIN_DIR)

    if not os.path.exists(plugin_path):
        print(f"Error: Directory {plugin_path} not found.")
        return

    plugins = []
    files = [f for f in os.listdir(plugin_path) if f.endswith('.lpx')]
    files.sort()

    for filename in files:
        filepath = os.path.join(plugin_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

            name = (RE_NAME.search(content) or [None, filename])[1].strip()
            desc = (RE_DESC.search(content) or [None, "暂无描述"])[1].strip()
            icon = (RE_ICON.search(content) or [None, ""])[1].strip()
            date = (RE_DATE.search(content) or [None, "Unknown"])[1].strip()
            
            tag_match = RE_TAG.search(content)
            tags = [t.strip() for t in tag_match.group(1).split(',')] if tag_match else []
            
            author_match = RE_AUTHOR.search(content)
            authors = parse_authors(author_match.group(1).strip() if author_match else "")

            download_url = f"https://raw.githubusercontent.com/{GITHUB_USER}/{GITHUB_REPO}/{BRANCH}/{PLUGIN_DIR}/{filename}"

            plugins.append({
                "name": name,
                "desc": desc,
                "icon": icon,
                "date": date,
                "tags": tags,
                "authors": authors,
                "url": download_url,
                "filename": filename
            })

    output_file = os.path.join(plugin_path, 'plugins.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(plugins, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated {len(plugins)} plugins into {output_file}")

if __name__ == "__main__":
    main()