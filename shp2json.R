library(sf)
library(jsonlite)
library(dplyr)
library(ggplot2)


# write_geojson = function (shp, output) {
#     if (!dir.exists(dirname(output))) {
#         dir.create(dirname(output))
#     }
#     if (file.exists(output)) {
#         unlink(output)
#     }
#     st_write(shp,
#              output)
#     json_data = fromJSON(output)
#     json_string = toJSON(json_data, pretty=TRUE,
#                          auto_unbox=TRUE)
#     writeLines(json_string, output)
# }


computer_data_path = "/home/louis/Documents/bouleau/INRAE/data/"
map_dir = "map"
data_dir = "data"

# france
output = file.path(data_dir, "france.geo.json")
france = st_read(file.path(computer_data_path, map_dir, "france"))
bbox = st_bbox(france)

json_data = list(
    type="FeatureCollection",
    
    features = list(
        list(
            type="Feature",

            properties=list(
                short_name="FRA",
                name="France",
                bbox=list(xmin=bbox[1],
                          ymin=bbox[2],
                          xmax=bbox[3],
                          ymax=bbox[4]),
                centroid=unlist(st_centroid(france)$geometry)
            ),
            
            geometry=list(
                type="MultiPolygon",
                coordinates=sapply(seq(length(france$geometry[[1]])),
                                   function (i) {
                                       france$geometry[[1]][i]
                                   })
            )
        )
    )
)

json_string = toJSON(json_data,
                     pretty=TRUE,
                     auto_unbox=TRUE)
writeLines(json_string, output)


# river
output = file.path(data_dir, "river.geo.json")
river = st_read(file.path(computer_data_path, map_dir, "river"))
river$length = as.numeric(st_length(river$geometry))
river = filter(river, length >= 100000)
river = st_transform(river, 4326)

nRiver = length(river$geometry)
# nRiver = 10

json_data = list(
    type="FeatureCollection",
    
    features = lapply(
        1:nRiver,
        function (i) {
            list(
                type="Feature",
                
                properties=list(
                    code=river$CdEntiteHy[i],
                    name=river$NomEntiteH[i],
                    length=river$length[i],
                    norm=(sqrt(river$length[i])-sqrt(min(river$length))) / (sqrt(max(river$length))-sqrt(min(river$length)))
                ),
                
                geometry=list(
                    type="MultiLineString",
                    coordinates=
                        lapply(        
                            1:length(river$geometry[[i]]),
                            function (j) {
                                river$geometry[[i]][[j]][, c(1, 2)]
                            })
                )
            )
        })
)

json_string = toJSON(json_data,
                     pretty=TRUE,
                     auto_unbox=TRUE)
writeLines(json_string, output)

