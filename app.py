from flask import Flask, render_template
app = Flask(__name__)


@app.route('/')
def songscape():
    return render_template('songscape.html')
