import xlrd, re, json, os

SUBJECT_TITLES = {
    # CI - Computer Science & IT
    '25B11CI112': 'Software Development Fundamentals (SDF)',
    '25BC1CI112': 'Software Development Fundamentals (SDF)',
    '25BC1CI113': 'Computer Programming & Problem Solving',
    '25B17CI172': 'Software Development Fundamentals Lab (SDF Lab)',
    '25BC7CI172': 'Computer Programming Lab',
    '25B11CI311': 'Object-Oriented Programming (OOP)',
    '25B11CI312': 'Data Structures & Algorithms (DSA)',
    '25B11CI313': 'Computer Organization & Architecture (COA)',
    '25B17CI373': 'Computer Organization Lab',
    '25B17CI375': 'Data Structures Lab (DSA Lab)',
    '18B11CI211': 'Data Structures & Algorithms',
    '18B11CI313': 'Database Management Systems (DBMS)',
    '18B17CI373': 'DBMS Lab',
    '18B11CI411': 'Operating Systems',
    '18B11CI611': 'Design & Analysis of Algorithms (DAA)',
    '18B11CI612': 'Computer Networks',
    '18B11CI613': 'Software Engineering',
    '25B11CI514': 'Operating Systems (OS)',
    '25B11CI517': 'Computer Networks (CN)',
    '25B11CI575': 'Operating Systems Lab',
    '25B17CI573': 'Computer Networks Lab',
    '25B18CI574': 'Full Stack Web Development Lab',
    '25B1WCI538': 'Cloud Computing & Virtualization',
    '25B1WCI573': 'Cloud Computing Lab',
    '25B1WCI574': 'Machine Learning Lab',
    '25B1WCI576': 'DevOps & Agile Methodologies Lab',
    '25B1WCI740': 'Artificial Intelligence & Machine Learning',
    '25B1WCI742': 'Information & Cyber Security',
    '18B1WCI772': 'AI & Machine Learning Project Lab',
    '22M11CI111': 'Advanced Algorithms & Analysis',
    '22M17CI171': 'Advanced Computing Lab',
    # MA - Mathematics
    '25B11MA111': 'Mathematics-I (Calculus & Analytical Geometry)',
    '25B11MA112': 'Mathematics-I (Engineering Calculus)',
    '25B11MA113': 'Mathematics-I (Calculus & Linear Algebra)',
    '18B11MA111': 'Mathematics-I',
    '25B11MA211': 'Mathematics-II (Differential Equations & Transforms)',
    '18B11MA313': 'Discrete Mathematics',
    '18B11MA314': 'Probability & Random Processes',
    '20MS1MA111': 'Mathematical Foundations of Computing',
    '22M11MA111': 'Applied Advanced Mathematics',
    # PH - Physics
    '25B11PH111': 'Engineering Physics (Mechanics & Electrodynamics)',
    '25B11PH112': 'Engineering Physics (Waves & Modern Physics)',
    '25B17PH171': 'Engineering Physics Laboratory',
    '18B17PH111': 'Physics Lab',
    '18B17PH271': 'Advanced Physics Lab',
    '18B1WPH731': 'Nanomaterials & Quantum Tech (OE)',
    # EC - Electronics & Communication
    '25B11EC111': 'Basic Electrical & Electronics Engineering',
    '25B11EC112': 'Basic Electrical Science',
    '25B17EC171': 'Basic Electrical & Electronics Lab',
    '18B17EC271': 'Basic Electronics Lab',
    '18B11EC212': 'Signals & Systems',
    '18B11EC313': 'Digital Circuit Design',
    '18B17EC373': 'Digital Electronics Lab',
    '25B11EC512': 'Microprocessors & Embedded Systems',
    '25B11EC514': 'Analog & Digital Communication Systems',
    '25B11EC516': 'Electromagnetic Fields & Waves',
    '25B1WEC541': 'VLSI Design & Systems',
    '20B1WEC731': 'Internet of Things (IoT) Systems',
    '20B1WEC734': 'Wireless & Mobile Communication',
    '18B1WEC847': 'Embedded System Design',
    '18B1WEC850': 'Satellite & Optical Communications',
    # HS - Humanities & Social Sciences
    '25B11HS111': 'English Communication Skills',
    '23BB1HS113': 'Business Communication',
    '24B11HS311': 'Professional Communication & Soft Skills',
    '24B11HS511': 'Industrial Management & Economics',
    '24B11HS512': 'Human Values & Professional Ethics',
    '24B11HS513': 'Sociology & Organizational Behaviour',
    '24BB1HS511': 'Managerial Economics',
    '24BB1HS512': 'Marketing Management',
    '25BBWHS533': 'Business Law & Corporate Governance',
    '25BBWHS534': 'Entrepreneurship & Innovation',
    '24B1WHS732': 'Philosophy & Cognitive Sciences (OE)',
    'HSNEW1': 'Modern Professional Communication',
    # BT & BI - Biotech & Bioinformatics
    '25BS1BT112': 'Biochemical Engineering Foundations',
    '25B11BT511': 'Immunology & Immunotechnology',
    '25B1WBT531': 'Genomics & Proteomics',
    '25B1WBT532': 'Bio-Separation Technologies',
    '25B11BI511': 'Structural Bioinformatics',
    '25B17BI571': 'Bioinformatics Lab',
    '19B1WBT732': 'Bioprocess Technology (OE)',
    '21B1WBT731': 'Biomedical Instrumentation (OE)',
    '18B1WBI731': 'Drug Design & Molecular Modeling',
    '14B1WBT739': 'Environmental Biotechnology',
    '20MS1BT111': 'Advanced Molecular Biology',
    '20MS1BT112': 'Cell Biology & Genetics',
    '20MS1BT115': 'Enzyme Technology & Kinetics',
    '20MS1BT312': 'Recombinant DNA Technology',
    '20MS1BT315': 'Applied Microbial Genetics',
    '20MS7BT372': 'Molecular Biology Lab',
    '24P1WBT272': 'Advanced Research Lab',
    '25P1WBT232': 'Doctoral Seminar in Biotech',
    # CE - Civil Engineering
    '25B11CE313': 'Mechanics of Solids',
    '25B11CE513': 'Structural Analysis-I',
    '25B11CE514': 'Design of Concrete Structures',
    '25B1WCE531': 'Hydrology & Water Resources Engineering',
    '18B1WCE732': 'Earthquake Resistant Structures',
    '22B1WCE733': 'Environmental Impact Assessment',
    '25M11CE111': 'Advanced Structural Design',
    '25M11CE113': 'Finite Element Analysis in Civil',
    '25M11CE114': 'Construction Technology & Management',
    '26M11CE111': 'Transportation System Planning',
    '26M11CE114': 'Advanced Foundation Engineering',
    '14M31CE113': 'Bridge Engineering',
    '14M31CE114': 'Disaster Management & Mitigation',
    '14M31CE116': 'Pavement Design & Analysis',
    # GE & General
    '25B17GE171': 'Engineering Workshop Lab',
    '25B17GE172': 'Engineering Drawing & Computer-Aided Drafting (CAD)',
    '18B17GE173': 'Engineering Graphics Lab',
    '18P1WGE101': 'Research Methodology & Ethics',
    # Management & MBA
    'MBA1': 'Financial Management',
    '26PMS301': 'Quantum Mechanics & Applications',
    '26PMS302': 'Solid State Devices',
    '26PMS303': 'Mathematical Physics',
    '26PMS304': 'Electrodynamics & Optics'
}

