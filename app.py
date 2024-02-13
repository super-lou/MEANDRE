from flask import Flask
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool

app = Flask(__name__)

# Configure the database connection URL
db_url = 'postgresql://dora:Chipeur_arrete_2_chiper@127.0.0.1/explore2'

# Create the engine with a connection pool
engine = create_engine(db_url, poolclass=QueuePool)

# Example SQL query with placeholders
sql_query = """
WITH historical AS (
    SELECT code, gcm, rcm, bc, hm, AVG(value) AS historical_value
    FROM data
    WHERE gcm = :gcm
    	  AND exp = :exp
    	  AND rcm = :rcm
    	  AND bc = :bc
    AND hm = :hm
    AND variable_en = :var
    AND date BETWEEN :start_historical AND :end_historical
    GROUP BY code, gcm, rcm, bc, hm
),
future AS (
    SELECT code, gcm, rcm, bc, hm, AVG(value) AS future_value
    FROM data
    WHERE gcm = :gcm
    	  AND exp = :exp
    	  AND rcm = :rcm
    	  AND bc = :bc
    AND hm = :hm
    AND variable_en = :var
    AND date BETWEEN :start_futur AND :end_futur
    GROUP BY code, gcm, rcm, bc, hm
),
chain_difference AS (
    SELECT h.code, h.gcm, h.rcm, h.bc, h.hm, (f.future_value - h.historical_value) / NULLIF(h.historical_value, 0) * 100 AS difference
    FROM historical h
    JOIN future f ON
    	 h.code = f.code
    	 AND h.gcm = f.gcm
	 AND h.rcm = f.rcm
	 AND h.bc = f.bc
	 AND h.hm = f.hm
),
hm_average AS (
    SELECT code, gcm, rcm, bc, AVG(difference) AS difference
    FROM chain_difference
    GROUP BY code, gcm, rcm, bc
),
bc_average AS (
    SELECT code, AVG(difference) AS difference
    FROM hm_average
    GROUP BY code, gcm, rcm
)
SELECT code, AVG(difference) AS difference
FROM bc_average
GROUP BY code
ORDER BY code;
"""

@app.route('/')
def index():
    # Get parameters from the URL query string
    gcm = request.args.get('gcm')
    exp = request.args.get('exp')
    rcm = request.args.get('rcm')
    bc = request.args.get('bc')
    hm = request.args.get('hm')
    var = request.args.get('var')
    start_historical = request.args.get('start_historical')
    end_historical = request.args.get('end_historical')
    start_futur = request.args.get('start_futur')
    end_futur = request.args.get('end_futur')

    # Get a connection from the pool
    connection = engine.connect()
    
    # Execute the SQL query with placeholders
    result = connection.execute(
        text(sql_query),
        gcm=gcm,
        exp=exp,
        rcm=rcm,
        bc=bc,
        hm=hm,
        var=var,
        start_historical=start_historical,
        end_historical=end_historical,
        start_futur=start_futur,
        end_futur=end_futur
    )

    # Fetch and process the results
    data = [{'code': row['code'], 'difference': row['difference']} for row in result]
    
    # Close the connection
    connection.close()
    
    # Return the data as JSON response
    return jsonify({'data': data})

if __name__ == '__main__':
    app.run(debug=True)
