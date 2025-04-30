// drawing.js
import * as d3 from "d3";
import { showBackground } from "./ui.js";
import { imagePaths } from "./backgrounds.js";

export function createSvgAndContainer() {
  const width  = window.innerWidth;
  const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const minDim = Math.min(width, height);
  const scaleUnit = minDim/180;

  if(window.visualViewport.height > (window.innerHeight+2)) {
    console.log("user appears to be on mobile. good luck.", "pink"); 
    console.log('height: ' + height, "pink"); 
    console.log('window.visualViewport.height: ' + window.visualViewport.height, "pink"); 
    console.log('(window.innerHeight+2): ' + (window.innerHeight+2), "pink");
  }
  const svg = d3.select("body")
    .append("svg")
    .attr("xmlns","http://www.w3.org/2000/svg")
    .attr("width", width)
    .attr("height", height);
  
  const container = svg.append("g")
    .attr("class", "container")
    .attr("transform", `translate(${width/2},${height/2})`);

  const backgroundLayer = container.append("g")
    .attr("id", "background-layer")
    .attr("class", showBackground.boolState ? showBackground.DOMObjectString+"" : showBackground.DOMObjectString+" hidden");
    imagePaths.forEach((imagePath, index) => {
        // backgroundLayer.append("rect")
        // .attr("width", imagePath.width * scaleUnit)
        // .attr("height", imagePath.height * scaleUnit)
        // .attr("x", imagePath.x * scaleUnit)
        // .attr("y", imagePath.y * scaleUnit)
        // .attr("fill", "url(#"+imagePath.name+")");  
        backgroundLayer.append("image")
        .attr("href",imagePath.url)
        .attr("width", imagePath.width * scaleUnit)
        .attr("height", imagePath.height * scaleUnit)
        .attr("x", imagePath.x * scaleUnit)
        .attr("y", imagePath.y * scaleUnit)
        //.attr("fill", "url(#"+imagePath.name+")")
        ;  

    });

    
  const hotspotLayer = container.append("g")
  .attr("class", "hotspot-layer");
  
  const windLayerCancel = container.append("g")
  .attr("class", "wind-layer-cancel");
  const windLayerStress = container.append("g")
  .attr("class", "wind-layer-stress");

  const nodeLayer = container.append("g")
  .attr("class", "node-layer");

  return { svg, container, nodeLayer, hotspotLayer, windLayerCancel, windLayerStress, width, height, minDim, scaleUnit };
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
