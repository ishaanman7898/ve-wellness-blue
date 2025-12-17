import tkinter as tk

root = tk.Tk()
root.title("X / Y & Window Info Tracker")
root.geometry("600x400")

label = tk.Label(
    root,
    text="Move your mouse or resize the window",
    font=("Consolas", 12),
    justify="left"
)
label.pack(padx=20, pady=20, anchor="nw")

def update_info(event=None):
    mouse_x = root.winfo_pointerx() - root.winfo_rootx()
    mouse_y = root.winfo_pointery() - root.winfo_rooty()

    screen_x = root.winfo_pointerx()
    screen_y = root.winfo_pointery()

    window_width = root.winfo_width()
    window_height = root.winfo_height()

    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()

    info = f"""
Mouse (Window):
  X: {mouse_x}
  Y: {mouse_y}

Mouse (Screen):
  X: {screen_x}
  Y: {screen_y}

Window Size:
  Width: {window_width}
  Height: {window_height}

Screen Size:
  Width: {screen_width}
  Height: {screen_height}
"""
    label.config(text=info)

# Update when mouse moves
root.bind("<Motion>", update_info)

# Update when window is resized
root.bind("<Configure>", update_info)

update_info()
root.mainloop()
