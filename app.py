from flask import Flask, request, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from flask_cors import CORS

import numpy as np
import subprocess
import json
import os
from datetime import datetime


def switch_color(color, color_to_find, color_to_switch):
    #switch 12% https://mdigi.tools/darken-color/#f6e8c3
    color = color.upper()
    color_to_find = np.char.upper(color_to_find)
    color_to_switch = np.char.upper(color_to_switch)
    if color in color_to_find:
        color = color_to_switch[color_to_find == color][0]
    return color



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

current_dir = os.path.dirname(os.path.abspath(__file__))

# Configure the database connection URL
db_url = 'postgresql://dora:Chipeur_arrete_2_chiper@127.0.0.1/explore2'

# Create the engine with a connection pool
engine = create_engine(db_url, poolclass=QueuePool)


@app.route('/delta', methods=['POST'])
def delta_post():
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
    connection.close()
    
    columns = result.keys()
    rows = result.fetchall()
    meta = [{f"{column_name}": value for column_name, value in zip(columns, row)} for row in rows][0]
    
    palette = meta['palette']
    palette = palette.split(" ")
    meta['palette'] = palette

    q01Delta = np.quantile(Delta, 0.01)
    q99Delta = np.quantile(Delta, 0.99)

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

    color_to_find = np.array(["#F6E8C3", "#C7EAE5",
                              "#EFE2E9", "#F5E4E2"])
    color_to_switch = np.array(["#EFD695", "#A1DCD3",
                                "#DBBECE", "#E7BDB8"])
    
    for i, d in enumerate(data):
        d['fill'] = Fill[i]
        d['fill_text'] = switch_color(Fill[i],
                                      color_to_find,
                                      color_to_switch)

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
    
    response = {'data': data,
                'bin': bin}
    response.update(meta)
    
    # Return the data as JSON response
    response = jsonify(response)
    return response



@app.route('/serie', methods=['POST'])
def serie_post():
    # Get parameters from the JSON payload
    data = request.json
    code = data.get('code')
    exp = data.get('exp')
    chain = data.get('chain')
    variable = data.get('variable')

    connection = engine.connect()

    sql_query = f"""
    SELECT chain, date, value
    FROM data_{exp}_{variable}
    WHERE chain IN :chain AND code = '{code}';
    """

    result = connection.execute(
        text(sql_query),
        {'chain': tuple(chain)}
    )
    connection.close()
    
    columns = result.keys()
    rows = result.fetchall()

    data = {}
    for row in rows:
        chain = row[0]
        date_str = row[1].strftime("%Y-%m-%d")
        value = row[2]
        
        if chain not in data:
            data[chain] = {
                "chain": chain,
                "color": "#ADABAA",
                "values": []
            }
        data[chain]["values"].append({"x": date_str, "y": value})
    
    data = list(data.values())
    
    response = jsonify(data)
    return response



if __name__ == '__main__':
    app.run(debug=True)
