<template>
  <v-app>
    <v-container>
      <v-btn
        @click="toggleTheme"
        class="theme-toggle-btn"
        :color="isDarkMode ? 'button' : 'button'"
        elevation="8"
      >
        {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
        &nbsp;
        <v-icon>{{
          isDarkMode ? "mdi-weather-sunny" : "mdi-weather-night"
        }}</v-icon>
      </v-btn>

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
        class="mt-15"
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

            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(patient, index) in patientList"
                  :key="index"
                  link
                  @click="loadPatientCase(patient, index)"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ patient.name }}</v-list-item-title>
                    <v-list-item-subtitle
                      >ID: {{ patient.id }}, Gender: {{ patient.gender }}, DOB:
                      {{ patient.dob }}</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
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

                    <!-- 알림 메시지 -->
                    <v-alert v-if="showAlert" type="error" dense>
                      환자 필수 요소를 입력해주세요.
                    </v-alert>
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
                        style="border: solid 1px #0cddcb; border-radius: 5px"
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
                      @change="handleFileChangeAndLoad"
                      label="Upload 3D Model (.obj)"
                      prepend-icon="mdi-file-upload"
                      outlined
                      dense
                      class="fixed-width-file-input"
                    ></v-file-input>
                    <div class="model-view-section">
                      <v-img
                        v-if="uploadedImage"
                        :src="uploadedImage"
                        alt="Uploaded Image"
                        max-width="100%"
                        contain
                      />
                    </div>
                  </v-card-text>

                  <v-row class="gap-2">
                    <v-col cols="6">
                      <v-card>
                        <v-card-title>Bite Jig View</v-card-title>
                        <v-card-text>
                          <div class="bite-jig-view-img-section">
                            <v-img
                              v-if="selectedGuideImage"
                              :src="selectedGuideImage"
                              alt="Selected Guide Image"
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
                            <!-- png file input -->
                            <!-- <canvas
                              width="100%"
                              height="100%"
                              @mousedown="beginDrawing"
                              @mousemove="keepDrawing"
                              @mouseup="stopDrawing"
                              ref="canvas"
                            ></canvas> -->
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
                  <v-card-text>
                    <v-row>
                      <!-- 4행 2열 그리드 레이아웃 생성 -->
                      <v-col cols="6" v-for="n in 8" :key="n" class="grid-item">
                        <v-card outlined class="jig-slot">
                          <v-card-text class="centered-image-container">
                            <v-btn
                              icon
                              @click="onGuideImageClick(n)"
                              class="guide-image-btn"
                            >
                              <v-img
                                v-if="guideImages && guideImages[n - 1]"
                                :src="guideImages[n - 1]"
                                alt="guideImages"
                                class="guide-image"
                              ></v-img>
                            </v-btn>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>

        <template v-slot:item.3>
          <v-card title="Simulation" flat>...</v-card>
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
import { ref, nextTick, watch, computed } from "vue";
import { useTheme } from "vuetify";
// 이미지 리스트 리소스 미리 로드
import img1 from "@/assets/1-preview.png";
import img2 from "@/assets/2-preview.png";
import img3 from "@/assets/3-preview.png";
import img4 from "@/assets/4-preview.png";
import img5 from "@/assets/5-preview.png";
import img6 from "@/assets/6-preview.png";
import img7 from "@/assets/7-preview.png";
import img8 from "@/assets/8-preview.png";

class Patient {
  name: string;
  id: string;
  gender: string;
  dob: string;
  memo: string;
  importData: File | null;
  selectedGuide: string;

  constructor(
    name = "",
    id = "",
    gender = "",
    dob = "",
    memo = "",
    importData: File | null = null,
    selectedGuide: string = ""
  ) {
    this.name = name;
    this.id = id;
    this.gender = gender;
    this.dob = dob;
    this.memo = memo;
    this.importData = importData;
    this.selectedGuide = selectedGuide;
  }

  reset() {
    this.name = "";
    this.id = "";
    this.gender = "";
    this.dob = "";
    this.memo = "";
    this.importData = null;
    this.selectedGuide = "";
  }
}

