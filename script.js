function getColor(num, i) {
  if (num < 12 || i === 0) {
    return "#D7F7D3";
  } else if ((12 <= num && num < 21) || i === 1) {
    return "#BCE3B8";
  } else if ((21 <= num && num < 30) || i === 2) {
    return "#A2CF9E";
  } else if ((30 <= num && num < 39) || i === 3) {
    return "#8CBC87";
  } else if ((39 <= num && 48) || i === 4) {
    return "#6CA367";
  } else if ((48 <= num && 57) || i === 5) {
    return "#50874A";
  } else if (num >= 57 || i === 6) {
    return "#34692E";
  }
}
function updateDes(county) {
  d3.select("#des-name").text(county["area_name"] + ", " + county["state"]);
  d3.select("#des-fips").text(county.fips);
  d3.select("#des-percentage").text(county["bachelorsOrHigher"]);
}
function getLegend(svg) {
  const points = Array(7)
    .fill(0)
    .map((num, i) => i);
  const side = 35;
  const xOffset = 50,
    yOffset = 230;
  const ticks = [
    "Less than 12%",
    "12% to 21%",
    "21% to 30%",
    "30% to 39%",
    "39% to 48%",
    "48% to 57%",
    "More than 57%",
  ];
  svg
    .selectAll("rect")
    .data(points)
    .enter()
    .append("rect")
    .attr("width", side)
    .attr("height", side)
    .attr("y", (d) => yOffset - d * side)
    .attr("x", (d) => xOffset)
    .attr("fill", (d) => getColor("#", d));
  svg
    .selectAll("text")
    .data(ticks)
    .enter()
    .append("text")
    .attr("x", xOffset + side + 20)
    .attr("y", (d, i) => yOffset - i * side + side / 2)
    .text((d) => d);
}

function drawMap(countyData, educationData, countyInfo, svg) {
  svg
    .selectAll("path")
    .data(countyData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("id", (d) => "c" + d.id)
    .attr("transform", "translate(30, 0)")
    .attr("fill", (d) => {
      const currCounty = educationData.find((county) => county.fips === d.id);
      return getColor(currCounty.bachelorsOrHigher, "#");
    });

  getLegend(d3.select("#canvas-des"));
}

const countyUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
let countyData, educationData;
const countyInfo = {};
const svg = d3.select("#canvas");
const button = document.getElementById("des-form-button");
const input = document.getElementById("des-form-input");
let selectedCountyId = "",
  selectedFillColor = "";

d3.json(countyUrl).then((data, error) => {
  if (error) {
    console.log(error);
  } else {
    countyData = topojson.feature(data, data.objects.counties).features;
  }
  d3.json(educationUrl).then((data, error) => {
    if (error) {
      console.log(error);
    } else {
      educationData = data;
      for (let i = 0; i < educationData.length; i++) {
        const county = educationData[i];
        countyInfo[county.fips] = county;
      }
      drawMap(countyData, educationData, countyInfo, svg);
      const countySquares = document.getElementsByClassName("county");
      for (let i = 0; i < countySquares.length; i++) {
        const county = countySquares[i];
        county.onclick = (e) => {
          const tempColor = d3.select("#" + e.target.id).attr("fill");
          d3.select("#" + e.target.id).attr("fill", "orange");
          if (selectedCountyId.length > 0) {
            d3.select("#" + selectedCountyId).attr("fill", selectedFillColor);
          }
          selectedCountyId = e.target.id;
          selectedFillColor = tempColor;
          updateDes(countyInfo[e.target.id.slice(1)]);
        };
      }
    }
  });
});
button.onclick = (e) => {
  const countyName = input.value;
  const county = educationData.find(
    (c) =>
      c.area_name.toLowerCase().split(" ").slice(0, -1).join("") ===
      countyName.split(" ").join("").toLowerCase()
  );

  if (county === undefined) {
    d3.select("#error-message").text("county not found");
  } else {
    updateDes(county);
    if ("c" + county.fips === selectedCountyId) {
      return;
    }
    const id = "c" + county.fips,
      countyPoly = d3.select("#" + id);
    const tempColor = countyPoly.attr("fill");
    countyPoly.attr("fill", "orange");
    if (selectedCountyId.length > 0) {
      d3.select("#" + selectedCountyId).attr("fill", selectedFillColor);
    }
    selectedCountyId = id;
    selectedFillColor = tempColor;
  }
};
input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    button.click();
  }
});
input.onchange = () => {
  d3.select("#error-message").text("");
};
