<template>
  <div class="page-wrap">
    <canvas ref="canvasRef" class="webgl"></canvas>
  </div>
</template>
<script setup lang="ts">
// 引入three.js
import * as THREE from 'three';
// 引入扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 引入扩展库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ref, onMounted } from 'vue';
const canvasRef = ref<HTMLCanvasElement | null>(null)
const sizes = ref({
  width: 0,
  height: 0
})
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  sizes.value.width = canvas.clientWidth
  sizes.value.height = canvas.clientHeight
  const aspect = sizes.value.width / sizes.value.height
  console.log("🚀 ~ aspect:", aspect)
  // 创建3D场景对象Scene
  const scene = new THREE.Scene();
  //创建一个长方体几何对象Geometry
  const geometry = new THREE.BoxGeometry(100, 60, 20);

  //创建一个材质对象Material n不受光照影响
  let material: THREE.Material

  // 是否需要光源：true为不需要，false为需要
  if (true) {
    material = new THREE.MeshBasicMaterial({
      color: 0xffffff,//0xffffff设置材质颜色为白色
    });
  } else {
    material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // new THREE.PointLight(颜色, 光照强度, 照射距离, 衰减指数)
    // 0:不限制光照距离
    // 2:衰减指数
    const pointLight = new THREE.PointLight(0xffffff, 800, 0, 2);
    pointLight.position.set(100, 100, 0);
    scene.add(pointLight);
  }

  // 网格模型Mesh
  // 两个参数分别为几何体geometry、材质material
  const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
  mesh.position.set(0, 10, 0);
  scene.add(mesh);

  // 实例化一个透视投影相机对象
  const camera = new THREE.PerspectiveCamera(30, sizes.value.width / sizes.value.height, 1, 3000);
  // 根据需要设置相机位置具体值
  camera.position.set(200, 200, 200);
  //相机观察目标指向Threejs 3D空间中某个位置
  camera.lookAt(0, 0, 0); //坐标原点
  // 创建渲染器并指定画布
  const renderer = new THREE.WebGLRenderer({ canvas });
  // 设置渲染器尺寸并渲染场景
  renderer.setSize(sizes.value.width, sizes.value.height);
  renderer.render(scene, camera);



  // 相机插件
  // 给 Three.js 添加轨道控制器，让你可以用鼠标拖动、滚轮缩放，从不同角度观察 3D 场景。
  const controls = new OrbitControls(camera, renderer.domElement);
  // 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
  controls.addEventListener('change', function () {
    renderer.render(scene, camera); //执行渲染操作
  });


})

</script>
<style scoped lang="less">
.page-wrap {
  width: 100%;
  height: 100%;

  .webgl {
    width: 100%;
    height: 100%;
  }
}
</style>
