<template>
  <div id="app">
    <div class="top-bar my-auto">
      <p class="text-center top-bar__title">Coronavirus COVID-19 Global Cases Visualization
        <a style="color:white;margin-left:1rem;"
        href="https://github.com/sourybunny/covid-19-Geojson"
        target="_blank"
      >
        <i class="fa fa-github"></i>
        Github
      </a>
      </p>
      
    </div>
    <div id="sidebar">
      <div class="card text-center">
        <div class="h4">Today</div>
        <hr />
        <div class="card-body">
          <div class="h3 my-0">{{ global.todayCases | comma }}</div>
          <div class="card-title">Cases</div>
          <!-- <div class="">{{ global.todayDeaths | comma }}</div>
          <div class="card-title">Deaths</div>
          <div class="">{{ global.todayRecovered | comma }}</div>
          <div class="card-title">Recovered</div> -->
        </div>
      </div>
      <div class="card text-center">
        <div class="h4">Global Total</div>
        <hr />
        <div class="card-body">
          <div class="h3">{{ global.cases | comma }}</div>
          <h5 class="card-title">Cases</h5>
          <div class="">{{ global.casesPerOneMillion | comma }}</div>
          <div class="card-title">Per 1 Million</div>
        </div>
        <hr />
        <div class="card-body">
          <div class="h3">{{ global.deaths | comma }}</div>
          <h5 class="card-title">Deaths</h5>
          <div>{{ global.deathsPerOneMillion | comma }}</div>
          <div class="card-title">Per 1 Million</div>
        </div>
        <hr />
        <div class="card-body pb-4">
          <div class="h3">{{ global.recovered | comma }}</div>
          <h5 class="card-title">Recovered</h5>
          <div>{{ global.recoveredPerOneMillion | comma }}</div>
          <div class="card-title">Per 1 Million</div>
        </div>
      </div>
    </div>
    <div id="map"></div>
    <div class="info">
      <p></p>
      <div>
        This application uses
        <a href="https://rapidapi.com/ShubhGupta/api/covid19-data/details" target="_blank" rel="noopener noreferrer"
          >RapidApi Covid-19 Geojson Data</a
        >
        and <a href="https://github.com/ExpDev07/coronavirus-tracker-api" target="_blank">NovelCovidApi</a>
      </div>
    </div>
    <div class="map-overlay" id="legend">
      <h4>India</h4>
      <h5>Total Cases</h5>
    </div>
  </div>
</template>

