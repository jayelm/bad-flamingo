
from flask import Flask
from flask import request
from flask_cors import CORS


import io
import base64

import json

import skimage.transform
import skimage.color
import numpy as np

from PIL import Image as pil_image
from PIL import ImageOps as pil_image_ops

import requests

STUB = 'data:image/png;base64,'

#  import keras
#  from keras.models import Model

#  model_loc = './weights.01-1.08.hdf5'
#  model = keras.models.load_model(model_loc)

#  last_layer = model.layers[-1]
#  print('last layer', last_layer.output)
#  model = Model([model.layers[0].input], [last_layer.output])

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return 'Hello, World!'


MIC_URL = 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.1/Prediction/a4b45311-35e3-4701-b081-938dbdfef456/image?iterationId=d0d2e7da-037d-40b1-aa90-16fad1b4d80d'
MIC_KEY = '79210266c4d949a4b39271fe013a92b0'


@app.route('/classify/', methods=['POST'])
def classify():
    img_url = request.get_json()['requests'][0]['img_url']
    img = decode_img_url(img_url)
    img = crop_img(img)
    return query_mic(img)


def query_mic(img):
    print('calling mic')
    headers = {
        'Prediction-Key': '79210266c4d949a4b39271fe013a92b0',
        'Content-Type': 'application/octet-stream',
    }
    img = to_mic_format(img)
    result = requests.post(MIC_URL, data=img, headers=headers).text
    return result


def decode_img_url(img_url):
    assert img_url.startswith(STUB)
    encoded_img = img_url[len(STUB):]
    #  print('enc', encoded_img)
    bts = base64.b64decode(encoded_img)
    with io.BytesIO(bts) as f:
        img = pil_image.open(f)
        img.load()
    return img


def crop_img(img):
    #  pil_image_ops.invert(img)
    bbox = img.getbbox()
    left, upper, right, lower = bbox
    height, width = img.size
    content_height = abs(upper - lower)
    content_width = abs(right - left)

    content_center = (left + right)/2, (upper + lower)/2
    middle_x, middle_y = content_center
    size = max(content_height, content_width)

    left = middle_x - size/2
    top = middle_y - size/2
    right = middle_x + size/2
    bottom = middle_y + size/2
    img = img.crop((left, top, right, bottom))
    return img


def to_mic_format(img):
    img.resize((28, 28), pil_image.BICUBIC)
    with io.BytesIO() as f:
        img.save(f, 'png')
        bts = f.getvalue()
    return bts


def to_keras_format(img):
    img = np.array(img)
    img = skimage.transform.resize(img, (28, 28))
    img = skimage.color.rgb2grey(img)
    img = img.reshape([28, 28, 1])
    return img
    print(img)

