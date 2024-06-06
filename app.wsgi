#!/usr/bin/python3
import sys
import logging
import os
from dotenv import load_dotenv

load_dotenv(os.path.join("/var/www/MEANDRE/.env"))

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, os.path.join(os.environ.get('SERVER_DIR'), "MEANDRE"))

from app import app as application
