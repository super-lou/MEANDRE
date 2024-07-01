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
