#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path

# Load language metadata
with open('/home/eren/DLanding/docs/language-metadata.json', 'r') as f:
    languages = json.load(f)

# Get all index.html files
base_dir = Path('/home/eren/DLanding')
index_files = list(base_dir.glob('**/index.html')) + [base_dir / 'index.html']
# Remove duplicates (root index.html might be in glob)
index_files = list(set(index_files))
index_files.sort()

def get_lang_code(file_path):
    """Determine language code from file path"""
    rel_path = file_path.relative_to(base_dir)
    if rel_path == Path('index.html'):
        return 'tr'
    return rel_path.parent.name

def generate_dropdown(current_code):
    """Generate full dropdown HTML with active class on current language"""
    links = []
    for lang in languages:
        code = lang['code']
        flag = lang['flag']
        native_name = lang['native_name']
        code_upper = code.upper()
        
        # Href: tr is ./, others are {code}/
        href = './' if code == 'tr' else f'{code}/'
        # Class: active if matches current file's language
        cls = 'lang-option active' if code == current_code else 'lang-option'
        
        link = f'<a href="{href}" class="{cls}" rel="noopener noreferrer" hreflang="{code}"><span class="lang-flag">{flag}</span> <span data-i18n="lang.{code_upper}">{native_name}</span></a>'
        links.append(link)
    
    dropdown = '<div class="lang-dropdown" id="langDropdown">\n  ' + '\n  '.join(links) + '\n</div>'
    return dropdown

def update_file(file_path):
    """Update a single index.html file"""
    current_code = get_lang_code(file_path)
    new_dropdown = generate_dropdown(current_code)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to match the entire lang-dropdown div
    pattern = r'<div class="lang-dropdown" id="langDropdown">.*?</div>'
    replacement = new_dropdown
    
    new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
    
    if count == 1:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated: {file_path}')
    else:
        print(f'Warning: Found {count} dropdowns in {file_path}')

if __name__ == '__main__':
    for file_path in index_files:
        if file_path.exists():
            update_file(file_path)
    print('Done updating all files.')
