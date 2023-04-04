<template>
	<div>
		<el-container>
			<!--侧栏-->
			<el-aside width="200px">
				<el-menu
					default-active="1"
					class="el-menu-vertical-demo"
					@select="handleSelect"
				>
					<el-menu-item index="1">
						<el-icon style="vertical-align: middle"><House /></el-icon>
						<span>湘龙花园</span>
					</el-menu-item>
					<el-menu-item index="2">
						<el-icon style="vertical-align: middle"><Connection /></el-icon>
						<span>一期二期对比</span>
					</el-menu-item>
					<el-menu-item index="3">
						<el-icon style="vertical-align: middle"><MapLocation /></el-icon>
						<span>空间量算</span>
					</el-menu-item>
					<el-menu-item index="4">
						<el-icon style="vertical-align: middle"><Pouring /></el-icon>
						<span>淹没分析</span>
					</el-menu-item>
					<el-menu-item index="5">
						<el-icon style="vertical-align: middle"><SetUp /></el-icon>
						<span>通视分析</span>
					</el-menu-item>
					<el-menu-item index="6">
						<el-icon style="vertical-align: middle"><Sunny /></el-icon>
						<span>日照分析</span>
					</el-menu-item>
					<el-menu-item index="7">
						<el-icon style="vertical-align: middle"><Document /></el-icon>
						<span>住户信息</span>
					</el-menu-item>
					<el-menu-item index="8">
						<el-icon style="vertical-align: middle"><DocumentRemove /></el-icon>
						<span>花园信息</span>
					</el-menu-item>
				</el-menu>
			</el-aside>
			<el-container>
				<!--导航栏-->
				<el-header class="header">
					<el-tag effect="dark" size="large" round>欢迎回来: roy</el-tag>
					<div class="title">虚拟湘龙花园</div>
				</el-header>
				<!--地图-->
				<el-main class="main">
					<div id="mars3dContainer" class="mars3d-container"></div>
					<!--量算工具栏-->
					<div class="measure-box" v-if="ifShowMeasure">
						<div>
							<input
								type="button"
								class="btn btn-info"
								value="清除"
								@click="removeAll"
							/>
							<!-- <input type="button" class="btn btn-info" value="结束(等同双击)" onclick="endDraw()" /> -->
							<!-- <span style="color: #cad1d1;">提示：单击下面按钮激活绘制，按提示操作即可。</span> -->
							<div
								class="checkbox checkbox-primary checkbox-inline"
								title="屏蔽拾取地形坐标，避免穿透3dtiles模型"
							>
								<input
									id="chk_onlyPickModelPosition"
									class="styled"
									type="checkbox"
								/>
								<label for="chk_onlyPickModelPosition">
									仅测量模型(不拾取地形)
								</label>
							</div>
						</div>

						<div>
							<input
								type="button"
								class="btn btn-primary"
								value="空间距离"
								@click="measureLength"
							/>
							<input
								type="button"
								class="btn btn-primary"
								value="水平面积"
								@click="measureArea"
							/>
							<input
								type="button"
								class="btn btn-primary"
								value="高度差"
								@click="measureHeight"
							/>

							<input
								type="button"
								class="btn btn-primary"
								value="坐标测量"
								@click="measurePoint"
							/>
						</div>

						<div>
							<input
								type="button"
								class="btn btn-primary"
								value="贴地距离"
								@click="measureSurfaceLength"
							/>
							<input
								type="button"
								class="btn btn-primary"
								value="贴地面积"
								@click="measureSurfaceeArea"
							/>
							<input
								type="button"
								class="btn btn-primary"
								value="三角测量"
								@click="measureTriangleHeight"
							/>

							<input
								type="button"
								class="btn btn-primary"
								value="方位角"
								@click="measureAngle"
							/>
						</div>
					</div>
					<!--淹没分析工具栏-->
					<div v-if="isFlood" class="flood-box">
						<div v-show="!isShow">
							<div class="f-mb">
								<div>
									<span>分析区域</span>
									<button @click="btnDrawExtent">绘制矩形</button>
									<button @click="btnDraw">绘制多边形</button>
									<button @click="clearDraw">清除</button>
								</div>
							</div>

							<div class="f-mb">
								<a-space>
									<span>最低海拔</span>
									<input v-model="formState.minHeight" :step="1" />米
								</a-space>
							</div>

							<div class="f-mb">
								<a-space>
									<span>最高海拔</span>
									<input v-model="formState.maxHeight" :step="1" />米
								</a-space>
							</div>
							<div class="f-mb">
								<div>
									<span>淹没速度</span>
									<input v-model="formState.speed" :step="1" />米/秒
								</div>
							</div>
							<div class="f-tac">
								<button @click="begin">开始分析</button>
							</div>
						</div>

						<div v-show="isShow">
							<div class="f-mb">
								<span>高度选择</span>
								<el-slider
									tooltipPlacement="bottom"
									v-model="formState.height"
									@change="onChangeHeight"
									:min="formState.minHeight"
									:max="formState.maxHeight"
									:step="1"
								/>
							</div>

							<div class="f-mb">
								<span>当前高度:{{ formState.height }}</span>
							</div>

							<div class="f-tac">
								<button @click="startPlay">
									{{ isStart ? '暂停' : '播放' }}
								</button>
								<button @click="goBack">返回</button>
								<el-checkbox
									label="显示全景"
									v-model="formState.enabledShowElse"
									@change="onChangeElse"
								/>
							</div>
						</div>
					</div>
					<!--通视分析工具栏-->
					<div class="flood-box" v-if="isTongShi">
						<div class="f-mb">
							<button @click="drawLine">通视分析</button>
							<button @click="drawCircle">圆形通视分析</button>
							<button @click="clearAll">清除</button>
						</div>
					</div>
					<!--光照分析工具栏-->
					<div class="flood-box" v-if="isShadows">
						<div class="f-mb">
							<div>
								<span>时间选择:</span>
								<el-slider
									tooltipPlacement="bottom"
									v-model="timeVal"
									@change="myTimeChange"
									:min="0"
									:max="1440"
									:step="1"
								/>
							</div>
						</div>
						<div class="f-mb">
							<div>
								<span>当前时间:</span>
								<span>{{ currDate }} {{ hours }} 时 {{ minutes }}分</span>
							</div>
						</div>
						<div class="f-mb">
							<div>
								<span>自动播放:</span>
								<button @click="myStartPlayLight">播放</button>
								<button @click="myStopPlayLight">暂停</button>
							</div>
						</div>
					</div>
					<div class="tableBox" v-if="isTable">
						<el-table
							:data="tableData"
							border
							height="100%"
							style="width: 100%"
						>
							<el-table-column prop="ID" label="序号" width="180" />
							<el-table-column prop="居住人数" label="居住人数" width="180" />
							<el-table-column prop="房主" label="房主" width="180" />
							<el-table-column prop="AREA" label="面积 m²" />
						</el-table>
					</div>
					<div class="tableBox2" v-show="isCharts">
						<div class="c1"></div>
						<div class="c2"></div>
						<div class="c3"></div>
						<div class="c4"></div>
					</div>
				</el-main>
			</el-container>
		</el-container>
	</div>
