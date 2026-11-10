# Búsqueda de hechos de importancia en el portal de la SMV por término y periodo
import requests, os, re, json, csv, time
from bs4 import BeautifulSoup
os.makedirs('smv/out', exist_ok=True)
C = json.load(open('smv/config.json', encoding='utf-8'))
URL = C['url']
S = requests.Session(); S.headers['User-Agent'] = 'Mozilla/5.0 (investigacion academica)'
GRID = 'ctl00$MainContent$grdHechosImportancia2'

def hidden(soup):
    return {i['name']: i.get('value', '') for i in soup.find_all('input', {'type': 'hidden'}) if i.get('name') and 'grdTh' not in i['name']}

def form(soup, term, d1, d2):
    f = hidden(soup)
    f.update({'ctl00$MainContent$cboTipoEmpresa': '000', 'ctl00$MainContent$cboSector': '-1', 'ctl00$MainContent$TextBox2': 'TODOS',
              'ctl00$MainContent$cboDenominacionSocial': '-2', 'ctl00$MainContent$Tipo': 'HI', 'ctl00$MainContent$TextBox1': 'TODOS',
              'ctl00$MainContent$cboTipoHechos': '%', 'ctl00$MainContent$txtBusquedaDesc': term,
              'ctl00$MainContent$txtFechDesde': d1, 'ctl00$MainContent$txtFechHasta': d2})
    return f

def cards(soup):
    out = []
    grid = soup.find(id='MainContent_grdHechosImportancia2')
    if not grid: return out
    for sp in grid.find_all('span', class_='titulo-empresa-azul'):
        emp = sp.get_text(' ', strip=True)
        tr = sp.find_parent('tr')
        for cb in tr.find_all('div', class_='card-body'):
            head = cb.find('p', class_='text-blue').get_text(' ', strip=True) if cb.find('p', class_='text-blue') else ''
            m = re.search(r'EXP\.\s*(\d+)\s+DEL\s+(\d\d/\d\d/\d{4})\s+(\d\d:\d\d)', head)
            tipo = cb.find('h5').get_text(' ', strip=True) if cb.find('h5') else ''
            fa = re.search(r'Fecha de acuerdo:\s*(\d\d/\d\d/\d{4})', cb.get_text(' ', strip=True))
            desc = cb.find('p', class_='card-text').get_text(' ', strip=True) if cb.find('p', class_='card-text') else ''
            docs = [a['href'] for a in cb.find_all('a', href=True) if 'documento.aspx' in a['href']]
            out.append({'empresa': emp, 'expediente': m.group(1) if m else '', 'fecha_presentacion': m.group(2) if m else '',
                        'hora': m.group(3) if m else '', 'encabezado': head, 'tipo': tipo,
                        'fecha_acuerdo': fa.group(1) if fa else '', 'descripcion': desc, 'documentos': ' | '.join(docs)})
    return out

def pages(soup):
    return sorted({int(p) for p in re.findall(r'Page\$(\d+)', str(soup))})

s0 = BeautifulSoup(S.get(URL, timeout=90).text, 'lxml')
filas, resumen = [], []
for term in C['terminos']:
    for d1, d2 in C['periodos']:
        f = form(s0, term, d1, d2); f['ctl00$MainContent$btnBuscar'] = 'Buscar'
        try:
            soup = BeautifulSoup(S.post(URL, data=f, timeout=180).text, 'lxml')
        except Exception as e:
            resumen.append([term, d1, d2, 'ERROR', 0, repr(e)]); continue
        got = cards(soup); seen = {1}; n_pag = 1
        while True:
            nxt = [p for p in pages(soup) if p not in seen]
            if not nxt: break
            p = nxt[0]; seen.add(p)
            f2 = form(soup, term, d1, d2); f2.update({'__EVENTTARGET': GRID, '__EVENTARGUMENT': f'Page${p}'})
            try:
                soup = BeautifulSoup(S.post(URL, data=f2, timeout=180).text, 'lxml')
            except Exception as e:
                resumen.append([term, d1, d2, 'ERROR_PAG', p, repr(e)]); break
            got += cards(soup); n_pag += 1; time.sleep(1)
        for g in got:
            filas.append({'termino': term, 'desde': d1, 'hasta': d2, **g})
        resumen.append([term, d1, d2, len(got), n_pag, ''])
        print(term, d1, d2, len(got), 'hechos', n_pag, 'pag', flush=True)
        time.sleep(1)
cols = ['termino', 'desde', 'hasta', 'empresa', 'expediente', 'fecha_presentacion', 'hora', 'fecha_acuerdo', 'tipo', 'descripcion', 'documentos', 'encabezado']
with open('smv/out/resultados.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(filas)
with open('smv/out/resumen.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['termino', 'desde', 'hasta', 'hechos', 'paginas', 'nota']); w.writerows(resumen)
json.dump({'consultado': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'url': URL, 'terminos': C['terminos'], 'periodos': C['periodos']},
          open('smv/out/metadatos.json', 'w'), indent=1)
