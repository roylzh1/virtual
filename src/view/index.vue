<template>
	<div>
		<el-container>
			<!--侧栏-->
			<el-aside width="200px">
				<el-menu
					default-active="2"
					class="el-menu-vertical-demo"
					@select="handleSelect"
				>
					<el-menu-item index="1">
						<el-icon style="vertical-align: middle"><location /></el-icon>
						<span>首页</span>
					</el-menu-item>
					<el-menu-item index="2">
						<el-icon style="vertical-align: middle"><location /></el-icon>
						<span>违建对比</span>
					</el-menu-item>
					<el-menu-item index="3">
						<el-icon style="vertical-align: middle"><location /></el-icon>
						<span>空间量算</span>
					</el-menu-item>
					<el-menu-item index="4">
						<el-icon style="vertical-align: middle"><location /></el-icon>
						<span>淹没分析</span>
					</el-menu-item>
				</el-menu>
			</el-aside>
			<el-container>
				<!--导航栏-->
				<el-header class="header">
					<el-tag effect="dark" size="large" round>欢迎回来: roy</el-tag>
					<div class="title">碧桂园园区违建决策系统</div>
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
					<div class="infoview" v-if="ifShowFlood">
						<table id="paramView" class="mars-table">
							<tr>
								<td class="nametd">分析区域</td>
								<td>
									<button
										type="button"
										id="btnDrawExtent"
										class="btn btn-default"
										@click="btnDrawExtent"
									>
										添加矩形
									</button>
									<button
										type="button"
										id="btnDraw"
										class="btn btn-default"
										@click="btnDraw"
									>
										添加多边形
									</button>
									<button
										type="button"
										id="clearDraw"
										class="btn btn-default"
										@click="clearDraw"
									>
										清除
									</button>
								</td>
							</tr>
							<tr>
								<td class="nametd">最低海拔(米)</td>
								<td>
									<input
										id="minHeight"
										v-model="flood.minLevel"
										type="number"
										class="form-control"
									/>
								</td>
							</tr>
							<tr>
								<td class="nametd">最高海拔(米)</td>
								<td>
									<input
										id="maxHeight"
										v-model="flood.maxLevel"
										type="number"
										class="form-control"
									/>
								</td>
							</tr>
							<tr>
								<td class="nametd">淹没速度(米/秒)</td>
								<td>
									<input
										id="speed"
										v-model="flood.speed"
										type="number"
										class="form-control"
									/>
								</td>
							</tr>
							<tr>
								<td colspan="2">
									<button
										type="button"
										id="begin"
										class="btn btn-primary"
										@click="begin"
									>
										开始分析
									</button>
								</td>
							</tr>
						</table>

						<div id="resultView" style="display: none; text-align: left">
							<div class="rowview clearfix">
								<span>高度选择:</span>
								<input
									id="range_currHeight"
									title="时间"
									type="range"
									min="0"
									max="1000"
									step="0.1"
									value="0"
								/>
							</div>
							<div class="rowview clearfix">
								<span>当前高度:</span><span id="lbl_nowHeight"></span>
							</div>

							<input
								id="btn_start"
								type="button"
								class="btn btn-primary"
								value="暂停"
							/>
							<button type="button" id="clear" class="btn btn-primary">
								返回
							</button>

							<div class="checkbox checkbox-info checkbox-inline">
								<input
									type="checkbox"
									id="showElse"
									value="this"
									name="jiaodu"
									checked
								/>
								<label for="showElse">显示非淹没区域</label>
							</div>
						</div>
					</div>
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
let threeDTilesLayer; //第一次加载的模型
let mapSplit; //卷帘对比图层
let measure; //量算组件
let floodByMaterial; //淹没组件
const ifShowMeasure = ref(false);
const ifShowFlood = ref(true);
const flood = reactive({
	minLevel: 0,
	maxLevel: 0,
	speed: 0,
});
onMounted(() => {
	map = initMap();
	threeDTilesLayer = queryTilesetData();
	addLayer(threeDTilesLayer);
});
//初始化地图
function initMap() {
	// 创建三维地球场景
	const map = new mars3d.Map('mars3dContainer', {
		scene: {
			center: {
				lat: 41, //41.6355340078007,118.70782726584
				lng: 118,
				alt: 17033341,
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
	//console.log('mars3d的Map主对象构造完成', map);
	//console.log('其中Cesium原生的Cesium.Viewer为', map.viewer);
	return map;
}
//获取模型
function queryTilesetData() {
	const tiles3dLayer = new mars3d.layer.TilesetLayer({
		name: '碧桂园',
		url: 'http://172.30.63.2/d3dt/cs_xljy_2022.03.15/tileset.json',
		maximumMemoryUsage: 812,
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
		preferLeaves: false,
		flyTo: true, //false TODO:交付记得改回来
		popup: 'all',
	});
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
	//移除原本的地图,切换成卷帘
	if (key == '2') {
		removeLayer(threeDTilesLayer);
		contrast();
		return;
	} else if (key == '1') {
		if (mapSplit != null) {
			map.removeControl(mapSplit, true);
		}
		addLayer(threeDTilesLayer);
		return;
	} else if (key == '3') {
		startMeasure();
		ifShowMeasure.value = true;
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
					alt: 79,
				},
				preferLeaves: false,
				maximumMemoryUsage: 155,
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
					alt: 79.8,
				},
				preferLeaves: false,
				maximumMemoryUsage: 155,
				dynamicScreenSpaceError: true,
				cullWithChildrenBounds: true,
				skipLevelOfDetail: true, //113.061611,28.267803
				flyTo: true,
			},
		],
	});
	map.addControl(mapSplit);
}

