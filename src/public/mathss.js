addTooltips = (chart, styles) => {
    const stroke_styles = { stroke: "blue", "stroke-width": 3 };
    const fill_styles = { fill: "blue", opacity: 0.5 };
  
    // Workaround if it's in a figure
    const type = d3.select(chart).node().tagName;
    let wrapper =
      type === "FIGURE" ? d3.select(chart).select("svg") : d3.select(chart);
  
    // Workaround if there's a legend....
    const svgs = d3.select(chart).selectAll("svg");
    if (svgs.size() > 1) wrapper = d3.select([...svgs].pop());
    wrapper.style("overflow", "visible"); // to avoid clipping at the edges
  
    // Set pointer events to visibleStroke if the fill is none (e.g., if its a line)
    wrapper.selectAll("path").each(function (data, index, nodes) {
      // For line charts, set the pointer events to be visible stroke
      if (
        d3.select(this).attr("fill") === null ||
        d3.select(this).attr("fill") === "none"
      ) {
        d3.select(this).style("pointer-events", "visibleStroke");
        if (styles === undefined) styles = stroke_styles;
      }
    });
    
    if (styles === undefined) styles = fill_styles;
  
    const tip = wrapper
      // .selectAll(".hover")
      .data([1])
      .join("g")
      // .attr("class", "hover")
      .style("pointer-events", "none")
      .style("text-anchor", "middle");
  
    // Add a unique id to the chart for styling
    const id = "0986";
  
    // Add the event listeners
    d3.select(chart).classed(id, true); // using a class selector so that it doesn't overwrite the ID
    wrapper.selectAll("title").each(function () {
      // Get the text out of the title, set it as an attribute on the parent, and remove it
      const title = d3.select(this); // title element that we want to remove
      const parent = d3.select(this.parentNode); // visual mark on the screen
      const t = title.text();
      if (t) {
        parent.attr("__title", t).classed("has-title", true);
        title.remove();
      }
      // Mouse events
      parent
        .on("pointerenter pointermove", function (event) {
          const text = d3.select(this).attr("__title");
          const pointer = d3.pointer(event, wrapper.node());
          // if (text) tip.call(hover, pointer, text.split("\n"));
          // else tip.selectAll("*").remove();
  
          // Raise it
          d3.select(this).raise();
          // Keep within the parent horizontally
          const tipSize = tip.node().getBBox();
          if (pointer[0] + tipSize.x < 0)
            tip.attr(
              "transform",
              `translate(${tipSize.width / 2}, ${pointer[1] + 7})`
            );
          else if (pointer[0] + tipSize.width / 2 > wrapper.attr("width"))
            tip.attr(
              "transform",
              `translate(${wrapper.attr("width") - tipSize.width / 2}, ${
                pointer[1] + 7
              })`
            );
        })
        .on("pointerout", function (event) {
          tip.selectAll("*").remove();
          // Lower it!
          d3.select(this).lower();
        });
    });
  
    // Remove the tip if you tap on the wrapper (for mobile)
    wrapper.on("touchstart", () => tip.selectAll("*").remove());
  
    // Define the styles
    chart.appendChild(html`<style>
    .${id} .has-title { cursor: pointer;  pointer-events: all; }
    .${id} .has-title:hover { ${Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(" ")} }`);
  
    return chart;
  }



function plots(data_arr,extent,conts){
    const plot = Plot.plot(
      {
      style: {display: "inline-block"},
      x: {label: "",ticks: extent},
        y: {
                  axis: null
                },
       marks:[
         Plot.rectY(
           {length:data_arr.length},
           Plot.binX(
             {y:"count"},
             {x:data_arr,fill:"rgba(242, 142, 44, 0.6)"}
             
           )
         )
         
       ]
      
      }
      )
      
    const div = document.querySelector(String('#')+conts.id);
    div.append(plot);
  }
// module.exports = router;

function legend({
    color,
    title,
    tickSize = 6,
    width = 320,
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues
  } = {}) {
  
    // const svg = div.append("svg")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .attr("viewBox", [0, 0, width, height])
    //   .style("overflow", "visible")
    //   .style("display", "block");
    const svg = div.append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");
  
    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;
  
    // Continuous
    if (color.interpolate) {
      const n = Math.min(color.domain().length, color.range().length);
  
      x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));
  
      svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
    }
  
    // Sequential
    else if (color.interpolator) {
      x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)), {
          range() {
            return [marginLeft, width - marginRight];
          }
        });
  
      svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());
  
      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }
  
    // Threshold
    else if (color.invertExtent) {
      const thresholds = color.thresholds ? color.thresholds() // scaleQuantize
        :
        color.quantiles ? color.quantiles() // scaleQuantile
        :
        color.domain(); // scaleThreshold
  
      const thresholdFormat = tickFormat === undefined ? d => d :
        typeof tickFormat === "string" ? d3.format(tickFormat) :
        tickFormat;
  
      x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);
  
      svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);
  
      tickValues = d3.range(thresholds.length);
      tickFormat = i => thresholdFormat(thresholds[i], i);
    }
  
    // Ordinal
    else {
      x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);
  
      svg.append("g")
        .selectAll("rect")
        .data(color.domain())
        .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);
  
      tickAdjust = () => {};
    }
  
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(title));
  
    return svg.node();
  }

function ramp(color, n = 256) {
    var canvas = document.createElement('canvas');
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }
  