# Descarga los documentos de cada hecho de importancia depurado y busca términos en su texto
import requests, json, os, re, subprocess, csv, time, hashlib
os.makedirs('smv/out/txt', exist_ok=True)
H = json.load(open('smv/hechos_universo.json', encoding='utf-8'))
S = requests.Session(); S.headers['User-Agent'] = 'Mozilla/5.0 (investigacion academica)'
PAT = {'dispensa': r'dispens', 'resguardo': r'resguardo', 'covenant': r'covenant', 'waiver': r'waiver',
       'ratio': r'\bratio', 'incumplimiento': r'incumpl', 'obligaciones financieras': r'obligaciones financieras',
       'compromisos financieros': r'compromisos financieros', 'aceleracion': r'acelera|vencimiento anticipado',
       'evento de incumplimiento': r'evento[s]? de incumplimiento'}
rows = []
for h in H:
    docs = [d for d in h['documentos'].split(' | ') if d]
    texto = ''
    for i, u in enumerate(docs):
        fn = f"smv/out/txt/{h['expediente']}_{i}"
        try:
            r = S.get(u, timeout=120)
            ct = r.headers.get('content-type', '')
            raw = fn + ('.pdf' if (r.content[:4] == b'%PDF') else '.bin')
            open(raw, 'wb').write(r.content)
            if raw.endswith('.pdf'):
                subprocess.run(['pdftotext', '-layout', raw, fn + '.txt'], timeout=120)
                t = open(fn + '.txt', encoding='utf-8', errors='ignore').read() if os.path.exists(fn + '.txt') else ''
            else:
                t = r.content.decode('utf-8', errors='ignore') if 'text' in ct or 'html' in ct else ''
                open(fn + '.txt', 'w', encoding='utf-8').write(t)
            os.remove(raw)
            texto += '\n' + t
        except Exception as e:
            texto += f'\n[ERROR {e}]'
        time.sleep(0.5)
    low = texto.lower()
    hits = {k: len(re.findall(p, low)) for k, p in PAT.items()}
    snip = ''
    for k in ('dispens', 'resguardo', 'covenant', 'waiver', 'ratio'):
        m = re.search(k, low)
        if m: snip = re.sub(r'\s+', ' ', texto[max(0, m.start() - 250): m.end() + 350]); break
    rows.append({'unidad': h['unidad'], 'empresa': h['empresa'], 'expediente': h['expediente'], 'fecha_presentacion': h['fecha_presentacion'],
                 'fecha_acuerdo': h['fecha_acuerdo'], 'descripcion': h['descripcion'], 'n_docs': len(docs), 'chars': len(texto),
                 **{f'h_{k}': v for k, v in hits.items()}, 'fragmento': snip})
    print(h['expediente'], len(docs), len(texto), {k: v for k, v in hits.items() if v}, flush=True)
cols = list(rows[0].keys())
with open('smv/out/documentos_terminos.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(rows)
