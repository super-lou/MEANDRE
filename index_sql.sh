#!/bin/bash

# Number of processes (adjust according to your setup)
NUM_PROCESSES=10

# Commands to execute in parallel
COMMANDS=(
    "CREATE INDEX idx_exp ON data (exp);"
    "CREATE INDEX idx_gcm ON data (gcm);"
    "CREATE INDEX idx_rcm ON data (rcm);"
    "CREATE INDEX idx_bc ON data (bc);"
    "CREATE INDEX idx_hm ON data (hm);"
    "CREATE INDEX idx_exp_gcm ON data (exp, gcm);"
    "CREATE INDEX idx_exp_rcm ON data (exp, rcm);"
    "CREATE INDEX idx_exp_bc ON data (exp, bc);"
    "CREATE INDEX idx_exp_hm ON data (exp, hm);"
    "CREATE INDEX idx_gcm_rcm ON data (gcm, rcm);"
    "CREATE INDEX idx_gcm_bc ON data (gcm, bc);"
    "CREATE INDEX idx_gcm_hm ON data (gcm, hm);"
    "CREATE INDEX idx_rcm_bc ON data (rcm, bc);"
    "CREATE INDEX idx_rcm_hm ON data (rcm, hm);"
    "CREATE INDEX idx_bc_hm ON data (bc, hm);"
    "CREATE INDEX idx_exp_gcm_rcm ON data (exp, gcm, rcm);"
    "CREATE INDEX idx_exp_gcm_bc ON data (exp, gcm, bc);"
    "CREATE INDEX idx_exp_gcm_hm ON data (exp, gcm, hm);"
    "CREATE INDEX idx_exp_rcm_bc ON data (exp, rcm, bc);"
    "CREATE INDEX idx_exp_rcm_hm ON data (exp, rcm, hm);"
    "CREATE INDEX idx_exp_bc_hm ON data (exp, bc, hm);"
    "CREATE INDEX idx_gcm_rcm_bc ON data (gcm, rcm, bc);"
    "CREATE INDEX idx_gcm_rcm_hm ON data (gcm, rcm, hm);"
    "CREATE INDEX idx_gcm_bc_hm ON data (gcm, bc, hm);"
    "CREATE INDEX idx_rcm_bc_hm ON data (rcm, bc, hm);"
    "CREATE INDEX idx_all_columns ON data (exp, gcm, rcm, bc, hm);"
)

# PostgreSQL connection settings
PG_HOST="127.0.0.1"
PG_PORT="5432"
PG_DATABASE="explore2"
PG_USER="dora"
PG_PASSWORD="Chipeur_arrete_2_chiper"

# Calculate number of commands
NUM_COMMANDS=${#COMMANDS[@]}

# Calculate commands per process
COMMANDS_PER_PROCESS=$((NUM_COMMANDS / NUM_PROCESSES))

# Execute commands in parallel using mpiexec
mpiexec -n $NUM_PROCESSES bash -c '
    # Assign commands to each process
    start=$((OMPI_COMM_WORLD_RANK * COMMANDS_PER_PROCESS))
    end=$((start + COMMANDS_PER_PROCESS - 1))

    # Connect to PostgreSQL and execute assigned commands
    for ((i=start; i<=end; i++)); do
        psql -h $PG_HOST -p $PG_PORT -U $PG_USER -d $PG_DATABASE -c "${COMMANDS[i]}"
    done
' 
 
