<template>
  <div v-show="isActive" :class="{widgetContainer : !isFixed}" :id="isFixed? 'layersIDFix' : 'layersID'">
    <div v-if="!isFixed" :class="{widgetHeader : !isFixed}" id="layersIDheader">
        <p style="font-weight: bold;">Lista de capas</p>
        <div>
          <button class="btn btn-info" v-on:click="isHidden = !isHidden">
            <font-awesome-icon v-if="!isHidden" icon="minus"></font-awesome-icon>
            <font-awesome-icon v-else icon="plus"></font-awesome-icon>
          </button>
          <button class="btn btn-danger" v-on:click="exitLayers()">
            <font-awesome-icon icon="times"></font-awesome-icon>
          </button>
        </div>
    </div>
    <div :class="{widgetBody : !isFixed}" v-show="!isHidden">
      <div :class="{resizable : !isFixed}">
        <ListPlegable
        v-for="(category,i) in layers" v-bind:key="i"
        v-bind:category="category"
        v-bind:index="i"
        v-on:selectLayer="onClickSelectLayer"
        v-on:removeLayer="onClickRemoveLayer"
        v-on:layerAttributes="getLayerInfo"
        >
        </ListPlegable>
      </div>
    </div>
  </div>
</template>

<script>
import ListPlegable from '@/components/mapTools/layers/ListPlegable.vue'
import {draggableDiv} from '@/components/mixin/draggableDiv.js'
import {vuex} from '@/components/mixin/vuex.js'

export default {
  name: 'HelloWorld',
  props: ['isFixed'],
  mixins:[draggableDiv, vuex],
  data() {
    return {
      isHidden: false
    }
  },
  components:{
    ListPlegable,
  },
  computed: {
    isActive: function() {
      return this.isFixed? this.isMobile : this.mapToolValues('layers').active && !this.isMobile
    }
  },
  methods:{
    onClickSelectLayer: function(categoryIndex, layerIndex) {
      //this.$store.dispatch('addActiveLayer', this.$store.getters.getLayers[categoryIndex].layers[layerIndex])
      this.executeMapToolAction('layers', 'addLayer', this.$store.getters.getLayers[categoryIndex].layers[layerIndex])
    },
    onClickRemoveLayer: function(categoryIndex, layerIndex) {
      //this.$store.dispatch('removeActiveLayer', this.$store.getters.getLayers[categoryIndex].layers[layerIndex])
      console.log("removeLayer",this.$store.getters.getLayers[categoryIndex].layers[layerIndex])
      this.executeMapToolAction('layers', 'removeLayer', this.$store.getters.getLayers[categoryIndex].layers[layerIndex])
    },
    exitLayers: function() {
      this.selectMapTool('layers', false)
    },
    getLayerInfo: function(categoryIndex, layerIndex){
      var layer=this.$store.getters.getLayers[categoryIndex].layers[layerIndex]
      if(layer.name=="arcgis"){
        this.arcgisFeatures(layer)
      }
      else this.geoserverFeatures(layer)
    },
    geoserverFeatures: function(layer){      
      var totalRecords=0
      var that=this
      var url=layer.parsed_url.protocol+'://'+layer.parsed_url.host+':'+layer.parsed_url.port+layer.parsed_url.path+
      '?service=WFS&version=2.0.0&request=GetFeature&typeNames='+layer.geoserver_data.workspace+':'+layer.geoserver_data.filename+'&count=1&outputFormat=application%2Fjson'
      this.$http.get(url)
      .then(function(response){
          totalRecords=response.data.totalFeatures
          that.executeMapToolAction('attributesTable', 'paginationInfo', {offset:0, totalRecords: totalRecords, layer:layer})
          that.selectMapTool('attributesTable', true)
      }, function(response){
        console.log("error", response)
      })
    },
    arcgisFeatures: function(layer){      
      var totalRecords=0
      var subLayers=[]
      var that=this
      that.$http.get(layer.url+'?f=json&pretty=true')
      .then(function(response){
        subLayers=response.data.layers
        that.$http.get(layer.url+'/0/query?where=objectid>0&returnCountOnly=true&f=pjson')
        .then(function(response){
          totalRecords=response.data.count
          that.executeMapToolAction('attributesTable', 'paginationInfo', {offset:0, totalRecords: totalRecords, layer:layer, layerId: 0, subLayers: subLayers})
          that.selectMapTool('attributesTable', true)
        })
      })
    }
  },
  updated () {

  },
  created () {

  },
  mounted () {
    if(!this.isFixed) {
      this.makeDraggable("layersID");
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.resizable{
  margin-top: 0.5em;
  height: 40vh;
  min-height: 20vh;
  min-width: 20vw;
  resize: both;
  overflow: auto;
}

.fixedWidget{
  margin-top: 0.5em;
  height: 100vh;
  min-height: 20vh;
  min-width: 20vw;
  resize: none;
  overflow: hidden
}

.scrollable{
  height: 110px;
  overflow-y: scroll;
}
</style>
