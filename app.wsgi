#!/usr/bin/python3
import sys
import logging
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, os.getenv('SERVER_DIR'))

from app import app as application
