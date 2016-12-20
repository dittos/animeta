import os
import uuid
import requests
from xml.etree import ElementTree
from django.conf import settings
from wand.image import Image


def download_poster(url):
    filename = uuid.uuid4().hex
    imgpath = os.path.join(settings.MEDIA_ROOT, filename)
    with open(imgpath, 'wb') as fp:
        fp.write(requests.get(url).content)
        return filename


def download_ann_poster(ann_id):
    fn = 'ann' + str(ann_id) + '.jpg'
    imgpath = os.path.join(settings.MEDIA_ROOT, fn)
    info = requests.get('http://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=' + str(ann_id))
    tree = ElementTree.fromstring(info.content)
    fullsrc = None
    for img in tree.findall('.//info[@type="Picture"]/img'):
        src = img.attrib['src']
        if 'full' in src:
            fullsrc = src
        elif 'max' in src and not fullsrc:
            fullsrc = src
    if fullsrc:
        with open(imgpath, 'wb') as fp:
            fp.write(requests.get(fullsrc).content)
        return fn
    return None


def generate_thumbnail(filename, remove_ann_watermark=False):
    path = os.path.join(settings.MEDIA_ROOT, filename)
    thumb_filename = 'thumb/' + filename
    targetpath = os.path.join(settings.MEDIA_ROOT, thumb_filename)

    w = 233
    h = 318
    ann_watermark_h = 13

    # Retina
    w *= 2
    h *= 2

    with Image(filename=path) as img:
        if remove_ann_watermark:
            img.crop(0, 0, img.size[0], img.size[1] - ann_watermark_h)
        img.transform(resize='%dx%d^' % (w, h))
        tw = img.size[0]
        if tw > w:
            img.crop((tw - w) / 2, 0, width=w, height=h)
        img.save(filename=targetpath)

    try:
        os.system('jpegoptim --max 40 --totals %s' % targetpath)
    except:
        pass
    return thumb_filename
