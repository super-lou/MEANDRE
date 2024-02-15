


SELECT chain
FROM projections
WHERE gcm = 'CNRM-CM5' AND exp = 'historical-rcp85' AND rcm = 'ALADIN63' AND bc = 'ADAMONT';
    



SELECT code, date, value
FROM data
WHERE chain = 'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_SMASH' AND variable_en = 'QA' AND date BETWEEN '1975-01-01' AND '2005-12-31' LIMIT 100;



WITH selected_projections AS (
    SELECT chain
    FROM projections
    WHERE gcm = 'CNRM-CM5' AND exp = 'historical-rcp85' AND rcm = 'ALADIN63' AND bc = 'ADAMONT'
)
SELECT *
FROM data
WHERE chain IN (SELECT chain FROM selected_projections); 




SELECT d.code, p.*, d.value
FROM data d
JOIN projections p ON d.chain = p.chain
WHERE p.gcm = 'CNRM-CM5' AND p.exp = 'historical-rcp85' AND p.rcm = 'ALADIN63' AND p.bc = 'ADAMONT'
AND d.variable_en = 'QA' AND d.date BETWEEN '1975-01-01' AND '2005-12-31'
LIMIT 100;






WITH historical AS (
    SELECT d.code, p.chain, p.gcm, p.rcm, p.bc, p.hm, AVG(d.value) AS historical_value
    FROM data d
    JOIN projections p ON d.chain = p.chain
    WHERE (p.gcm = 'CNRM-CM5'
    	  AND p.exp = 'historical-rcp85'
	  AND p.rcm = 'ALADIN63'
	  AND p.bc = 'ADAMONT')
    OR (p.gcm = 'EARTH'
       AND p.exp = 'historical-rcp85'
       AND p.rcm = 'HadREM3'
       AND p.bc = 'ADAMONT')
    AND d.variable_en = 'QA'
    AND d.date BETWEEN '1975-01-01' AND '2005-12-31'
    GROUP BY d.code, p.chain
),
future AS (
    SELECT d.code, p.chain, p.gcm, p.rcm, p.bc, p.hm, AVG(d.value) AS future_value
    FROM data d
    JOIN projections p ON d.chain = p.chain
    WHERE (p.gcm = 'CNRM-CM5'
    	  AND p.exp = 'historical-rcp85'
	  AND p.rcm = 'ALADIN63'
	  AND p.bc = 'ADAMONT')
    OR (p.gcm = 'EARTH'
       AND p.exp = 'historical-rcp85'
       AND p.rcm = 'HadREM3'
       AND p.bc = 'ADAMONT')
    AND d.variable_en = 'QA'
    AND d.date BETWEEN '2050-01-01' AND '2080-12-31'
    GROUP BY d.code, p.chain
),
chain_delta AS (
    SELECT h.code, h.gcm, h.rcm, h.bc, h.hm, (f.future_value - h.historical_value) / NULLIF(h.historical_value, 0) * 100 AS delta
    FROM historical h
    JOIN future f ON h.code = f.code AND h.chain = f.chain
),
hm_average AS (
    SELECT code, gcm, rcm, bc, AVG(delta) AS delta
    FROM chain_delta
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



        
-- "HadGEM2-ES_historical-rcp85_CCLM4-8-17_ADAMONT"
-- "EC-EARTH_historical-rcp85_HadREM3-GA7_ADAMONT"
-- "historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT"
-- "HadGEM2-ES_historical-rcp85_ALADIN63_ADAMONT"


-- EXPLAIN
EXPLAIN ANALYZE
WITH historical AS (
    SELECT code, chain, AVG(value) AS historical_value
    FROM data
    WHERE
    chain IN
    ('historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_CTRIP',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_EROS',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_GRSD',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_J2000',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_MORDOR-SD',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_MORDOR-TS',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_ORCHIDEE',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_SIM2',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_SMASH')
    AND variable_en = 'QA'
    AND date BETWEEN '1975-01-01' AND '2005-12-31'
    GROUP BY code, chain
),
future AS (
    SELECT code, chain, AVG(value) AS future_value
    FROM data
    WHERE
    chain IN
    ('historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_CTRIP',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_EROS',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_GRSD',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_J2000',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_MORDOR-SD',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_MORDOR-TS',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_ORCHIDEE',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_SIM2',
    'historical-rcp85_CNRM-CM5_ALADIN63_ADAMONT_SMASH')
    AND variable_en = 'QA'
    AND date BETWEEN '2050-01-01' AND '2080-12-31'
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



-- DELETE FROM data
-- WHERE variable_en = 'fQ10A';


CREATE TABLE data_rcp26 AS
SELECT *
FROM data d
WHERE EXISTS (
    SELECT 1
    FROM projections p
    WHERE p.chain = d.chain
    AND p.exp = 'historical-rcp26'
);

CREATE TABLE data_rcp45 AS
SELECT *
FROM data d
WHERE EXISTS (
    SELECT 1
    FROM projections p
    WHERE p.chain = d.chain
    AND p.exp = 'historical-rcp45'
);



CREATE TABLE data_rcp85 AS
SELECT *
FROM data d
WHERE EXISTS (
    SELECT 1
    FROM projections p
    WHERE p.chain = d.chain
    AND p.exp = 'historical-rcp85'
);






