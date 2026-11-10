# Búsqueda de hechos de importancia en el portal de la SMV por término y periodo
import requests, os, re, json, csv, time
from bs4 import BeautifulSoup
os.makedirs('smv/out', exist_ok=True)
C = json.load(open('smv/config.json', encoding='utf-8'))
S = requests.Session()
S.headers['User-Agent'] = 'Mozilla/5.0 (investigacion academica)'
URL = C['url']

def hidden(soup):
    return {i['name']: i.get('value', '') for i in soup.find_all('input', {'type': 'hidden'}) if i.get('name') and 'grdTh' not in i['name']}

def base_form(soup):
    f = hidden(soup)
    f.update({'ctl00$MainContent$cboTipoEmpresa': '000', 'ctl00$MainContent$cboSector': '-1',
              'ctl00$MainContent$TextBox2': 'TODOS', 'ctl00$MainContent$cboDenominacionSocial': '-2',
              'ctl00$MainContent$cbxRetiradas': 'on', 'ctl00$MainContent$Tipo': 'HI',
              'ctl00$MainContent$TextBox1': 'TODOS', 'ctl00$MainContent$cboTipoHechos': '%',
              'ctl00$MainContent$rbVigente': 'on'})
    return f

def parse(soup):
    rows = []
    for tb in soup.find_all('table'):
        tid = tb.get('id') or ''
        if 'grdTh' in tid: continue
        trs = tb.find_all('tr')
        if len(trs) < 2: continue
        for tr in trs:
            tds = tr.find_all('td', recursive=False)
            if len(tds) < 3: continue
            txt = [td.get_text(' ', strip=True) for td in tds]
            links = [a.get('href') for a in tr.find_all('a') if a.get('href') and 'Page$' not in (a.get('href') or '')]
            rows.append({'tabla': tid, 'celdas': txt, 'links': links})
    pages = sorted(set(re.findall(r"Page\$(\d+)", str(soup))), key=int)
    return rows, pages

def pager_target(soup):
    m = re.search(r"__doPostBack\('([^']+)','Page\$\d+'\)", str(soup).replace('&#39;', "'"))
    return m.group(1) if m else None

r = S.get(URL, timeout=90); soup0 = BeautifulSoup(r.text, 'lxml')
out, resumen = [], []
for term in C['terminos']:
    for d1, d2 in C['periodos']:
        soup = soup0
        f = base_form(soup)
        f.update({'ctl00$MainContent$txtBusquedaDesc': term, 'ctl00$MainContent$txtFechDesde': d1,
                  'ctl00$MainContent$txtFechHasta': d2, 'ctl00$MainContent$btnBuscar': 'Buscar'})
        try:
            r = S.post(URL, data=f, timeout=120)
        except Exception as e:
            resumen.append([term, d1, d2, 'ERROR', repr(e)]); continue
        soup = BeautifulSoup(r.text, 'lxml')
        if C.get('debug_una_consulta') and not os.path.exists('smv/out/debug_resultado.html'):
            open('smv/out/debug_resultado.html', 'w', encoding='utf-8').write(r.text)
        rows, pages = parse(soup)
        allrows = list(rows); seen = {'1'}
        tgt = pager_target(soup)
        while tgt:
            nxt = [p for p in pages if p not in seen]
            if not nxt: break
            p = nxt[0]; seen.add(p)
            f2 = base_form(soup)
            f2.update({'__EVENTTARGET': tgt, '__EVENTARGUMENT': 'Page$' + p,
                       'ctl00$MainContent$txtBusquedaDesc': term, 'ctl00$MainContent$txtFechDesde': d1, 'ctl00$MainContent$txtFechHasta': d2})
            r = S.post(URL, data=f2, timeout=120); soup = BeautifulSoup(r.text, 'lxml')
            rr, pages2 = parse(soup); allrows += rr; pages = sorted(set(pages) | set(pages2), key=int)
            time.sleep(1)
        for x in allrows:
            out.append([term, d1, d2, x['tabla']] + x['celdas'] + [' | '.join(x['links'])])
        resumen.append([term, d1, d2, len(allrows), len(seen)])
        print(term, d1, d2, len(allrows), 'filas', len(seen), 'paginas', flush=True)
        time.sleep(1)
with open('smv/out/resultados.csv', 'w', newline='', encoding='utf-8') as fh:
    csv.writer(fh).writerows(out)
with open('smv/out/resumen.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['termino', 'desde', 'hasta', 'filas', 'paginas']); w.writerows(resumen)
