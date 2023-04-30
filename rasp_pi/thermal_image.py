# import os
# import io
# import ctypes
# from PIL import Image

# cairo_path = "/opt/homebrew/Cellar/cairo/1.16.0_5/lib/libcairo.2.dylib"  # The path found using 'brew info cairo'
# ctypes.CDLL(cairo_path)

# from cairosvg import svg2png

# # Your SVG string
# svg_string = '''
# <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
#   <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
# </svg>
# '''

# # Convert the SVG string to a PNG bytes object
# png_bytes = svg2png(bytestring=svg_string)

# # Create a file-like buffer to read the PNG bytes object
# buffer = io.BytesIO(png_bytes)

# # Open the buffer as an image with PIL
# image = Image.open(buffer)

# # Now, you can use PIL to work with the image, e.g., save as a JPEG or a different format
# image.save('output.jpg', 'JPEG')
