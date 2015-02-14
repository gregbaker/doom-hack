#!/usr/bin/env python

# from http://freeseamlesstextures.com/gallery/

import urllib

def url_for(url):
    data = urllib.urlopen(url).read()
    encoded = urllib.quote(data.encode("base64"))
    return '' + encoded

print "var wall_texture = 'data:image/jpeg;base64,%s'" % (url_for('http://freeseamlesstextures.com/images/12-natural-stone-background-sml.jpg'))
print "var floor_texture = 'data:image/jpeg;base64,%s'" % (url_for('http://freeseamlesstextures.com/images/41-black-asphalt-background-sml.jpg'))
print "var goal_texture = 'data:image/jpeg;base64,%s'" % (url_for('http://freeseamlesstextures.com/images/34-gold-parchment-background-sml.jpg'))