//量算
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
function startFlood() {
	floodByMaterial = new mars3d.thing.FloodByMaterial({
		color: '#0033ff91', // 淹没颜色
	});
	map.addThing(floodByMaterial);

	floodByMaterial.on(mars3d.EventType.start, function (e) {
		console.log('开始分析', e);
	});

	floodByMaterial.on(mars3d.EventType.change, function (e) {
		var height = e.height;
		eventTarget.fire('heightChange', { height });
	});

	floodByMaterial.on(mars3d.EventType.end, function (e) {
		console.log('结束分析', e);
	});
}
function btnDrawExtent(callback) {
	clearDraw();

	map.graphicLayer.startDraw({
		type: 'rectangle',
		style: {
			color: '#0033ff91',
			// clampToGround: true
		},
		success: function (graphic) {
			// 绘制成功后回调
			const positions = graphic.getOutlinePositions(false);
			// 更新最大、最小高度值
			updateHeightRange(graphic, positions, callback);
			// 区域
			floodByMaterial.addArea(positions);
		},
	});
}

// 绘制多边形
function btnDraw(callback) {
	clearDraw();

	map.graphicLayer.startDraw({
		type: 'polygon',
		style: {
			color: '#0033ff91',
			outline: false,
			// clampToGround: true
		},
		success: function (graphic) {
			const positions = graphic.positionsShow;

			// 更新最大、最小高度值
			updateHeightRange(graphic, positions, callback);
			floodByMaterial.addArea(positions);
		},
	});
}

// 求最大、最小高度值
function updateHeightRange(graphic, positions, callback) {
	showLoading();

	// 求最大、最小高度值
	graphic.show = false; // 会遮挡深度图，所以需要隐藏
	mars3d.PolyUtil.interPolygonByDepth({ scene: map.scene, positions }).then(
		result => {
			graphic.show = true; // 恢复显示
			const minHeight = Math.ceil(result.minHeight);
			const maxHeight = Math.floor(result.maxHeight);

			callback(minHeight, maxHeight);
			hideLoading();
		}
	);
}

// 开始分析
function begin() {
	if (floodByMaterial.length === 0) {
		globalMsg('请首先绘制分析区域！');
		return;
	}
	map.graphicLayer.clear();

	const minValue = Number(flood.minLevel);
	const maxValue = Number(flood.maxLevel);
	const speed = Number(flood.speed);

	floodByMaterial.setOptions({
		minHeight: minValue,
		maxHeight: maxValue,
		speed: speed,
	});
	floodByMaterial.start();
}

// 高度选择
function onChangeHeight(height) {
	floodByMaterial.height = height;
}

// 颜色发生改变
function onChangeColor(color) {
	floodByMaterial.color = color;
}

// 自动播放
function startPlay() {
	if (floodByMaterial.isStart) {
		floodByMaterial.stop();
	} else {
		floodByMaterial.start();
	}
}

// 是否显示非淹没区域
function onChangeElse(val) {
	floodByMaterial.showElseArea = val;
}

function clearDraw() {
	floodByMaterial.clear();
	map.graphicLayer.clear();
}
function changeFloodValue() {
	if (floodByMaterial.isStart) {
		floodByMaterial.stop();
		$('#btn_start').val('自动播放');
	} else {
		floodByMaterial.start();
		$('#btn_start').val('暂停');
	}
}
</script>
<style scoped>
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
	height: 7vh;
	background-color: #52d6a4;
}
#mars3dContainer {
	padding: 0;
	height: 93vh;
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
</style>
