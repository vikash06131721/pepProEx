//drag on the histogram and you can observe the fading of the specific bar in the scatterplot
//This vis shows the clustering of various tissues, in combination with their occurence.
//User can select any particular tissue for detailed viewing, allows for zooming on panning.
async function renderChart(){
    // create an interval selection over an x-axis encoding
    const data1 = await loadData();
    const brush = vl.selectInterval().encodings('x');
  
    // const isOrigin = vl.selectPoint('isOrigin')
    //   .fields('tissue')
    //   .bind('legend'); // bind to legend interactions
    
    // determine opacity based on brush
    const opacity = vl.opacity().if(brush, vl.value(1.0)).value(0.0);
    // const show = vl.and(isOrigin); // combine selections
  
  
    // an overview histogram of cars per year
    // add the interval brush to select cars over time
    const overview = vl.markBar()
      .encode(
        vl.x().fieldO('tissue') // extract year unit, treat as ordinal
          .axis({title: null, labelAngle: 90}),  // no title, no label angle
        vl.y().count().title(null),             // counts, no axis title
        opacity  // modulate bar opacity based on the brush selection
      )
      .params(brush) // add interval brush selection to the chart
      .width(200)    // use the full default chart width
      .height(200);   // set chart height to 50 pixels
    
    // a detail scatterplot of horsepower vs. mileage
    const detail = vl.markPoint()
      .encode(
        vl.x().fieldQ('dim0'),
        vl.y().fieldQ('dim1'),
        vl.color().fieldN('tissue'),
        vl.tooltip(['tissue']),
        vl.size().if(brush, vl.value(100)).value(1000),
        // vl.color().if(show, vl.color().fieldN('tissue')).value('grey'),
        opacity  // modulate point opacity based on the brush selection
      )
      .params(vl.selectInterval().bind("scales"))
      .width(400)
      .height(200)
      
      
      ;
  
    // vertically concatenate (vconcat) charts
    // return vl.data(data1).vconcat(overview, detail).render();
    vl.data(data1).vconcat(overview, detail).render().then((chart) => {
              document.getElementById("pic1-container").appendChild(chart);
            });

  }


  
  
  
  
  
  