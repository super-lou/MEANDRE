#!/usr/bin/env Rscript

# Load required packages
library(argparse)

# Define argument parser
parser <- ArgumentParser()
parser$add_argument("--x", type = "character", help = "x")
parser$add_argument("--y", type = "character", help = "y")

# Parse command-line arguments
args <- parser$parse_args()

# Convert JSON string to list of numbers
X <- as.numeric(strsplit(args$x, " ")[[1]])
Y <- as.numeric(strsplit(args$y, " ")[[1]])

Y = predict(smooth.spline(X, Y, spar=1.1, df=3), X)$y
cat(Y, sep = "\n")
