with open('js/data/initial_data.js', encoding='utf-8') as f:
    for line in f:
        if any(k in line for k in ['title:', 'subject:', 'link:']):
            print(line.strip())
