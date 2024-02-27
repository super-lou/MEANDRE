from flask import Flask, request, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from flask_cors import CORS

import numpy as np
import subprocess
import json


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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
    SELECT palette
    FROM variables
    WHERE variable_en = :variable;
    """
    result = connection.execute(
        text(sql_query),
        {'variable': variable}
    )
    rows = result.fetchall()
    Palette = rows[0][0]
    Palette = Palette.split(" ")

    q01Delta = np.quantile(Delta, 0.01)
    q99Delta = np.quantile(Delta, 0.99)

    command = [
        "Rscript",
        "compute_color.R",
        "--min", str(q01Delta),
        "--max", str(q99Delta),
        "--delta", json.dumps(Delta),
        "--palette", json.dumps(Palette)
    ]
    process = subprocess.Popen(command,
                           stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    output, error = process.communicate()
    Fill = output.decode().strip().split('\n')

    for i, d in enumerate(data):
        d['fill'] = Fill[i]

    
    connection.close()
    
    # Return the data as JSON response
    response = jsonify({'data': data})
    return response

if __name__ == '__main__':
    app.run(debug=True)





Palette = list(['#543005', '#8C510A', '#BF812D', '#DFC27D', '#F6E8C3', '#C7EAE5', '#80CDC1', '#35978F', '#01665E', '#003C30'])

data = np.array([{'code': 'Y603561001', 'delta': -7.79405570774717},
                 {'code': 'Y604201001', 'delta': -9.83602093231473},
                 {'code': 'Y611050000', 'delta': -6.84004845313229},
                 {'code': 'Y611501001', 'delta': -8.8980261995047},
                 {'code': 'Y612501201', 'delta': -6.66320155043784},
                 {'code': 'Y620581301', 'delta': -13.7629691066986}])

Code = [item['code'] for item in data]
Delta = [item['delta'] for item in data]

q01Delta = np.quantile(Delta, 0.01)
q99Delta = np.quantile(Delta, 0.99)



command = [
    "Rscript",
    "compute_color.R",
    "--min", str(q01Delta),
    "--max", str(q99Delta),
    "--delta", json.dumps(Delta),
    "--palette", json.dumps(Palette)
]
process = subprocess.Popen(command,
                           stdout=subprocess.PIPE,
                           stderr=subprocess.PIPE)
output, error = process.communicate()
output = output.decode().strip().split('\n')



