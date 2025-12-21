<template>
  <div class="location-picker">
    <t-button theme="default" variant="outline" @click="openMapDialog">
      <template #icon><t-icon name="location" /></template>
      {{ modelValue?.name || '选择位置' }}
    </t-button>

    <t-dialog
      v-model:visible="dialogVisible"
      header="选择位置"
      width="700px"
      :footer="false"
      attach="body"
      destroy-on-close
    >
      <div class="map-container">
        <!-- 搜索框 -->
        <div class="search-box">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索地点"
            clearable
            @enter="handleSearch"
          >
            <template #suffix-icon>
              <t-icon name="search" class="search-icon" @click="handleSearch" />
            </template>
          </t-input>
        </div>

        <!-- 地图容器 -->
        <div id="amap-container" class="map"></div>

        <!-- 搜索结果列表 -->
        <div v-if="searchResults.length" class="search-results">
          <div
            v-for="(item, index) in searchResults"
            :key="index"
            class="result-item"
            @click="selectSearchResult(item)"
          >
            <t-icon name="location" />
            <div class="result-info">
              <div class="result-name">{{ item.name }}</div>
              <div class="result-address">{{ item.address }}</div>
            </div>
          </div>
        </div>

        <!-- 当前选中位置 -->
        <div v-if="selectedLocation" class="selected-info">
          <div class="info-row">
            <span class="label">位置名称：</span>
            <t-input v-model="selectedLocation.name" placeholder="请输入位置名称" size="small" style="flex: 1" />
          </div>
          <div class="info-row">
            <span class="label">经度：</span>
            <span>{{ selectedLocation.longitude?.toFixed(6) }}</span>
          </div>
          <div class="info-row">
            <span class="label">纬度：</span>
            <span>{{ selectedLocation.latitude?.toFixed(6) }}</span>
          </div>
          <t-button theme="primary" block @click="confirmSelect">确认选择</t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

// 高德地图 API Key（Web端 JS API）
const AMAP_KEY = '2b1cb722c7f31b5a59c710453b24fb37'
// 高德地图安全密钥
const AMAP_SECRET = '558d845b31baa1ccc138e3833a55832b'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const selectedLocation = ref(null)

let map = null
let marker = null
let placeSearch = null
let geocoder = null

const openMapDialog = () => {
  dialogVisible.value = true
  nextTick(() => {
    initMap()
  })
}

const initMap = () => {
  if (!window.AMap) {
    loadAMapScript()
      .then(() => {
        console.log('地图脚本加载完成，开始创建地图')
        createMap()
      })
      .catch((error) => {
        console.error('地图初始化失败:', error)
        MessagePlugin.error('地图加载失败，请检查网络连接')
      })
  } else {
    console.log('地图已加载，直接创建')
    createMap()
  }
}

