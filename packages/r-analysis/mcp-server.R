#!/usr/bin/env Rscript

# Network Analysis MCP Server for Alteri
# Exposes bootnet, qgraph, and psychonetrics functions via MCP
# Use mode: Autonomous R development (vs r-session for pair programming)

library(mcpr)
library(bootnet)
library(qgraph)

# Create server
server <- new_server(
 name = "r-network",
 version = "0.1.0",
 description = "Network analysis MCP server providing autonomous R execution for psychological network analysis using bootnet, qgraph, and psychonetrics"
)

# Tool: Estimate psychological network
#' @mcp Estimate a psychological network using bootnet
#' @param data_path Path to CSV file containing the data
#' @param default Estimation method: "EBICglasso" (default), "pcor", "cor", "ggmModSelect"
#' @param gamma EBIC tuning parameter (0, 0.25, or 0.5). Default 0.5 for sparse networks
#' @type data_path string
#' @type default string
#' @type gamma number
estimate_network_tool <- new_tool(
 name = "estimate_network",
 description = "Estimate a psychological network from data using bootnet. Returns network structure and fit statistics.",
 fn = function(data_path, default = "EBICglasso", gamma = 0.5) {
   data <- read.csv(data_path)

   result <- bootnet::estimateNetwork(
     data,
     default = default,
     tuning = gamma
   )

   # Extract key information
   edges <- sum(result$graph != 0) / 2
   nodes <- ncol(result$graph)
   density <- edges / (nodes * (nodes - 1) / 2)

   response_text(sprintf(
     "Network estimated successfully:\n- Nodes: %d\n- Edges: %d\n- Density: %.3f\n- Method: %s\n- Gamma: %.2f",
     nodes, edges, density, default, gamma
   ))
 },
 inputSchema = list(
   type = "object",
   properties = list(
     data_path = list(type = "string", description = "Path to CSV data file"),
     default = list(type = "string", description = "Estimation method", default = "EBICglasso"),
     gamma = list(type = "number", description = "EBIC tuning parameter", default = 0.5)
   ),
   required = list("data_path")
 )
)

# Tool: Check network stability via bootstrap
#' @mcp Assess network stability using case-dropping bootstrap
#' @param data_path Path to CSV file containing the data
#' @param nBoots Number of bootstrap samples (default 1000, use 100 for quick check)
#' @param type Type of bootstrap: "case" for edge stability, "node" for centrality stability
#' @type data_path string
#' @type nBoots number
#' @type type string
check_stability_tool <- new_tool(
 name = "check_stability",
 description = "Assess network stability using bootnet bootstrap. Returns CS-coefficient for centrality measures. CS >= 0.5 preferred, < 0.25 should not interpret.",
 fn = function(data_path, nBoots = 100, type = "case") {
   data <- read.csv(data_path)

   # Estimate network first
   network <- bootnet::estimateNetwork(data, default = "EBICglasso")

   # Run bootstrap
   boot_result <- bootnet::bootnet(
     network,
     nBoots = nBoots,
     type = type,
     nCores = 1  # Safe for MCP context
   )

   # Get CS-coefficients
   cs <- bootnet::corStability(boot_result)

   response_text(sprintf(
     "Stability analysis complete (%d bootstraps):\n\nCS-coefficients (target >= 0.5, minimum >= 0.25):\n- Strength: %.3f\n- Betweenness: %.3f\n- Closeness: %.3f\n\nInterpretation: %s",
     nBoots,
     cs["strength"],
     cs["betweenness"],
     cs["closeness"],
     if (min(cs) >= 0.5) "Stable - safe to interpret all centrality measures"
     else if (min(cs) >= 0.25) "Marginal - interpret with caution"
     else "Unstable - do not interpret centrality measures"
   ))
 },
 inputSchema = list(
   type = "object",
   properties = list(
     data_path = list(type = "string", description = "Path to CSV data file"),
     nBoots = list(type = "number", description = "Number of bootstrap samples", default = 100),
     type = list(type = "string", description = "Bootstrap type: case or node", default = "case")
   ),
   required = list("data_path")
 )
)

# Tool: Plot network and return image
#' @mcp Generate a network visualisation using qgraph
#' @param data_path Path to CSV file containing the data
#' @param output_path Path to save the PNG image
#' @param layout Layout algorithm: "spring" (default), "circle", "groups"
#' @type data_path string
#' @type output_path string
#' @type layout string
plot_network_tool <- new_tool(
 name = "plot_network",
 description = "Generate a network visualisation using qgraph. Saves PNG to specified path.",
 fn = function(data_path, output_path, layout = "spring") {
   data <- read.csv(data_path)

   # Estimate network
   network <- bootnet::estimateNetwork(data, default = "EBICglasso")

   # Save plot
   png(output_path, width = 800, height = 800, res = 150)
   qgraph::qgraph(
     network$graph,
     layout = layout,
     theme = "colorblind",
     labels = colnames(network$graph)
   )
   dev.off()

   response_text(sprintf("Network plot saved to: %s", output_path))
 },
 inputSchema = list(
   type = "object",
   properties = list(
     data_path = list(type = "string", description = "Path to CSV data file"),
     output_path = list(type = "string", description = "Path to save PNG image"),
     layout = list(type = "string", description = "Layout: spring, circle, groups", default = "spring")
   ),
   required = list("data_path", "output_path")
 )
)

# Tool: Compare two networks statistically
#' @mcp Compare two networks using Network Comparison Test
#' @param data_path1 Path to first CSV file
#' @param data_path2 Path to second CSV file
#' @param it Number of permutations (default 100 for quick, 1000 for publication)
#' @type data_path1 string
#' @type data_path2 string
#' @type it number
compare_networks_tool <- new_tool(
 name = "compare_networks",
 description = "Compare two networks statistically using Network Comparison Test. Tests global structure and connectivity differences.",
 fn = function(data_path1, data_path2, it = 100) {
   data1 <- read.csv(data_path1)
   data2 <- read.csv(data_path2)

   # Run NCT
   nct_result <- NetworkComparisonTest::NCT(
     data1, data2,
     it = it,
     test.edges = TRUE,
     test.centrality = TRUE
   )

   response_text(sprintf(
     "Network Comparison Test (%d permutations):\n\n- Global strength difference: %.3f (p = %.3f)\n- Network structure: %s\n- Global connectivity: %s",
     it,
     nct_result$glstrinv.real,
     nct_result$glstrinv.pval,
     if (nct_result$nwinv.pval < 0.05) "Significantly different" else "Not significantly different",
     if (nct_result$glstrinv.pval < 0.05) "Significantly different" else "Not significantly different"
   ))
 },
 inputSchema = list(
   type = "object",
   properties = list(
     data_path1 = list(type = "string", description = "Path to first CSV file"),
     data_path2 = list(type = "string", description = "Path to second CSV file"),
     it = list(type = "number", description = "Number of permutations", default = 100)
   ),
   required = list("data_path1", "data_path2")
 )
)

# Register tools with server
server <- server |>
 add_capability(estimate_network_tool) |>
 add_capability(check_stability_tool) |>
 add_capability(plot_network_tool) |>
 add_capability(compare_networks_tool)

# Run server on stdio (for Claude Code integration)
serve_io(server)
