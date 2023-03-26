<template>
	<div>
		<el-container>
			<!--侧栏-->
			<el-aside width="200px">
				<el-menu
					default-active="2"
					class="el-menu-vertical-demo"
					@open="handleOpen"
					@close="handleClose"
				>
					<el-menu-item index="1">
						<el-icon style="vertical-align: middle"><location /></el-icon>
						<span>Navigator Two</span>
					</el-menu-item>
				</el-menu>
			</el-aside>
			<el-container>
				<!--导航栏-->
				<el-header class="header">
					<el-tag effect="dark" size="large" round>欢迎回来: roy</el-tag>
					<div class="title">hi</div>
				</el-header>
				<!--地图-->
				<el-main>
					<div id="mars3dContainer" class="mars3d-container"></div>
				</el-main>
			</el-container>
		</el-container>
	</div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import 'mars3d-cesium/Build/Cesium/Widgets/widgets.css'; //依赖的cesium库本身css
import 'mars3d/dist/mars3d.css';
import * as mars3d from 'mars3d';
let map;

onMounted(() => {
	map = initMap();
  const threeDTilesLayer = queryTilesetData();
  addLayer(threeDTilesLayer);
});
function initMap() {
	// 创建三维地球场景
	const map = new mars3d.Map('mars3dContainer', {
		scene: {
			center: {
				lat: 41.6355340078007,//41.6355340078007,118.70782726584
				lng: 118.70782726584,
				alt: 1703334,
				heading: 359,
				pitch: -90,
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
			url: '//data.mars3d.cn/terrain',
			show: true,
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
	// 打印测试信息
	console.log('mars3d的Map主对象构造完成', map);
	console.log('其中Cesium原生的Cesium.Viewer为', map.viewer);
	return map;
};

//获取模型
function queryTilesetData() {
  const tiles3dLayer = new mars3d.layer.TilesetLayer({
    name: "碧桂园",
    url: "http://172.30.63.2/d3dt/cs_xljy_2022.03.15/tileset.json",
    maximumMemoryUsage: 812,
    dynamicScreenSpaceError: true,
    cullWithChildrenBounds: true,
    skipLevelOfDetail: true,//113.061611,28.267803
    center: { lat: 28.267803, lng: 113.061611, alt: 100, heading: 7, pitch: -29 },
    preferLeaves: false,
    flyTo: true,
    popup: "all"
})
  return tiles3dLayer;
}
function addLayer(layer) {
  map.addLayer(layer)
  layer.flyTo()
}
</script>
<style scoped>
.title {
	margin-left: 7vw;
	font-size: 25px;
	font-weight: 700;
	font-family: 'KaiTi';
}
.header {
	display: flex;
	flex-direction: row-reverse;
	justify-content: space-between;
	align-items: center;
	height: 7vh;
	background-color: #4747475e;
}
#mars3dContainer {
	padding: 0;
	height: 93vh;
	width: 100%;
}
.el-main{
  padding: 0 !important;
}
</style>
