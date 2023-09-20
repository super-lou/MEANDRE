library(sf)
library(jsonlite)
library(dplyr)


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

france = st_read(file.path(computer_data_path, map_dir, "france"))
# france = st_simplify(france,
                     # preserveTopology=TRUE,
                     # dTolerance=1000)


output = file.path(data_dir, "france.geo.json")


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




# json_string = fromJSON("data/Australia and New Zealand.geo.json")
# json_string = toJSON(json_string,
#                      pretty=TRUE,
#                      auto_unbox=TRUE)
# writeLines(json_string,
#            "data/Australia and New Zealand_2.geo.json")
