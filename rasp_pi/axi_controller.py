from pyaxidraw import axidraw

def setup_plotter():
    # setup axidraw
    axi = axidraw.AxiDraw()
    axi.plot_setup()

    return axi

def plot_svg(axi, svg_string):
    axi.penup()
    enable_motors(axi)
    axi.plot_setup(svg_string)
    axi.plot_run()  

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