</template>
<script setup>
import { onMounted, reactive, ref, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import 'mars3d-cesium/Build/Cesium/Widgets/widgets.css'; //依赖的cesium库本身css
import 'mars3d/dist/mars3d.css';
import * as mars3d from 'mars3d';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
let map;
const eventTarget = new mars3d.BaseClass(); // 事件对象，用于抛出事件到面板中
let threeDTilesLayer; //第一次加载的模型
let floodTilesLayer; //洪水淹没加载的模型
let mapSplit; //卷帘对比图层
let measure; //量算组件
let floodByGraphic; //淹没组件
let drawPotions;
const ifShowMeasure = ref(false);
const formState = reactive({
	minHeight: 0,
	maxHeight: 0,
	height: 0,
	speed: 1,
});
const isFlood = ref(false);
const isStart = ref(true);
const isShow = ref(false);
const floodColor = ref('rgba(0, 123, 230, 0.5)');
let sightline;
const isTongShi = ref(false);
let shadows;
const isShadows = ref(false);
const currDate = ref(dayjs().format('YYYY-MM-DD'));
const timeVal = ref(420);
const hours = computed(() => Math.floor(timeVal.value / 60));
const minutes = computed(() => Math.floor(timeVal.value % 60));
const isTable = ref(false);
const isCharts = ref(false);

onMounted(() => {
	map = initMap();
	threeDTilesLayer = queryTilesetData();
	floodTilesLayer = queryFloodTilesetData();
	addLayer(threeDTilesLayer);
	queryGeoJsonData();
	eventTarget.on('heightChange', e => {
		isShow.value = true;
		formState.height = Math.ceil(e.height);
	});
	eventTarget.on('changeShadows', event => {
		const date = event.shadowTime;
		timeVal.value = date.getHours() * 60 + date.getMinutes();
	});
  //#region 图表
	var myChart1 = echarts.init(document.querySelector('.c1'), null, {
    width: 800,
    height: 500
  });
	myChart1.setOption( {
  title: {
    text: '车位情况',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 148, name: '已占车位' },
        { value: 235, name: '剩余车位' },

      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});
  var myChart2 = echarts.init(document.querySelector('.c2'), null, {
    width: 800,
    height: 500
  });
	myChart2.setOption({
  title: {
    text: '实际住户占比',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 230, name: '入住' },
        { value: 100, name: '未入住' },

      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});
  var myChart3 = echarts.init(document.querySelector('.c3'), null, {
    width: 800,
    height: 500
  });
	myChart3.setOption({
    title: {
    text: '电力消耗情况',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [1420, 1032, 1901, 1034, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
});
  var myChart4 = echarts.init(document.querySelector('.c4'), null, {
    width: 800,
    height: 500
  });
	myChart4.setOption({
    title: {
    text: '水资源消耗情况',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [1020, 1132, 1901, 2134, 1290, 1830, 1420],
      type: 'line',
      smooth: true
    }
  ]
});
 //#endregion
});
onUnmounted(() => {
	map = null;
});
//初始化地图
function initMap() {
	// 创建三维地球场景
	const map = new mars3d.Map('mars3dContainer', {
		scene: {
			center: {
				lat: 28.267803,
				lng: 113.061611,
			},
			showSun: true,
			showMoon: true,
			showSkyBox: true,
			showSkyAtmosphere: true,
			fog: true,
			fxaa: true,
			globe: {
				showGroundAtmosphere: false, // 关闭大气（球表面白蒙蒙的效果）
				depthTestAgainstTerrain: false,
				baseColor: '#546a53',
			},
			cameraController: {
				zoomFactor: 3.0,
				minimumZoomDistance: 1,
				maximumZoomDistance: 50000000,
				enableRotate: true,
				enableZoom: true,
			},
		},
		control: {
			contextmenu: { hasDefault: true }, // 右键菜单
		},
		terrain: {
			//url: '//data.mars3d.cn/terrain',
			show: false,
		},
		basemaps: [
			{
				name: '天地图影像',
				//icon: 'img/basemaps/tdt_img.png',
				type: 'tdt',
				layer: 'img_d',
				show: true,
			},
		],
	});
	sightline = new mars3d.thing.Sightline({
		visibleColor: new mars3d.Cesium.Color(0, 1, 0, 0.4),
		hiddenColor: new mars3d.Cesium.Color(1, 0, 0, 0.4),
		// depthFailColor: Cesium.Color.fromCssColorString("#db2c8f"),
	});
	map.addThing(sightline);
	// 基于polygon矢量面抬高模拟，只支持单个区域
	floodByGraphic = new mars3d.thing.FloodByGraphic({
		// perPositionHeight: true, // 是否每个分析点高度都不一样
		style: {
			color: '#007be6',
			opacity: 0.5,
			outline: false,
		},
	});
	floodByGraphic.on(mars3d.EventType.start, function (e) {
		console.log('开始分析', e);
	});
	floodByGraphic.on(mars3d.EventType.change, function (e) {
		const height = e.height;
		eventTarget.fire('heightChange', { height });
	});
	floodByGraphic.on(mars3d.EventType.end, function (e) {
		console.log('结束分析', e);
	});
	const graphicLayer = new mars3d.layer.GeoJsonLayer({
		name: '房屋信息',
		url: '/MERGE.json',
		clampToGround: true,
		popup:
			'房屋ID:{ID} <br/> 居住人数: {居住人数}<br/>  房主: {房主}<br/> 面积: {AREA} m²',
		symbol: {
			type: 'polygon',
			styleOptions: {
				opacity: 0.01,
				color: 'rgba(255,255,255,0)',
			},
		},
	});
	map.addLayer(graphicLayer);
	// load事件,必须在load完成前绑定才能监听

	graphicLayer.on(mars3d.EventType.load, function (event) {
		if (event.layer) {
			console.log('数据加载完成', event);
		}
	});
	// 单击事件
	graphicLayer.on(mars3d.EventType.click, function (event) {
		console.log('单击了图层', event);
	});

	// 创建DIV数据图层
	const videoGraphicLayer = new mars3d.layer.GraphicLayer();
	map.addLayer(videoGraphicLayer);
	addRandomGraphicByCount(videoGraphicLayer, [113.064212, 28.267046, 5]);
	addRandomGraphic2ByCount(videoGraphicLayer, [113.061906, 28.268769, 5]);
	return map;
}
function queryGeoJsonData() {}
//获取模型
function queryTilesetData() {
	const tiles3dLayer = new mars3d.layer.TilesetLayer({
		name: '碧桂园',
		url: 'http://172.30.63.2/d3dt/cs_xljy_2022.03.15/tileset.json',
		maximumMemoryUsage: 64,
		dynamicScreenSpaceError: true,
		cullWithChildrenBounds: true,
		skipLevelOfDetail: true, //113.061611,28.267803
		center: {
			lat: 28.267803,
			lng: 113.061611,
			alt: 100,
			heading: 7,
			pitch: -29,
		},
		position: {
			alt: 35,
		},
		preferLeaves: false,
		flyTo: false, //false TODO:交付记得改回来
		shadows: Cesium.ShadowMode.ENABLED,
	});
	tiles3dLayer.allowDrillPick = true;
	shadows = new mars3d.thing.Shadows({
		multiplier: 1600,
	});
	shadows.on(mars3d.EventType.change, function () {
		const shadowTime = shadows.time;
		eventTarget.fire('changeShadows', { shadowTime });
	});
	return tiles3dLayer;
}
function queryFloodTilesetData() {
	const tiles3dLayer = new mars3d.layer.TilesetLayer({
		name: '碧桂园',
		url: 'http://172.30.63.2/d3dt/cs_xljy_2022.03.15/tileset.json',
		maximumMemoryUsage: 32,
		dynamicScreenSpaceError: true,
		cullWithChildrenBounds: true,
		skipLevelOfDetail: true, //113.061611,28.267803
		center: {
			lat: 28.267803,
			lng: 113.061611,
			alt: 100,
			heading: 7,
			pitch: -29,
		},
		position: {
			alt: 79,
		},
		preferLeaves: false,
		flyTo: true, //false TODO:交付记得改回来
		shadows: Cesium.ShadowMode.ENABLED,
	});
	tiles3dLayer.allowDrillPick = true;
	return tiles3dLayer;
}
function addLayer(layer) {
	map.addLayer(layer);
	//layer.flyTo({
	//  duration: 5
	//});
}
function removeLayer(layer) {
	map.removeLayer(layer);
}
//菜单切换
function handleSelect(key, keyPath) {
	console.log(key, keyPath);
	ifShowMeasure.value = false;
	isFlood.value = false;
	isTongShi.value = false;
	isShadows.value = false;
	isTable.value = false;
  isCharts.value = false;
	map.removeThing(shadows);
	map.removeThing(floodByGraphic);
	map.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
	map.viewer.scene.requestRender();
	removeLayer(floodTilesLayer);
	//移除原本的地图,切换成卷帘
	if (key == '2') {
		removeLayer(threeDTilesLayer);
		contrast();
		return;
	} else if (key == '1') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
    if (!map.getLayer('碧桂园')) {
			addLayer(threeDTilesLayer);
		}
		addLayer(threeDTilesLayer);
		return;
	} else if (key == '3') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
		if (!map.getLayer('碧桂园')) {
			addLayer(threeDTilesLayer);
		}
		startMeasure();
		ifShowMeasure.value = true;
		return;
	} else if (key == '4') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
		removeLayer(threeDTilesLayer);
		map.addThing(floodByGraphic);
		addLayer(floodTilesLayer);
		map.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
			url: '//data.mars3d.cn/terrain',
			show: true,
		});
		isFlood.value = true;
		return;
	} else if (key == '5') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
		if (!map.getLayer('碧桂园')) {
			addLayer(threeDTilesLayer);
		}
		isTongShi.value = true;
		return;
	} else if (key == '6') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
		if (!map.getLayer('碧桂园')) {
			addLayer(threeDTilesLayer);
		}
		map.addThing(shadows);
		isShadows.value = true;
		return;
	} else if (key == '7') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
		if (!map.getLayer('碧桂园')) {
			addLayer(threeDTilesLayer);
		}
		isTable.value = true;
		return;
	} else if (key == '8') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
      mapSplit = null;
		}
		if (!map.getLayer('碧桂园')) {
			addLayer(threeDTilesLayer);
		}
		isCharts.value = true;
		return;
	}
}
//卷帘
function contrast() {
	mapSplit = new mars3d.control.MapSplit({
		rightLayer: [
			//{ name: '天地图卫星', type: 'tdt', layer: 'img_d' },
			{
				name: '碧桂园一期',
				type: '3dtiles',
				url: 'http://172.30.63.2/d3dt/cs_xljy_2022.03.15/tileset.json',
				center: {
					lat: 28.267803,
					lng: 113.061611, //113.062522,28.267795
					alt: 150,
					heading: 7,
					pitch: -29,
				},
				position: {
					lat: 28.267795,
					lng: 113.062522,
					alt: 35,
				},
				preferLeaves: false,
				maximumMemoryUsage: 32,
				dynamicScreenSpaceError: true,
				cullWithChildrenBounds: true,
				skipLevelOfDetail: true,
				flyTo: true,
			},
		],
		leftLayer: [
			//{ name: '天地图卫星', type: 'tdt', layer: 'img_d' },
			{
				name: '碧桂园二期',
				type: '3dtiles',
				url: 'http://172.30.63.2/d3dt/cs_xljy_2022.06.21/tileset.json',
				center: {
					lat: 28.267803,
					lng: 113.061611, //113.062522,28.267795
					alt: 150,
					heading: 7,
					pitch: -29,
				},
				position: {
					lat: 28.267959,
					lng: 113.062431,
					alt: 35,
				},
				preferLeaves: false,
				maximumMemoryUsage: 32,
				dynamicScreenSpaceError: true,
				cullWithChildrenBounds: true,
				skipLevelOfDetail: true, //113.061611,28.267803
				flyTo: true,
			},
		],
	});
	map.addControl(mapSplit);
}
//#region 量算

