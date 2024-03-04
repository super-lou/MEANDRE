import logging
from logging.handlers import RotatingFileHandler
from flask import Flask

app = Flask(__name__)

# Configure the root logger
logging.basicConfig(level=logging.DEBUG)

# Configure a file handler for additional logging to a file
file_handler = RotatingFileHandler('/tmp/app.log', maxBytes=1024 * 1024, backupCount=10)
file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
file_handler.setLevel(logging.DEBUG)
app.logger.addHandler(file_handler)

@app.route('/')
def hello():
    app.logger.debug('This is a debug message')
    app.logger.info('This is an info message')
    app.logger.warning('This is a warning message')
    app.logger.error('This is an error message')
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
