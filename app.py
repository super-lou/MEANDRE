from flask import Flask, request, jsonify, render_template, send_file
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from flask_cors import CORS

import numpy as np
import subprocess
import json
import os
from datetime import datetime
import pandas as pd
# from scipy.interpolate import interp1d
# from scipy.interpolate import UnivariateSpline
import rpy2.robjects as robjects


name_of_storylines = np.array([
    "historical-rcp85_HadGEM2-ES_ALADIN63_ADAMONT",
    "historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT",
    "historical-rcp85_EC-EARTH_HadREM3-GA7_ADAMONT",
    "historical-rcp85_HadGEM2-ES_CCLM4-8-17_ADAMONT"
])
color_of_storylines = np.array([
    "#569A71",
    "#EECC66",
    "#E09B2F",
    "#791F5D"
])

  
def switch_color(color, color_to_find, color_to_switch):
    #switch 12% https://mdigi.tools/darken-color/#f6e8c3
    color = color.upper()
    color_to_find = np.char.upper(color_to_find)
    color_to_switch = np.char.upper(color_to_switch)
    if color in color_to_find:
        color = color_to_switch[color_to_find == color][0]
    return color


# app = Flask(__name__)
app = Flask(__name__, static_url_path='', static_folder='static')

CORS(app, resources={r"/*": {"origins": "*"}})
current_dir = os.path.dirname(os.path.abspath(__file__))
R_dir = os.path.join(current_dir, "static", "R")

# Configure the database connection URL
db_url = 'postgresql://dora:Chipeur_arrete_2_chiper@127.0.0.1/explore2'

# Create the engine with a connection pool
engine = create_engine(db_url, poolclass=QueuePool)




@app.route('/')
@app.route('/plus_eau_moins_eau/disparite')
@app.route('/personnalisation_avancee')
def index():
    return render_template('index.html')





# @app.route('/plus-eau-moin-eau_disparite')
# def plus_eau_moin_eau_disparite():
#     # Read the content of dynamic_content.html
#     path = os.path.join("templates", "plus-eau-moin-eau", "disparite.html")
#     with open(path, 'r') as f:
#         content = f.read()
#     return render_template('index.html', content=content)


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
        os.path.join(R_dir, "compute_color.R"),
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
        os.path.join(R_dir, "compute_bin.R"),
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


    data = pd.DataFrame(rows, columns=columns)
    data['date'] = pd.to_datetime(data['date'])
    data['climate_chain'] = data['chain'].str.rsplit("_", n=1).str[0]
    data['opacity'] = "0.08"
    data['stroke_width'] = "1px"
    data['color'] = "#ADABAA"
    data['order'] = 0


    ### not need to be done after cleaning
    filtered_data = data[(data['date'] >= '1976-01-01') &
                         (data['date'] <= '2005-08-31')]
    mean_values = filtered_data.groupby('chain')['value'].mean().reset_index()
    mean_values.columns = ['chain', 'mean_value']

    data = pd.merge(data, mean_values, on='chain', how='left')

    data['value'] = (data['value'] - data['mean_value']) / data['mean_value']
    data.drop(columns=['mean_value'], inplace=True)
    ###
    

    for storyline in name_of_storylines:
        data_med = data[data['climate_chain'] == storyline].groupby(['date'])['value'].median().reset_index()

        data_med = data_med.dropna()
        x = pd.to_numeric(data_med['date']) / 10**9
        y = data_med['value']
        x_str = ' '.join(map(str, x))
        y_str = ' '.join(map(str, y))
        command = [
            "Rscript",
            os.path.join(R_dir, "compute_spline.R"),
            "--x", x_str,
            "--y", y_str
        ]
        process = subprocess.Popen(command,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
        output, error = process.communicate()
        y = output.decode().strip().split('\n')

        data_med['value'] = pd.to_numeric(y)
        
        data_med['chain'] = storyline + "_back"
        data_med['climate_chain'] = storyline + "_back"
        data_med['opacity'] = "1"
        data_med['stroke_width'] = "3px"
        data_med['color'] = "#ffffff"
        data_med['order'] = 1
        data = pd.concat([data, data_med], ignore_index=True)
        
        data_med['chain'] = storyline
        data_med['climate_chain'] = storyline
        data_med['opacity'] = "1"
        data_med['stroke_width'] = "1px"
        data_med['color'] = color_of_storylines[name_of_storylines == storyline][0]
        data_med['order'] = 2
        data = pd.concat([data, data_med], ignore_index=True)
       
    data['date'] = data['date'].dt.strftime("%Y-%m-%d")
    data = data.rename(columns={'value': 'y', 'date': 'x'})

    group = ['chain', 'color', 'stroke_width', 'opacity', 'order']
    data = data.groupby(group).apply(lambda x: x[['x', 'y']].to_dict('records')).reset_index(name='values')

    data = data.sort_values(by=['order'], ascending=True)
    
    json_output = []
    for index, row in data.iterrows():
        json_row = {'chain': row['chain'],
                    'color': row['color'],
                    'order': row['order'],
                    'stroke_width': row['stroke_width'],
                    'opacity': row['opacity'],
                    'values': row['values']}
        json_output.append(json_row)
   
    json_output_cleaned = json_output.copy()
    for item in json_output_cleaned:
        for record in item['values']:
            if np.isnan(record['y']):
                record['y'] = None
   
    json_output_str = json.dumps(json_output_cleaned)
   
    return json_output_str





if __name__ == '__main__':
    app.run(debug=True)
