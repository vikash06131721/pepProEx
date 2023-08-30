import {vl} from '@vega/vega-lite-api-v5'

function drawPic1(data1)//drag on the histogram and you can observe the fading of the specific bar in the scatterplot
//This vis shows the clustering of various tissues, in combination with their occurence.
//User can select any particular tissue for detailed viewing, allows for zooming on panning.
{
  // create an interval selection over an x-axis encoding
  const brush = vegaLite.selectInterval().encodings('x');

  // const isOrigin = vl.selectPoint('isOrigin')
  //   .fields('tissue')
  //   .bind('legend'); // bind to legend interactions
  
  // determine opacity based on brush
  const opacity = vegaLite.opacity().if(brush, vegaLite.value(1.0)).value(0.0);
  // const show = vl.and(isOrigin); // combine selections


  // an overview histogram of cars per year
  // add the interval brush to select cars over time
  const overview = vegaLite.markBar()
    .encode(
      vegaLite.x().fieldO('tissue') // extract year unit, treat as ordinal
        .axis({title: null, labelAngle: 90}),  // no title, no label angle
      vegaLite.y().count().title(null),             // counts, no axis title
      opacity  // modulate bar opacity based on the brush selection
    )
    .params(brush) // add interval brush selection to the chart
    .width(400)    // use the full default chart width
    .height(200);   // set chart height to 50 pixels
  
  // a detail scatterplot of horsepower vs. mileage
  const detail = vegaLite.markPoint()
    .encode(
      vegaLite.x().fieldQ('dimA'),
      vegaLite.y().fieldQ('dimB'),
      vegaLite.color().fieldN('tissue'),
      vegaLite.tooltip(['tissue']),
      vegaLite.size().if(brush, vegaLite.value(100)).value(1000),
      // vl.color().if(show, vl.color().fieldN('tissue')).value('grey'),
      opacity  // modulate point opacity based on the brush selection
    )
    .params(vegaLite.selectInterval().bind("scales"))
    .width(700)
    .height(500)
    
    
    ;

  // vertically concatenate (vconcat) charts
  return vegaLite.data(data1).vconcat(overview, detail).render();
}


async function loadData() {
   try {
      const rows = await d3.csv("scatterplot.csv", function(d) {
         return {
            dimA: parseFloat(d.dim0),
            dimB: parseFloat(d.dim1),
            tissue: d.tissue // convert "Length" column to number
         };
      });

      console.log(rows);
   } catch (error) {
      console.error("Error loading CSV:", error);
   }
}

function testVega(){
   if (typeof vega !== 'undefined') {
      console.log('Vega is loaded.');
  } else {
      console.log('Vega is NOT loaded.');
  }
  
  if (typeof vegaLite !== 'undefined') {
      console.log('Vega-Lite is loaded.');
  } else {
      console.log('Vega-Lite is NOT loaded.');
  }
  
  if (typeof vegaEmbed !== 'undefined') {
      console.log('Vega-Embed is loaded.');
  } else {
      console.log('Vega-Embed is NOT loaded.');
  }
}
function drawChart(container, data){
   const data1 =loadData();
   testVega();
   drawPic1(data1);
   const chartWidth = 400;
   const chartHeight = 400;
   
   const xScale = d3.scaleLinear() 
            .domain([0, data.length])
            .range([0, chartWidth]);
   
   const yScale = d3.scaleLinear()
                      .domain([0, d3.max(data)]) 
                      .range([0, chartHeight]);
   
   // First and only difference, instead of creating SVG, we are appending it to container
   const svg = d3.select(container).append('svg')
       .attr('width',chartWidth)
       .attr('height',chartHeight)
 
   svg.append("g")
       .attr("fill", 'aqua')
       .selectAll("rect")
       .data(data)
       .join("rect")
       .attr("x", (d, i) => xScale(i))
       .attr("y", d => -yScale(d)+chartHeight)
       .attr("height", d => yScale(d))
       .attr("width", 10);
 }