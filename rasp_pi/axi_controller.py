from pyaxidraw import axidraw

# setup axidraw
axi = axidraw.AxiDraw()

def plot_svg(svg_string):
    global axi

    enable_motors()
    axi.plot_setup(svg_string)
    axi.plot_run()  

def stop_plot():
    global axi

    axi.connect()
    axi.pause()
    axi.moveto(0, 0)
    disable_motors()
    axi.disconnect()

def disable_motors():
    global axi

    axi.penup()
    axi.plot_setup()
    axi.options.mode = "manual"
    axi.options.manual_cmd = "disable_xy"
    axi.plot_run()

def enable_motors():
    global axi

    axi.penup()
    axi.plot_setup()
    axi.options.mode = "manual"
    axi.options.manual_cmd = "enable_xy"
    axi.plot_run()

