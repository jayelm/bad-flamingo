
import urllib.request
from pathlib import Path

data_dir = Path('/local/sdd/nm583/quickdraw_data')

URL_TEMPLATE = \
  'https://storage.googleapis.com/quickdraw_dataset/full/numpy_bitmap/{}.npy'
for line in open('categories.txt'):
  cat = line.strip()
  cat = cat.replace(' ', '%20')
  url = URL_TEMPLATE.format(cat)
  with (data_dir / '{}.npy'.format(cat)).open('wb') as f:
    response = urllib.request.urlopen(url)
    f.write(response.read())
  print(cat)

