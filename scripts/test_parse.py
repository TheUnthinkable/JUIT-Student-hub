import xlrd, re, json, os

def parse_cell(cell_str):
    cell_str = cell_str.strip()
    if not cell_str or re.match(r'^[0-9.]+$', cell_str) or cell_str == 'NEW':
        return None
    
    m = re.match(r'^([LPT])\s*-\s*([0-9A-Za-z_/-]+)\s*(.*)$', cell_str)
    if not m:
        return {'raw': cell_str, 'type': 'L', 'code': '', 'batches': [], 'faculty': '', 'venue': ''}
    
    type_char = m.group(1)
    type_full = 'Lecture' if type_char == 'L' else ('Tutorial' if type_char == 'T' else 'Practical / Lab')
    code = m.group(2)
    rest = m.group(3).strip()
    
    # Check for faculty in parentheses: e.g. (AVA) or (MAT_RS7)
    fac_matches = re.findall(r'\(([^)]+)\)', rest)
    faculty = fac_matches[-1] if fac_matches else ''
    
    venue = ''
    if fac_matches:
        idx = rest.rfind(')')
        venue = rest[idx+1:].strip()
        last_paren_full = '(' + faculty + ')'
        b_idx = rest.rfind(last_paren_full)
        batches_part = rest[:b_idx].strip()
    else:
        parts = rest.split()
        if len(parts) >= 2:
            venue = parts[-1]
            batches_part = ' '.join(parts[:-1])
        else:
            batches_part = rest
            venue = ''
            
    # Extract batches
    batches = []
    # Match patterns like 26BT01, 25A11.., 24A110, 23A11, etc.
    raw_tokens = re.findall(r'\b(2[3-6][A-Za-z0-9_.]+)\b', batches_part)
    for tok in raw_tokens:
        tok_clean = tok.rstrip('.')
        if tok_clean not in batches:
            batches.append(tok_clean)
            
    if not batches:
        # maybe ALL, or PE/OE
        if 'ALL' in batches_part.upper():
            batches = ['ALL']
        elif batches_part:
            batches = [batches_part]

    return {
        'raw': cell_str,
        'type': type_char,
        'type_full': type_full,
        'code': code,
        'batches': batches,
        'batches_raw': batches_part,
        'faculty': faculty,
        'venue': venue
    }

wb = xlrd.open_workbook('ODDSEMTT2026.xls')
sh = wb.sheet_by_name('BTECH 1 SEM')
print(f"BTECH 1 SEM rows: {sh.nrows}, cols: {sh.ncols}")
for r in range(2, 15):
    for c in range(1, 6):
        v = str(sh.cell_value(r, c)).strip()
        res = parse_cell(v)
        if res and res.get('code'):
            print(f"[{res['type']}] Code: {res['code']} | Fac: {res['faculty']} | Ven: {res['venue']} | Batches: {res['batches']}")
