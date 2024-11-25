<template>
  <v-app>
    <v-container>
      <v-speed-dial
        :open-on-hover="false"
        location="right center"
        transition="slide-y-reverse-transition"
      >
        <template v-slot:activator="{ props: themeBtnProps }">
          <v-btn
            v-bind="themeBtnProps"
            icon
            :color="currentBorderColor"
            size="large"
          >
            <v-icon color="#ffffff">mdi-theme-light-dark</v-icon>
          </v-btn>
        </template>

        <!-- 테마 변경 -->
        <v-btn
          v-for="(theme, index) in themeList"
          :key="index"
          fab
          icon
          :color="theme.color"
          @click="changeTheme(theme.name)"
        >
          <v-icon :color="theme.borderColor">{{ theme.icon }}</v-icon>
        </v-btn>
      </v-speed-dial>

      <!-- 환자 정보가 완전히 입력되었는지 알림 메시지 -->
      <transition name="slide-down">
        <v-alert
          v-if="isPatientInfoComplete"
          type="error"
          dense
          class="alert-patient-warning"
        >
          환자 필수 요소를 입력해주세요.
        </v-alert>
      </transition>

      <!-- stepper 시작  -->
      <v-stepper
        v-model="activeStep"
        alt-labels
        editable
        :items="[
          'Home',
          'Create Case',
          'Simulation',
          'Detection',
          'Planning',
          'Guide',
        ]"
        class="mt-15 header-stepper"
      >
        <!-- Home 단계 -->
        <template v-slot:item.1>
          <v-card>
            <v-card-title>
              <span>Patient List</span>
              <v-btn small @click="createPatient" class="new-patient-btn"
                >New Patient</v-btn
              >
            </v-card-title>

            <v-list lines="two">
              <v-list-item
                v-for="(patient, index) in patientList"
                :key="index"
                link
                @click="loadPatientCase(patient, index)"
              >
                <template v-slot:prepend>
                  <v-icon :color="currentBorderColor">mdi-account</v-icon>
                </template>
                <v-list-item-content>
                  <v-list-item-title> {{ patient.name }}</v-list-item-title>
                  <v-list-item-subtitle
                    >ID: {{ patient.id }}, Gender: {{ patient.gender }}, DOB:
                    {{ patient.dob }}</v-list-item-subtitle
                  >
                </v-list-item-content>
                <v-divider :thickness="2" color="borderColor"></v-divider>
              </v-list-item>
            </v-list>
          </v-card>
        </template>

        <!-- 2단계 -->
        <template v-slot:item.2>
          <v-container>
            <v-row justify="center">
              <v-col cols="3">
                <!-- 환자, case setting 영역 -->
                <v-card>
                  <v-card-title>New Patient Case</v-card-title>
                  <v-card-text>
                    <v-form ref="patientForm" @submit.prevent="saveNewPatient">
                      <v-row>
                        <!-- Name, ID, Gender, DOB 영역 -->
                        <v-col cols="6">
                          <v-text-field
                            v-model="newPatient.name"
                            label="Name"
                            required
                          ></v-text-field>
                          <v-text-field
                            v-model="newPatient.id"
                            label="ID"
                            required
                            unique
                          ></v-text-field>
                          <v-select
                            v-model="newPatient.gender"
                            :items="['Male', 'Female']"
                            label="Gender"
                            required
                          ></v-select>
                          <v-text-field
                            v-model="newPatient.dob"
                            label="Date of Birth"
                            type="date"
                            :max="today"
                            required
                          ></v-text-field>
                        </v-col>

                        <!-- Memo 영역 -->
                        <v-col cols="6">
                          <v-textarea
                            v-model="newPatient.memo"
                            label="Memo"
                            outlined
                            :rows="11"
                          ></v-textarea>
                        </v-col>
                      </v-row>

                      <div class="new-patient-btns">
                        <v-btn class="save-btn" @click="saveNewPatient"
                          >Save</v-btn
                        >
                        <v-btn class="cancel-btn" @click="cancelNewPatient"
                          >Cancel</v-btn
                        >
                      </div>
                    </v-form>
                  </v-card-text>

                  <!-- 구강 이미지 케이스 세팅 -->
                  <v-card-title>Case Setting</v-card-title>
                  <v-row justify="center">
                    <v-col cols="11" md="11" lg="11">
                      <v-img
                        v-if="showMouthStructure"
                        src="@/assets/mouth-structure.png"
                        alt="Mouth Structure"
                        max-width="100%"
                        height="30rem"
                        contain
                        style="
                          border: solid 1px rgb(var(--v-theme-borderColor));
                          border-radius: 5px;
                        "
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
              <!-- import data영역 -->
              <v-col cols="6">
                <v-card class="ml-4">
                  <v-card-title>Import Data</v-card-title>
                  <v-card-text>
                    <v-file-input
                      v-model="uploadedCtImage"
                      @change="updateCtImage"
                      label="Upload 3D Model (.obj)"
                      prepend-icon=""
                      prepend-inner-icon="mdi-file-upload"
                      outlined
                      bg-color="borderColor"
                      class="fixed-width-file-input"
                      accept=".obj,.stl"
                    ></v-file-input>
                    <div class="model-view-section">
                      <div
                        id="viewer"
                        ref="viewer"
                        class="viewer-container"
                      ></div>
                      <!-- <v-img
                        v-if="selectedFileName"
                        :src="selectedFileName"
                        alt="Uploaded Image"
                        max-width="100%"
                        contain
                      /> -->
                    </div>
                  </v-card-text>

                  <v-row class="gap-2">
                    <v-col cols="6">
                      <v-card>
                        <v-card-title>Bite Jig View</v-card-title>
                        <v-card-text>
                          <div class="bite-jig-view-img-section">
                            <v-img
                              v-if="selectedImage"
                              :src="selectedImage"
                              alt="Selected Image"
                              width="90%"
                              height="90%"
                              max-width="100%"
                              max-height="100%"
                            ></v-img>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="6">
                      <v-card>
                        <v-card-title>Marker</v-card-title>
                        <v-card-text>
                          <div class="marker-section">
                            <img
                              src="@/assets/dot.png"
                              alt="dot"
                              width="100%"
                              height="100%"
                            />
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <!-- select guide & jig 영역 -->
              <v-col cols="3">
                <v-card class="ml-4">
                  <v-card-title>Select Guide & Jig</v-card-title>
                  <v-card>
                    <v-tabs v-model="activeTab" fixed-tabs>
                      <v-tab :value="1">Pre-Guide</v-tab>
                      <v-tab :value="2">Bite Jig</v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="activeTab">
                      <v-tabs-window-item
                        v-for="tabValue in [1, 2]"
                        :key="tabValue"
                        :value="tabValue"
                      >
                        <v-container>
                          <v-row>
                            <v-col
                              cols="6"
                              v-for="n in 8"
                              :key="n"
                              class="grid-item"
                            >
                              <v-card outlined class="jig-slot">
                                <v-card-text class="centered-image-container">
                                  <v-btn
                                    icon
                                    @click="onGuideImageClick(n)"
                                    class="guide-image-btn"
                                  >
                                    <v-img
                                      v-if="tabValue === 1"
                                      :src="guideImages[n - 1]"
                                      alt="Guide Image"
                                      class="guide-image"
                                    ></v-img>
                                    <v-img
                                      v-if="tabValue === 2 && n <= 4"
                                      :src="jigImages[n - 1]"
                                      alt="Jig Image"
                                      class="guide-image"
                                    ></v-img>
                                  </v-btn>
                                </v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-tabs-window-item>
                    </v-tabs-window>
                  </v-card>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>
        <template v-slot:item.3>
          <v-card title="Simulation" flat>
            <v-card-text>
              <v-row>
                <v-col cols="2">
                  <!-- 커스텀 라디오 버튼: 버튼 색상 테마색상으로 변경 및 아이콘 집어넣기 / 라벨 색상 테마색상으로 변경 -->
                  <v-radio-group v-model="selectedRadio" label="Custom Radio">
                    <v-radio
                      v-for="(option, index) in options"
                      :key="index"
                      :label="option.label"
                      :value="option.value"
                      :color="currentBorderColor"
                    >
                      <template v-slot:label>
                        <v-icon>{{ option.icon }}</v-icon
                        >&nbsp;
                        <span :style="{ color: currentBorderColor }">{{
                          option.label
                        }}</span>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-col>
                <v-divider class="ms-3" inset vertical></v-divider>
                <v-col cols="8"> </v-col>
                <v-divider class="ms-3" inset vertical></v-divider>
                <v-col cols="2">
                  <v-switch
                    v-model="ctSwitch"
                    color="borderColor"
                    label="CT"
                    value="ct"
                    hide-details
                    inset
                    class="custom-switch"
                  ></v-switch>
                  <v-switch
                    v-model="ctSwitch"
                    color="borderColor"
                    label="CT"
                    value="ct"
                    hide-details
                    class="custom-switch"
                  ></v-switch>
                  <v-switch
                    :v-model="ctSwitch"
                    label="loading"
                    loading="warning"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <template v-slot:item.4>
          <v-card title="Detection" flat>
            <v-card>
              <v-card-text>
                <v-row class="detection-step">
                  <!-- detection-view -->
                  <v-col cols="9">
                    <div class="detection-view">
                      <!-- <v-img src="@/assets/detection.png"></v-img> -->
                      <canvas
                        ref="detectionCanvas"
                        @mousedown="beginDrawing"
                        @mousemove="keepDrawing"
                        @mouseup="stopDrawing"
                        @mouseout="stopDrawing"
                      >
                      </canvas>
                    </div>
                  </v-col>

                  <!-- panoramic-view -->
                  <v-col cols="3">
                    <div class="panoramic-container">
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/panoramic.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/axial.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/orthogonal.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                      <div class="panoramic-view">
                        <v-img
                          src="@/assets/tangential.png"
                          width="100%"
                          height="100%"
                        ></v-img>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
        </template>

        <template v-slot:item.5>
          <v-card title="Planning" flat>...</v-card>
        </template>
        <template v-slot:item.6>
          <v-card title="Guide" flat>...</v-card>
        </template>
      </v-stepper>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import {
  ref,
  onMounted,
  nextTick,
  watch,
  defineComponent,
  onBeforeUnmount,
} from "vue";
import { useTheme } from "vuetify";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Theme {
  name: string;
  color: string;
  icon: string;
  borderColor: string;
}

