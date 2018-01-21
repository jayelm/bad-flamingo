
import numpy as np
from pathlib import Path

import keras

data_dir = Path('/local/sdd/nm583/quickdraw_data')

labels = []
with Path('categories.txt').open() as f:
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

per_image_labels = []
for label, image_stack in zip(labels, image_stacks):
  per_image_labels += [label_to_int[label]] * len(image_stack)

images = np.vstack(image_stacks)
del image_stacks
images = images.reshape([-1, 28, 28, 1])
image_labels = np.array(per_image_labels)

print(images.shape, image_labels.shape)
 
# Shuffling
np.random.seed(7)
indices = np.arange(len(images))
np.random.shuffle(indices)
images = images[indices]
image_labels = image_labels[indices]
image_labels = keras.utils.to_categorical(image_labels, len(labels))

from keras.models import Model
from keras.layers import Conv2D, Input, GlobalAveragePooling2D, Concatenate, LeakyReLU, Dense, BatchNormalization, Dropout

def DenseNetLayer(*args, **kwargs):
  conv = Conv2D(*args, **kwargs, activation='linear', padding='same')
  act = LeakyReLU(0.1)
  cat = Concatenate(axis=-1)
  return lambda x: cat([act(conv(x)), x])

net_input = Input([28, 28, 1])
net = net_input
net = BatchNormalization()(net)
net = Dropout(0.1)(net)
net = DenseNetLayer(64, [5, 5], dilation_rate=1)(net)
net = BatchNormalization()(net)
net = Dropout(0.1)(net)
net = DenseNetLayer(64, [5, 5], dilation_rate=2)(net)
net = BatchNormalization()(net)
net = Dropout(0.1)(net)
net = DenseNetLayer(64, [5, 5], dilation_rate=3)(net)
net = BatchNormalization()(net)
net = Dropout(0.1)(net)
net = DenseNetLayer(64, [1, 1], dilation_rate=1)(net)
net = BatchNormalization()(net)
net = GlobalAveragePooling2D()(net)
net = Dropout(0.1)(net)
net = Dense(len(labels), activation='softmax')(net)
model = Model([net_input], [net])
model.compile('rmsprop', loss='categorical_crossentropy', metrics=['acc'])
model.summary()

checkpointer = keras.callbacks.ModelCheckpoint(
  'checkpoints/weights.{epoch:02d}-{val_loss:.2f}.hdf5', verbose=1, 
   save_weights_only=False, mode='auto', period=1)

model.fit(images, image_labels, batch_size=32, epochs=20, 
          validation_split=0.15, callbacks=[checkpointer])
