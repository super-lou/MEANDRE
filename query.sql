


SELECT chain
FROM projections
WHERE gcm = 'CNRM-CM5' AND exp = 'historical-rcp85' AND rcm = 'ALADIN63' AND bc = 'ADAMONT';
    



SELECT code, date, value
FROM data
WHERE chain = 'CNRM-CM5|historical-rcp85|ALADIN63|ADAMONT|SMASH' AND variable_en = 'QA' AND date BETWEEN '1975-01-01' AND '2005-12-31' LIMIT 100;



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
chain_difference AS (
    SELECT h.code, h.gcm, h.rcm, h.bc, h.hm, (f.future_value - h.historical_value) / NULLIF(h.historical_value, 0) * 100 AS difference
    FROM historical h
    JOIN future f ON h.code = f.code AND h.chain = f.chain
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



-- EXPLAIN
WITH historical AS (
    SELECT code, gcm, rcm, bc, hm, AVG(value) AS historical_value
    FROM data
    WHERE gcm = 'CNRM-CM5'
    	  AND exp = 'historical-rcp85'
    	  AND rcm = 'ALADIN63'
    	  AND bc = 'ADAMONT'
    -- WHERE gcm IN ('CNRM-CM5', 'EARTH')
    -- 	  AND exp = 'historical-rcp85'
    -- 	  AND rcm IN ('ALADIN63', 'HadREM3')
    -- 	  AND bc = 'ADAMONT'
    AND hm IN ('CTRIP',
               'EROS',
	       'GRSD',
	       'J2000',
	       'MORDOR-SD',
	       'MORDOR-TS',
	       'ORCHIDEE',
	       'SIM2',
	       'SMASH')
    AND variable_en = 'QA'
    AND date BETWEEN '1975-01-01' AND '2005-12-31'
    GROUP BY code, gcm, rcm, bc, hm
),
future AS (
    SELECT code, gcm, rcm, bc, hm, AVG(value) AS future_value
    FROM data
    WHERE gcm = 'CNRM-CM5'
    	  AND exp = 'historical-rcp85'
    	  AND rcm = 'ALADIN63'
    	  AND bc = 'ADAMONT'
    -- WHERE gcm IN ('CNRM-CM5', 'EARTH')
    -- 	  AND exp = 'historical-rcp85'
    -- 	  AND rcm IN ('ALADIN63', 'HadREM3')
    -- 	  AND bc = 'ADAMONT'
    AND hm IN ('CTRIP',
               'EROS',
	       'GRSD',
	       'J2000',
	       'MORDOR-SD',
	       'MORDOR-TS',
	       'ORCHIDEE',
	       'SIM2',
	       'SMASH')
    AND variable_en = 'QA'
    AND date BETWEEN '2050-01-01' AND '2080-12-31'
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



















-- SELECT h.code, h.gcm, h.rcm, h.bc, h.hm,
--        (f.future_value - h.historical_value) / h.historical_value * 100 AS difference
-- FROM historical h
-- JOIN future f ON h.code = f.code AND h.chain = f.chain
-- LIMIT 100;