function startMeasure() {
	measure = new mars3d.thing.Measure({
		label: {
			color: '#ffffff',
			font_family: '楷体',
			font_size: 20,
			background: false,
		},
	});
	map.addThing(measure);
	measure.on(mars3d.EventType.start, function (e) {
		console.log('开始异步分析', e);
	});
	measure.on(mars3d.EventType.end, function (e) {
		console.log('完成异步分析', e);
	});
}
//空间距离
function measureLength() {
	measure.distance({
		showAddText: true,
		label: {
			// 自定义显示label的graphic类型
			type: 'div',
			updateText: function (text, graphic) {
				// updateText是必须，用于动态更新 text
				graphic.html = `<div class="marsGreenGradientPnl" >${text}</div>`;
			},
			// 下面是graphic对应类型本身的参数
			html: `<div class="marsGreenGradientPnl" ></div>`,
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		},
		// style: {
		//   color: '#ffff00',
		//   width: 3,
		//   clampToGround: false //是否贴地
		// }
	});
}
// 贴地距离
function measureSurfaceLength() {
	measure.distanceSurface({
		showAddText: true,
		exact: false, // 是否进行精确计算， 传false时是否快速概略计算方式，该方式计算精度较低，但计算速度快，仅能计算在当前视域内坐标的高度
		// unit: 'm', //支持传入指定计量单位
		// style: {
		//   color: '#ffff00',
		//   width: 3,
		//   clampToGround: true //是否贴地
		// }
	});
}
// 水平面积
function measureArea() {
	measure.area({
		// style: {
		//   color: '#00fff2',
		//   opacity: 0.4,
		//   outline: true,
		//   outlineColor: '#fafa5a',
		//   outlineWidth: 1,
		//   clampToGround: false //贴地
		// }
	});
}
// 贴地面积
function measureSurfaceeArea() {
	measure.areaSurface({
		style: {
			color: '#ffff00',
		},
		splitNum: 10, // step插值分割的个数
		exact: false, // 是否进行精确计算， 传false时是否快速概略计算方式，该方式计算精度较低，但计算速度快，仅能计算在当前视域内坐标的高度
	});
}
// 高度差
function measureHeight() {
	measure.height();
}
// 三角测量
function measureTriangleHeight() {
	measure.heightTriangle();
}
// 方位角
function measureAngle() {
	measure.angle();
}
// 坐标测量
function measurePoint() {
	measure.point();
}
function removeAll() {
	measure.clear();
}
//#endregion
//#region 洪水模拟

