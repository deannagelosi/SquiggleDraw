from pyaxidraw import axidraw
from lxml import etree
from svgpathtools import parse_path


def setup_plotter():
    # setup axidraw
    axi = axidraw.AxiDraw()
    axi.plot_setup()
    axi.options.model = 1

    return axi


def plot_svg(axi, svg_string):
    axi.penup()
    enable_motors(axi)

    # Parse the SVG string
    svg_root = etree.fromstring(svg_string.encode('utf-8'))
    width = float(svg_root.get('width'))
    height = float(svg_root.get('height'))
    print(f"w: ${width}, h ${height}")

    # Calculate the scale factors and center
    new_width = 100
    ratio = height / width
    new_height = ratio * new_width
    scale_x = new_width / width
    scale_y = new_height / height
    translate_x = (new_width - width * scale_x) / 2
    translate_y = (new_height - height * scale_y) / 2

    # Extract the path element from the SVG string
    path_element = svg_root.find(".//{http://www.w3.org/2000/svg}path")
    path_data = path_element.get("d")

    # Transform the SVG path
    path = parse_path(path_data)
    transformed_path = path.scaled(
        scale_x, scale_y).translated(translate_x, translate_y)
    path_element.set("d", transformed_path.d())

    # Convert the modified SVG root back to a string
    transformed_svg_string = etree.tostring(svg_root, encoding='unicode')

    # Send the transformed SVG string to the AxiDraw
    axi.plot_setup(transformed_svg_string)
    axi.plot_run()

# def plot_svg(axi, svg_string):
#     axi.penup()
#     enable_motors(axi)
#     axi.plot_setup(svg_string)
#     axi.plot_run()


def stop_plot(axi):
    axi.plot_setup()
    axi.plot_run()

    axi.moveto(0, 0)
    disable_motors(axi)


def disable_motors(axi):
    axi.penup()
    axi.plot_setup()
    axi.options.mode = "manual"
    axi.options.manual_cmd = "disable_xy"
    axi.plot_run()


def enable_motors(axi):
    axi.penup()
    axi.plot_setup()
    axi.options.mode = "manual"
    axi.options.manual_cmd = "enable_xy"
    axi.plot_run()
