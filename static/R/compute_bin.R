#!/usr/bin/env Rscript

# Copyright 2024
# Louis Héraut (louis.heraut@inrae.fr)*1,
# Jean-Philippe Vidal (jean-philippe.vidal@inrae.fr)*1

# *1   INRAE, France

# This file is part of MEANDRE.

# MEANDRE is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.

# MEANDRE is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with MEANDRE.
# If not, see <https://www.gnu.org/licenses/>.


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
