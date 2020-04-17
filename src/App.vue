<template>
  <div id="app">
    <div class="map-wrapper">
      <div id="map"></div>
      <div class="footer">Data from RapidApi covid19-data</div>
    </div>
    
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'App',
  components: {
  },
  data(){
    return {
      isloaded:false,
      data: {},
      map: null,
      mapboxKey: 'pk.eyJ1Ijoic291cnlidW5ueSIsImEiOiJjazhvOHpodDAwMG8wM2x0ZHE3b3NsbGZoIn0.bq_KvAx7F-v9_OyfsyjNdA'
    }
  },
  async created(){
    this.data = await axios({
    "method":"GET",
    "url":"https://covid19-data.p.rapidapi.com/geojson-in",
    "headers":{
    "content-type":"application/octet-stream",
    "x-rapidapi-host":"covid19-data.p.rapidapi.com",
    "x-rapidapi-key":"bd6efc5951mshe1edff48a7e805ap13db9ajsne0db115765e0"
    }
    })
    .then((response)=>{
      return response.data;
    })
    .catch((error)=>{
      console.log(error)
    })
    await this.init();
    this.map.on("load", () => {
        this.isloaded = true;
        this.map.addControl(new mapboxgl.NavigationControl(), "top-right");
    })
  },
  methods: {
    init(){
      var token =this.mapboxKey;
    mapboxgl.accessToken = token;
    this.map=  
         new mapboxgl.Map({
        container: "map",
        // style: 'mapbox://styles/mapbox/streets-v11',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [76.81350249690618, 22.78900060506338],
        minZoom: 4,
        zoom: 0,
        attributionControl: false
        })
      
    }
  },
  watch: {
    isloaded: function(val) {
      if(val && this.data.features.length>0) {
        let data = this.data;
        this.map.addSource('covid',{
          'type': 'geojson',
          'data': data
        });
        this.map.addLayer({
        'id': 'covid',
        'type': 'fill',
        'source': 'covid',
        'layout': {},
        'paint': {
          'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'active'],
          0,
          '#fced7f',
          5,
          '#ffebee',
          10,
          '#FFEC19',
          50,
          '#FFC100',
          150,
          '#FF9800',
          500,
          '#f85e5e',
          1000,
          '#c20303',
          2500,
          '#7e0404',
          5000,
          '#5c0303',
          10000,
          '#350202'
          ],
          'fill-opacity': 0.7
        }
        });
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body { margin: 0; padding: 0; }

#map { position: absolute; top: 0; bottom: 5px; width: 100%; }

.footer {
  position: absolute;
  bottom: 2rem;
  z-index: 99999;
  color: crimson;
}
</style>

