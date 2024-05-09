#!/usr/bin/env Rscript

# Load required packages
library(argparse)
library(jsonlite)
library(dataSHEEP)

# Define argument parser
parser <- ArgumentParser()
parser$add_argument("--min", type = "character", help = "min")
parser$add_argument("--max", type = "character", help = "max")
parser$add_argument("--delta", type = "character", help = "Value for Delta")
parser$add_argument("--palette", type = "character", help = "Palette colors")

# Parse command-line arguments
args <- parser$parse_args()

# Convert JSON string to list of numbers
min <- as.numeric(args$min)
max <- as.numeric(args$max)
delta <- as.numeric(fromJSON(args$delta))
palette <- as.character(fromJSON(args$palette))

# Call R functions with provided arguments
res <- compute_colorBin(min, max, length(palette), 0, FALSE)
res <- as.list(res)
bin <- res$bin
upBin <- res$upBin
lowBin <- res$lowBin

cat(bin, sep = "\n")