// 绘制矩形
function mapBtnDrawExtent(callback) {
	floodClearDraw();
	map.graphicLayer.startDraw({
		type: 'rectangle',
		style: {
			color: '#007be6',
			opacity: 0.8,
			outline: false,
		},
		success: function (graphic) {
			// 绘制成功后回调
			const positions = graphic.getOutlinePositions(false);
			// 区域
			drawPotions = positions;
			if (floodByGraphic.options.perPositionHeight) {
				// eslint-disable-next-line
				callback(-100, 100);
			} else {
				// 求最大、最小高度值
				graphic.show = false; // 会遮挡深度图，所以需要隐藏
				mars3d.PolyUtil.interPolygonByDepth({
					scene: map.scene,
					positions,
				}).then(result => {
					graphic.show = true; // 恢复显示
					callback(result.minHeight, result.maxHeight);
				});
			}
		},
	});
}
// 绘制多边形
function mapBtnDraw(callback) {
	floodClearDraw();
	map.graphicLayer.startDraw({
		type: 'polygon',
		style: {
			color: '#007be6',
			opacity: 0.5,
			outline: false,
		},
		success: function (graphic) {
			const positions = graphic.positionsShow;
			drawPotions = positions;
			if (floodByGraphic.options.perPositionHeight) {
				// eslint-disable-next-line
				callback(-100, 100);
			} else {
				showLoading();
				// 求最大、最小高度值
				graphic.show = false; // 会遮挡深度图，所以需要隐藏
				mars3d.PolyUtil.interPolygonByDepth({
					scene: map.scene,
					positions,
				}).then(result => {
					graphic.show = true; // 恢复显示
					hideLoading();
					callback(result.minHeight, result.maxHeight);
				});
			}
		},
	});
}
function floodClearDraw() {
	drawPotions = null;
	map.graphicLayer.clear();

	if (floodByGraphic) {
		floodByGraphic.clear();
	}
}
// 求最大、最小高度值
function updateHeightRange(graphic, positions, callback) {
	// 求最大、最小高度值
	graphic.show = false; // 会遮挡深度图，所以需要隐藏
	mars3d.PolyUtil.interPolygonByDepth({ scene: map.scene, positions }).then(
		result => {
			graphic.show = true; // 恢复显示
			const minHeight = Math.ceil(result.minHeight);
			const maxHeight = Math.floor(result.maxHeight);
			callback(minHeight, maxHeight);
		}
	);
}