export default {
  setup() {
    const STEP: number = 1;
    const activeStep = ref(STEP);
    const patientList = ref<Patient[]>([]);
    const newPatient = ref(new Patient());
    const today = ref(new Date().toISOString().split("T")[0]);
    const showMouthStructure = ref(false);
    const uploadedImage = ref<string | null>(null);
    const showAlert = ref(false);
    const guideImages = [img1, img2, img3, img4, img5, img6, img7, img8];
    const selectedGuideImage = ref<string | null>(null);

    //테마 변경
    const theme = useTheme();
    const currentTheme = ref(theme.global.name.value);

    // 다크모드 여부 확인
    // 반응형 데이터로 다크모드 여부 계산
    const isDarkMode = computed(() => currentTheme.value === "dark");

    function toggleTheme() {
      currentTheme.value = isDarkMode.value ? "light" : "dark";
      theme.global.name.value = currentTheme.value;
    }

    // 그림판 기능
    const detectionCanvas = ref<HTMLCanvasElement | null>(null);
    const detectionCtx = ref<CanvasRenderingContext2D | null>(null);
    const x = ref(0);
    const y = ref(0);
    const isDrawing = ref(false);

    function initializeCanvas() {
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
    ) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      // ctx.scale(dpr, dpr);
      ctx.scale(1, 1);
    }

    function setCanvasDimensions(canvas: HTMLCanvasElement) {
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number) {
      if (detectionCtx.value) {
        detectionCtx.value.beginPath();
        detectionCtx.value.strokeStyle = "#0CDDCB";
        detectionCtx.value.lineWidth = 5;
        detectionCtx.value.moveTo(x1, y1);
        detectionCtx.value.lineTo(x2, y2);
        detectionCtx.value.stroke();
        detectionCtx.value.closePath();
      }
    }

    function getMousePosition(e: MouseEvent) {
      const rect = detectionCanvas.value.getBoundingClientRect();
      const scaleX = detectionCanvas.value.width / rect.width;
      const scaleY = detectionCanvas.value.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }

    function beginDrawing(e: MouseEvent) {
      const pos = getMousePosition(e);
      x.value = pos.x;
      y.value = pos.y;
      isDrawing.value = true;
    }

    function keepDrawing(e: MouseEvent) {
      if (isDrawing.value) {
        const pos = getMousePosition(e);
        drawLine(x.value, y.value, pos.x, pos.y);
        x.value = pos.x;
        y.value = pos.y;
      }
    }

    function stopDrawing() {
      isDrawing.value = false;
    }

    watch(activeStep, async (newStep: number) => {
      if (newStep === 4) {
        await nextTick();
        initializeCanvas();
      }
    });

    function handleFileChangeAndLoad(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files ? input.files[0] : null;

      if (file) {
        // FileReader를 사용하여 이미지 파일을 URL로 변환
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedImage.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }

    function createPatient(event: Event) {
      activeStep.value++;
      cancelNewPatient();
    }

    function isPatientInfoValid(patient: Patient) {
      return patient.name && patient.id && patient.gender && patient.dob;
    }

    function addNewPatient(patient: Patient) {
      patientList.value.unshift(
        new Patient(
          patient.name,
          patient.id,
          patient.gender,
          patient.dob,
          patient.memo,
          patient.importData,
          patient.selectedGuide
        )
      );
    }

    function saveNewPatient() {
      if (isPatientInfoValid(newPatient.value)) {
        newPatient.value.importData = uploadedImage.value;
        newPatient.value.selectedGuide = selectedGuideImage.value || "";

        addNewPatient(newPatient.value);
        showMouthStructure.value = true;
        cancelNewPatient();
        activeStep.value = STEP;
      } else {
        showAlertMessage();
      }
    }

    function showAlertMessage() {
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 3000);
    }

    function cancelNewPatient() {
      newPatient.value.reset();
      newPatient.value.importData = null;
      uploadedImage.value = null;
    }

    function loadPatientCase(patient: Patient, index: number) {
      newPatient.value = patient;
      uploadedImage.value = patient.importData;
      selectedGuideImage.value = patient.selectedGuide;
      patientList.value.splice(index, 1);
      activeStep.value++;
    }

    function onGuideImageClick(slotNumber: number) {
      // console.log(`Slot ${slotNumber} clicked`);
      selectedGuideImage.value = guideImages[slotNumber - 1];
    }

    // 그림판 기능

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
      uploadedImage,
      handleFileChangeAndLoad,
      showAlert,
      onGuideImageClick,
      guideImages,
      selectedGuideImage,

      // 테마변경
      isDarkMode,
      toggleTheme,
      currentTheme,

      // 그림판 기능
      detectionCanvas,
      beginDrawing,
      keepDrawing,
      stopDrawing,
    };
  },
};
</script>

<style scoped>
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
  border: solid 1px rgb(250, 146, 139);
}

.new-patient-btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

::v-deep .v-text-field input {
  font-size: 0.9rem !important;
}

/* three.js css 시작 임시로 이미지만 띄우고 있음*/
.model-view-section {
  width: 100%;
  height: 500px;
  display: flex;
  border: 1px solid rgb(var(--v-theme-borderColor));
  border-radius: 5px;
  justify-content: center;
  align-items: center;
}

/* file select 시작*/
.fixed-width-file-input {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

/* 지그 선택 버튼 */
.jig-slot {
  height: 13rem;
  width: 100%;
  border: 1px solid rgb(var(--v-theme-borderColor));
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
  height: 16rem;
}

.marker-section {
  display: flex;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
  width: 100%;
  height: 16rem;
}

.detection-step {
  display: flex;
  align-items: center;
  width: 100%;
  height: 70vh;
}

.detection-view {
  width: 100%;
  display: flex;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

.panoramic-container {
  display: grid;
  grid-template-rows: 1fr, 1fr;
  width: 100%;
  height: 100%;
  gap: 8px;
}

.panoramic-view {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: solid 1px rgb(var(--v-theme-borderColor));
}

canvas {
  cursor: crosshair;
  background-image: url("@/assets/detection.png");
  background-position: center; /* 배경 이미지를 중앙에 위치 */
  background-size: cover; /* 배경 이미지가 요소의 크기에 맞게 조정되도록 설정 */
  background-repeat: no-repeat; /* 배경 이미지 반복 없음 */
  width: 100%;
}

.theme-toggle-btn {
  position: fixed;
  top: 20px;
  right: 50px;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  font-size: 10px;
  transition: all 0.3s ease-in-out;
}

.theme-toggle-btn:hover {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
}
</style>