<script>
  import axios from "axios";
  import { distanceInWordsToNow, fromUnixTime } from "date-fns";
  export default {
    name: "App",
    components: {},
    computed: {
      selectedItem: {
        get() {
          return this.selected;
        },
      },
    },
    data() {
      return {
        isloaded: false,
        countries: {},
        data: {},
        global: {},
        draw: null,
        selected: null,
        map: null,
        type: "country",
        mapboxKey: "pk.eyJ1Ijoic291cnlidW5ueSIsImEiOiJjazhvOHpodDAwMG8wM2x0ZHE3b3NsbGZoIn0.bq_KvAx7F-v9_OyfsyjNdA",
      };
    },

    async mounted() {
      await this.getGlobalData();
      await this.get_india_data();
      await this.get_countries_data();
      await this.init();
      await this.initDraw();
      this.map.on("load", () => {
        this.isloaded = true;
        this.map.addControl(new mapboxgl.NavigationControl(), "top-right");
        this.map.addControl(this.draw);
        this.map.on("draw.selectionchange", (e) => {
          this.selected = null;
          this.selected = e.features[0];
        });
      });
    },
    methods: {
      async getGlobalData() {
        let response;
        try {
          response = await axios.get("https://corona.lmao.ninja/v2/all");
        } catch (e) {
          console.log("error");
          return;
        }
        const { data = {} } = response;
        this.global = { ...data };
        console.log(data);
      },
      async get_countries() {
        // this.map.on("load", () => {
        this.map.addSource("coronacases", {
          "type": "geojson",
          "data": this.countries,
          "cluster": true,
          "clusterRadius": 80,
          "clusterMaxZoom": 14,
        });
        this.map.addLayer({
          id: "clusters",
          type: "circle",
          source: "coronacases",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 20, "#f28cb1"],
            "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
          },
        });

        this.map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "coronacases",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });

        // let map =this.map;
        this.countries.features.forEach((marker) => {
          // map.loadImage(marker.properties.countryInfo.flag, (error, image)=> {
          //   if (error) throw error;
          //   map.addImage(`m-${marker.properties.countryInfo._id}`, image);
          //   map.addSource(`m-${marker.properties.countryInfo._id}`, {
          //     "type": "geojson",
          //     "data": {
          //       "type": "FeatureCollection",
          //       "features": [
          //         {
          //           "type": "Feature",
          //           "geometry": {
          //             "type": "Point",
          //             "coordinates": marker.geometry.coordinates,
          //           },
          //         },
          //       ],
          //     },
          //   });
          //   map.addLayer({
          //     "id": `m-${marker.properties.countryInfo._id}`,
          //     "type": "symbol",
          //     "source": `m-${marker.properties.countryInfo._id}`,
          //     "layout": {
          //       "icon-image": `m-${marker.properties.countryInfo._id}`,
          //       "icon-size": 0.05,
          //     },
          //   });
          var el = document.createElement("div");
          el.className = "marker";
          el.style.backgroundImage = `url("${marker.properties.countryInfo.flag}")`;
          el.style.width = "12px";
          el.style.height = "9px";
          el.style.opacity = 0.6;

          new mapboxgl.Marker(el, {
            offset: {
              x: 0,
              y: -14,
            },
          })
            .setLngLat(marker.geometry.coordinates)
            .addTo(this.map);
        });
        this.map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "coronacases",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 6,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });
        this.map.on("click", "clusters", (e) => {
          console.log(this.map);
          var features = this.map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          var clusterId = features[0].properties.cluster_id;
          this.map.getSource("coronacases").getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            this.map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
        });
        let popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: "country-details",
        });

        this.map.on("mouseenter", "unclustered-point", (e) => {
          // this.openCountryPopup(e);
          let coordinates = e.features[0].geometry.coordinates.slice();
          // var active = e.features[0].properties.active;
          let popup_data = this.getPopupHtml(e.features[0].properties);
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          popup
            .setLngLat(coordinates)
            .setHTML(popup_data)
            .addTo(this.map);
        });
        this.map.on("mouseleave", "unclustered-point", (e) => {
          this.map.getCanvas().style.cursor = "";
          popup.remove();
        });
        this.map.on("mouseenter", "clusters", () => {
          this.map.getCanvas().style.cursor = "pointer";
        });
        this.map.on("mouseleave", "clusters", () => {
          this.map.getCanvas().style.cursor = "";
        });
        // });
      },
      init() {
        var token = this.mapboxKey;
        mapboxgl.accessToken = token;
        this.map = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/dark-v10",
          center: [80.81350249690618, 22.78900060506338],
          minZoom: 0,
          zoom: 2,
          attributionControl: false,
        });
        // this.map = new mapboxgl.Map({
        //   container: "map",
        //   // style: 'mapbox://styles/mapbox/streets-v11',
        //   style: "mapbox://styles/mapbox/light-v10",
        //   center: [80.81350249690618, 22.78900060506338],
        //   minZoom: 3,
        //   zoom: 0,
        //   attributionControl: false,
        // });
      },
      initDraw() {
        this.draw = new MapboxDraw({
          keybindings: false,
          userProperties: true,
          displayControlsDefault: false,
        });
      },
      getPopupHtml(props) {
        let flag = JSON.parse(props.countryInfo).flag;
        return `
          <span class="popup-wrapper">
        <span class="country-card">
          <h2>${props.country}</h2>
          <div class="country-card--flag">
            <img src="${flag}" />
          </div>
          <ul>
            <li>Confirmed: ${props.cases}</li>
            <li>Deaths: ${props.deaths}</li>
            <li>Recovered: ${props.recovered}</li>
          </ul>
        </span>
      </span>
      `;
      },
      async get_india_data() {
        this.data = await axios({
          "method": "GET",
          "url": "https://covid19-data.p.rapidapi.com/geojson-in",
          "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "covid19-data.p.rapidapi.com",
            "x-rapidapi-key": "bd6efc5951mshe1edff48a7e805ap13db9ajsne0db115765e0",
          },
        })
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            console.log(error);
          });
      },
      async get_countries_data() {
        let response;
        try {
          response = await axios.get("https://corona.lmao.ninja/v2/countries");
        } catch (e) {
          console.log("error");
          return;
        }
        const { data = [] } = response;
        if (!data.length) return;
        const collection = {
          type: "FeatureCollection",
          features: data.map((country = {}) => {
            const { countryInfo = {} } = country;
            const { lat, long: lng } = countryInfo;
            return {
              type: "Feature",
              properties: {
                ...country,
              },
              geometry: {
                type: "Point",
                coordinates: [lng, lat],
              },
            };
          }),
        };
        this.countries = { ...collection };
      },
      add_layer_india() {
        let data = { ...this.data };
        this.map.addSource("covid", {
          "type": "geojson",
          "data": data,
        });
        this.draw.add(data);
        var layers = ["0 - 500", "500 - 1,000", "1,000 - 5,000", "5,000 - 10,000", "10,000 - 25,000", "25,000 - 50,000", "50,000 +"];
        var colors = ["#FFEDA0", "#FFEC19", "#e96d28", "#df2c2b", "#b6421f", "#610d0e", "#350202"];
        layers.forEach((layer, i) => {
          var layer = layers[i];
          var color = colors[i];
          var item = document.createElement("div");
          var key = document.createElement("span");
          key.className = "legend-key";
          key.style.backgroundColor = color;

          var value = document.createElement("span");
          value.innerHTML = layer;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });
        this.map.addLayer({
          "id": "covid",
          "type": "fill",
          "source": "covid",
          "layout": {},
          "paint": {
            "fill-outline-color": "rgba(218, 6, 6, 0.685)",
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "active"],
              0,
              "#fced7f",
              500,
              "#FFEC19",
              1000,
              "#e96d28",
              5000,
              "#df2c2b",
              10000,
              "#b6421f",
              25000,
              "#610d0e",
              50000,
              "#350202",
            ],
            "fill-opacity": 0.8,
          },
        });
      },
      addPopup(data) {
        var popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: false });
        popup
          .setLngLat(data.coordinates)
          .setHTML(
            "<h4 style='color:black'>" +
              data.info.name +
              "</h4>" +
              '<p class="title">Active: <span class="">' +
              data.info.active +
              "</span></p>" +
              '<p class="title">Recovered: <span class="">' +
              data.info.recovered +
              "</span></p>" +
              '<p class="title">Deaths: <span class="">' +
              data.info.deaths +
              "</span></p>"
          )
          .addTo(this.map);
        this.map.flyTo({
          center: data.coordinates,
          zoom: 6,
          curve: 1,
        });
      },
    },
    watch: {
      selectedItem: function(val) {
        if (val) {
          var coordinates = [];
          coordinates[0] = this.selectedItem.properties.longitude;
          coordinates[1] = this.selectedItem.properties.latitude;

          var info = {};
          info.name = this.selectedItem.properties.name;
          info.active = this.selectedItem.properties.active;
          info.recovered = this.selectedItem.properties.recovered;
          info.deaths = this.selectedItem.properties.deaths;
          // this.removePopup();
          this.addPopup({ coordinates: coordinates, info: info });
        }
      },
      // type: function(val) {
      //   if (this.map && this.type == "world") {
      //     this.get_countries();
      //   } else if (this.map && this.type == "country") {
      //     this.add_layer_india();
      //   }
      // },
      isloaded: function(val) {
        if (val) {
          if (this.map && this.draw && this.data.features.length) this.add_layer_india();
          if (this.map && this.countries) this.get_countries();
        }
      },
    },
  };
