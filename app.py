from flask import Flask, request, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure the database connection URL
db_url = 'postgresql://dora:Chipeur_arrete_2_chiper@127.0.0.1/explore2'

# Create the engine with a connection pool
engine = create_engine(db_url, poolclass=QueuePool)

# Example SQL query with placeholders
sql_query = """
WITH historical AS (
    SELECT code, chain, AVG(value) AS historical_value
    FROM data
    WHERE
    chain IN :chain
    AND variable_en = :variable
    AND date BETWEEN :historical_start AND :historical_end
    GROUP BY code, chain
),
future AS (
    SELECT code, chain, AVG(value) AS future_value
    FROM data
    WHERE
    chain IN :chain
    AND variable_en = :variable
    AND date BETWEEN :futur_start AND :futur_end
    GROUP BY code, chain
),
chain_delta AS (
    SELECT h.code, h.chain, (f.future_value - h.historical_value) / NULLIF(h.historical_value, 0) * 100 AS delta
    FROM historical h
    JOIN future f ON
         h.code = f.code
         AND h.chain = f.chain
),
full_chain_delta AS (
    SELECT d.code, d.chain, p.gcm, p.rcm, p.bc, d.delta
    FROM chain_delta d 
    JOIN projections p ON
         d.chain = p.chain
),
hm_average AS (
    SELECT code, gcm, rcm, bc, AVG(delta) AS delta
    FROM full_chain_delta
    GROUP BY code, gcm, rcm, bc
),
bc_average AS (
    SELECT code, AVG(delta) AS delta
    FROM hm_average
    GROUP BY code, gcm, rcm
)
SELECT code, AVG(delta) AS delta
FROM bc_average
GROUP BY code
ORDER BY code;
"""

@app.route('/', methods=['POST'])
def index_post():
    # Get parameters from the JSON payload
    data = request.json
    chain = data.get('chain')
    variable = data.get('variable')
    historical_start = data.get('historical_start')
    historical_end = data.get('historical_end')
    futur_start = data.get('futur_start')
    futur_end = data.get('futur_end')

    # Get a connection from the pool
    connection = engine.connect()

    result = connection.execute(
        text(sql_query),
        {
            'chain': tuple(chain),  # Convert Python list to tuple
            'variable': variable,
            'historical_start': historical_start,
            'historical_end': historical_end,
            'futur_start': futur_start,
            'futur_end': futur_end
        }
    )

    # Fetch all rows
    rows = result.fetchall()
    
    # Process the rows and create a list of dictionaries
    data = [{'code': row[0], 'delta': row[1]} for row in rows]

    print(data)
    
    # Close the connection
    connection.close()
    
    # Return the data as JSON response
    response = jsonify({'data': data})
    return response

if __name__ == '__main__':
    app.run(debug=True)




data = [{'code': 'Y603561001', 'delta': -7.79405570774717},
        {'code': 'Y604201001', 'delta': -9.83602093231473},
        {'code': 'Y611050000', 'delta': -6.84004845313229},
        {'code': 'Y611501001', 'delta': -8.8980261995047},
        {'code': 'Y612501201', 'delta': -6.66320155043784},
        {'code': 'Y620581301', 'delta': -13.7629691066986},
        {'code': 'Y621040000', 'delta': -10.2837353838771},
        {'code': 'Y622401001', 'delta': -7.57890207824158},
        {'code': 'Y622402001', 'delta': -7.77312274777425},
        {'code': 'Y623402001', 'delta': -3.90533738602494}]

codes = [item['code'] for item in data]