class Patient {
  name: string;
  id: string;
  gender: string;
  dob: string;
  memo: string;
  uploadedCtImage: File | null;
  selectedFileName: string;
  selectedImage: string | null;

  constructor(
    name = "",
    id = "",
    gender = "",
    dob = "",
    memo = "",
    uploadedCtImage: File | null = null,
    selectedFileName = "",
    selectedImage: string | null = null
  ) {
    this.name = name;
    this.id = id;
    this.gender = gender;
    this.dob = dob;
    this.memo = memo;
    this.uploadedCtImage = uploadedCtImage;
    this.selectedFileName = selectedFileName;
    this.selectedImage = selectedImage;
  }

  reset() {
    this.name = "";
    this.id = "";
    this.gender = "";
    this.dob = "";
    this.memo = "";
    this.uploadedCtImage = null;
    this.selectedImage = null;
    this.selectedFileName = "";
  }
}

export default defineComponent({
  setup() {
    const STEP: number = 1;
    const activeStep = ref<number>(STEP);
    const patientList = ref<Patient[]>([]);
    const newPatient = ref<Patient>(new Patient());
    const today = ref<string>(new Date().toISOString().split("T")[0]);
    const showMouthStructure = ref<boolean>(false);
    const uploadedCtImage = ref<File | null>(null);
    const isPatientInfoComplete = ref<boolean>(false);
    const guideImages = ref<string[]>([]);
    const jigImages = ref<string[]>([]);
    const selectedImage = ref<string | null>(null);
    const selectedFileName = ref<string>("");
    const selectedGuideAndJigCase: number = 1;
    const activeTab = ref<number>(selectedGuideAndJigCase);
    // 그림판 기능
    const detectionCanvas = ref<HTMLCanvasElement | null>(null);
    const detectionCtx = ref<CanvasRenderingContext2D | null>(null);
    const x = ref<number>(0);
    const y = ref<number>(0);
    const isDrawing = ref<boolean>(false);

    // 테마 변경
    const theme = useTheme();
    const currentTheme = ref<string>(theme.global.name.value);
    const currentBorderColor = ref<string>("rgb(var(--v-theme-borderColor))");
    const themeList = ref<Theme[]>([
      {
        name: "light",
        color: "#FFFFFF",
        icon: "mdi-white-balance-sunny",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "dark",
        color: "#FFFFFF",
        icon: "mdi-weather-night",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "lightSecondary",
        color: "#FFFFFF",
        icon: "mdi-star-outline",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "darkSecondary",
        color: "#FFFFFF",
        icon: "mdi-star",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "bluePastel",
        color: "#FFFFFF",
        icon: "mdi-eyedropper",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
      {
        name: "pinkPastel",
        color: "#FFFFFF",
        icon: "mdi-pencil",
        borderColor: "rgb(var(--v-theme-borderColor))",
      },
    ]);

    // 커스텀 라디오버튼 테스트 변수 설정
    const ctSwitch = ref<boolean>(false);
    const selectedRadio = ref<string>("one");
    const options = ref<{ label: string; value: string; icon: string }[]>([
      { label: "Option One", value: "one", icon: "mdi-star-outline" },
      { label: "Option Two", value: "two", icon: "mdi-star" },
      { label: "Option Three", value: "three", icon: "mdi-star-half" },
    ]);

    // three.js 관련 변수 설정
    const viewer = ref<HTMLDivElement | null>(null);
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

    // 밑에부터 건들지말기
    // 테마 변경 함수
    function changeTheme(themeName: string): void {
      currentTheme.value = themeName;
      theme.global.name.value = currentTheme.value;
    }

    // 반응형 데이터로 다크모드 여부 계산
    // const isDarkMode = computed(() => currentTheme.value === "dark");

    // function toggleTheme() {
    //   currentTheme.value = isDarkMode.value ? "light" : "dark";
    //   theme.global.name.value = currentTheme.value;
    // }

    function initializeCanvas(): void {
      if (detectionCanvas.value) {
        console.log("Canvas context initialized");
        detectionCtx.value = detectionCanvas.value.getContext("2d");

        setCanvasDimensions(detectionCanvas.value);

        if (detectionCtx.value) {
          scaleCanvasForHighResolution(
            detectionCanvas.value,
            detectionCtx.value
          );
        }
      } else {
        console.log("Canvas is still null after nextTick");
      }
    }

    function scaleCanvasForHighResolution(
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D
    ): void {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      // ctx.scale(dpr, dpr);
      ctx.scale(1, 1);
    }

    function setCanvasDimensions(canvas: HTMLCanvasElement): void {
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number): void {
      if (detectionCtx.value) {
        detectionCtx.value.lineWidth = 5;
        detectionCtx.value.strokeStyle = "#6200EE";
        detectionCtx.value.beginPath();
        detectionCtx.value.moveTo(x1, y1);
        detectionCtx.value.lineTo(x2, y2);
        detectionCtx.value.closePath();
        detectionCtx.value.stroke();
      }
    }

    function getMousePosition(e: MouseEvent): { x: number; y: number } {
      if (!detectionCanvas.value) {
        throw new Error("Canvas is not initialized");
      }
      const rect = detectionCanvas.value.getBoundingClientRect();
      const scaleX = detectionCanvas.value.width / rect.width;
      const scaleY = detectionCanvas.value.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }

    function beginDrawing(e: MouseEvent): void {
      const position = getMousePosition(e);
      x.value = position.x;
      y.value = position.y;
      isDrawing.value = true;
    }

    function keepDrawing(e: MouseEvent): void {
      if (isDrawing.value) {
        const position = getMousePosition(e);
        drawLine(x.value, y.value, position.x, position.y);
        x.value = position.x;
        y.value = position.y;
      }
    }

    function stopDrawing(): void {
      isDrawing.value = false;
    }

    watch(activeStep, async (newStep: number) => {
      if (newStep === 4) {
        await nextTick();
        initializeCanvas();
      }
    });

    //file을 url로 변환하여 화면에 로드함
    // function convertFileToUrl(file: File): void {
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     selectedFileName.value = e.target?.result as string;
    //   };
    //   reader.readAsDataURL(file);
    // }

    function updateCtImage(event: Event): void {
      const input = event.target as HTMLInputElement;
      const file = input.files ? input.files[0] : null;

      if (file) {
        uploadedCtImage.value = file;
        selectedFileName.value = file.name;
        // convertFileToUrl(file);
        load3DModel(file);
      }
    }

    function load3DModel(file: File) {
      console.log("load3DModel 호출 완료");
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result && viewer.value) {
          initializeThreeJS(); // Three.js 초기화
          const objData = reader.result as string;

          if (file.name.toLowerCase().endsWith(".obj")) {
            loadOBJModel(objData);
          } else if (file.name.toLowerCase().endsWith(".stl")) {
            loadSTLModel(reader.result as ArrayBuffer);
          } else {
            console.error("지원되지 않는 파일 형식입니다.");
            return;
          }

          camera.position.set(0, 0, 10); // Adjust the camera position as needed
          camera.lookAt(0, 0, 0); // Look at the center of the scene
          startAnimation();
        }
      };

      // .obj 파일은 텍스트로, .stl 파일은 바이너리로 읽기
      if (file.name.toLowerCase().endsWith(".obj")) {
        reader.readAsText(file);
      } else if (file.name.toLowerCase().endsWith(".stl")) {
        reader.readAsArrayBuffer(file);
      }
    }

    function initializeThreeJS(): void {
      scene = new THREE.Scene();
      if (viewer.value) {
        camera = new THREE.PerspectiveCamera(
          75,
          viewer.value.clientWidth / viewer.value.clientHeight,
          0.1,
          1000
        );
      } else {
        console.error("Viewer is not initialized");
        return; // Handle the case where viewer is null
      }

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(viewer.value.clientWidth, viewer.value.clientHeight);

      // 다크 모드와 라이트 모드에 따라 배경색 설정
      watch(currentTheme, (newTheme) => {
        if (newTheme === "dark") {
          renderer.setClearColor(0x121212);
        } else {
          renderer.setClearColor(0xffffff);
        }
      });

      viewer.value.innerHTML = "";
      viewer.value.appendChild(renderer.domElement);

      // OrbitControls 초기화
      initializeOrbitControls(camera, renderer.domElement);
    }

    function initializeOrbitControls(
      camera: THREE.PerspectiveCamera,
      rendererDomElement: HTMLElement
    ): void {
      controls = new OrbitControls(camera, rendererDomElement);
      controls.enableDamping = true; // 감속 효과 활성화
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = true; // 드래그(패닝) 활성화
      controls.maxPolarAngle = Math.PI / 2;
      controls.minDistance = 3; // 최소 거리
      controls.maxDistance = 50; // 최대 거리
    }

    function loadOBJModel(objData: string): void {
      const loader = new OBJLoader();
      const objModel = loader.parse(objData);
      objModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = new THREE.MeshNormalMaterial();
        }
      });
      scene.add(objModel);
    }

    function loadSTLModel(stlData: ArrayBuffer): void {
      const loader = new STLLoader();
      const geometry = loader.parse(stlData);
      const material = new THREE.MeshNormalMaterial();
      const stlModel = new THREE.Mesh(geometry, material);
      stlModel.scale.set(0.2, 0.2, 0.2);
      scene.add(stlModel);
    }

    function startAnimation(): void {
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update(); // OrbitControls 업데이트
        renderer.render(scene, camera);
      };

      animate();
    }

    function resizeViewer(): void {
      if (viewer.value && renderer) {
        renderer.setSize(viewer.value.clientWidth, viewer.value.clientHeight);
        camera.aspect = viewer.value.clientWidth / viewer.value.clientHeight;
        camera.updateProjectionMatrix(); // Update the projection matrix
      }
    }

    function createPatient(): void {
      activeStep.value++;
      cancelNewPatient();
    }

    function cancelNewPatient(): void {
      newPatient.value.reset();
      uploadedCtImage.value = null;
      selectedFileName.value = "";
      selectedImage.value = null;
    }

    function insertNewPatient(patient: Patient): void {
      patientList.value.unshift(
        new Patient(
          patient.name,
          patient.id,
          patient.gender,
          patient.dob,
          patient.memo,
          patient.uploadedCtImage,
          patient.selectedFileName,
          patient.selectedImage
        )
      );
    }

    function isPatientInfoValid(patient: Patient): boolean {
      return !!(patient.name && patient.id && patient.gender && patient.dob);
    }

    function showAlertMessage(): void {
      isPatientInfoComplete.value = true;
      setTimeout(() => {
        isPatientInfoComplete.value = false;
      }, 3000);
    }

    function saveNewPatient(): void {
      if (!isPatientInfoValid(newPatient.value)) {
        showAlertMessage();
        return;
      }

      const existingPatientIndex = findPatientIndexById(newPatient.value.id);

      if (existingPatientIndex !== -1) {
        updatePatient(existingPatientIndex, newPatient.value);
      } else {
        addNewPatient(newPatient.value);
      }

      showMouthStructure.value = true;
      activeStep.value--;
    }

    function findPatientIndexById(patientId: string): number {
      return patientList.value.findIndex((p) => p.id === patientId);
    }

    function updatePatient(index: number, updatedPatient: Patient): void {
      patientList.value[index] = {
        ...patientList.value[index], // 기존 환자 정보 유지
        ...updatedPatient, // 변경된 값으로 업데이트
        uploadedCtImage: uploadedCtImage.value,
        selectedImage: selectedImage.value || "",
      };
      console.log(`환자 ID ${updatedPatient.id}의 정보가 업데이트되었습니다.`);
    }

    function addNewPatient(patient: Patient): void {
      // 환자 리스트에서 동일한 ID를 가진 환자 찾기
      const existingPatientIndex = findPatientIndexById(patient.id);

      if (existingPatientIndex !== -1) {
        // 중복된 환자가 있는 경우, 추가하지 않음
        console.log(
          `환자 ID ${patient.id}는 이미 존재합니다. 추가하지 않습니다.`
        );
        return;
      }

      // 환자 정보를 리스트에 추가
      patient.uploadedCtImage = uploadedCtImage.value;
      patient.selectedImage = selectedImage.value || "";
      insertNewPatient(patient);
      console.log(`환자 ID ${patient.id}가 새로 추가되었습니다.`);
    }

    function loadPatientCase(patient: Patient, index: number): void {
      patientList.value[index] = patient;
      selectedImage.value = patient.selectedImage;
      selectedFileName.value = patient.selectedFileName;
      uploadedCtImage.value = patient.uploadedCtImage;

      if (uploadedCtImage.value) {
        load3DModel(uploadedCtImage.value);
      }
      activeStep.value++;
    }

    function onGuideImageClick(slotNumber: number): void {
      console.log(`Slot ${slotNumber} clicked`);
      if (activeTab.value === 1) {
        selectedImage.value = guideImages.value[slotNumber - 1];
      } else if (activeTab.value === 2 && slotNumber <= 4) {
        selectedImage.value = jigImages.value[slotNumber - 1];
      }
    }

    onMounted(() => {
      // WebGL 지원 확인
      if (!window.WebGLRenderingContext) {
        console.error("WebGL is not supported in this browser");
        return;
      }

      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        console.error("WebGL context could not be initialized");
        return;
      }

      // guideImages 초기화
      for (let i = 1; i <= 8; i++) {
        import(`@/assets/guide${i}.png`).then((module) => {
          guideImages.value.push(module.default);
        });
      }

      // jigImages 초기화
      for (let i = 1; i <= 4; i++) {
        import(`@/assets/jig${i}.png`).then((module) => {
          jigImages.value.push(module.default);
        });
      }

      if (viewer.value) {
        viewer.value.style.width = "100%";
        viewer.value.style.height = "60vh";
        window.addEventListener("resize", resizeViewer);
        resizeViewer();
      }
    });

    function onJigImageClick(slotNumber: number): void {
      selectedImage.value = jigImages.value[slotNumber - 1];
    }

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeViewer);
    });

    return {
      activeStep,
      createPatient,
      patientList,
      newPatient,
      saveNewPatient,
      cancelNewPatient,
      today,
      showMouthStructure,
      loadPatientCase,
      uploadedCtImage,
      updateCtImage,
      isPatientInfoComplete,

      // 지그 선택 기능
      onGuideImageClick,
      onJigImageClick,
      guideImages,
      jigImages,
      activeTab,
      selectedImage,
      selectedFileName,

      // 테마변경
      currentTheme,
      themeList,
      changeTheme,
      currentBorderColor,

      // 그림판 기능
      detectionCanvas,
      beginDrawing,
      keepDrawing,
      stopDrawing,

      // 커스텀 테스트 변수 설정
      ctSwitch,
      selectedRadio,
      options,
      viewer,
    };
  },
});
</script>