</script>

<style lang="scss">
  html {
    font-size: 16px;
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body {
    margin: 0;
    padding: 0;
  }
  .top-bar {
    background: #1c1d1d;
    height: 3rem;
    color: white;
    &__title {
      padding: 0.8rem;
      font-size: 1.1rem;
      opacity: 0.8;
    }
  }
  #map {
    position: absolute;
    top: 3rem;
    height: 88%;
    bottom: 0;
    right: 0;
    // width: calc(100vw - 15rem);
    width: 84%;
  }
  #sidebar {
    color: white;
    position: absolute;
    top: 2.7rem;
    height: auto;
    // min-height: 100vh;
    left: 0;
    width: 16%;
    background: #1c1d1d;
    .card {
      margin: 0.5rem;
      border-radius: 0.2rem;
      padding: 0rem;
      background: #3c4952;
      padding: 0.3rem 0rem 1rem;
      &-body {
        .card-title {
          opacity: 0.8;
        }
      }
      hr {
        margin: 0;
        margin-top: 0.7rem;
        opacity: 0.3;
      }
    }
    .country-cases {
      margin-top: 1rem;
      height: 70vh;
      overflow: auto;
    }
  }
  .info {
    color: black;
    position: absolute;
    bottom: 0;
    right: 0;
    // width: calc(100vw - 15rem);
    width: 84%;
    background: lightgray;
    padding-left: 1rem;
    div {
      padding-bottom: 0.4rem;
    }
  }
  .footer {
    position: absolute;
    bottom: 2rem;
    z-index: 99999;
    color: crimson;
  }
  .mapboxgl-popup {
    max-width: 400px;
    font: 12px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
    z-index: 999999999;
  }
  .active-count {
    color: rgba(218, 6, 6, 0.685);
    font-weight: bold;
  }
  .recovered-count {
    color: rgba(2, 107, 2, 0.726);
    font-weight: bold;
  }
  .deaths-count {
    color: black;
    font-weight: bold;
  }
  .title {
    color: gray;
    text-align: left;
  }
  .map-overlay {
    position: absolute;
    bottom: 4rem;
    right: 0;
    background: rgba(255, 255, 255, 0.8);
    background-color: #3c4952;
    color: white;
    margin-right: 0.5rem;
    font-family: Arial, sans-serif;
    overflow: auto;
    border-radius: 3px;
  }
  .map-overlay div {
    margin-top: 0.5rem;
  }
  #features {
    top: 0;
    height: 100px;
    margin-top: 20px;
    width: 300px;
  }

  #legend {
    padding: 15px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    line-height: 18px;
    height: 150px;
    margin-bottom: 40px;
    width: 150px;
    height: 270px;
  }

  .legend-key {
    display: inline-block;
    border-radius: 20%;
    width: 10px;
    height: 10px;
    margin-right: 5px;
  }
  .marker {
    display: block;
    border: none;
    background-repeat: no-repeat;
    background-size: cover;
    /* border-radius: 50%; */
    cursor: pointer;
    padding: 0;
  }

  .country-details .mapboxgl-popup-content {
    background-color: #212b31;
    color: white;
    border-radius: 0.3rem;
    box-shadow: 0 2px 15px rgba(black, 0.7);
    width: 12.3rem;
    .country-card {
      position: relative;
      &--flag {
        position: absolute;
        top: 0.2rem;
        left: 9.35rem;

        img {
          box-shadow: 0 1px 6px rgba(black, 0.5);
          height: 2rem;
          width: 3rem;
        }
      }
      h2 {
        font-size: 1.5em;
        line-height: 1.2;
        margin-bottom: 0.1em;
        margin-top: 0;
      }

      h3 {
        font-size: 1.2em;
        margin: 0.1em 0;
        font-weight: normal;
        color: grey;
      }

      ul,
      p {
        font-weight: normal;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0.6em 0 0;
      }
    }
  }
</style>