// 开始量算分析
function mapBegin(data) {
	if (drawPotions == null) {
		ElMessage('请首先绘制分析区域！');
		return;
	}
	map.graphicLayer.clear();
	floodByGraphic.setOptions({
		positions: drawPotions,
		minHeight: Number(data.minHeight),
		maxHeight: Number(data.maxHeight),
		speed: Number(data.speed),
	});
	floodByGraphic.start();
}
// 高度选择
function mapOnChangeHeight(height) {
	floodByGraphic.height = height;
}
// 颜色发生改变
function mapOnChangeColor(color) {
	floodByMaterial.color = color;
}
// 自动播放
function mapStartPlay() {
	if (floodByGraphic.isStart) {
		floodByGraphic.stop();
	} else {
		floodByGraphic.start();
	}
}
// 是否显示非淹没区域
function mapOnChangeElse(val) {
	floodByMaterial.showElseArea = val;
}
//#endregion
//#region 通视
//清除通视分析
function mapClearDraw() {
	floodByGraphic.clear();
	map.graphicLayer.clear();
}
//画圆通视分析
function drawCircle() {
	map.graphicLayer.clear();
	map.graphicLayer.startDraw({
		type: 'circle',
		style: {
			color: '#ffff00',
			opacity: 0.2,
			clampToGround: true,
		},
		success: function (graphic) {
			// 绘制成功后回调
			let center = graphic.positionShow;
			center = mars3d.PointUtil.addPositionsHeight(center, 1.5); // 加人的身高等因素，略微抬高一些
			const targetPoints = graphic.getOutlinePositions(false, 45);
			map.graphicLayer.clear();
			map.scene.globe.depthTestAgainstTerrain = true;
			for (let i = 0; i < targetPoints.length; i++) {
				let targetPoint = targetPoints[i];
				targetPoint = mars3d.PointUtil.getSurfacePosition(
					map.scene,
					targetPoint
				);
				sightline.add(center, targetPoint);
			}
			createPoint(center, true);
			map.scene.globe.depthTestAgainstTerrain = false;
		},
	});
}
//线通视分析
function drawLine() {
	map.graphicLayer.clear();
	map.graphicLayer.startDraw({
		type: 'polyline',
		maxPointNum: 2,
		style: {
			color: '#55ff33',
			width: 3,
		},
		success: function (graphic) {
			// 绘制成功后回调
			const positions = graphic.positionsShow;
			map.graphicLayer.clear();
			map.scene.globe.depthTestAgainstTerrain = true;
			const center = positions[0];
			const targetPoint = positions[1];
			sightline.add(center, targetPoint, { offsetHeight: 1.5 }); // 1.5是加人的身高等因素，略微抬高一些
			createPoint(center, true);
			createPoint(targetPoint, false);
			map.scene.globe.depthTestAgainstTerrain = false;
		},
	});
}
//通视分析点
function createPoint(position, isFirst) {
	const graphic = new mars3d.graphic.PointEntity({
		position: position,
		style: {
			color: Cesium.Color.fromCssColorString('#3388ff'),
			pixelSize: 6,
			outlineColor: Cesium.Color.fromCssColorString('#ffffff'),
			outlineWidth: 2,
			scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.2),
			label: {
				text: isFirst ? '观察位置' : '目标点',
				font_size: 17,
				font_family: '楷体',
				color: Cesium.Color.AZURE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
				outlineWidth: 2,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				pixelOffset: new Cesium.Cartesian2(0, -20), // 偏移量
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0.0,
					2000000
				),
			},
		},
	});
	map.graphicLayer.addGraphic(graphic);

	return graphic;
}
//#endregion
//#region 日照分析
function clearAll() {
	sightline.clear();
	map.graphicLayer.clear();
}
function stopPlayLight() {
	if (shadows && shadows.isStart) {
		shadows.pause();
	}
}
//开始播放光照
function startPlayLight(date, hours, minutes) {
	const currentTime = setShadows(date, hours, minutes);
	const startDate = new Date(date + ' 00:00:00');
	const endDate = new Date(date + ' 23:59:59');
	shadows.start(startDate, endDate, currentTime);
}
function setShadows(date, hours, minutes) {
	const dateTime = new Date(`${date} ${hours}:${minutes}:00`);
	shadows.time = dateTime;
	return dateTime;
}
//#endregion
function addRandomGraphicByCount(graphicLayer, position) {
	const graphicImg = new mars3d.graphic.DivGraphic({
		position: position,
		style: {
			html: ` <div class="camera-content">
                      <img style=" height: 50px;width: 50px;" src="/-s-摄像头.svg" >
                    </div>
                    <div class="mars3d-camera-line" ></div>
                    <div class="mars3d-camera-point"></div>
                  `,
			offsetX: -16,
			distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 100000),
		},
		popup: `<video src='http://data.mars3d.cn/file/video/lukou.mp4' controls autoplay style="width: 300px;" ></video>`,
		popupOptions: {
			offsetY: -170, // 显示Popup的偏移值，是DivGraphic本身的像素高度值
			template: `<div class="marsBlackPanel animation-spaceInDown">
                        <div class="marsBlackPanel-text">{content}</div>
                        <span class="mars3d-popup-close-button closeButton" >×</span>
                      </div>`,
			horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
			verticalOrigin: Cesium.VerticalOrigin.CENTER,
		},
	});
	graphicLayer.addGraphic(graphicImg);
}
function addRandomGraphic2ByCount(graphicLayer, position) {
	const graphicImg = new mars3d.graphic.DivGraphic({
		position: position,
		style: {
			html: ` <div class="camera-content">
                      <img style=" height: 50px;width: 50px;" src="/-s-摄像头.svg" >
                    </div>
                    <div class="mars3d-camera-line" ></div>
                    <div class="mars3d-camera-point"></div>
                  `,
			offsetX: -16,
			distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 100000),
		},
		popup: `<video src='/210261071-1-16.mp4' controls autoplay style="width: 300px;" ></video>`,
		popupOptions: {
			offsetY: -170, // 显示Popup的偏移值，是DivGraphic本身的像素高度值
			template: `<div class="marsBlackPanel animation-spaceInDown">
                        <div class="marsBlackPanel-text">{content}</div>
                        <span class="mars3d-popup-close-button closeButton" >×</span>
                      </div>`,
			horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
			verticalOrigin: Cesium.VerticalOrigin.CENTER,
		},
	});
	graphicLayer.addGraphic(graphicImg);
}
//#region 量算的功能
// 添加矩形
const btnDrawExtent = () => {
	mapBtnDrawExtent((min, max) => {
		formState.minHeight = Math.ceil(min);
		formState.maxHeight = Math.ceil(max);
	});
};
// 添加多边形
const btnDraw = () => {
	mapBtnDraw((min, max) => {
		formState.minHeight = Math.ceil(min);
		formState.maxHeight = Math.ceil(max);
	});
};
const clearDraw = () => {
	mapClearDraw();
	formState.minHeight = 0;
	formState.maxHeight = 0;
};
//#endregion
//#region 开始淹没
const begin = () => {
	mapBegin(formState);
};