<style scoped>
.header-stepper {
  border-radius: 5px;
}
.new-patient-btn {
  padding: 4px 8px;
  font-size: 10px;
  margin-left: 150px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.save-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.cancel-btn {
  font-size: 10px;
  padding: 4px 8px;
  border: solid 1px rgb(var(--v-theme-cancelButton));
}

.new-patient-btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* three.js css 시작 임시로 이미지만 띄우고 있음*/
.model-view-section {
  width: 100%;
  height: 500px;
  border: 1px solid rgb(var(--v-theme-borderColor));
  border-radius: 5px;
  position: relative;
}

.viewer-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--v-theme-background));
}

/* file select 시작*/
.fixed-width-file-input {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

/* 지그 선택 버튼 */
.jig-slot {
  height: 12rem;
  width: 100%;
  border: 1px solid rgb(var(--v-theme-borderColor), 0.5);
  border-radius: 5px;
}

.centered-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.guide-image-btn {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;
}

.guide-image {
  width: 10rem; /* 컨테이너의 너비에 맞추기 */
  max-width: 12rem; /* 최대 너비 설정 */
  max-height: 100%; /* 최대 높이 설정 */
  object-fit: contain;
}

.bite-jig-view-img-section {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
  width: 100%;
  height: 17rem;
}

.marker-section {
  display: flex;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
  width: 100%;
  height: 17rem;
}

.detection-step {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.detection-view {
  flex: 1;
  display: flex;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.panoramic-container {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  width: 100%;
  height: 100%;
  flex: 1;
  gap: 10px;
}

.panoramic-view {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
  margin-bottom: 10px;
}

canvas {
  cursor: crosshair;
  background-image: url("@/assets/detection.png");
  background-position: center; /* 배경 이미지를 중앙에 위치 */
  background-size: cover; /* 배경 이미지가 요소의 크기에 맞게 조정되도록 설정 */
  background-repeat: no-repeat; /* 배경 이미지 반복 없음 */
  width: 100%;
}

.alert-patient-warning {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 1000;
}

/* 커스텀 트랜지션 */
.slide-down-enter-active {
  animation: slide-down-in 0.5s ease-out forwards;
}
.slide-down-leave-active {
  animation: slide-down-out 0.5s ease-in forwards;
}

/* 슬라이드 애니메이션 키프레임 */
@keyframes slide-down-in {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-down-out {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}
</style>
