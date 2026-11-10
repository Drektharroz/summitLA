import requests, json, re, os
from bs4 import BeautifulSoup
os.makedirs('smv/out', exist_ok=True)
URL = json.load(open('smv/config.json'))['url']
S = requests.Session(); S.headers['User-Agent'] = 'Mozilla/5.0 (investigacion academica)'
s0 = BeautifulSoup(S.get(URL, timeout=90).text, 'lxml')
def hidden(soup):
    return {i['name']: i.get('value', '') for i in soup.find_all('input', {'type': 'hidden'}) if i.get('name') and 'grdTh' not in i['name']}
def run(tag, emp, term, d1, d2, extra=None):
    f = hidden(s0)
    f.update({'ctl00$MainContent$cboTipoEmpresa': '000', 'ctl00$MainContent$cboSector': '-1', 'ctl00$MainContent$TextBox2': 'TODOS',
              'ctl00$MainContent$cboDenominacionSocial': emp, 'ctl00$MainContent$Tipo': 'HI', 'ctl00$MainContent$TextBox1': 'TODOS',
              'ctl00$MainContent$cboTipoHechos': '%', 'ctl00$MainContent$txtBusquedaDesc': term,
              'ctl00$MainContent$txtFechDesde': d1, 'ctl00$MainContent$txtFechHasta': d2, 'ctl00$MainContent$btnBuscar': 'Buscar'})
    if extra: f.update(extra)
    r = S.post(URL, data=f, timeout=120)
    open(f'smv/out/diag_{tag}.html', 'w', encoding='utf-8').write(r.text)
    s = BeautifulSoup(r.text, 'lxml')
    tabs = [(t.get('id'), len(t.find_all('tr'))) for t in s.find_all('table')]
    return {'tag': tag, 'status': r.status_code, 'no_hay': 'No se encontraron' in r.text, 'tablas': tabs, 'len': len(r.text),
            'msg': (s.find(id='MainContent_lblMsg').get_text(strip=True) if s.find(id='MainContent_lblMsg') else None)}
res = [run('1_scotia_dia', '71436', '', '28/09/2020', '28/09/2020'),
       run('2_todos_dia', '-2', '', '28/09/2020', '28/09/2020'),
       run('3_todos_Asamblea', '-2', 'Asamblea', '28/09/2020', '28/09/2020'),
       run('4_todos_asamblea_mes', '-2', 'asamblea', '01/09/2020', '30/09/2020'),
       run('5_scotia_rango', '71436', '', '01/09/2020', '31/10/2020'),
       run('6_retiradas', '-2', '', '28/09/2020', '28/09/2020', {'ctl00$MainContent$cbxRetiradas': 'on'})]
json.dump(res, open('smv/out/diag.json', 'w'), indent=1)
print(json.dumps(res, indent=1))
