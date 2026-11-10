# Reconocimiento del portal de hechos de importancia de la SMV
import requests, os, re, json
from bs4 import BeautifulSoup
os.makedirs('smv/out', exist_ok=True)
H = {'User-Agent': 'Mozilla/5.0 (investigacion academica)'}
URLS = {
 'hi_all': 'https://www.smv.gob.pe/SIMV/Frm_hechosdeImportanciaAll?data=38C2EC33FA106691BB5B5039DACFDF50795D8EC3AF',
 'hi_tit': 'https://www.smv.gob.pe/simv/Frm_HechosDeImportancia?data=EEB95830B46F362B76DD0EEC80872C6C6CD0C00068',
}
log = {}
for k, u in URLS.items():
    try:
        r = requests.get(u, headers=H, timeout=60)
        open(f'smv/out/{k}.html', 'w', encoding='utf-8').write(r.text)
        s = BeautifulSoup(r.text, 'lxml')
        fields = [(i.name, i.get('name'), i.get('type'), (i.get('value') or '')[:60]) for i in s.find_all(['input', 'select', 'textarea'])]
        sel = {x.get('name'): [(o.get('value'), o.text.strip()) for o in x.find_all('option')][:15] for x in s.find_all('select')}
        log[k] = {'status': r.status_code, 'len': len(r.text), 'fields': fields, 'selects': sel,
                  'forms': [(f.get('action'), f.get('method')) for f in s.find_all('form')],
                  'scripts': [x.get('src') for x in s.find_all('script') if x.get('src')]}
    except Exception as e:
        log[k] = {'error': repr(e)}
json.dump(log, open('smv/out/recon.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(log, ensure_ascii=False)[:3000])
