from flask import Flask, request, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from flask_cors import CORS

import numpy as np
import subprocess
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

current_dir = os.path.dirname(os.path.abspath(__file__))

# Configure the database connection URL
db_url = 'postgresql://dora:Chipeur_arrete_2_chiper@127.0.0.1/explore2'

# Create the engine with a connection pool
engine = create_engine(db_url, poolclass=QueuePool)

@app.route('/', methods=['POST'])
def index_post():
    # Get parameters from the JSON payload
    data = request.json
    n = data.get('n')
    exp = data.get('exp')
    chain = data.get('chain')
    variable = data.get('variable')
    horizon = data.get('horizon')

    connection = engine.connect()

    sql_query = f"""
    WITH hm_average AS (
        SELECT code, gcm, rcm, bc, AVG(value) AS value
        FROM delta_{exp}_{variable}_{horizon}
        WHERE chain IN :chain AND n >= {n}
        GROUP BY code, gcm, rcm, bc
    ),
    bc_average AS (
        SELECT code, AVG(value) AS value
        FROM hm_average
        GROUP BY code, gcm, rcm
    )
    SELECT s.*, b.value
    FROM stations s
    JOIN (
    SELECT code, AVG(value) AS value
    FROM bc_average
    GROUP BY code
    ) b ON s.code = b.code;
    """

    result = connection.execute(
        text(sql_query),
        {'chain': tuple(chain)}
    )
    columns = result.keys()
    rows = result.fetchall()

    data = [{f"{column_name}": value for column_name, value in zip(columns, row)} for row in rows]

    Code = [x['code'] for x in data]
    nCode = len(Code)
    Delta = [x['value'] for x in data]

    sql_query = f"""
    SELECT variable_fr, unit_fr, name_fr, description_fr, method_fr, sampling_period_fr, topic_fr, palette
    FROM variables
    WHERE variable_en = :variable;
    """
    result = connection.execute(
        text(sql_query),
        {'variable': variable}
    )
    columns = result.keys()
    rows = result.fetchall()
    meta = [{f"{column_name}": value for column_name, value in zip(columns, row)} for row in rows][0]
    
    palette = meta['palette']
    palette = palette.split(" ")
    meta['palette'] = palette

    q01Delta = np.quantile(Delta, 0.01)
    q99Delta = np.quantile(Delta, 0.99)


    print(os.path.join(current_dir, "compute_color.R"))
    
    command = [
        "Rscript",
        os.path.join(current_dir, "compute_color.R"),
        "--min", str(q01Delta),
        "--max", str(q99Delta),
        "--delta", json.dumps(Delta),
        "--palette", json.dumps(palette)
    ]
    process = subprocess.Popen(command,
                           stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    output, error = process.communicate()
    Fill = output.decode().strip().split('\n')

    
    print(data)
    print(Fill)
    
    
    for i, d in enumerate(data):
        d['fill'] = Fill[i]

    command = [
        "Rscript",
        os.path.join(current_dir, "compute_bin.R"),
        "--min", str(q01Delta),
        "--max", str(q99Delta),
        "--delta", json.dumps(Delta),
        "--palette", json.dumps(palette)
    ]
    process = subprocess.Popen(command,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    output, error = process.communicate()
    bin = output.decode().strip().split('\n')
    
    connection.close()

    response = {'data': data,
                'bin': bin}
    response.update(meta)
    
    # Return the data as JSON response
    response = jsonify(response)
    return response

if __name__ == '__main__':
    app.run(debug=True)
