// drawing.js
import * as d3 from "d3";
import { collisionMargin } from "./data.js";

export function createSvgAndContainer() {
  const width  = window.innerWidth;
  const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  if(window.visualViewport !== window.innerHeight) {console.log("user appears to be on mobile. good luck.", "pink");}
  const svg = d3.select("body")
    .append("svg")
    .attr("xmlns","http://www.w3.org/2000/svg")
    .attr("width", width)
    .attr("height", height);
  
  const container = svg.append("g")
    .attr("class", "container")
    .attr("transform", `translate(${width/2},${height/2})`);

  const hotspotLayer = container.append("g")
  .attr("class", "hotspot-layer");
  
  const nodeLayer = container.append("g")
  .attr("class", "node-layer");

  return { svg, container, nodeLayer, hotspotLayer, width, height };
}

export function createAxes(container, width, height, minDim) {
  const domainExtent = 90;

  const yScale = d3.scaleLinear()
    .domain([-domainExtent, domainExtent])
    .range([ minDim/2, -minDim/2 ]);

  const xScale = d3.scaleLinear()
    .domain([-domainExtent, domainExtent])
    .range([-minDim/2, minDim/2]);

  const yAxis = d3.axisLeft(yScale).ticks(10);
  const xAxis = d3.axisBottom(xScale).ticks(10);

  const axisContainer = container.append("g").attr("class","axis");
  axisContainer.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

    axisContainer.append("g")
    .attr("class", "x-axis")
    .call(xAxis);

  return { xScale, yScale, xAxis, yAxis };
}

export function createArrowheads(svg) {
  const arrowsContainer = svg.select("#defs").append("g").attr("id","arrows").attr("class","arrows");
  arrowsContainer.append("marker")
    .attr("id", "arrowhead-white")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 0)
    .attr("refY", 5)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", "white");

  arrowsContainer.append("marker")
    .attr("id", "arrowhead-orange")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 0)
    .attr("refY", 5)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", "orange");
}