VENUE_CATALOG = {
    'CR01': {'name': 'Classroom 01', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR02': {'name': 'Classroom 02', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR03': {'name': 'Classroom 03', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR04': {'name': 'Classroom 04', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR05': {'name': 'Classroom 05', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR06': {'name': 'Classroom 06', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR07': {'name': 'Classroom 07', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR08': {'name': 'Classroom 08', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR09': {'name': 'Classroom 09', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR10': {'name': 'Classroom 10', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR11': {'name': 'Classroom 11', 'building': 'Academic Block 3', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR12': {'name': 'Classroom 12', 'building': 'Academic Block 3', 'floor': 'Ground Floor', 'type': 'Lecture Hall'},
    'CR13': {'name': 'Classroom 13', 'building': 'Academic Block 3', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR14': {'name': 'Classroom 14', 'building': 'Academic Block 3', 'floor': '1st Floor', 'type': 'Lecture Hall'},
    'CR16': {'name': 'Classroom 16', 'building': 'Academic Block 3', 'floor': '2nd Floor', 'type': 'Lecture Hall'},
    'CR17': {'name': 'Classroom 17', 'building': 'Academic Block 3', 'floor': '2nd Floor', 'type': 'Lecture Hall'},
    'CR18': {'name': 'Classroom 18', 'building': 'Academic Block 3', 'floor': '2nd Floor', 'type': 'Lecture Hall'},
    'CR19': {'name': 'Classroom 19', 'building': 'Academic Block 3', 'floor': '3rd Floor', 'type': 'Lecture Hall'},
    'CR20': {'name': 'Classroom 20', 'building': 'Academic Block 3', 'floor': '3rd Floor', 'type': 'Lecture Hall'},
    'LT1': {'name': 'Lecture Theatre 1', 'building': 'Academic Block 2', 'floor': '1st Floor', 'type': 'Tiered Amphitheatre'},
    'LT2': {'name': 'Lecture Theatre 2', 'building': 'Academic Block 2', 'floor': '1st Floor', 'type': 'Tiered Amphitheatre'},
    'LT3': {'name': 'Lecture Theatre 3', 'building': 'Academic Block 2', 'floor': '2nd Floor', 'type': 'Tiered Amphitheatre'},
    'DLC': {'name': 'Distance Learning Classroom', 'building': 'Academic Block 1', 'floor': 'Ground Floor (Adjacent CR01)', 'type': 'Smart Auditorium'},
    'DLC,CR01': {'name': 'Distance Learning Classroom & CR01', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Smart Auditorium'},
    'DLC,LT2': {'name': 'DLC & LT2 Combined', 'building': 'Academic Block 1 & 2', 'floor': 'Ground/1st Floor', 'type': 'Combined Lecture Hall'},
    'DLC,CR09': {'name': 'DLC & CR09 Combined', 'building': 'Academic Block 1', 'floor': 'Ground/1st Floor', 'type': 'Combined Lecture Hall'},
    'LANGULAB': {'name': 'Language Communication Lab', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Language & Soft Skills Lab'},
    'GDROOM': {'name': 'Group Discussion Room', 'building': 'Academic Block 1', 'floor': '1st Floor (HSS Dept)', 'type': 'Interactive Seminar Room'},
    'WORKLAB1': {'name': 'Engineering Workshop 1 (Machining & Welding)', 'building': 'Workshop Complex', 'floor': 'Ground Floor', 'type': 'Mechanical Workshop'},
    'WORKLAB2': {'name': 'Engineering Workshop 2 (Fitting & Carpentry)', 'building': 'Workshop Complex', 'floor': 'Ground Floor', 'type': 'Mechanical Workshop'},
    'CAD,DRAWR': {'name': 'CAD & Engineering Drawing Hall', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'Graphics & CAD Lab'},
    'DRAWR': {'name': 'Engineering Drawing Hall', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'Drafting Studio'},
    'PHLAB1': {'name': 'Physics Laboratory 1', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Physics Lab'},
    'PHLAB2': {'name': 'Physics Laboratory 2', 'building': 'Academic Block 1', 'floor': 'Ground Floor', 'type': 'Optics Lab'},
    'ECL1': {'name': 'Electronics Lab 1 (Circuits & Devices)', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'ECE Hardware Lab'},
    'ECL2': {'name': 'Electronics Lab 2 (Digital Design)', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'ECE Hardware Lab'},
    'ECL3': {'name': 'Electronics Lab 3 (Microprocessors)', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'ECE Embedded Lab'},
    'ECL7': {'name': 'Communication & Microwave Lab', 'building': 'Academic Block 1', 'floor': '3rd Floor', 'type': 'ECE Communication Lab'},
    'CL04': {'name': 'Computer Lab 04', 'building': 'Academic Block 2', 'floor': '2nd Floor', 'type': 'Computer Lab'},
    'CL06': {'name': 'Computer Lab 06', 'building': 'Academic Block 2', 'floor': '2nd Floor', 'type': 'Computer Lab'},
    'CL07': {'name': 'Computer Lab 07', 'building': 'Academic Block 2', 'floor': '2nd Floor', 'type': 'Computer Lab'},
    'CL10': {'name': 'Computer Lab 10', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'Computer Lab'},
    'CL11': {'name': 'Computer Lab 11', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'Computer Lab'},
    'CL1A': {'name': 'Computer Lab 1A', 'building': 'Academic Block 2', 'floor': 'Ground Floor', 'type': 'Programming Lab'},
    'CL1B': {'name': 'Computer Lab 1B', 'building': 'Academic Block 2', 'floor': 'Ground Floor', 'type': 'Programming Lab'},
    'CL31': {'name': 'Computer Lab 31', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'Specialized Computing Lab'},
    'CL52': {'name': 'Computer Lab 52', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'DSA & System Lab'},
    'ALAB1': {'name': 'Advanced Computing Lab 1', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'AI / Project Lab'},
    'ALAB2': {'name': 'Advanced Computing Lab 2', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'Deep Learning Lab'},
    'DLAB': {'name': 'Development & Research Lab', 'building': 'Academic Block 2', 'floor': '3rd Floor', 'type': 'Software Dev Lab'},
    'BIL': {'name': 'Bioinformatics Infrastructure Lab', 'building': 'Academic Block 3', 'floor': '1st Floor', 'type': 'Computational Biology Lab'},
    'GENOMELAB': {'name': 'Genomics & Proteomics Lab', 'building': 'Academic Block 3', 'floor': '2nd Floor', 'type': 'Biotech Research Lab'},
    'MICROLAB': {'name': 'Microbiology & Cell Biology Lab', 'building': 'Academic Block 3', 'floor': '2nd Floor', 'type': 'Wet Lab'},
    'TR1': {'name': 'Tutorial Room 1', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Tutorial Room'},
    'TR2': {'name': 'Tutorial Room 2', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Tutorial Room'},
    'TR3': {'name': 'Tutorial Room 3', 'building': 'Academic Block 1', 'floor': '1st Floor', 'type': 'Tutorial Room'},
    'TR4': {'name': 'Tutorial Room 4', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'Tutorial Room'},
    'TR5': {'name': 'Tutorial Room 5', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'Tutorial Room'},
    'TR6': {'name': 'Tutorial Room 6', 'building': 'Academic Block 1', 'floor': '2nd Floor', 'type': 'Tutorial Room'},
    'TR8': {'name': 'Tutorial Room 8', 'building': 'Academic Block 3', 'floor': '1st Floor', 'type': 'Tutorial Room'},
    'TR9': {'name': 'Tutorial Room 9', 'building': 'Academic Block 3', 'floor': '2nd Floor', 'type': 'Tutorial Room'},
    'CABIN': {'name': 'Faculty Cabin Discussion', 'building': 'Academic Block 1 & 3', 'floor': 'Faculty Wing', 'type': 'Consultation Cabin'},
    'UG2': {'name': 'Undergraduate Lab 2', 'building': 'Academic Block 3', 'floor': 'Ground Floor', 'type': 'Specialized Lab'}
}

def guess_subject_title(code):
    if code in SUBJECT_TITLES:
        return SUBJECT_TITLES[code]
    for k, v in SUBJECT_TITLES.items():
        if k in code:
            return v
    # Department fallback
    if 'CI' in code or 'CS' in code:
        return f"Computer Science Course ({code})"
    elif 'MA' in code:
        return f"Mathematics Course ({code})"
    elif 'PH' in code:
        return f"Physics Course ({code})"
    elif 'EC' in code:
        return f"Electronics & Comm. Course ({code})"
    elif 'HS' in code:
        return f"Humanities & Social Science ({code})"
    elif 'BT' in code:
        return f"Biotechnology Course ({code})"
    elif 'BI' in code:
        return f"Bioinformatics Course ({code})"
    elif 'CE' in code:
        return f"Civil Engineering Course ({code})"
    elif 'GE' in code:
        return f"Engineering Practice ({code})"
    return f"Course {code}"

def parse_cell_string(cell_str):
    cell_str = cell_str.strip()
    if not cell_str or re.match(r'^[0-9.]+$', cell_str) or cell_str == 'NEW':
        return None
    
    m = re.match(r'^([LPT])\s*-\s*([0-9A-Za-z_/-]+)\s*(.*)$', cell_str)
    if not m:
        return None
    
    type_char = m.group(1)
    type_name = 'Lecture' if type_char == 'L' else ('Tutorial' if type_char == 'T' else 'Lab / Practical')
    type_code = 'L' if type_char == 'L' else ('T' if type_char == 'T' else 'P')
    code = m.group(2)
    rest = m.group(3).strip()
    
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
            
    batches = []
    # Match patterns like 26BT01, 25A11.., 24A110, 23A11, 26Q11, 26W11, 26MB11, etc.
    raw_tokens = re.findall(r'\b(2[0-9][A-Za-z0-9_.]+)\b', batches_part)
    for tok in raw_tokens:
        tok_clean = tok.rstrip('.')
        if tok_clean not in batches:
            batches.append(tok_clean)
            
    # Correction for known Excel omission: SDF lecture in CR09 taught by RTY is for batch 26BT25
    if not batches:
        if code == '25B11CI112' and faculty == 'RTY' and 'CR09' in venue:
            batches = ['26BT25']
            batches_part = '26BT25'
        elif 'ALL' in batches_part.upper():
            batches = ['ALL']
        elif batches_part:
            batches = [batches_part]

    venue_clean = venue.strip()
    venue_info = VENUE_CATALOG.get(venue_clean, {
        'name': f"Venue {venue_clean}" if venue_clean else 'Campus Venue',
        'building': 'Academic Complex',
        'floor': 'Campus Facility',
        'type': 'Classroom / Lab'
    })

    return {
        'type': type_code,
        'typeName': type_name,
        'code': code,
        'subject': guess_subject_title(code),
        'batches': batches,
        'batchesRaw': batches_part,
        'faculty': faculty,
        'venue': venue_clean,
        'venueDetails': venue_info
    }

def process_timetable_file(filename, sem_term):
    if not os.path.exists(filename):
        return {}
    wb = xlrd.open_workbook(filename)
    results = {}
    for sname in wb.sheet_names():
        if 'TTEntry' in sname:
            continue
        sh = wb.sheet_by_name(sname)
        
        # header
        header_row = None
        for r in range(min(6, sh.nrows)):
            vals = [str(sh.cell_value(r, c)).strip() for c in range(sh.ncols)]
            if any('AM' in v or 'PM' in v for v in vals):
                header_row = r
                break
        if header_row is None:
            continue
            
        time_cols = {}
        for c in range(1, sh.ncols):
            t = str(sh.cell_value(header_row, c)).strip()
            if 'AM' in t or 'PM' in t:
                # Normalize time slot: e.g. '09:00 AM - 09:55 AM'
                time_cols[c] = t
                
        day_rows = {}
        days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        for r in range(header_row + 1, sh.nrows):
            d_val = str(sh.cell_value(r, 0)).strip()
            if d_val in days:
                day_rows[d_val] = r
                
        sheet_entries = []
        all_batches_set = set()
        
        for day, r_start in day_rows.items():
            next_rows = [r2 for r2 in day_rows.values() if r2 > r_start]
            r_end = min(next_rows) if next_rows else sh.nrows
            for r in range(r_start, r_end):
                for c, t_str in time_cols.items():
                    val = str(sh.cell_value(r, c)).strip()
                    parsed = parse_cell_string(val)
                    if parsed and parsed.get('code'):
                        parsed['day'] = day
                        parsed['time'] = t_str
                        parsed['colIndex'] = c
                        sheet_entries.append(parsed)
                        for b in parsed['batches']:
                            all_batches_set.add(b)
                            
        # Clean up semester name
        sem_id = sname.replace(' ', '_').replace(',', '').replace(';', '').lower()
        results[sem_id] = {
            'id': sem_id,
            'title': sname,
            'term': sem_term,
            'batches': sorted(list(all_batches_set)),
            'timeSlots': list(dict.fromkeys(time_cols.values())),
            'entries': sheet_entries
        }
    return results

def build_all_timetable_data():
    all_data = {}
    
    # ODD Sem 2026
    odd_data = process_timetable_file('ODDSEMTT2026.xls', 'ODD 2026 (Active)')
    for k, v in odd_data.items():
        all_data[f"odd_{k}"] = v
        
    # EVEN Sem 2026
    even_data = process_timetable_file('EVENSEM2026.xls', 'EVEN 2026-27')
    for k, v in even_data.items():
        all_data[f"even_{k}"] = v
        
    # SUMMER Sem 2026
    summer_data = process_timetable_file('SUMMERSEM2026TT.xls', 'SUMMER 2026')
    for k, v in summer_data.items():
        all_data[f"summer_{k}"] = v
        
    return all_data

def build_mess_data():
    return {
        "title": "Annapurna Dining Hall Weekly Menu",
        "month": "October 2026",
        "mealTimings": {
            "breakfast": {
                "label": "Breakfast",
                "start": "07:30",
                "end": "09:30",
                "display": "07:30 AM – 09:30 AM",
                "locations": "Annapurna Dining Halls (Boys & Girls)"
            },
            "lunch": {
                "label": "Lunch",
                "start": "12:00",
                "end": "14:00",
                "display": "12:00 PM – 02:00 PM",
                "locations": "Annapurna Dining Halls"
            },
            "dinner": {
                "label": "Dinner",
                "start": "19:30",
                "end": "21:00",
                "display": "07:30 PM – 09:00 PM",
                "locations": "Annapurna Dining Halls"
            },
            "nightMilk": {
                "label": "Night Milk Distribution",
                "start": "21:15",
                "end": "21:45",
                "display": "09:15 PM – 09:45 PM",
                "locations": "Geeta Bhawan, Malviya-B, Dining Hall 1, Azad & Shastri Extension"
            }
        },
        "milkDistribution": [
            {
                "group": "GIRLS",
                "timing": "09:15PM TO 09:45PM",
                "place": "Geeta Bhawan, Geeta Bhawan Extention & Malviya - B"
            },
            {
                "group": "BOYS",
                "timing": "09:15PM TO 09:45PM",
                "place": "Dinning hall no. 1 & First Year Dining Hall"
            },
            {
                "group": "BOYS",
                "timing": "07:30 PM to 08:30 pm",
                "place": "Azad & Shastri Extention"
            }
        ],
        "importantNotice": "The menu may deviate in unavoidable circumstances. Please do not carry fruits / eatables outside the dining hall — Do not waste food.",
        "weeklyMenu": {
            "Monday": {
                "dayCode": "MON",
                "breakfast": {
                    "items": ["Aaloo Sandwich", "Poha", "Dalia", "Boiled Egg", "Kala Chana Chaat", "Bread", "Butter", "Jam", "Cold Coffee", "Apple"],
                    "highlights": ["Fresh Apple", "Chilled Cold Coffee", "Boiled Egg", "Kala Chana Chaat"],
                    "fruit": "Apple",
                    "category": "Sandwich & Cold Coffee Breakfast"
                },
                "lunch": {
                    "items": ["Dal Rajmah", "Mix Veg.", "Plain Curd", "Tandoori Roti & Plain Chapati", "Rice", "Salad"],
                    "highlights": ["Himachali Dal Rajmah", "Fresh Plain Curd", "Tandoori Roti & Plain Chapati"]
                },
                "dinner": {
                    "items": ["Dal Arhar", "Matar Mushroom", "Tandoori Roti & Plain Chapati", "Rice", "Corn Salad", "Green Chutney", "Veg. Soup"],
                    "sweetDish": "Moong Dal Halwa, Hot Milk",
                    "sweet": "Moong Dal Halwa",
                    "highlights": ["Desi Ghee Moong Dal Halwa", "Matar Mushroom Special", "Hot Milk", "Veg. Soup"]
                }
            },
            "Tuesday": {
                "dayCode": "TUE",
                "breakfast": {
                    "items": ["Stuffed Parantha", "Curd", "Macaroni", "Sprouts (Chat Masala)", "Bread", "Butter", "Jam", "Pickle", "Tea"],
                    "highlights": ["Hot Stuffed Parantha", "Fresh Curd", "Macaroni", "Sprouts (Chat Masala)"],
                    "category": "North Indian Parantha & Curd Breakfast"
                },
                "lunch": {
                    "items": ["Choley Bhature", "Pakodi with Saunth Chutney / Dahi Vada", "Rice", "Lemon Onion Salad", "Apple Golden"],
                    "fruit": "Apple Golden",
                    "highlights": ["Choley Bhature Special", "Dahi Vada / Pakodi with Saunth", "Apple Golden"]
                },
                "dinner": {
                    "items": ["Dal Chana Urad", "Malai Kofta", "Tandoori & Multi Grain Chapati", "Rice", "Salad"],
                    "sweetDish": "Fruit Custard, Hot Milk",
                    "sweet": "Fruit Custard",
                    "highlights": ["Royal Malai Kofta", "Chilled Fruit Custard", "Multi Grain Chapati", "Hot Milk"]
                }
            },
            "Wednesday": {
                "dayCode": "WED",
                "breakfast": {
                    "items": ["Bread Pakora / Bread Roll", "Veg Semiya", "Dalia", "Kala Chana Chaat", "Bread", "Butter", "Jam", "Tea", "Banana"],
                    "fruit": "Banana",
                    "highlights": ["Crispy Bread Pakora / Roll", "Fresh Banana", "Kala Chana Chaat"],
                    "category": "Campus Special Bread Pakora Breakfast"
                },
                "lunch": {
                    "items": ["Aaloo Methi", "Kadhi Pakora", "Tandoori Roti & Plain Chapati", "Rice", "Salad", "Papad"],
                    "highlights": ["Kadhi Pakora Special", "Fresh Aaloo Methi", "Crispy Papad"]
                },
                "dinner": {
                    "items": ["Dal Moong Malka", "Egg Bhurji / Egg Curry", "Soya Chap", "Tandoori Roti & Plain Chapati", "Veg. Pulao", "Salad"],
                    "sweetDish": "Semiya, Hot Milk",
                    "sweet": "Semiya",
                    "highlights": ["Egg Curry / Egg Bhurji", "Soya Chap Curry", "Sweet Semiya", "Hot Milk"]
                }
            },
            "Thursday": {
                "dayCode": "THU",
                "breakfast": {
                    "items": ["Poori", "Aaloo Tomato Sabji", "Cornflakes", "Boiled Egg", "Sprouts (Chat Masala)", "Bread", "Butter", "Jam", "Milk", "Tea"],
                    "highlights": ["Hot Poori Aaloo Sabji", "Boiled Egg", "High Protein Sprouts"],
                    "category": "Festive Poori Aaloo Feast"
                },
                "lunch": {
                    "items": ["Dal Lobia(Rongi)", "Matar Paneer", "Boondi Raita", "Tandoori Roti & Plain Chapati", "Rice", "Salad", "Apple Golden"],
                    "fruit": "Apple Golden",
                    "highlights": ["Matar Paneer", "Chilled Boondi Raita", "Dal Lobia (Rongi)", "Apple Golden"]
                },
                "dinner": {
                    "items": ["Dal Makhani", "Aaloo Gobhi", "Tandoori Roti & Plain Chapati", "Rice", "Salad", "Green Chutney"],
                    "sweetDish": "Gulab Jamun, Hot Milk",
                    "sweet": "Gulab Jamun",
                    "highlights": ["Creamy Dal Makhani", "Hot Gulab Jamun", "Aaloo Gobhi", "Hot Milk"]
                }
            },
            "Friday": {
                "dayCode": "FRI",
                "breakfast": {
                    "items": ["Idli", "Sambhar", "Vada", "Coconut Chutney", "Upma", "Kala Chana Chaat ( Onion + Tomato)", "Bread", "Butter", "Jam", "Tea", "Banana"],
                    "fruit": "Banana",
                    "highlights": ["Steaming Idli, Sambhar & Crispy Vada", "Coconut Chutney & Upma", "Fresh Banana"],
                    "category": "South Indian Weekend Morning Feast"
                },
                "lunch": {
                    "items": ["Dal Kala Chana", "Aloo Shimla Mirch", "Veg Raita", "Tandoori Roti & Plain Chapati", "Rice", "Salad"],
                    "highlights": ["Dal Kala Chana", "Aloo Shimla Mirch", "Chilled Veg Raita"]
                },
                "dinner": {
                    "items": ["Dal Green Moong Sabut", "Chilli Paneer", "Tandoori Roti & Plain Chapati", "Rice", "Salad"],
                    "sweetDish": "Rice Kheer, Hot Milk",
                    "sweet": "Rice Kheer",
                    "highlights": ["Indo-Chinese Chilli Paneer", "Traditional Rice Kheer", "Dal Green Moong Sabut", "Hot Milk"]
                }
            },
            "Saturday": {
                "dayCode": "SAT",
                "breakfast": {
                    "items": ["Ajwain Methi Parantha", "Aaloo Tomato Sabji", "Poha", "Sprouts (Chat Masala)", "Bread", "Butter", "Jam", "Cold Coffee"],
                    "highlights": ["Ajwain Methi Parantha with Aaloo Sabji", "Chilled Cold Coffee", "Poha"],
                    "category": "Ajwain Methi Parantha & Cold Coffee Morning"
                },
                "lunch": {
                    "items": ["Dal Sabut Masoor", "Mix Veg.", "Tandoori Roti & Plain Chapati", "Rice", "Corn Salad", "Lassi", "Fruit Chaat"],
                    "highlights": ["Sweet Chilled Lassi", "Tangy Fruit Chaat", "Corn Salad", "Dal Sabut Masoor"]
                },
                "dinner": {
                    "items": ["Dal Maharani", "Aloo Beans", "Tandoori Roti & Plain Chapati", "Veg Pulao", "Salad", "Tomato/Mushroom Soup"],
                    "sweetDish": "Besan Ladoo, Hot Milk",
                    "sweet": "Besan Ladoo",
                    "highlights": ["Dal Maharani", "Tomato/Mushroom Soup", "Fragrant Veg Pulao", "Besan Ladoo", "Hot Milk"]
                }
            },
            "Sunday": {
                "dayCode": "SUN",
                "breakfast": {
                    "items": ["Aaloo Bonda / Burger", "Red Sauce Pasta", "Cornflakes", "Omlette", "Bread", "Butter", "Jam", "Milk", "Tea", "Banana"],
                    "fruit": "Banana",
                    "highlights": ["Aaloo Bonda / Burger", "Italian Red Sauce Pasta", "Fresh Fluffy Omlette", "Fresh Banana"],
                    "category": "Sunday Grand Brunch"
                },
                "lunch": {
                    "items": ["Paneer Onion Paratha / Dal / Matar Kachori", "Aaloo Tomato Sabji", "Plain Curd", "Veg Biryani"],
                    "highlights": ["Paneer Onion Paratha / Matar Kachori", "Aromatic Veg Biryani", "Fresh Plain Curd"]
                },
                "dinner": {
                    "items": ["Dal Chana Masala", "Chilli Nutri / Sarson Saag", "Tandoori Roti & Plain Chapati", "Rice", "Green Chutney", "Salad"],
                    "sweetDish": "Amul Kulfi - Rajasthani / Kashmiri, Hot Milk",
                    "sweet": "Amul Kulfi (Rajasthani / Kashmiri)",
                    "highlights": ["Amul Kulfi - Rajasthani / Kashmiri", "Chilli Nutri / Sarson Saag", "Dal Chana Masala", "Hot Milk"]
                }
            }
        }
    }

def build_calendar_data():
    return {
        "institution": "Jaypee University of Information Technology, Waknaghat, Solan (H.P.)",
        "academicYear": "2026 - 2027",
        "notificationRef": "JUIT/WKG/REGR/2026-27/0935 (02 June 2026)",
        "semesters": {
            "odd2026": {
                "name": "ODD Semester 2026",
                "termCode": "ODD-2026",
                "active": True,
                "startDate": "2026-07-20",
                "endDate": "2026-12-15",
                "milestones": [
                    {
                        "category": "registration",
                        "title": "Registration (Online Mode)",
                        "target": "BTech, BBA, BCA 2nd, 3rd, and Final Year",
                        "dates": "17 & 18 Jul 2026",
                        "status": "Completed"
                    },
                    {
                        "category": "commencement",
                        "title": "Commencement of Classes (2nd, 3rd, Final Year)",
                        "target": "All Continuing Students",
                        "dates": "20 Jul 2026",
                        "status": "Ongoing"
                    },
                    {
                        "category": "freshers",
                        "title": "Induction Program for BTech 1st Year",
                        "target": "Freshers 2026 Batch",
                        "dates": "21 - 25 Jul 2026",
                        "status": "Completed"
                    },
                    {
                        "category": "commencement",
                        "title": "Commencement of Classes for First Year",
                        "target": "BTech 1st Year Entry",
                        "dates": "27 Jul 2026",
                        "status": "Ongoing"
                    },
                    {
                        "category": "cultural",
                        "title": "Diksha (Fresher Induction Welcome)",
                        "target": "JYC / All Students",
                        "dates": "05 Aug 2026",
                        "status": "Completed"
                    },
                    {
                        "category": "exam",
                        "title": "T1 Examination Schedule",
                        "target": "All UG & PG Students",
                        "dates": "31 Aug - 09 Sep 2026",
                        "status": "Completed"
                    },
                    {
                        "category": "academic",
                        "title": "Showing of T1 Evaluated Answer Sheets",
                        "target": "All Students & Faculty",
                        "dates": "16 Sep 2026",
                        "status": "Completed"
                    },
                    {
                        "category": "fest",
                        "title": "Murious / Innovate to Excel 2026",
                        "target": "Flagship Technical Fest & Hackathon",
                        "dates": "24 - 26 Sep 2026",
                        "status": "Imminent (In 2 Days!)",
                        "isUpcoming": True
                    },
                    {
                        "category": "sports",
                        "title": "Parakram 2026 (Annual Sports Meet)",
                        "target": "Inter-Batch Sports Tournament (JYC)",
                        "dates": "01 - 04 Oct 2026",
                        "status": "Upcoming",
                        "isUpcoming": True
                    },
                    {
                        "category": "academic",
                        "title": "Attendance Review Before T2 Exam",
                        "target": "Dean (A) Office",
                        "dates": "09 Oct 2026",
                        "status": "Upcoming",
                        "isUpcoming": True
                    },
                    {
                        "category": "exam",
                        "title": "T2 Examination Schedule (Mid-Term)",
                        "target": "All Batches",
                        "dates": "10 - 19 Oct 2026",
                        "status": "Major Examination",
                        "isUpcoming": True
                    },
                    {
                        "category": "academic",
                        "title": "Showing of T2 Evaluated Answer Sheets",
                        "target": "Faculty & Students",
                        "dates": "29 Oct 2026",
                        "status": "Upcoming"
                    },
                    {
                        "category": "vacation",
                        "title": "Mid-Semester Break (Diwali Vacation)",
                        "target": "All Students",
                        "dates": "02 Nov - 09 Nov 2026",
                        "status": "Holiday Vacation",
                        "isUpcoming": True
                    },
                    {
                        "category": "exam",
                        "title": "Make-Up Examination (All Eligible)",
                        "target": "Controller of Examinations (COE)",
                        "dates": "16 - 19 Nov 2026",
                        "status": "Special Exam"
                    },
                    {
                        "category": "academic",
                        "title": "Submission of Final Year Projects / Dissertations",
                        "target": "BTech 7th Sem, MSc, MTech",
                        "dates": "20 Nov 2026",
                        "status": "Submission Deadline"
                    },
                    {
                        "category": "academic",
                        "title": "Final Project Viva-Voce",
                        "target": "BTech, MSc, MTech",
                        "dates": "23 - 27 Nov 2026",
                        "status": "Viva Evaluation"
                    },
                    {
                        "category": "academic",
                        "title": "Attendance Review Before T3 Exam",
                        "target": "Dean (A) Office",
                        "dates": "25 Nov 2026",
                        "status": "Mandatory Review"
                    },
                    {
                        "category": "academic",
                        "title": "Classes to be Over With Effect From",
                        "target": "All Academic Departments",
                        "dates": "01 Dec 2026",
                        "status": "Teaching Concludes"
                    },
                    {
                        "category": "exam",
                        "title": "T3 Examination Schedule (End-Term Final Exams)",
                        "target": "All Semesters (UG, PG, PhD)",
                        "dates": "02 - 15 Dec 2026",
                        "status": "End Semester Exams"
                    },
                    {
                        "category": "academic",
                        "title": "Declaration of Results by Registrar",
                        "target": "All Students",
                        "dates": "24 Dec 2026",
                        "status": "Official Result Day"
                    },
                    {
                        "category": "vacation",
                        "title": "Winter Vacation",
                        "target": "All Students",
                        "dates": "19 Dec 2026 - 05 Jan 2027",
                        "status": "Campus Vacation"
                    }
                ],
                "holidays": [
                    {"name": "Independence Day", "date": "15 Aug 2026", "day": "Saturday"},
                    {"name": "Raksha-Bandhan", "date": "28 Aug 2026", "day": "Friday"},
                    {"name": "Janmashtami", "date": "04 Sep 2026", "day": "Friday"},
                    {"name": "Gandhi Jayanti", "date": "02 Oct 2026", "day": "Friday"},
                    {"name": "Dussehra", "date": "20 Oct 2026", "day": "Tuesday"},
                    {"name": "Diwali", "date": "06 - 07 Nov 2026", "day": "Friday & Saturday"},
                    {"name": "Govardhan Puja", "date": "09 Nov 2026", "day": "Monday"},
                    {"name": "Guru Nanak Jayanti", "date": "24 Nov 2026", "day": "Tuesday"},
                    {"name": "Christmas", "date": "25 Dec 2026", "day": "Friday"}
                ]
            },
            "even2027": {
                "name": "EVEN Semester 2027",
                "termCode": "EVEN-2027",
                "active": False,
                "startDate": "2027-01-07",
                "endDate": "2027-05-29",
                "milestones": [
                    {
                        "category": "registration",
                        "title": "Registration (Online Mode)",
                        "target": "All Semesters",
                        "dates": "06 & 07 Jan 2027",
                        "status": "Scheduled"
                    },
                    {
                        "category": "commencement",
                        "title": "Commencement of Classes",
                        "target": "All Batches (UG & PG)",
                        "dates": "07 Jan 2027",
                        "status": "Scheduled"
                    },
                    {
                        "category": "exam",
                        "title": "T1 Examination Schedule",
                        "target": "All Students",
                        "dates": "08 - 15 Feb 2027",
                        "status": "Mid-Semester T1"
                    },
                    {
                        "category": "fest",
                        "title": "Parakram 2027 / Annual Sports Meet",
                        "target": "Campus Sports",
                        "dates": "04 - 06 Mar 2027",
                        "status": "Scheduled"
                    },
                    {
                        "category": "vacation",
                        "title": "Mid-Semester Break (Holi Vacation)",
                        "target": "All Students",
                        "dates": "20 Mar - 25 Mar 2027",
                        "status": "Holi Break"
                    },
                    {
                        "category": "exam",
                        "title": "T2 Examination Schedule",
                        "target": "All Batches",
                        "dates": "29 Mar - 07 Apr 2027",
                        "status": "Mid-Semester T2"
                    },
                    {
                        "category": "fest",
                        "title": "Le-Fiestus 2027 (Annual Cultural Fest)",
                        "target": "North India's Renowned Campus Cultural Fest",
                        "dates": "30 Apr - 02 May 2027",
                        "status": "Flagship Cultural Fest"
                    },
                    {
                        "category": "academic",
                        "title": "Classes Conclude",
                        "target": "Teaching Ends",
                        "dates": "18 May 2027",
                        "status": "Scheduled"
                    },
                    {
                        "category": "exam",
                        "title": "T3 Examination Schedule (Finals)",
                        "target": "All Semesters",
                        "dates": "19 - 29 May 2027",
                        "status": "Final Exams"
                    },
                    {
                        "category": "academic",
                        "title": "Declaration of Results",
                        "target": "All Students",
                        "dates": "07 June 2027",
                        "status": "Results Declared"
                    },
                    {
                        "category": "vacation",
                        "title": "Summer Vacation",
                        "target": "All Students",
                        "dates": "03 June - 18 Jul 2027",
                        "status": "Summer Break"
                    }
                ],
                "holidays": [
                    {"name": "HP Statehood Day", "date": "25 Jan 2027", "day": "Monday"},
                    {"name": "Republic Day", "date": "26 Jan 2027", "day": "Tuesday"},
                    {"name": "Mahashivratri", "date": "06 Mar 2027", "day": "Saturday"},
                    {"name": "Id-ul-Fitr", "date": "09 Mar 2027", "day": "Tuesday"},
                    {"name": "Holi", "date": "22 - 23 Mar 2027", "day": "Monday & Tuesday"},
                    {"name": "Ambedkar Jayanti", "date": "14 Apr 2027", "day": "Wednesday"},
                    {"name": "Himachal Day", "date": "15 Apr 2027", "day": "Thursday"},
                    {"name": "Ram Navami", "date": "16 Apr 2027", "day": "Friday"},
                    {"name": "Mahavir Jayanti", "date": "19 Apr 2027", "day": "Monday"},
                    {"name": "Buddha Purnima", "date": "20 May 2027", "day": "Thursday"}
                ]
            }
        }
    }

def build_campus_directory():
    return {
        "institution": "Jaypee University of Information Technology, Waknaghat, Solan",
        "campusOverview": {
            "name": "JUIT Waknaghat Campus",
            "location": "Waknaghat, P.O. Dumehar, Tehsil Kandaghat, District Solan, H.P. - 173234",
            "elevation": "1,550 meters above sea level",
            "campusArea": "25 scenic hill acres"
        },
        "buildings": [
            {
                "id": "block1",
                "name": "Academic Block 1",
                "code": "AB1",
                "category": "academic",
                "coordinates": {"x": 320, "y": 310, "w": 130, "h": 90},
                "icon": "school",
                "color": "#3b82f6",
                "summary": "Main Academic Complex housing Classrooms CR01-CR10, Tutorial Rooms TR1-TR7, Physics Labs, Electronics Labs, and Language Lab.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Classrooms CR01, CR02, CR03, CR04, CR05", "Distance Learning Classroom (DLC / Smart Hall)", "Physics Laboratories (PHLAB1, PHLAB2)", "Dean Academics Office Annex"]},
                    {"level": "1st Floor", "facilities": ["Classrooms CR06, CR07, CR08, CR09, CR10", "Language Communication Lab (LANGULAB)", "Group Discussion & Placement Room (GDROOM)", "Tutorial Rooms TR1, TR2, TR3"]},
                    {"level": "2nd Floor", "facilities": ["Electronics & Hardware Labs (ECL1, ECL2, ECL3)", "Computer-Aided Drafting & Drawing Hall (CAD, DRAWR)", "Tutorial Rooms TR4, TR5, TR6"]},
                    {"level": "3rd Floor", "facilities": ["Communication & Microwave Lab (ECL7)", "Tutorial Room TR7", "ECE Faculty Cabins"]}
                ]
            },
            {
                "id": "block2",
                "name": "Academic Block 2 (Lecture Theatres & Computing Centre)",
                "code": "AB2",
                "category": "academic",
                "coordinates": {"x": 480, "y": 270, "w": 140, "h": 100},
                "icon": "computer",
                "color": "#8b5cf6",
                "summary": "Tiered Lecture Theatres LT1-LT3, Main Computer Centre, High Performance Computing Labs CL01-CL52, and AI/Project Labs.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Central Server Room & IT Network Control", "Computer Labs CL1A, CL1B (Introductory & Programming Labs)", "Student Project Work Area"]},
                    {"level": "1st Floor", "facilities": ["Lecture Theatre 1 (LT1 - Tiered Amphitheatre)", "Lecture Theatre 2 (LT2 - Tiered Amphitheatre)", "Faculty Cabins (CSE & IT Department)"]},
                    {"level": "2nd Floor", "facilities": ["Lecture Theatre 3 (LT3 - 250 Seater Multimedia Hall)", "Computer Labs CL04, CL06, CL07", "Data Engineering & Systems Labs"]},
                    {"level": "3rd Floor", "facilities": ["Computer Labs CL10, CL11, CL31, CL52", "Advanced Computing Labs (ALAB1, ALAB2)", "DevOps & Software Engineering Lab (DLAB)"]}
                ]
            },
            {
                "id": "block3",
                "name": "Academic Block 3 (Biotech, Civil & Research Labs)",
                "code": "AB3",
                "category": "academic",
                "coordinates": {"x": 650, "y": 310, "w": 130, "h": 90},
                "icon": "biotech",
                "color": "#10b981",
                "summary": "Specialized Biotech, Bioinformatics, Genomics, Concrete & Environmental Engineering Labs, plus CR11-CR20.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Classrooms CR11, CR12", "Undergraduate Lab UG2", "Civil Heavy Structures & Concrete Technology Lab", "Surveying & Geotechnical Lab"]},
                    {"level": "1st Floor", "facilities": ["Classrooms CR13, CR14", "Bioinformatics Infrastructure Lab (BIL)", "Tutorial Room TR8", "Environmental Engineering Lab"]},
                    {"level": "2nd Floor", "facilities": ["Classrooms CR16, CR17, CR18", "Microbiology & Cell Biology Lab (MICROLAB)", "Genomics & Proteomics Lab (GENOMELAB)", "Tutorial Room TR9"]},
                    {"level": "3rd Floor", "facilities": ["Classrooms CR19, CR20", "Plant Tissue Culture & Bioprocess Lab", "Tutorial Room TR10", "Civil & Biotech Faculty Chambers"]}
                ]
            },
            {
                "id": "lrc",
                "name": "Learning Resource Centre (LRC / Central Library)",
                "code": "LRC",
                "category": "library",
                "coordinates": {"x": 410, "y": 170, "w": 120, "h": 80},
                "icon": "local_library",
                "color": "#f59e0b",
                "summary": "Premier 3-floor intellectual hub with over 45,000 volumes, DSpace Digital Library, IEEE & Springer digital access, and 24x7 reading halls.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Circulation Counter & Book Issue/Return", "Reference Book Section", "Newspaper & Popular Magazines Lounge", "LRC Staff & Librarian Office"]},
                    {"level": "1st Floor", "facilities": ["Digital Library Terminal Room (DSpace & E-Resources)", "Previous Year Question Papers (PYQ) Repository", "Main Reading Hall (Silent Study)", "Subject Book Stacks"]},
                    {"level": "2nd Floor", "facilities": ["Journals & Periodicals Archive", "Research Scholar & PhD Discussion Cubicles", "Group Study Zone", "Seminar & Audio-Visual Hall"]}
                ]
            },
            {
                "id": "admin",
                "name": "Administrative Block",
                "code": "ADMIN",
                "category": "admin",
                "coordinates": {"x": 260, "y": 180, "w": 110, "h": 75},
                "icon": "account_balance",
                "color": "#64748b",
                "summary": "University Headquarters housing the Vice-Chancellor, Registrar, Examination Controller, and Student Accounts.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Main Campus Reception & Information Helpdesk", "Student Accounts & Fee Receipt Section", "Bank Extension Counter"]},
                    {"level": "1st Floor", "facilities": ["Controller of Examinations (COE) Office", "Dean of Students (DOS) & Proctorial Board", "Registry & Student Records Branch"]},
                    {"level": "2nd Floor", "facilities": ["Vice-Chancellor (VC) Secretariat", "Registrar Office", "Academic Council & Boardroom"]}
                ]
            },
            {
                "id": "annapurna_a",
                "name": "Annapurna Dining Hall A (Senior Boys & Central Dining)",
                "code": "MESS-A",
                "category": "mess",
                "coordinates": {"x": 360, "y": 450, "w": 130, "h": 85},
                "icon": "restaurant",
                "color": "#ef4444",
                "summary": "Central Annapurna Dining Facility serving warm breakfast, lunch, and dinner to senior students and hostellers.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Dining Hall No. 1 (Seating 600+ students)", "Tandoor & Live Chapati Station", "Self-Service Salad & Curd Counter", "Night Milk Distribution Station 1"]}
                ]
            },
            {
                "id": "annapurna_b",
                "name": "Annapurna Dining Hall B (Girls & 1st Year Dining)",
                "code": "MESS-B",
                "category": "mess",
                "coordinates": {"x": 520, "y": 450, "w": 130, "h": 85},
                "icon": "restaurant_menu",
                "color": "#f97316",
                "summary": "Dedicated dining complex for Girls and First-Year boys, with adjoining tuck shop and canteen.",
                "floors": [
                    {"level": "Ground Floor", "facilities": ["Girls Dining Hall & First-Year Dining Section", "Zero-Maida Diet & Nutrition Counter", "Special Diet Station"]},
                    {"level": "Annex", "facilities": ["Peach Tree Cafeteria & Meet & Treet Tuck Shop", "First Year Boys Night Milk Collection Point", "Late-Night Snacks & Beverage Counter"]}
                ]
            },
            {
                "id": "oat",
                "name": "Open Air Theatre (OAT)",
                "code": "OAT",
                "category": "cultural",
                "coordinates": {"x": 450, "y": 380, "w": 80, "h": 50},
                "icon": "theater_comedy",
                "color": "#ec4899",
                "summary": "Heart of JUIT cultural life: venue for Murious, Le-Fiestus, DJ Nights, Induction Ceremony, and Open Air Student Gatherings.",
                "floors": [
                    {"level": "Ground", "facilities": ["Tiered Stone Amphitheatre", "Central Cultural Stage & Acoustic Wall", "Sound & Lighting Console Deck"]}
                ]
            },
            {
                "id": "hostels_girls",
                "name": "Girls Hostels (Geeta Bhawan & Malviya Bhawan)",
                "code": "GH",
                "category": "hostel",
                "coordinates": {"x": 720, "y": 180, "w": 130, "h": 90},
                "icon": "apartment",
                "color": "#a855f7",
                "summary": "Secure campus living for female scholars with panoramic mountain views and modern hostel amenities.",
                "floors": [
                    {"level": "Complex", "facilities": ["Geeta Bhawan & Geeta Bhawan Extension", "Malviya Bhawan (Blocks A & B)", "Night Milk Distribution Counters (09:15 - 09:45 PM)", "Indoor Badminton, Common Room & Gymnasium"]}
                ]
            },
            {
                "id": "hostels_boys",
                "name": "Boys Hostels (Shastri, Azad, Patel, Subhash)",
                "code": "BH",
                "category": "hostel",
                "coordinates": {"x": 160, "y": 420, "w": 140, "h": 100},
                "icon": "apartment",
                "color": "#06b6d4",
                "summary": "Multi-tier hostel blocks for male students nestled into the hill terrace.",
                "floors": [
                    {"level": "Complex", "facilities": ["Shastri Bhawan", "Azad Bhawan", "Patel Bhawan", "Subhash Bhawan & Bhagat Singh Bhawan", "Reading Lounges, Table Tennis & Laundry Services"]}
                ]
            },
            {
                "id": "sports_complex",
                "name": "Sports Arena & Gymnasium",
                "code": "SPORTS",
                "category": "sports",
                "coordinates": {"x": 680, "y": 440, "w": 110, "h": 75},
                "icon": "sports_basketball",
                "color": "#14b8a6",
                "summary": "Outdoor basketball courts, floodlit volleyball & tennis courts, indoor badminton arena, and university gym.",
                "floors": [
                    {"level": "Ground", "facilities": ["Full Court Basketball Arena (Parakram Main Venue)", "Volleyball Courts", "Indoor Badminton & Table Tennis Room", "Fitness Centre & Gymnasium"]}
                ]
            },
            {
                "id": "dispensary",
                "name": "Dispensary & Health Centre",
                "code": "HEALTH",
                "category": "facility",
                "coordinates": {"x": 200, "y": 280, "w": 90, "h": 60},
                "icon": "local_hospital",
                "color": "#ef4444",
                "summary": "24x7 campus medical dispensary with resident doctor, nursing staff, emergency observation beds, and campus ambulance.",
                "floors": [
                    {"level": "Ground", "facilities": ["OPD Consultation Chamber", "Pharmacy & Medicine Stock", "Observation Beds & First Aid", "24x7 Dedicated Ambulance Bay"]}
                ]
            },
            {
                "id": "main_gate",
                "name": "Main Entrance Gate & PNB ATM",
                "code": "GATE",
                "category": "facility",
                "coordinates": {"x": 100, "y": 160, "w": 90, "h": 60},
                "icon": "security",
                "color": "#64748b",
                "summary": "Campus security check-post on Shimla-Solan highway with 24x7 Punjab National Bank ATM and visitor registry.",
                "floors": [
                    {"level": "Ground", "facilities": ["Campus Security Gatehouse & Visitor Gate Pass Desk", "Punjab National Bank (PNB) 24x7 ATM", "Taxi & Campus Bus Drop-off Bay"]}
                ]
            },
            {
                "id": "viewpoint",
                "name": "Helipad & Shivalik Hill Viewpoint",
                "code": "VIEW",
                "category": "facility",
                "coordinates": {"x": 580, "y": 140, "w": 90, "h": 50},
                "icon": "landscape",
                "color": "#0ea5e9",
                "summary": "Scenic high-altitude ridge overlooking the verdant Solan valley, popular for sunset walks and mountain photography.",
                "floors": [
                    {"level": "Ridge", "facilities": ["Campus Helipad / Open Pavilion", "Panoramic Valley Viewpoint", "Hill Path connecting to Campus Mandir"]}
                ]
            }
        ]
    }

