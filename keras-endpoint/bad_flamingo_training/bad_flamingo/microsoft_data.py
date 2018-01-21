
import numpy as np
from pathlib import Path
from PIL import Image as pil_image

data_dir = Path('/local/sdd/nm583/quickdraw_data')
output_dir = Path('/local/sdd/nm583/microsoft_quickdraw') 

labels = []
with Path('microsoft-labels.txt').open() as f:
  for line in f:
    labels.append(line.strip())
labels = labels
label_to_int = {label: i for i, label in enumerate(labels)}

image_stacks = []
for i, label in enumerate(labels):
  label = label.replace(' ', '%20')
  image_loc = data_dir / '{}.npy'.format(label)
  image_stacks.append(np.load(image_loc))
  print(i, len(labels))

for label, image_stack in zip(labels, image_stacks):
  image_stack = image_stack.reshape([-1, 28, 28, 1])
  indices = np.arange(len(image_stack))
  np.random.shuffle(indices)
  image_stack = image_stack[indices]
  image_stack = image_stack[:100]
  label_dir = output_dir / label
  label_dir.mkdir(exist_ok=True)
  for image_n, image_array in enumerate(image_stack):
    three_chan = np.zeros((*image_array.shape[:-1], 3), dtype=np.uint8)
    for i in range(3):
      three_chan[:, :, i] = np.squeeze(image_array)
    image = pil_image.fromarray(three_chan)
    save_loc = label_dir / '{}.png'.format(image_n)
    image.save(str(save_loc))