// 高度改变
const onChangeHeight = () => {
	mapOnChangeHeight(formState.height);
};

// 颜色修改
const onChangeColor = e => {
	mapOnChangeColor(floodColor.value);
};

// 默认自动播放
const startPlay = () => {
	isStart.value = !isStart.value;
	mapStartPlay();
};

const goBack = () => {
	mapClearDraw();
	formState.minHeight = 0;
	formState.maxHeight = 0;
	isShow.value = false;
	isStart.value = true;
	formState.enabledShowElse = true;
};

const onChangeElse = () => {
	mapOnChangeElse(formState.enabledShowElse);
};
//#endregion
const myTimeChange = () => {
	setShadows(currDate.value, hours.value, minutes.value);
};
const myStartPlayLight = () => {
	startPlayLight(currDate.value, hours.value, minutes.value);
};
const myStopPlayLight = () => {
	stopPlayLight();
};
let tableData = ref();
let xhr = new XMLHttpRequest();
xhr.open('GET', '/file.json', true);
xhr.setRequestHeader('Content-type', 'application/json');
xhr.onreadystatechange = function () {
	if (xhr.readyState === 4 && xhr.status === 200) {
		// 将获取到的JSON数据转换为JavaScript对象
		tableData.value = JSON.parse(xhr.responseText);
	}
};
xhr.send();
</script>
<style scoped>
.ant-slider {
	width: 200px;
}
.title {
	margin-left: 1vw;
	font-size: 30px;
	font-weight: 700;
	font-family: 'KaiTi';
}
.header {
	display: flex;
	flex-direction: row-reverse;
	justify-content: space-between;
	align-items: center;
	height: 6vh;
	background-color: rgba(98,89,44,1);
}
#mars3dContainer {
	padding: 0;
	height: 94vh;
	width: 100%;
}
.el-main {
	padding: 0 !important;
	position: relative !important;
}
.measure-box {
	position: absolute;
	top: 0;
	right: 10px;
	font-size: 14px;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.479);
}
.btn-primary {
	font-size: 12px;
	padding: 5px;
	font-weight: 600;
	color: #fff;
	background-color: rgba(43, 128, 167, 0.479);
}
.btn-info {
	color: #fff;
	background-color: rgba(0, 0, 0, 0.479);
}
.infoview {
	position: absolute;
	top: 0;
	right: 10px;
	font-size: 14px;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.479);
}
.infoview input {
	color: #fff;
	background-color: rgba(100, 100, 100, 0.63);
	border: 0px solid;
}
.infoview button {
	font-size: 10px;
	color: #fff;
	padding: 5px;
	margin: 0 5px;
	background-color: rgba(0, 0, 0, 0.479);
	cursor: pointer;
}
.flood-box {
	position: absolute;
	top: 10px;
	right: 10px;
	width: 350px;
}
.f-mb {
	color: #fff;
	padding: 5px;
	background-color: #383838bd;
}
.f-mb button {
	color: #fff;
	padding: 5px;
	margin: 0 5px;
	border-radius: 5px;
	border: 0px;
	background-color: #1371afa6;
}
.f-mb input {
	color: #fff;
	width: 50px;
	padding: 5px;
	margin: 0 5px;
	border-radius: 5px;
	border: 0px;
	background-color: #1371afa6;
}
.f-tac {
	color: #fff;
	background-color: #383838bd;
}
.f-tac button {
	color: #fff;
	padding: 5px;
	margin: 0 5px;
	border-radius: 5px;
	border: 0px;
	background-color: #1371afa6;
}
.camera-content {
	height: 50px;
	width: 100px;
	background-color: #ff0000;
}
.camera-img {
	height: 50px;
	width: 50px;
}
.tableBox {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background-color: #fff;
}
.tableBox2 {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background-color: #fff;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat(2, 1fr);
	gap: 10px;
}
.c1 {
	z-index: 10;
}
</style>