def main():
    print("Building JUIT Student Hub Data...")
    
    timetable = build_all_timetable_data()
    print(f"Compiled Timetable with {len(timetable)} semester sheets.")
    for k, v in timetable.items():
        print(f"  - {k}: {len(v['entries'])} entries, {len(v['batches'])} batches")
        
    mess = build_mess_data()
    print(f"Compiled Annapurna Mess Data for {len(mess['weeklyMenu'])} days.")
    
    calendar = build_calendar_data()
    print(f"Compiled Academic Calendar for {len(calendar['semesters'])} semesters.")
    
    campus = build_campus_directory()
    print(f"Compiled Campus Directory with {len(campus['buildings'])} landmark complexes.")
    
    # Save to data/ and js/data/
    paths = ['data', 'js/data']
    for p in paths:
        os.makedirs(p, exist_ok=True)
        with open(os.path.join(p, 'timetable_data.json'), 'w', encoding='utf-8') as f:
            json.dump(timetable, f, ensure_ascii=False, indent=2)
        with open(os.path.join(p, 'mess_data.json'), 'w', encoding='utf-8') as f:
            json.dump(mess, f, ensure_ascii=False, indent=2)
        with open(os.path.join(p, 'calendar_data.json'), 'w', encoding='utf-8') as f:
            json.dump(calendar, f, ensure_ascii=False, indent=2)
        with open(os.path.join(p, 'campus_data.json'), 'w', encoding='utf-8') as f:
            json.dump(campus, f, ensure_ascii=False, indent=2)
            
    # Also regenerate js/data/bundle.js for unified loading
    bundle_content = f"""// Auto-generated JUIT Student Hub Data Bundle
window.JUIT_DATA = {{
  timetable: {json.dumps(timetable, ensure_ascii=False)},
  mess: {json.dumps(mess, ensure_ascii=False)},
  calendar: {json.dumps(calendar, ensure_ascii=False)},
  campus: {json.dumps(campus, ensure_ascii=False)}
}};
console.log('JUIT Hub Data Bundle successfully initialized.');
"""
    with open('js/data/bundle.js', 'w', encoding='utf-8') as f:
        f.write(bundle_content)
        
    print("Successfully built all data files in data/, js/data/ and js/data/bundle.js!")

if __name__ == '__main__':
    main()
