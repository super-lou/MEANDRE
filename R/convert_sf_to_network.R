

# library(sf)
# library(tidygraph)
# library(igraph)
# library(dplyr)
# library(tibble)
# library(ggplot2)
# # library(units)
# library(tmap)
# library(osmdata)
# library(rgrass)
# library(link2GI)
# library(nabor)


library(phytools)
library(igraph)
library(sfnetworks)
library(sf)
library(dplyr)
library(RColorBrewer)



# sf_to_tidygraph = function(x, directed=TRUE) {

#     edges = x %>%
#         mutate(edgeID = c(1:n()))

#     nodes = edges %>%
#         st_coordinates() %>%
#         as_tibble() %>%
#         rename(edgeID = L1) %>%
#         group_by(edgeID) %>%
#         slice(c(1, n())) %>%
#         ungroup() %>%
#         mutate(start_end=rep(c('start', 'end'), times=n()/2)) %>%
#         mutate(xy = paste(.$X, .$Y)) %>% 
#         mutate(nodeID=group_indices(., factor(xy, levels=unique(xy)))) %>%
#         select(-xy)

#     source_nodes = nodes %>%
#         filter(start_end == 'start') %>%
#         pull(nodeID)

#     target_nodes = nodes %>%
#         filter(start_end == 'end') %>%
#         pull(nodeID)

#     edges = edges %>%
#         mutate(from=source_nodes, to=target_nodes)

#     nodes = nodes %>%
#         distinct(nodeID, .keep_all=TRUE) %>%
#         select(-c(edgeID, start_end)) %>%
#         st_as_sf(coords=c('X', 'Y')) %>%
#         st_set_crs(st_crs(edges))

#     tbl_graph(nodes=nodes, edges=as_tibble(edges),
#               directed=directed)
# }


check_sf = function (sf, output="sf.pdf") {
    cf = coord_fixed()
    cf$default = TRUE
    plot = ggplot(sf) + theme_void() + cf +
        geom_sf()

    if (!dir.exists(dirname(output))) {
        dir.create(output, recursive=TRUE)
    }
    ggplot2::ggsave(plot=plot,
                    path="./",
                    filename=output,
                    width=10,
                    height=10,
                    units='cm',
                    dpi=300)
}


# check_network = function (network, output="network.pdf") {

#     cf = coord_fixed()
#     cf$default = TRUE
#     plot = ggplot() + theme_void() + cf +
#         geom_sf(data = network %>%
#                     activate(edges) %>%
#                     as_tibble() %>%
#                     st_as_sf()) + 
#         geom_sf(data = network %>%
#                     activate(nodes) %>%
#                     as_tibble() %>%
#                     st_as_sf(), size=0.5)

#     if (!dir.exists(dirname(output))) {
#         dir.create(output, recursive=TRUE)
#     }
#     ggplot2::ggsave(plot=plot,
#                     path="./",
#                     filename=output,
#                     width=10,
#                     height=10,
#                     units='cm',
#                     dpi=300)
# }


computer_data_path = "/home/louis/Documents/bouleau/INRAE/data/"
map_dir = "map"

river = st_read(file.path(computer_data_path, map_dir, "coursEau"))

# river$length = st_length(river)
# river = filter(river, length >= quantile(river$length, 0.1))

# river = st_crop(river,
#                 c(xmin=610000, xmax=630000,
#                   ymin=6100000, ymax=6200000))

# river = st_simplify(river, preserveTopology=TRUE,
# 100)

river = st_cast(river, "LINESTRING")



# check_sf(river)
# river_network = sf_to_tidygraph(river, directed=FALSE)
# check_network(river_network)


# reverse the edge direction 
transposeGraph <- function(g) {
    g %>% get.edgelist %>%
        # {cbind(.[, 2], .[, 1])} %>%
        graph.edgelist
}


# convert igraph class to phylo class
# and calculate strahler number 
igraphStrahler <- function(g){
    
    if (!igraph::is_simple(g) |
        !igraph::is_connected(g) |
        !igraph::is_dag(g)) {
        stop("Taxon graph is not a simple, connected, directed acylic graph")
    }
    
    root = which(sapply(V(g), 
                        function(x) length(neighbors(g, x, mode = "in"))) == 0)
    leaves = which(sapply(V(g), 
                          function(x) length(neighbors(g, x, mode = "out"))) == 0)
    
    g <- g %>% 
        set_vertex_attr("leaf", index = leaves, TRUE) %>%
        set_vertex_attr("root", index = root, TRUE)
    
    traverse <- igraph::dfs(g, root)
    
    is_leaf <- igraph::vertex_attr(g, "leaf", traverse$order)
    is_leaf[which(is.na(is_leaf))] <- FALSE
    
    n_leaf <- sum(is_leaf)
    
    n_node <- sum(!is_leaf)
    node_id <- ifelse(is_leaf, cumsum(is_leaf), cumsum(!is_leaf) + n_leaf)
    
    # Store the node ids on the graph
    g <- igraph::set_vertex_attr(g, "node_id", index = traverse$order,
                                 value = node_id)
    
    # Extract the edge and vertex data
    vertex_data <-  igraph::as_data_frame(g, "vertices") %>%
        mutate(name = row_number())
    edge_data <- igraph::as_data_frame(g, "edges")
    edge_data$geom <- NULL
    
    # Substitute the node id numbers into the edge list
    edge_data <- unlist(edge_data)
    edge_data <- vertex_data$node_id[match(edge_data, vertex_data$name)]
    edge_data <- matrix(edge_data, ncol = 2)
    
    # lookup the tip and node labels
    tip_labels <- 1:n_leaf
    tip_labels <- vertex_data$name[match(tip_labels, vertex_data$node_id)]
    node_labels <- (n_leaf + 1):(n_node + n_leaf)
    node_labels <- vertex_data$name[match(node_labels, vertex_data$node_id)]

    # Build the phylogeny
    phy <- structure(list(edge = edge_data,
                          edge.length = rep(1, nrow(edge_data)),
                          tip.labels = tip_labels,
                          node.labels = node_labels,
                          Nnode = n_node),
                     class = "phylo")
    
    stra <- as.data.frame(strahlerNumber(phy)) %>%
        rename(strahler_order = `strahlerNumber(phy)`) %>%
        mutate(node_id = row_number()) %>%
        left_join(vertex_data, by = "node_id") %>%
        rename(to = name)
    
    return(stra)
}





network <- as_sfnetwork(river)

graph <- network %>%
    transposeGraph()

strahler <- igraphStrahler(graph)

edges = st_as_sf(network, "edges") %>%
    left_join(strahler, by = c("from" = "to"))



cols = brewer.pal(3, "Blues")
pal = colorRampPalette(cols)

plot(st_geometry(edges))
plot(edges["strahler_order"], 
     lwd = 3, , 
     add = TRUE,
     col = pal(3)[edges$strahler_order])
legend(x = "topright",
       legend = c("1","2","3"),          
       lwd = 3,
       col = cols,
       title = "Strahler order")



