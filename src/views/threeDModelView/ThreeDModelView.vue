<template>
  <div class="page-wrap">
    <canvas ref="cosmicCanvasRef" class="webgl"></canvas>
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
const cosmicCanvasRef = ref<HTMLCanvasElement | null>(null)
const sizes = ref({
  width: 0,
  height: 0
})
onMounted(() => {
  const canvas = cosmicCanvasRef.value
  if (!canvas) return
  sizes.value.width = canvas.clientWidth
  sizes.value.height = canvas.clientHeight
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c1c20);

  // GLTF 汽车为 PBR 材质：环境光略低 + 主/补/轮廓光，避免之前 ambient1+hemi2 发灰过曝
  scene.add(new THREE.AmbientLight(0xffffff, 0.32));

  const hemisphereLight = new THREE.HemisphereLight(0xdce8ff, 0x2a2018, 0.5);
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xb8cfff, 0.75);
  fillLight.position.set(-4, 3, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffe8cc, 0.55);
  rimLight.position.set(0, 4, -6);
  scene.add(rimLight);

  const loader = new GLTFLoader();

  loader.load(
    '/models/scene.gltf', // 改成你实际的模型路径

    (gltf) => {
      const model = gltf.scene

      // 1. 计算模型的包围盒
      const box = new THREE.Box3().setFromObject(model)

      // 2. 获取模型的尺寸
      const size = box.getSize(new THREE.Vector3())

      // 3. 获取模型的中心点
      const center = box.getCenter(new THREE.Vector3())

      console.log('汽车模型尺寸：', size)
      console.log('汽车模型中心：', center)

      // 4. 将模型中心移动到世界坐标原点
      model.position.sub(center)
      model.position.y += size.y * 0.5
      scene.add(model)

      // 5. 根据模型尺寸自动调整相机距离
      const maxSize = Math.max(size.x, size.y, size.z)

      if (maxSize > 0) {
        const fov = THREE.MathUtils.degToRad(camera.fov)

        const distance = (maxSize / 2) / Math.tan(fov / 2) * 0.7
        console.log("🚀 ~ distance:", distance)

        // 从斜上方观察汽车
        camera.position.set(
          distance * 0.8,
          distance * 0.5,
          distance * 0.8
        )
        camera.near = Math.max(maxSize / 1000, 0.01)
        camera.far = Math.max(maxSize * 1, 50)
        camera.updateProjectionMatrix()
      }

      controls.target.set(0, 0, 0)
      controls.update()
      renderer.render(scene, camera)

      console.log('汽车模型加载并显示完成')
    },

    undefined,

    (error) => {
      console.error('汽车模型加载失败：', error)
    }
  )

  // 实例化一个透视投影相机对象
  const camera = new THREE.PerspectiveCamera(30, sizes.value.width / sizes.value.height, 1, 500);
  // 根据需要设置相机位置具体值

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(sizes.value.width, sizes.value.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.render(scene, camera);



  // 相机插件
  // 给 Three.js 添加轨道控制器，让你可以用鼠标拖动、滚轮缩放，从不同角度观察 3D 场景。
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.addEventListener('change', () => {
    renderer.render(scene, camera);
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
