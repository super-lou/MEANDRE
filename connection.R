# Copyright 2024
# Louis Héraut (louis.heraut@inrae.fr)*1

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


library(dotenv)

load_dot_env("/var/www/MEANDRE/.env")
APP_NAME = Sys.getenv("APP_NAME")
URL = Sys.getenv("URL")
FROM = Sys.getenv("FROM")
TO = Sys.getenv("TO")
TO = unlist(strsplit(TO, ", "))
SMTP_HOST = Sys.getenv("SMTP_HOST")
SMTP_PORT = Sys.getenv("SMTP_PORT")
SMTP_USERNAME = Sys.getenv("SMTP_USERNAME")
SMTP_PASSWORD = Sys.getenv("SMTP_PASSWORD")
SUBJECT = Sys.getenv("SUBJECT")


fact = 2
Paths = list.files("/var/log/apache2/", pattern=paste0(APP_NAME, "_access"), full.names=TRUE)
Id = stringr::str_extract(basename(Paths), "[[:digit:]]+")
Id[is.na(Id)] = 0
Id = as.numeric(Id)

Paths = Paths[order(Id)]
nPaths = length(Paths)
today = Sys.Date()

graph = ""

for (i in 1:nPaths) {
    path = Paths[i]
    date = today - i + 1

    if (grepl("[.]gz$", basename(path))) {
        path = gzfile(path, "r")
    }
    
    Lines = readLines(path)
    Lines = Lines[grepl(URL, Lines)]
    IP = gsub("[ ].*", "", Lines)
    IP = IP[!duplicated(IP)]
    nIP = length(IP)
    nIP_fact = round(nIP / fact)
    
    text = paste0(format(date, "%d/%m/%Y"), " ",
                  strrep("-", nIP_fact), " ", nIP, "\r\n")
    graph = paste0(graph, text)
}

email = emayili::envelope(from=FROM,
                          to=TO,
                          subject=SUBJECT,
                          text=graph)

smtp = emayili::server(host=SMTP_HOST,
                       port=SMTP_PORT,
                       username=SMTP_USERNAME,
                       password=SMTP_PASSWORD)

smtp(email, verbose=TRUE)