const loadAMapScript = () => {
  return new Promise((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (window.AMap && window.AMap.Map) {
      resolve()
      return
    }

    // 清理可能存在的旧脚本
    const oldScript = document.querySelector('script[src*="webapi.amap.com"]')
    if (oldScript) {
      oldScript.remove()
      window.AMap = undefined
    }

    // 设置安全密钥（必须在加载脚本之前设置）
    window._AMapSecurityConfig = {
      securityJsCode: AMAP_SECRET
    }

    // 使用 1.4.15 版本（更稳定）
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${AMAP_KEY}&plugin=AMap.PlaceSearch,AMap.Geocoder,AMap.Geolocation`

    script.onload = () => {
      console.log('高德地图加载成功')
      if (window.AMap) {
        resolve()
      } else {
        reject(new Error('AMap 未正确加载'))
      }
    }

    script.onerror = (error) => {
      console.error('高德地图加载失败:', error)
      reject(new Error('高德地图加载失败'))
    }

    document.head.appendChild(script)
  })
}

const createMap = () => {
  try {
    const AMap = window.AMap
    console.log('开始创建地图，AMap对象:', AMap)

    // 确保坐标是有效的数字
    let centerLng = 113.65
    let centerLat = 34.76

    if (props.modelValue &&
        typeof props.modelValue.longitude === 'number' &&
        typeof props.modelValue.latitude === 'number' &&
        !isNaN(props.modelValue.longitude) &&
        !isNaN(props.modelValue.latitude)) {
      centerLng = props.modelValue.longitude
      centerLat = props.modelValue.latitude
    }

    const defaultCenter = [centerLng, centerLat]
    console.log('地图中心点:', defaultCenter)

    map = new AMap.Map('amap-container', {
      zoom: 15,
      center: defaultCenter,
      resizeEnable: true
    })

    console.log('地图创建成功')

    // 创建地点搜索插件
    placeSearch = new AMap.PlaceSearch({
      pageSize: 10,
      pageIndex: 1,
      city: '全国'
    })

    // 创建地理编码插件
    geocoder = new AMap.Geocoder({
      city: '全国'
    })

    console.log('插件创建成功')

    // 添加定位控件（不自动定位，点击按钮才定位）
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      showButton: true,
      buttonPosition: 'RB',
      buttonOffset: new AMap.Pixel(10, 20),
      showMarker: false,
      showCircle: false,
      panToLocation: false,  // 不自动移动到定位点
      zoomToAccuracy: false  // 不自动缩放
    })
    map.addControl(geolocation)
    
    // 定位成功回调
    AMap.event.addListener(geolocation, 'complete', (result) => {
      const { position } = result
      addMarker([position.lng, position.lat])
      
      geocoder.getAddress([position.lng, position.lat], (status, res) => {
        if (status === 'complete' && res.regeocode) {
          const address = res.regeocode.formattedAddress
          selectedLocation.value = {
            name: address.split('市').pop() || address,
            longitude: position.lng,
            latitude: position.lat
          }
        } else {
          selectedLocation.value = {
            name: '',
            longitude: position.lng,
            latitude: position.lat
          }
        }
      })
    })
    
    // 定位失败回调
    AMap.event.addListener(geolocation, 'error', (error) => {
      console.error('定位失败:', error)
      MessagePlugin.error('定位失败，请检查位置权限')
    })

    // 如果有初始值，添加标记
    if (props.modelValue) {
      addMarker(defaultCenter, props.modelValue.name)
      selectedLocation.value = { ...props.modelValue }
    }

    // 地图点击事件
    map.on('click', (e) => {
      const lnglat = e.lnglat
      addMarker([lnglat.lng, lnglat.lat])

      geocoder.getAddress([lnglat.lng, lnglat.lat], (status, result) => {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress
          selectedLocation.value = {
            name: address.split('市').pop() || address,
            longitude: lnglat.lng,
            latitude: lnglat.lat
          }
        } else {
          selectedLocation.value = {
            name: '',
            longitude: lnglat.lng,
            latitude: lnglat.lat
          }
        }
      })
    })

    console.log('地图初始化完成')
  } catch (error) {
    console.error('创建地图时出错:', error)
    MessagePlugin.error('地图创建失败: ' + error.message)
  }
}

const addMarker = (position, title = '') => {
  // 验证坐标有效性
  if (!position || !Array.isArray(position) || position.length !== 2) {
    console.error('无效的坐标:', position)
    return
  }

  const [lng, lat] = position
  if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
    console.error('坐标必须是有效的数字:', position)
    return
  }

  if (marker) {
    marker.setMap(null)
  }
  marker = new window.AMap.Marker({ position, title })
  marker.setMap(map)
  map.setCenter(position)
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  if (!placeSearch) {
    MessagePlugin.warning('地图插件加载中，请稍后再试')
    return
  }

  placeSearch.search(searchKeyword.value, (status, result) => {
    if (status === 'complete' && result.poiList) {
      searchResults.value = result.poiList.pois.map(poi => ({
        name: poi.name,
        address: poi.address || (poi.cityname || '') + (poi.adname || ''),
        longitude: poi.location.lng,
        latitude: poi.location.lat
      }))
    } else {
      searchResults.value = []
      if (status === 'no_data') {
        MessagePlugin.info('未找到相关地点')
      }
    }
  })
}

const selectSearchResult = (item) => {
  searchResults.value = []
  searchKeyword.value = ''
  addMarker([item.longitude, item.latitude], item.name)
  selectedLocation.value = {
    name: item.name,
    longitude: item.longitude,
    latitude: item.latitude
  }
}

const confirmSelect = () => {
  if (!selectedLocation.value?.name) {
    MessagePlugin.warning('请输入位置名称')
    return
  }
  emit('update:modelValue', { ...selectedLocation.value })
  dialogVisible.value = false
}

watch(dialogVisible, (val) => {
  if (!val) {
    searchResults.value = []
    searchKeyword.value = ''
    if (map) {
      map.destroy()
      map = null
    }
  }
})
</script>

<style scoped lang="less">
.location-picker {
  display: inline-block;
}

.map-container {
  position: relative;
}

.search-box {
  margin-bottom: 12px;

  .search-icon {
    cursor: pointer;
  }
}

.map {
  width: 100%;
  height: 350px;
  border-radius: 6px;
  overflow: hidden;
}

.search-results {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-2-color);
  border-radius: 6px;
  z-index: 10;
  box-shadow: var(--td-shadow-2);

  .result-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--td-bg-color-container-hover);
    }

    .result-info {
      flex: 1;
      min-width: 0;
    }

    .result-name {
      font-size: 14px;
      color: var(--td-text-color-primary);
    }

    .result-address {
      font-size: 12px;
      color: var(--td-text-color-secondary);
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.selected-info {
  margin-top: 12px;
  padding: 12px;
  background: var(--td-bg-color-container-hover);
  border-radius: 6px;

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;

    .label {
      width: 80px;
      color: var(--td-text-color-secondary);
    }
  }

  .t-button {
    margin-top: 8px;
  }
}
</style>
